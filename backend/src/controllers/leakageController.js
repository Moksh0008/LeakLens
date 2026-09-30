const {
    getAllLeakageResults,
    getLeakageByTransactionId
} = require("../services/leakageService");

const formatLeakage = (leakage) => ({
    transactionId: leakage.transaction_id,
    product: leakage.product,
    supplier: leakage.supplier,
    quantity: Number(leakage.quantity),
    actualPrice: Number(leakage.actual_price),
    benchmarkPrice: Number(leakage.benchmark_price),
    potentialLeakage: Number(leakage.potential_leakage),
    severity: leakage.severity,
    detectionType: leakage.detection_type,
    reason: leakage.reason
});

const getLeakage = async (req, res) => {
    try {
        const results = await getAllLeakageResults();

        res.json(results.map(formatLeakage));
    } catch (error) {
        console.error("Leakage fetch error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch leakage results",
            error: error.message
        });
    }
};

const getLeakageDetails = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const result = await getLeakageByTransactionId(transactionId);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: `No leakage result found for transaction ${transactionId}`
            });
        }

        res.json(formatLeakage(result));
    } catch (error) {
        console.error("Leakage detail fetch error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch leakage details",
            error: error.message
        });
    }
};

module.exports = {
    getLeakage,
    getLeakageDetails
};