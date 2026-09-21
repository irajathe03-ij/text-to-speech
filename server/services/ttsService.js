const gTTS = require("gtts");
const path = require("path");
const fs = require("fs");

const generateSpeech = (text, language, outputFileName) => {
    return new Promise((resolve, reject) => {

        const audioFolder = path.join(__dirname, "../audio");

        if (!fs.existsSync(audioFolder)) {
            fs.mkdirSync(audioFolder, { recursive: true });
        }

        const outputPath = path.join(audioFolder, outputFileName);

        // Convert frontend language codes to gTTS language codes
        const languageMap = {
    "en-US": "en",
    "hi-IN": "hi",
    "mr-IN": "mr",
    "gu-IN": "gu",
    "es-ES": "es",
    "fr-FR": "fr",
    "de-DE": "de"
};

        const languageCode = languageMap[language];

        if (!languageCode) {
            return reject(
                new Error(`Unsupported language: ${language}`)
            );
        }

        console.log(`Generating speech: ${language} → ${languageCode}`);

        const speech = new gTTS(text, languageCode);

        speech.save(outputPath, (error) => {
            if (error) {
                console.error("gTTS Error:", error);
                reject(error);
            } else {
                console.log(`Audio created: ${outputFileName}`);
                resolve(outputPath);
            }
        });
    });
};

module.exports = {
    generateSpeech
};