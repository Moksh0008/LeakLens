const axios = require("axios");

const DETECTION_ENGINE_URL =
    process.env.DETECTION_ENGINE_URL || "http://localhost:8000";

const runDetection = async (transactions) => {
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