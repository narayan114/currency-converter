import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css"; // make sure you have basic styles or paste styles below

const App = () => {
  const [amount, setAmount] = useState();
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("INR");
  const [converted, setConverted] = useState("");
  const [spokenText, setSpokenText] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [lang, setLang] = useState("en-US");

  const GOOGLE_TRANSLATE_API_KEY = "AIzaSyDeNRUMpIz6RYLgg36zSM7RMl8Uth1AVIw"; // 🔐 Replace this

  const translateText = async (
    text,
    sourceLang = "auto",
    targetLang = "en"
  ) => {
    const url = `https://translation.googleapis.com/language/translate/v2`;

    try {
      const response = await axios.post(
        url,
        {
          q: text,
          source: sourceLang,
          target: targetLang,
          format: "text",
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: GOOGLE_TRANSLATE_API_KEY },
        }
      );

      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return null;
    }
  };

  const handleVoiceCommand = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support Speech Recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.start();

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);

      setTimeout(async () => {
        setSpokenText(""); // hide caption after 2s
        const translated = await translateText(transcript, lang, "en");
        console.log("Translated:", translated);

        const regex = /convert\s+(\d+)\s+([a-zA-Z]{3})\s+to\s+([a-zA-Z]{3})/;
        const match = translated?.toLowerCase().match(regex);

        if (match) {
          const amt = Number(match[1]);
          const from = match[2].toUpperCase();
          const to = match[3].toUpperCase();
          setAmount(amt);
          setFromCur(from);
          setToCur(to);
        } else {
          alert("Sorry, I couldn't understand the command.");
        }
      }, 2000);
    };
  };

  useEffect(() => {
    async function convert() {
      if (fromCur === toCur) {
        setConverted(amount);
        return;
      }
      const res = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCur}&to=${toCur}`
      );
      const data = await res.json();
      setConverted(data.rates[toCur]);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }

    convert();
  }, [amount, fromCur, toCur]);

  return (
    <div className="app">
      <div className="card">
        <h1>🌍 Multilingual Currency Converter</h1>

        {spokenText && (
          <div className="spoken-text">
            🗣️ You said: <em>"{spokenText}"</em>
          </div>
        )}

        <div className="form-group">
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Enter amount"
          />
        </div>

        <div className="selectors">
          <select value={fromCur} onChange={(e) => setFromCur(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="AUD">AUD</option>
            <option value="INR">INR</option>
          </select>

          <select value={toCur} onChange={(e) => setToCur(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="AUD">AUD</option>
            <option value="INR">INR</option>
          </select>
        </div>

        <div className="lang-select">
          🌐 Language:
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="ar-SA">Arabic</option>
          </select>
        </div>

        <button className="voice-btn" onClick={handleVoiceCommand}>
          🎙 Speak
        </button>

        <p className="result">
          Your total of {amount} {fromCur} is <strong>{converted}</strong>{" "}
          {toCur}
        </p>

        {showNotification && (
          <div className="notification">✅ Conversion completed!</div>
        )}
      </div>
    </div>
  );
};

export default App;
