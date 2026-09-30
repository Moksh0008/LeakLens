const express = require("express");

const {
    getLeakage,
    getLeakageDetails
} = require("../controllers/leakageController");

const router = express.Router();

router.get("/", getLeakage);
router.get("/:transactionId", getLeakageDetails);

module.exports = router;