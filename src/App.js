import React, { useRef, useEffect, useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root");

function App() {
  const [value, setValue] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const chatFeedRef = useRef(null); // Reference to chat feed container

  const createNewChat = () => {
    const chatNumber = previousChats.length; // Generate unique timestamp
    const uniqueTitle = `Chat ${chatNumber}`;
    setMessage(null);
    setValue("");
    setCurrentTitle(uniqueTitle.substring(0, 10));
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setValue("");
  };

  const handleRename = (uniqueTitle) => {
    setIsPromptOpen(true);
    setModalValue(uniqueTitle);
  };

  const handlePromptClose = () => {
    setIsPromptOpen(false);
  };

  const handlePromptSubmit = () => {
    if (modalValue.length > 18) {
      alert("The chat name is too big. Please try a shorter one.");
    } else {
      setPreviousChats((prevChats) =>
        prevChats.map((chat) =>
          chat.title === currentTitle ? { ...chat, title: modalValue } : chat
        )
      );
      setIsPromptOpen(false);
    }
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
  const handleDeleteChat = (uniqueTitle) => {
    setPreviousChats((prevChats) => prevChats.filter((chat) => chat.title !== uniqueTitle));
  };
  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Conversation</button>
        <ul className="history">
          {uniqueTitles.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              <div className="chat-title-container">
                <button className="rename" onClick={() => handleRename(uniqueTitle)}>
                  <span>&#128393;</span>
                </button>
                <span>{uniqueTitle}</span>
                <button className="delete" onClick={() => handleDeleteChat(uniqueTitle)}>
        <span>&#128465;</span></button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section className={`main ${isPromptOpen ? 'blur' : ''}`}>
        {!currentTitle ? null : <h1 className="title">INTELLIBOT</h1>}
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
              id="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />

            {isListening ? (
              <button className="voice_lisenting" onClick={stopListening}>
                &#127897;
              </button>
            ) : (
              <button className="voice_lisenting" onClick={startListening}>
                &#127897;
              </button>
            )}

            <div id="submit" onClick={getMessages}>
              &#10146;
            </div>
          </div>
          <p className={"info"}>Made by Rahmath, Hussain, Owais</p>
        </div>
      </section>
      <Modal isOpen={isPromptOpen} onRequestClose={handlePromptClose} className="custom-modal"
        overlayClassName="custom-modal-overlay" >
        <h2>Enter New Title</h2>
        <input
          type="text"
          value={modalValue}
          onChange={(e) => setModalValue(e.target.value)}
        />
        <div >
          <button onClick={() => handlePromptSubmit(value)}>Submit</button>
          <button onClick={handlePromptClose}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}

export default App;

