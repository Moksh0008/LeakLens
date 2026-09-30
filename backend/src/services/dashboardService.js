const supabase = require("./supabase");

const getDashboardStats = async () => {
    // Get all procurement transactions
    const { data: transactions, error: transactionError } = await supabase
        .from("procurement_transactions")
        .select("total_amount");

    if (transactionError) {
        throw new Error(transactionError.message);
    }

    // Get all leakage results
    const { data: leakageResults, error: leakageError } = await supabase
        .from("leakage_results")
        .select("potential_leakage");

    if (leakageError) {
        throw new Error(leakageError.message);
    }

    const totalProcurement = transactions.reduce(
        (sum, transaction) => sum + Number(transaction.total_amount),
        0
    );

    const potentialLeakage = leakageResults.reduce(
        (sum, leakage) => sum + Number(leakage.potential_leakage),
        0
    );

    return {
        totalProcurement,
        potentialLeakage,
        transactionsAnalyzed: transactions.length,
        flaggedTransactions: leakageResults.length
    };
};

module.exports = {
    getDashboardStats
};