const { processCSVUpload } = require("../services/uploadService");

const uploadProcurementCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "CSV file is required."
            });
        }

        const result = await processCSVUpload(req.file.path);

        res.status(201).json({
            success: true,
            message: "Procurement CSV uploaded successfully.",
            transactionsInserted: result.insertedCount,
            flaggedTransactions: result.flaggedTransactions
        });

    } catch (error) {
        console.error("CSV upload error:", error.message);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    uploadProcurementCSV
};