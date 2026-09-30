const {
    getAllTransactions
} = require("../services/transactionService");

const getTransactions = async (req, res) => {
    try {
        const transactions = await getAllTransactions();

        const formattedTransactions = transactions.map((transaction) => ({
            transactionId: transaction.transaction_id,
            date: transaction.date,
            product: transaction.product,
            category: transaction.category,
            supplier: transaction.supplier,
            quantity: Number(transaction.quantity),
            unitPrice: Number(transaction.unit_price),
            totalAmount: Number(transaction.total_amount)
        }));

        res.json(formattedTransactions);

    } catch (error) {
        console.error("Transaction fetch error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch procurement transactions",
            error: error.message
        });
    }
};

module.exports = {
    getTransactions
};