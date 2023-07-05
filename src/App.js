import React, { useRef, useEffect, useState } from "react";

function App() {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");

  const chatFeedRef = useRef(null); // Reference to chat feed container

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle("");
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  };

  const getMessages = async () => {
    const options = {
      method: "POST",
      body: JSON.stringify({
        message: value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
    try {
      const response = await fetch("http://localhost:8000/completions", options);
      const data = await response.json();
      console.log(data);
      setMessage(data.choices[0].message);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: "user",
          content: value,
        },
        {
          title: currentTitle,
          role: message.role,
          content: message.content,
        },
      ]);
    }
  }, [message]);

  useEffect(() => {
    chatFeedRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [previousChats]);

  const currentChat = previousChats.filter(
    (previousChat) => previousChat.title === currentTitle
  );
  const uniqueTitles = Array.from(
    new Set(previousChats.map((previousChat) => previousChat.title))
  );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      getMessages();
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      recognition.current =
        new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;

      recognition.current.onstart = () => {
        setIsListening(true);
      };

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        setValue(transcript);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    }
  }, []);

  const startListening = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      setIsListening(false);
      recognition.current.stop();
    }
  };

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New chat</button>
        <ul className="history">
          {uniqueTitles.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
            {uniqueTitle}
          </li>
        ))}
      </ul>
    </section>
    <section className="main">
      {!currentTitle && <h1>PoweredGPT</h1>}
      <ul className="feed">
        {currentChat.map((chatMessage, index) => (
          <li key={index}>
            <p className="role">{chatMessage.role}</p>
            <pre>
              <span>{chatMessage.content}</span>
            </pre>
          </li>
        ))}
        <div ref={chatFeedRef} /> {/* Empty div for scrolling */}
      </ul>
      <div className="bottom-section">
        <div className="input-container">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />

          {isListening ? (
            <button onClick={stopListening}>Stop Listening</button>
          ) : (
            <button onClick={startListening}>Start Listening</button>
          )}

          <div id="submit" onClick={getMessages}>
            &#10146;
          </div>
        </div>
        <p className={"info"}>Made by Rahmath, Hussain, Owais</p>
      </div>
    </section>
  </div>
);
}

export default App;
