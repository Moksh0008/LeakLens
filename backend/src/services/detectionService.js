const axios = require("axios");

const DETECTION_ENGINE_URL =
    process.env.DETECTION_ENGINE_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Simplified local detection (MOCK_DETECTION=true).
// Bridges the upload flow until the detection engine exposes its HTTP API.
// Emits the exact finding shape the engine contract defines; once the engine
// is live, set MOCK_DETECTION=false and the axios path below takes over.
// ---------------------------------------------------------------------------
const ANOMALY_THRESHOLD = 0.15; // flag purchases ≥15% above the product benchmark

function severityFor(deviation, leakage) {
    if (deviation >= 0.5 || leakage >= 500000) return "HIGH";
    if (deviation >= 0.3 || leakage >= 100000) return "MEDIUM";
    return "LOW";
}

function inr(n) {
    return Math.round(n).toLocaleString("en-IN");
}

function localDetection(transactions) {
    // Benchmark price per product = lowest unit price seen in the batch.
    const benchmarks = new Map();
    for (const t of transactions) {
        const known = benchmarks.get(t.product);
        if (known === undefined || t.unitPrice < known) {
            benchmarks.set(t.product, t.unitPrice);
        }
    }

    const findings = [];
    const seen = new Map();

    for (const t of transactions) {
        const benchmarkPrice = benchmarks.get(t.product) ?? t.unitPrice;
        const deviation =
            benchmarkPrice > 0
                ? (t.unitPrice - benchmarkPrice) / benchmarkPrice
                : 0;

        if (deviation >= ANOMALY_THRESHOLD) {
            const potentialLeakage = Math.round(
                (t.unitPrice - benchmarkPrice) * t.quantity
            );
            findings.push({
                transactionId: t.transactionId,
                product: t.product,
                supplier: t.supplier,
                quantity: t.quantity,
                actualPrice: t.unitPrice,
                benchmarkPrice,
                potentialLeakage,
                severity: severityFor(deviation, potentialLeakage),
                detectionType: "PRICE_ANOMALY",
                reason: `Priced ₹${inr(
                    t.unitPrice - benchmarkPrice
                )} above the ₹${inr(benchmarkPrice)} benchmark per unit · ${
                    t.quantity
                } units`,
            });
        }

        const dupKey = `${t.date}|${t.supplier}|${t.product}|${t.quantity}|${t.unitPrice}`;
        if (seen.has(dupKey)) {
            findings.push({
                transactionId: t.transactionId,
                product: t.product,
                supplier: t.supplier,
                quantity: t.quantity,
                actualPrice: t.unitPrice,
                benchmarkPrice,
                potentialLeakage: 0,
                severity: "LOW",
                detectionType: "POSSIBLE_DUPLICATE",
                reason: `Same product, supplier, quantity and price as ${seen.get(
                    dupKey
                )} on ${t.date}`,
            });
        } else {
            seen.set(dupKey, t.transactionId);
        }
    }

    return findings;
}

const runDetection = async (transactions) => {
    if (String(process.env.MOCK_DETECTION).toLowerCase() === "true") {
        return localDetection(transactions);
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

        return response.data.findings || [];

    } catch (error) {
        console.error(
            "Detection engine error:",
            error.response?.data || error.message
        );

        throw new Error("Detection engine is unavailable.");
    }
};

module.exports = {
    runDetection
};