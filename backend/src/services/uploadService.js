const fs = require("fs");

const supabase = require("./supabase");
const { parseCSV } = require("./csvService");
const { runDetection } = require("./detectionService");

// Normalize common CSV date formats to ISO (YYYY-MM-DD) so the DB `date`
// column accepts them. Indian convention DD-MM-YYYY and DD/MM/YYYY are the
// usual variants; ISO passes straight through.
function normalizeDate(raw) {
    const s = String(raw || "").trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s; // already ISO

    let m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/); // DD-MM-YYYY
    if (m) {
        return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }

    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // DD/MM/YYYY
    if (m) {
        return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
    }

    return s; // let the DB surface anything else as a row error
}

const findDuplicateTransactionIds = (rows) => {
    const seen = new Set();
    const duplicates = new Set();

    for (const row of rows) {
        const transactionId = String(row.transactionId || "").trim();

        if (!transactionId) {
            continue;
        }

        if (seen.has(transactionId)) {
            duplicates.add(transactionId);
            continue;
        }

        seen.add(transactionId);
    }

    return [...duplicates].sort();
};

const validateAndTransformRows = (rows) => {
    const validRows = [];
    const errors = [];

    const duplicateTransactionIds = findDuplicateTransactionIds(rows);

    if (duplicateTransactionIds.length > 0) {
        errors.push(
            `Duplicate transaction IDs found: ${duplicateTransactionIds.join(", ")}.`
        );
        return { validRows, errors };
    }

    rows.forEach((row, index) => {
        const rowNumber = index + 2;

        const quantity = Number(row.quantity);
        const unitPrice = Number(row.unitPrice);
        const totalAmount = Number(row.totalAmount);

        if (!row.transactionId) {
            errors.push(`Row ${rowNumber}: transactionId is required.`);
            return;
        }

        if (!row.date) {
            errors.push(`Row ${rowNumber}: date is required.`);
            return;
        }

        if (!row.product) {
            errors.push(`Row ${rowNumber}: product is required.`);
            return;
        }

        if (!row.category) {
            errors.push(`Row ${rowNumber}: category is required.`);
            return;
        }

        if (!row.supplier) {
            errors.push(`Row ${rowNumber}: supplier is required.`);
            return;
        }

        if (!Number.isFinite(quantity) || quantity <= 0) {
            errors.push(`Row ${rowNumber}: quantity must be greater than 0.`);
            return;
        }

        if (!Number.isFinite(unitPrice) || unitPrice < 0) {
            errors.push(`Row ${rowNumber}: unitPrice must be a valid number.`);
            return;
        }

        if (!Number.isFinite(totalAmount) || totalAmount < 0) {
            errors.push(`Row ${rowNumber}: totalAmount must be a valid number.`);
            return;
        }

        validRows.push({
            transaction_id: row.transactionId.trim(),
            date: normalizeDate(row.date),
            product: row.product.trim(),
            category: row.category.trim(),
            supplier: row.supplier.trim(),
            quantity,
            unit_price: unitPrice,
            total_amount: totalAmount
        });
    });

    return { validRows, errors };
};

const processCSVUpload = async (filePath) => {
    try {
        // 1. Parse CSV
        const { rows } = await parseCSV(filePath);

        if (rows.length === 0) {
            throw new Error("CSV file contains no data rows.");
        }

        // 2. Validate CSV
        const { validRows, errors } = validateAndTransformRows(rows);

        if (errors.length > 0) {
            throw new Error(errors.join(" | "));
        }

        const transactionIds = validRows.map((row) => row.transaction_id);
        const { data: existingRows, error: existingError } = await supabase
            .from("procurement_transactions")
            .select("transaction_id")
            .in("transaction_id", transactionIds);

        if (existingError) {
            throw new Error(existingError.message);
        }

        const existingTransactionIds = (existingRows || []).map(
            (row) => row.transaction_id
        );

        if (existingTransactionIds.length > 0) {
            throw new Error(
                `Duplicate transaction IDs found: ${existingTransactionIds.join(", ")}.`
            );
        }

        // 3. Save procurement transactions
        const { data, error } = await supabase
            .from("procurement_transactions")
            .insert(validRows)
            .select();

        if (error) {
            throw new Error(error.message);
        }

        // 4. Convert database records to detection-engine format
        const transactionsForDetection = data.map((transaction) => ({
            transactionId: transaction.transaction_id,
            date: transaction.date,
            product: transaction.product,
            category: transaction.category,
            supplier: transaction.supplier,
            quantity: Number(transaction.quantity),
            unitPrice: Number(transaction.unit_price),
            totalAmount: Number(transaction.total_amount)
        }));

        // 5. Run detection engine / mock detection
        const leakageResults = await runDetection(
            transactionsForDetection
        );

        // 6. Save leakage results
        if (leakageResults.length > 0) {
            const leakageRows = leakageResults.map((result) => ({
                transaction_id: result.transactionId,
                product: result.product,
                supplier: result.supplier,
                quantity: result.quantity,
                actual_price: result.actualPrice,
                benchmark_price: result.benchmarkPrice,
                potential_leakage: result.potentialLeakage,
                severity: result.severity,
                detection_type: result.detectionType,
                reason: result.reason
            }));

            const { error: leakageError } = await supabase
                .from("leakage_results")
                .insert(leakageRows);

            if (leakageError) {
                throw new Error(leakageError.message);
            }
        }

        // 7. Return complete upload summary
        return {
            insertedCount: data.length,
            flaggedTransactions: leakageResults.length
        };

    } finally {
        // 8. Delete temporary uploaded CSV
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

module.exports = {
    processCSVUpload,
    validateAndTransformRows,
    findDuplicateTransactionIds
};