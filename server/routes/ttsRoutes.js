const express = require("express");
const path = require("path");

const { generateSpeech } = require("../services/ttsService");

const router = express.Router();

// POST /api/tts
router.post("/", async (req, res) => {
    try {
        const { text, language, voice } = req.body;

        // 1. Check text
        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Text is required"
            });
        }

        // 2. Maximum text length
        const MAX_TEXT_LENGTH = 5000;

        if (text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({
                success: false,
                message: `Text cannot exceed ${MAX_TEXT_LENGTH} characters`
            });
        }

        // 3. Check language
        if (!language || language.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Language is required"
            });
        }

        // 4. Check voice
        if (!voice || voice.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Voice is required"
            });
        }

        // Create unique file name
        const fileName = `speech-${Date.now()}.mp3`;

        // Generate speech
        await generateSpeech(text, language, fileName);

        // Audio URL
        const audioUrl = `/audio/${fileName}`;

        res.json({
            success: true,
            message: "Speech generated successfully",
            audioUrl: audioUrl
        });

    } catch (error) {
        console.error("TTS Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate speech"
        });
    }
});

module.exports = router;