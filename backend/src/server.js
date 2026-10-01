const express = require("express");
const cors = require("cors");
require("dotenv").config();

const transactionRoutes = require("./routes/transactionRoutes");
const leakageRoutes = require("./routes/leakageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "http://localhost:5173"
    })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "LeakLens backend is running"
    });
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/leakage", leakageRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

app.listen(PORT, () => {
    console.log(`LeakLens backend running on http://localhost:${PORT}`);
});