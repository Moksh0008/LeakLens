const fs = require("fs");
const csv = require("csv-parser");

const REQUIRED_FIELDS = [
    "transactionId",
    "date",
    "product",
    "category",
    "supplier",
    "quantity",
    "unitPrice",
    "totalAmount"
];

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const rows = [];

        fs.createReadStream(filePath)
            .pipe(
                csv({
                    mapHeaders: ({ header }) => header.trim()
                })
            )
            .on("headers", (headers) => {
                const missingFields = REQUIRED_FIELDS.filter(
                    (field) => !headers.includes(field)
                );

                if (missingFields.length > 0) {
                    reject(
                        new Error(
                            `Missing required CSV columns: ${missingFields.join(", ")}`
                        )
                    );
                }
            })
            .on("data", (row) => {
                rows.push(row);
            })
            .on("error", reject)
            .on("end", () => {
                resolve({ rows });
            });
    });
};

module.exports = {
    REQUIRED_FIELDS,
    parseCSV
};