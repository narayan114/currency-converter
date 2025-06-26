import React, { useEffect, useState } from "react";
import "./App.css";

const App = () => {
  const [amount, setAmount] = useState(1);
  const [fromCur, setFromCur] = useState("USD");
  const [toCur, setToCur] = useState("INR");
  const [converted, setConverted] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  // 🎙️ Speech Recognition Setup
  const handleVoiceCommand = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice input:", transcript);

      // Example: "convert 100 usd to inr"
      const regex = /convert\s+(\d+)\s+([a-zA-Z]{3})\s+to\s+([a-zA-Z]{3})/;
      const match = transcript.match(regex);

      if (match) {
        const amt = Number(match[1]);
        const from = match[2].toUpperCase();
        const to = match[3].toUpperCase();

        setAmount(amt);
        setFromCur(from);
        setToCur(to);
      } else {
        alert("Couldn't understand the command. Try: Convert 100 USD to INR");
      }
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
        <h1>💲Currency Converter 🪙</h1>

        <input
          type="number"
          value={amount}
          min={0}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Enter amount"
        />

        <div className="selectors">
          <select value={fromCur} onChange={(e) => setFromCur(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="AUD">AUD</option>
            <option value="INR">INR</option>
            <option value="INR">CAD</option>
          </select>

          <select value={toCur} onChange={(e) => setToCur(e.target.value)}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="AUD">AUD</option>
            <option value="INR">INR</option>
            <option value="INR">CAD</option>
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
          <div className="notification">✅ Conversion Completed!</div>
        )}
      </div>
    </div>
  );
};

export default App;
