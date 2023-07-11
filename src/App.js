/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useRef, useEffect, useState } from "react";
import Modal from "react-modal";
import DefaultPage from "./components/Default";
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
  const [isDefaultPage, setIsDefaultPage] = useState(true); // Track if the default page should be shown
  const [theme, setTheme] = useState("default");
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const toggleMenu = () => {
    setIsActive(!isActive);
  };
  const handleThemeChange = (selectedTheme) => {
    setTheme(selectedTheme);
    setIsThemeMenuOpen(false);
  };

  const handleThemeMenuToggle = () => {
    setIsThemeMenuOpen((prevState) => !prevState);
  };

  const createNewChat = async () => {
    setIsDefaultPage(true); // Hide the default page

    const chatNumber = previousChats.length;
    const uniqueTitle = `Chat ${chatNumber}`;
    setMessage(null);
    setValue("");
    setCurrentTitle(uniqueTitle.substring(0, 10));
    await fetch("http://localhost:8000/newSession", {
      method: "POST",
      body: JSON.stringify({
        message: value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const handleClick = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle);
    setMessage(null);
    setIsDefaultPage(false);
  };

  const handleRename = (uniqueTitle) => {
    setIsPromptOpen(true);
    setModalValue(uniqueTitle);
  };

  const handlePromptClose = () => {
    setIsPromptOpen(false);
  };

  const handlePromptSubmit = () => {
    if (modalValue.length > 16) {
      setIsAlertOpen(true);
    } else {
      setPreviousChats((prevChats) =>
        prevChats.map((chat) =>
          chat.title === currentTitle ? { ...chat, title: modalValue } : chat
        )
      );
      setIsPromptOpen(false);
      setCurrentTitle(modalValue);
    }
  };

  const getMessages = async () => {
    if (!value) return; // Return if the input is empty
    setPreviousChats((prevChats) => [
      ...prevChats,
      {
        title: currentTitle,
        role: "user",
        content: value,
      },
    ]);
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

      if (data.image) {
        // Check if the response contains an image
        setPreviousChats((prevChats) => [
          ...prevChats,
          {
            title: currentTitle,
            role: "assistant",
            content: "", // Empty content for the image message
            image: data.image, // Add the `image` property to the chat message
          },
        ]);
      } else {
        setPreviousChats((prevChats) => [
          ...prevChats,
          {
            title: currentTitle,
            role: "assistant",
            content: data.completion,
          },
        ]);
      }
      setValue("");
      if (isSpeaking) {
        stopSpeaking();
      }
      console.log("Assistant Response:", data.completion);
      console.log("Generated Image URL:", data.image);
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
          image: message.image, // Add the `image` property to the chat message
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
        e.preventDefault(); // Prevent from submission
        handlePromptSubmit(); // Programmatically click the "Rename" button
      } else {
        getMessages();
        setIsDefaultPage(true);
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
      setIsDefaultPage(false);
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
    setIsDefaultPage(true);
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
  };

  const handlekeyPress = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      setValue((prevValue) => prevValue + "\n");
    } else if (e.key === "Enter") {
      setIsDefaultPage(false);
      e.preventDefault();
      getMessages();
    }
  };

  return (
    <div className={`app ${theme}`}>
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
        <div
          id="circularMenu"
          className={`circular-menu ${isActive ? "active" : ""}`}
        >
          <a className="floating-btn" onClick={toggleMenu}>
            <i className="fa fa-plus"></i>
          </a>

          <menu className="items-wrapper">
            <a
              className={`dark menu-item fa fa-linkedin ${
                theme === "dark" ? "active" : ""
              }`}
              onClick={() => handleThemeChange("dark")}
            ></a>
            <a
              className={`light menu-item fa fa-linkedin ${
                theme === "light" ? "active" : ""
              }`}
              onClick={() => handleThemeChange("light")}
            ></a>
            <a
              className={`blue menu-item fa fa-linkedin ${
                theme === "blue" ? "active" : ""
              }`}
              onClick={() => handleThemeChange("blue")}
            ></a>
            <a
              className={`default menu-item fa fa-linkedin ${
                theme === "default" ? "active" : ""
              }`}
              onClick={() => handleThemeChange("default")}
            ></a>
          </menu>
        </div>
      </section>

      <section
        className={`main ${isPromptOpen || isDeletePromptOpen ? "blur" : ""}`}
      >
        <h1 className="title">INTELLIBOT</h1>
        {isDefaultPage ? (
          <DefaultPage />
        ) : (
          <ul className="feed">
            {currentChat.map((chatMessage, index) => (
              <li key={index}>
                <div className="message-container">
                  {chatMessage && ( // Add null check for chatMessage
                    <div className="role-container">
                      <p className="role">{chatMessage.role}</p>
                      {chatMessage.role === "assistant" &&
                        chatMessage.content && (
                          <button
                            className="speak-button"
                            onClick={() => {
                              if (chatMessage.isSpeaking) {
                                stopSpeaking();
                              } else {
                                const content =
                                  chatMessage.role === "user"
                                    ? chatMessage.content.content
                                    : chatMessage.content.content;
                                speak(content);
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
                  )}
                  {chatMessage && chatMessage.image ? ( // Add null check for chatMessage
                    <img
                      className="generated-image"
                      src={chatMessage.image}
                      alt="Generated"
                    />
                  ) : (
                    chatMessage &&
                    chatMessage.content && ( // Add null check for chatMessage and content
                      <pre>
                        <span>
                          {chatMessage.role === "user"
                            ? chatMessage.content
                            : chatMessage.content.content}
                        </span>
                      </pre>
                    )
                  )}
                </div>
              </li>
            ))}
            <div ref={chatFeedRef} />
            {/* Empty div for scrolling */}
          </ul>
        )}
        <div className="bottom-section">
          <div className={"input-container"}>
            <textarea
              id="input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyPress={handlekeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
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
        <div className="alert">
          <h2>Alert</h2>
          <p>
            The chat name is too big. Please try a shorter one.The limit is upto
            16 characters.
          </p>
          <button onClick={handleAlertClose}>OK</button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
