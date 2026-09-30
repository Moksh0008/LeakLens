const supabase = require("./supabase");

const getAllLeakageResults = async () => {
    const { data, error } = await supabase
        .from("leakage_results")
        .select("*")
        .order("potential_leakage", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

const getLeakageByTransactionId = async (transactionId) => {
    const { data, error } = await supabase
        .from("leakage_results")
        .select("*")
        .eq("transaction_id", transactionId)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

module.exports = {
    getAllLeakageResults,
    getLeakageByTransactionId
};