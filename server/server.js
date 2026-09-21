const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const healthRoutes = require("./routes/healthRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const ttsRoutes = require("./routes/ttsRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// ================================
// Middleware
// ================================

app.use(cors());
app.use(express.json());
app.use("/audio", express.static("audio"));

// ================================
// API Routes
// ================================

app.use("/api/health", healthRoutes);
app.use("/api/voices", voiceRoutes);
app.use("/api/tts", ttsRoutes);

// ================================
// Home Route
// ================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Text-to-Speech backend is running!"
    });
});

// ================================
// Start Server
// ================================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});