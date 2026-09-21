const express = require("express");
const cors = require("cors");
require("dotenv").config();

const healthRoutes = require("./routes/healthRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const ttsRoutes = require("./routes/ttsRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Serve generated audio files
app.use("/audio", express.static("audio"));

// API Routes
app.use("/api/health", healthRoutes);
app.use("/api/voices", voiceRoutes);
app.use("/api/tts", ttsRoutes);

// Root endpoint
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Text-to-Speech backend is running!"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});