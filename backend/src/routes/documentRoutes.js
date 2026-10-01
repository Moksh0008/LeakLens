const express = require("express");
const path = require("path");
const multer = require("multer");

const {
    analyzeDocument,
    isNovaConfigured,
    maskedKey
} = require("../services/documentAnalysisService");

const router = express.Router();

// Analyse in-memory only — no temp files written to disk.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

// Text-extractable formats. PDF/DOCX are binary — rejected with a clear
// message until a text-extraction step is added.
const TEXT_EXTENSIONS = new Set([
    ".txt",
    ".csv",
    ".tsv",
    ".md",
    ".json",
    ".log"
]);

router.get("/status", (req, res) => {
    res.json({
        success: true,
        novaConfigured: isNovaConfigured(),
        keyMask: maskedKey()
    });
});

router.post("/analyze", upload.single("file"), async (req, res, next) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Attach a document in the 'file' field to analyse."
            });
        }

        const extension = path.extname(file.originalname).toLowerCase();
        if (!TEXT_EXTENSIONS.has(extension)) {
            return res.status(415).json({
                success: false,
                message: `Unsupported document type '${extension}'. Supported: ${[
                    ...TEXT_EXTENSIONS
                ].join(", ")}.`
            });
        }

        const result = await analyzeDocument({
            filename: file.originalname,
            mimeType: file.mimetype,
            text: file.buffer.toString("utf8"),
            question: req.body?.question
        });

        res.json({
            success: true,
            document: {
                filename: file.originalname,
                size: file.size,
                mimeType: file.mimetype
            },
            analysis: result.analysis,
            model: result.model,
            usage: result.usage,
            nova: result.nova
        });
    } catch (error) {
        next(error);
    }
});

// DocumentAnalysisError and multer errors → clean JSON responses.
// eslint-disable-next-line no-unused-vars
router.use((error, req, res, next) => {
    const statusCode =
        error.statusCode || (error.code === "LIMIT_FILE_SIZE" ? 413 : 500);

    res.status(statusCode).json({
        success: false,
        message: error.message || "Document analysis failed."
    });
});

module.exports = router;
