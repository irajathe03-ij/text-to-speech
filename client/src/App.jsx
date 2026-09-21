import { useEffect, useRef, useState } from "react";
import "./index.css";

const BACKEND_URL = "http://localhost:5000";

const fallbackVoices = [
  {
    id: "en-US-1",
    name: "English Voice 1",
    language: "en-US",
  },
  {
    id: "hi-IN-1",
    name: "Hindi Voice 1",
    language: "hi-IN",
  },
  {
    id: "mr-IN-1",
    name: "Marathi Voice 1",
    language: "mr-IN",
  },
  {
    id: "gu-IN-1",
    name: "Gujarati Voice 1",
    language: "gu-IN",
  },
  {
    id: "es-ES-1",
    name: "Spanish Voice 1",
    language: "es-ES",
  },
  {
    id: "fr-FR-1",
    name: "French Voice 1",
    language: "fr-FR",
  },
  {
    id: "de-DE-1",
    name: "German Voice 1",
    language: "de-DE",
  },
];

const languages = [
  {
    value: "en-US",
    label: "English",
    flag: "🇬🇧",
  },
  {
    value: "hi-IN",
    label: "Hindi",
    flag: "🇮🇳",
  },
  {
    value: "mr-IN",
    label: "Marathi",
    flag: "🇮🇳",
  },
  {
    value: "gu-IN",
    label: "Gujarati",
    flag: "🇮🇳",
  },
  {
    value: "es-ES",
    label: "Spanish",
    flag: "🇪🇸",
  },
  {
    value: "fr-FR",
    label: "French",
    flag: "🇫🇷",
  },
  {
    value: "de-DE",
    label: "German",
    flag: "🇩🇪",
  },
];

function App() {
  const [text, setText] = useState("");

  const [language, setLanguage] = useState("en-US");

  const [voices, setVoices] = useState(fallbackVoices);

  const [selectedVoice, setSelectedVoice] = useState("en-US-1");

  const [audioUrl, setAudioUrl] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);

  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);

  const [speed, setSpeed] = useState(1);

  const audioRef = useRef(null);

  const maxCharacters = 5000;

  // ================================
  // Word Count
  // ================================

  const wordCount =
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  // ================================
  // Load Voices From Backend
  // ================================

  useEffect(() => {
    const loadVoices = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/voices`);

        if (!response.ok) {
          throw new Error("Unable to load voices");
        }

        const data = await response.json();

        console.log("Voices response:", data);

        if (
          data.success &&
          Array.isArray(data.voices) &&
          data.voices.length > 0
        ) {
          const languageMap = {
            English: "en-US",
            Hindi: "hi-IN",
            Marathi: "mr-IN",
            Gujarati: "gu-IN",
            Spanish: "es-ES",
            French: "fr-FR",
            German: "de-DE",
          };

          const normalizedVoices = data.voices.map((voice) => ({
            id: voice.id || voice.voice || voice.name,

            name:
              voice.voice ||
              voice.name ||
              voice.id,

            language:
              languageMap[voice.language] ||
              voice.languageCode ||
              voice.locale ||
              "en-US",
          }));

          setVoices(normalizedVoices);
        } else {
          setVoices(fallbackVoices);
        }
      } catch (err) {
        console.error("Voice loading error:", err);

        console.log("Using fallback voices.");

        setVoices(fallbackVoices);
      }
    };

    loadVoices();
  }, []);

  // ================================
  // Filter Voices According To Language
  // ================================

  const filteredVoices = voices.filter((voice) => {
    const voiceLanguage =
      voice.language ||
      voice.lang ||
      voice.locale ||
      "en-US";

    return voiceLanguage
      .toLowerCase()
      .startsWith(language.split("-")[0].toLowerCase());
  });

  // ================================
  // Automatically Select First Voice
  // ================================

  useEffect(() => {
    if (filteredVoices.length === 0) {
      setSelectedVoice("");
      return;
    }

    const currentVoiceExists = filteredVoices.some(
      (voice) => voice.id === selectedVoice
    );

    if (!currentVoiceExists) {
      setSelectedVoice(filteredVoices[0].id);
    }
  }, [language, voices, selectedVoice]);

  // ================================
  // Generate Speech
  // ================================

  const handleGenerate = async () => {
    setError("");

    // Check text
    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    // Check maximum characters
    if (text.length > maxCharacters) {
      setError(
        `Text cannot exceed ${maxCharacters} characters.`
      );
      return;
    }

    // Check language
    if (!language) {
      setError("Please select a language.");
      return;
    }

    // Check voice
    if (!selectedVoice) {
      setError("Please select a voice.");
      return;
    }

    setIsGenerating(true);
    setIsPlaying(false);

    // Stop previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      console.log("Sending TTS request...");

      const response = await fetch(
        `${BACKEND_URL}/api/tts`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: text.trim(),
            language: language,
            voice: selectedVoice,
          }),
        }
      );

      const data = await response.json();

      console.log("TTS response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Speech generation failed."
        );
      }

      if (!data.success || !data.audioUrl) {
        throw new Error(
          data.message || "No audio was generated."
        );
      }

      // Convert relative URL into full URL
      const generatedAudioUrl =
        data.audioUrl.startsWith("http")
          ? data.audioUrl
          : `${BACKEND_URL}${data.audioUrl}`;

      console.log(
        "Generated audio URL:",
        generatedAudioUrl
      );

      setAudioUrl(generatedAudioUrl);

      setError("");
    } catch (err) {
      console.error("Frontend TTS Error:", err);

      setAudioUrl("");

      setIsPlaying(false);

      setError(
        err.message ||
          "Unable to generate speech. Please check that the backend server is running."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ================================
  // Clear
  // ================================

  const handleClear = () => {
    setText("");

    setAudioUrl("");

    setError("");

    setIsPlaying(false);

    if (audioRef.current) {
      audioRef.current.pause();

      audioRef.current.currentTime = 0;

      audioRef.current.removeAttribute("src");

      audioRef.current.load();
    }
  };

  // ================================
  // Play / Pause
  // ================================

  const handlePlayPause = async () => {
    if (!audioRef.current || !audioUrl) {
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
    } catch (err) {
      console.error(
        "Audio playback error:",
        err
      );

      setError(
        "Unable to play the generated audio."
      );
    }
  };

  // ================================
  // Change Speed
  // ================================

  const handleSpeedChange = (value) => {
    const newSpeed = Math.min(
      2,
      Math.max(0.5, speed + value)
    );

    setSpeed(newSpeed);

    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  // ================================
  // Download Audio
  // ================================

  const handleDownload = () => {
    if (!audioUrl) {
      return;
    }

    const link = document.createElement("a");

    link.href = audioUrl;

    link.download = "voiceflow-speech.mp3";

    link.target = "_blank";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  // ================================
  // Audio Events
  // ================================

  const handleAudioPlay = () => {
    setIsPlaying(true);

    setError("");
  };

  const handleAudioPause = () => {
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleAudioError = () => {
    console.error(
      "Audio could not be loaded:",
      audioUrl
    );

    setIsPlaying(false);

    setError(
      "The audio file could not be played. Please check the backend server."
    );
  };

  const handleAudioLoaded = () => {
    console.log(
      "Audio loaded successfully:",
      audioUrl
    );

    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // ================================
  // UI
  // ================================

  return (
    <div className="app">

      {/* ================================
          NAVBAR
      ================================= */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-icon">
            🔊
          </div>

          <div>
            <h2>VoiceFlow</h2>

            <span>
              Text to Speech
            </span>
          </div>

        </div>

        <div className="status">

          <span className="status-dot"></span>

          Ready

        </div>

      </header>


      {/* ================================
          MAIN
      ================================= */}

      <main className="main-container">

        {/* HERO */}

        <div className="hero">

          <div className="hero-badge">
            ✨ AI-Powered Voice Generator
          </div>

          <h1>

            Transform your

            <br />

            <span>
              text into speech
            </span>

          </h1>

          <p>
            Type your text, select a language and
            voice, and create natural audio in seconds.
          </p>

        </div>


        {/* ================================
            GENERATOR CARD
        ================================= */}

        <section className="generator-card">

          {/* TEXT HEADER */}

          <div className="text-header">

            <div>

              <h3>
                Enter your text
              </h3>

              <p>
                Write or paste the text you want
                to convert.
              </p>

            </div>

            <div className="counter">

              <span>
                Characters: {text.length} / {maxCharacters}
              </span>

              <span>
                Words: {wordCount}
              </span>

            </div>

          </div>


          {/* TEXTAREA */}

          <textarea
            value={text}
            maxLength={maxCharacters}
            onChange={(e) => {
              setText(e.target.value);
              setError("");
            }}
            placeholder="Paste your text or script here..."
          />


          {/* ================================
              CONTROLS
          ================================= */}

          <div className="controls-row">

            {/* LANGUAGE */}

            <div className="control-group language-control">

              <label>
                🌐 Language
              </label>

              <div className="select-wrapper">

                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);

                    setError("");
                  }}
                >

                  {languages.map((item) => (

                    <option
                      key={item.value}
                      value={item.value}
                    >

                      {item.flag} {item.label}

                    </option>

                  ))}

                </select>

              </div>

            </div>


            {/* VOICE */}

            <div className="control-group voice-control">

              <label>
                🔊 Voice
              </label>

              <div className="select-wrapper">

                <select
                  value={selectedVoice}
                  onChange={(e) =>
                    setSelectedVoice(e.target.value)
                  }
                >

                  {filteredVoices.length === 0 ? (

                    <option value="">
                      No voices available
                    </option>

                  ) : (

                    filteredVoices.map(
                      (voice, index) => {

                        const voiceId =
                          voice.id ||
                          voice.voice ||
                          voice.name ||
                          `voice-${index}`;

                        const voiceName =
                          voice.name ||
                          voice.voice ||
                          `Voice ${index + 1}`;

                        return (
                          <option
                            key={voiceId}
                            value={voiceId}
                          >
                            {voiceName}
                          </option>
                        );
                      }
                    )

                  )}

                </select>

              </div>

            </div>


            {/* SIDE BUTTONS */}

            <div className="side-buttons">

              <button
                className="small-action"
                type="button"
              >
                ↻ History
              </button>

              <button
                className="small-action"
                type="button"
              >
                ☷ Presets
              </button>

              <button
                className="small-action"
                type="button"
                onClick={handleDownload}
                disabled={!audioUrl}
              >
                ↓ Export
              </button>

            </div>

          </div>


          {/* ================================
              ACTION BUTTONS
          ================================= */}

          <div className="action-row">

            <button
              className="generate-button"
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
            >

              {isGenerating ? (

                <>
                  <span className="spinner"></span>

                  Generating...
                </>

              ) : (

                <>
                  🔊 Generate Speech
                </>

              )}

            </button>


            <button
              className="clear-button"
              type="button"
              onClick={handleClear}
            >
              Clear
            </button>

          </div>


          {/* ERROR */}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

        </section>


        {/* ================================
            AUDIO CARD
        ================================= */}

        <section className="audio-card">

          {/* WAVEFORM */}

          <div className="waveform">

            {Array.from({
              length: 70,
            }).map((_, index) => {

              const heights = [
                18, 25, 12, 35, 20,
                30, 15, 38, 22, 28,
                16, 34, 24, 12, 31,
                20, 36, 18, 27, 14
              ];

              return (
                <span
                  key={index}
                  style={{
                    height: `${
                      heights[index % heights.length]
                    }px`,
                  }}
                ></span>
              );

            })}

          </div>


          {/* AUDIO PLAYER */}

          {audioUrl && (

            <div className="audio-player-box">

              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                preload="auto"
                onPlay={handleAudioPlay}
                onPause={handleAudioPause}
                onEnded={handleAudioEnded}
                onError={handleAudioError}
                onLoadedMetadata={handleAudioLoaded}
              />

            </div>

          )}


          {/* AUDIO CONTROLS */}

          <div className="audio-controls">

            <div className="left-audio-controls">

              {/* PLAY */}

              <button
                className="audio-button play"
                type="button"
                onClick={handlePlayPause}
                disabled={!audioUrl}
              >

                {isPlaying
                  ? "⏸ Pause"
                  : "▶ Play"}

              </button>


              {/* PAUSE */}

              <button
                className="audio-button"
                type="button"
                onClick={() => {

                  if (audioRef.current) {
                    audioRef.current.pause();
                  }

                }}
                disabled={!audioUrl}
              >
                ⏸ Pause
              </button>


              {/* SPEED */}

              <div className="speed-control">

                <span>
                  Speed
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleSpeedChange(-0.25)
                  }
                  disabled={speed <= 0.5}
                >
                  −
                </button>

                <span className="speed-value">
                  {speed.toFixed(2)}x
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleSpeedChange(0.25)
                  }
                  disabled={speed >= 2}
                >
                  +
                </button>

              </div>

            </div>


            {/* DOWNLOAD */}

            <button
              className="download-button"
              type="button"
              onClick={handleDownload}
              disabled={!audioUrl}
            >
              ↓ Download
            </button>

          </div>

        </section>


        {/* ================================
            FEATURES
        ================================= */}

        <section className="features">

          <div className="feature-card purple">

            <div className="feature-icon">
              🌐
            </div>

            <div>

              <h3>
                Multiple Languages
              </h3>

              <p>
                Choose from different supported
                languages.
              </p>

            </div>

          </div>


          <div className="feature-card blue">

            <div className="feature-icon">
              ⚡
            </div>

            <div>

              <h3>
                Fast Generation
              </h3>

              <p>
                Convert your text into audio quickly.
              </p>

            </div>

          </div>


          <div className="feature-card orange">

            <div className="feature-icon">
              🔊
            </div>

            <div>

              <h3>
                Speech & Download
              </h3>

              <p>
                Convert your text into audio easily.
              </p>

            </div>

          </div>


          <div className="feature-card green">

            <div className="feature-icon">
              🎧
            </div>

            <div>

              <h3>
                Listen & Download
              </h3>

              <p>
                Play your generated audio or download it.
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* ================================
          FOOTER
      ================================= */}

      <footer>
        © 2026 VoiceFlow • Text to Speech Application
      </footer>

    </div>
  );
}

export default App;