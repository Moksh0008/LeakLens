const supabase = require("./supabase");

const getAllTransactions = async () => {
    const { data, error } = await supabase
        .from("procurement_transactions")
        .select("*")
        .order("date", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

module.exports = {
    getAllTransactions
};