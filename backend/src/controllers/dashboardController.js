const {
    getDashboardStats
} = require("../services/dashboardService");

const getDashboard = async (req, res) => {
    try {
        const stats = await getDashboardStats();

        res.json(stats);

    } catch (error) {
        console.error("Dashboard error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

module.exports = {
    getDashboard
};