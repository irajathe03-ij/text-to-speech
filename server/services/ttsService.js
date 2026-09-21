const gTTS = require("gtts");
const path = require("path");
const fs = require("fs");

const generateSpeech = (text, language, outputFileName) => {
    return new Promise((resolve, reject) => {

        try {
            // Audio folder
            const audioFolder = path.join(__dirname, "../audio");

            // Create audio folder if it doesn't exist
            if (!fs.existsSync(audioFolder)) {
                fs.mkdirSync(audioFolder, { recursive: true });
            }

            // Output file path
            const outputPath = path.join(audioFolder, outputFileName);

            // Frontend language → gTTS language
            const languageMap = {
                "en-US": "en",
                "hi-IN": "hi",
                "mr-IN": "mr",
                "gu-IN": "gu",
                "es-ES": "es",
                "fr-FR": "fr",
                "de-DE": "de"
            };

            // Get gTTS language code
            const languageCode = languageMap[language];

            if (!languageCode) {
                return reject(
                    new Error(`Unsupported language: ${language}`)
                );
            }

            console.log(
                `Generating speech: ${language} → ${languageCode}`
            );

            // Create gTTS object
            const speech = new gTTS(text, languageCode);

            // Generate MP3
            speech.save(outputPath, (error) => {

                if (error) {
                    console.error("gTTS Error:", error);
                    return reject(error);
                }

                console.log(
                    `Audio created successfully: ${outputFileName}`
                );

                resolve(outputPath);
            });

        } catch (error) {
            console.error("TTS Service Error:", error);
            reject(error);
        }
    });
};

module.exports = {
    generateSpeech
};