const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        success: true,
        voices: [
            {
                id: "en-US-1",
                language: "English",
                voice: "English Voice 1"
            },
            {
                id: "hi-IN-1",
                language: "Hindi",
                voice: "Hindi Voice 1"
            },
            {
                id: "mr-IN-1",
                language: "Marathi",
                voice: "Marathi Voice 1"
            },
            {
                id: "gu-IN-1",
                language: "Gujarati",
                voice: "Gujarati Voice 1"
            },
            {
                id: "fr-FR-1",
                language: "French",
                voice: "French Voice 1"
            },
            {
                id: "de-DE-1",
                language: "German",
                voice: "German Voice 1"
            },
            {
                id: "es-ES-1",
                language: "Spanish",
                voice: "Spanish Voice 1"
            }
        ]
    });
});

module.exports = router;