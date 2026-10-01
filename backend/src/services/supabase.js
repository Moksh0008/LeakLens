const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey =
    process.env.SUPABASE_KEY || process.env.SUPABASE_SECRET_KEY;

// Fail loudly and clearly at startup — an obscure supabase-js error at
// request time is much harder to debug during integration.
if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        "Missing Supabase configuration. Copy backend/.env.example to backend/.env " +
            "and set SUPABASE_URL and SUPABASE_KEY."
    );
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
