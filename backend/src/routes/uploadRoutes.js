const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
    uploadProcurementCSV
} = require("../controllers/uploadController");

const router = express.Router();

router.post("/", upload.single("file"), uploadProcurementCSV);

module.exports = router;