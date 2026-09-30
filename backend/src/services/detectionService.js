const axios = require("axios");

const DETECTION_ENGINE_URL =
    process.env.DETECTION_ENGINE_URL || "http://localhost:8000";

const MOCK_DETECTION = process.env.MOCK_DETECTION !== "false";

const runDetection = async (transactions) => {
    // Development mode: don't depend on Member 4's Python server
    if (MOCK_DETECTION) {
        return generateMockResults(transactions);
    }

    try {
        const response = await axios.post(
            `${DETECTION_ENGINE_URL}/analyze`,
            {
                transactions
            },
            {
                timeout: 30000
            }
        );

        return response.data.results || [];
    } catch (error) {
        console.error(
            "Detection engine error:",
            error.response?.data || error.message
        );

        throw new Error("Detection engine is unavailable.");
    }
};

const generateMockResults = (transactions) => {
    const results = [];

    for (const transaction of transactions) {
        /*
         * Simple MOCK rule:
         * Flag transactions whose unit price is above
         * ₹50,000.
         *
         * This is ONLY for backend testing.
         * Member 4's real detection algorithm will replace this.
         */

        if (Number(transaction.unitPrice) > 50000) {
            const benchmarkPrice = 50000;

            const potentialLeakage =
                (Number(transaction.unitPrice) - benchmarkPrice) *
                Number(transaction.quantity);

            const percentageAbove =
                ((Number(transaction.unitPrice) - benchmarkPrice) /
                    benchmarkPrice) *
                100;

            results.push({
                transactionId: transaction.transactionId,
                product: transaction.product,
                supplier: transaction.supplier,
                quantity: Number(transaction.quantity),
                actualPrice: Number(transaction.unitPrice),
                benchmarkPrice,
                potentialLeakage,
                severity: percentageAbove >= 30 ? "HIGH" : "MEDIUM",
                detectionType: "PRICE_ANOMALY",
                reason: `Unit price is ${percentageAbove.toFixed(
                    0
                )}% above the mock historical benchmark.`
            });
        }
    }

    return results;
};

module.exports = {
    runDetection
};