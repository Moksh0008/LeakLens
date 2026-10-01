const axios = require("axios");

// ---------------------------------------------------------------------------
// Document analysis via the Nova AI API (Nova-route).
// OpenAI-compatible chat completions: POST {baseUrl}/v1/chat/completions
// with `Authorization: Bearer nova_sk_...`. The key lives in backend/.env as
// NOVA_API_KEY (git-ignored) — never hardcode it in this file.
// ---------------------------------------------------------------------------

const DEFAULT_BASE_URL = "https://api.nova.ai";
const COMPLETIONS_PATH = "/v1/chat/completions";
const DEFAULT_TIMEOUT_MS = 60000;

// Keep prompts bounded — documents larger than this get truncated.
const MAX_DOCUMENT_CHARS = 100000;

const ANALYST_SYSTEM_PROMPT = [
    "You are a senior public-procurement spend analyst working for LeakLens.",
    "Analyse the supplied document and respond with:",
    "1. A one-line summary of what the document is.",
    "2. Key procurement figures you can extract (totals, suppliers, prices).",
    "3. Red flags that suggest spend leakage: overpricing, duplicate payments,",
    "   split purchases, off-contract buying, single-source risk.",
    "4. Recommended actions, most impactful first.",
    "Be concise and factual; only cite figures that actually appear in the document.",
].join(" ");

function novaConfig() {
    return {
        apiKey: process.env.NOVA_API_KEY || "",
        baseUrl: (process.env.NOVA_API_BASE_URL || DEFAULT_BASE_URL).replace(
            /\/+$/,
            ""
        ),
        timeoutMs:
            Number(process.env.NOVA_API_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS,
        // Optional — Nova falls back to the project default model when omitted.
        model: process.env.NOVA_API_MODEL || undefined,
    };
}

function isNovaConfigured() {
    return Boolean(novaConfig().apiKey);
}

function maskedKey() {
    const key = novaConfig().apiKey;
    if (!key) return null;
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
}

class DocumentAnalysisError extends Error {
    constructor(message, statusCode = 500, code = "document_analysis_error") {
        super(message);
        this.name = "DocumentAnalysisError";
        this.statusCode = statusCode;
        this.code = code;
    }
}

function truncate(text) {
    if (text.length <= MAX_DOCUMENT_CHARS) return text;
    return `${text.slice(0, MAX_DOCUMENT_CHARS)}\n\n[Document truncated at ${MAX_DOCUMENT_CHARS} characters]`;
}

const analyzeDocument = async ({ filename, mimeType, text, question }) => {
    const { apiKey, baseUrl, timeoutMs, model } = novaConfig();

    if (!apiKey) {
        throw new DocumentAnalysisError(
            "NOVA_API_KEY is not configured on the server.",
            503,
            "nova_not_configured"
        );
    }

    const documentText = truncate(String(text || ""));
    if (!documentText.trim()) {
        throw new DocumentAnalysisError(
            "The uploaded document contains no readable text.",
            400,
            "empty_document"
        );
    }

    const userContent = [
        "Analyse the following document for procurement spend leakage.",
        `Filename: ${filename || "unknown"}`,
        mimeType ? `Type: ${mimeType}` : null,
        question ? `Specific question: ${question}` : null,
        "--- DOCUMENT START ---",
        documentText,
        "--- DOCUMENT END ---",
    ]
        .filter(Boolean)
        .join("\n");

    const payload = {
        stream: false,
        messages: [
            { role: "system", content: ANALYST_SYSTEM_PROMPT },
            { role: "user", content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 1500,
    };
    if (model) payload.model = model;

    try {
        const response = await axios.post(`${baseUrl}${COMPLETIONS_PATH}`, payload, {
            timeout: timeoutMs,
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            }
        });

        const analysis = response.data?.choices?.[0]?.message?.content;
        if (!analysis) {
            throw new DocumentAnalysisError(
                "Nova API returned an unexpected response shape.",
                502,
                "nova_bad_response"
            );
        }

        return {
            analysis,
            model: response.data.model || model || "project-default",
            usage: response.data.usage || null,
            nova: response.data.nova || null
        };
    } catch (error) {
        if (error instanceof DocumentAnalysisError) throw error;

        if (error.response) {
            const status = error.response.status;
            const detail =
                error.response.data?.error?.message ||
                error.response.data?.message ||
                error.response.statusText ||
                "unknown error";
            throw new DocumentAnalysisError(
                `Nova API error (HTTP ${status}): ${detail}`,
                502,
                "nova_api_error"
            );
        }

        const hint =
            error.code === "ENOTFOUND"
                ? " — host not found; set NOVA_API_BASE_URL in backend/.env to your Nova deployment URL"
                : "";
        throw new DocumentAnalysisError(
            `Nova API unreachable: ${error.message}${hint}`,
            502,
            "nova_unreachable"
        );
    }
};

module.exports = {
    analyzeDocument,
    isNovaConfigured,
    maskedKey,
    DocumentAnalysisError
};
