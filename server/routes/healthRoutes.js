const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        status: "OK",
        message: "Backend is healthy"
    });
});

module.exports = router;