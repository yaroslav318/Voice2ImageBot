import React, { useRef, useEffect, useState } from "react";
import Modal from "react-modal";
import "./App.css"; // Import the CSS file for styling

Modal.setAppElement("#root");

function App() {
  const [value, setValue] = useState("");
  const [modalValue, setModalValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking] = useState(false);
  const chatFeedRef = useRef(null);
  

  const createNewChat = () => {
    const chatNumber = previousChats.length;
    const uniqueTitle = `Chat ${chatNumber}`;
    setMessage(null);
    setValue("");
    setCurrentTitle(uniqueTitle.substring(0, 10));
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
  };

  const handleRename = (uniqueTitle) => {
    setIsPromptOpen(true);
    setModalValue(uniqueTitle);
  };

  const handlePromptClose = () => {
    setIsPromptOpen(false);
  };

  const handlePromptSubmit = () => {
    if (modalValue.length > 15) {
      setIsAlertOpen(true);
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
    if (!value) return; // Return if the input is empty

    setIsLoading(true);

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
      const response = await fetch(
        "http://localhost:8000/completions",
        options
      );
      const data = await response.json();
      console.log(data);
      setMessage(data.choices[0].message);
      if (isSpeaking) {
        stopSpeaking();
      }
      // Read aloud the response content
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (content) => {
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.onend = () => {
      stopSpeaking();
    };
    speechSynthesis.speak(utterance);

    // Update the speaking state for the current chat message
    setPreviousChats((prevChats) =>
      prevChats.map((chat) =>
        chat.title === currentTitle ? { ...chat, isSpeaking: true } : chat
      )
    );
  };

  const stopSpeaking = () => {
    const speechSynthesis = window.speechSynthesis;
    speechSynthesis.cancel();

    // Update the speaking state for the current chat message
    setPreviousChats((prevChats) =>
      prevChats.map((chat) =>
        chat.title === currentTitle ? { ...chat, isSpeaking: false } : chat
      )
    );
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
      if (isPromptOpen) {
        e.preventDefault(); // Prevent form submission
        handlePromptSubmit(); // Programmatically click the "Rename" button
      } else {
        getMessages();
      }
    }
  };

  const [isListening, setIsListening] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      recognition.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
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
      getMessages();
    }
  };

  const handleDeleteChat = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setIsDeletePromptOpen(true);
  };

  const handleDeletePromptClose = () => {
    setIsDeletePromptOpen(false);
  };

  const handleDeleteConfirm = () => {
    setPreviousChats((prevChats) =>
      prevChats.filter((chat) => chat.title !== currentTitle)
    );
    setIsDeletePromptOpen(false);
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
  };

  const handlekeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setValue((prevValue) => prevValue + "\n");
    } else if (e.key === "Enter") {
      e.preventDefault();
      getMessages();
    }
  };

  return (
    <div className="app">
      <section className="side-bar">
        <button onClick={createNewChat}>+ New Conversation</button>
        <ul className="history">
          {uniqueTitles.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              <div className="chat-title-container">
                <button
                  className="rename"
                  onClick={() => handleRename(uniqueTitle)}
                >
                  <img className="renameimg" alt="rename button" />
                </button>
                <span>{uniqueTitle}</span>
                <button
                  className="delete"
                  onClick={() => handleDeleteChat(uniqueTitle)}
                >
                  <img className="deleteimg" alt="delete button" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>
      <section
        className={`main ${isPromptOpen || isDeletePromptOpen ? "blur" : ""}`}
      >
        {<h1 className="title">INTELLIBOT</h1>}
        <ul className="feed">
  {currentChat.map((chatMessage, index) => (
    <li key={index}>
      <div className="message-container">
        <div className="role-container">
          <p className="role">{chatMessage.role}</p>
          {chatMessage.role === "assistant" && (
            <button
              className="speak-button"
              onClick={() => {
                if (chatMessage.isSpeaking) {
                  stopSpeaking();
                } else {
                  speak(chatMessage.content);
                }
              }}
            >
              {chatMessage.isSpeaking ? (
                <img className="speak" alt="Stop" />
              ) : (
                <img className="speak" alt="Speak" />
              )}
            </button>
          )}
        </div>
        <pre>
          <span>{chatMessage.content}</span>
        </pre>
      </div>
    </li>
  ))}
  <div ref={chatFeedRef} />{/* Empty div for scrolling */}
</ul>

        <div className="bottom-section">
          <div className={"input-container"}>
            <textarea
              id="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handlekeyPress}
              placeholder="Type your message..."
            />
            {isListening ? (
              <button className="voice_lisenting" onClick={stopListening}>
                <img className="listen" alt="Listen" />
              </button>
            ) : (
              <button className="voice_lisenting" onClick={startListening}>
                <img className="mic" alt="Microphone" />
              </button>
            )}

            <div
              id="submit"
              className={isLoading ? "loading" : ""}
              onClick={getMessages}
            >
              {isLoading ? (
                <>
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </>
              ) : (
                <span>&#10146;</span>
              )}
            </div>
          </div>

          <p className={"info"}>Made by Rahmath, Hussain, Owais</p>
        </div>
      </section>
      <Modal
        isOpen={isPromptOpen}
        onRequestClose={handlePromptClose}
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>Enter New Title</h2>
        <input
          type="text"
          value={modalValue}
          onChange={(e) => setModalValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div>
          <button onClick={handlePromptSubmit}>Rename</button>
          <button onClick={handlePromptClose}>Cancel</button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeletePromptOpen}
        onRequestClose={handleDeletePromptClose}
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>Are you sure?</h2>
        <p className="delete-prompt">Do you want to delete this chat?</p>
        <div>
          <button onClick={handleDeleteConfirm}>Yes</button>
          <button onClick={handleDeletePromptClose}>No</button>
        </div>
      </Modal>
      <Modal
        isOpen={isAlertOpen}
        onRequestClose={handleAlertClose}
        className="custom-modal"
        overlayClassName="custom-modal-overlay"
      >
        <h2>Alert</h2>
        <p className="alert">
          The chat name is too big. Please try a shorter one.The limit is upto
          13 characters.
        </p>
        <button onClick={handleAlertClose}>OK</button>
      </Modal>
    </div>
  );
}

export default App;
