import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import 'bootstrap/dist/css/bootstrap.min.css';

const socket = io("https://testingcs.vercel.app");

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState("");       // final joined user
  const [nameInput, setNameInput] = useState(""); // input state
  const msgEndRef = useRef(null);

  useEffect(() => {
    socket.on("messages:init", (msgs) => setMessages(msgs));
    socket.on("messages:reset", (msgs) => setMessages(msgs));
    socket.on("chat:message", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("messages:init");
      socket.off("messages:reset");
      socket.off("chat:message");
    };
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const join = () => {
    if (nameInput.trim()) {
      setUser(nameInput); // set final user name
      socket.emit("user:join", nameInput);
    }
  };

  const sendMessage = () => {
    if (text.trim() && user.trim()) {
      socket.emit("chat:message", { user, text });
      setText("");
    }
  };

  return (
    <div className="container-fluid bg-dark text-light d-flex align-items-center justify-content-center vh-100">
      {!user ? (
        <div className="card bg-secondary p-4 shadow" style={{ width: "300px" ,overflowY:"scroll"}}>
          <h4 className="text-center mb-3">Enter Your Name</h4>
          <input
            className="form-control mb-3"
            placeholder="Your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <button onClick={join} className="btn btn-primary w-100">
            Join Chat
          </button>
        </div>
      ) : (
        <div className="card bg-secondary shadow" style={{ width: "100%", maxWidth: "500px", height: "90vh" }}>
          {/* Header */}
          <div className="card-header bg-primary text-white text-center">
            Welcome, {user}
          </div>

          {/* Messages */}
          <div className="card-body overflow-auto" style={{ flex: 1 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`d-flex mb-2 ${
                  m.user === user ? "justify-content-end" : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 rounded ${
                    m.user === user ? "bg-primary text-white" : "bg-light text-dark"
                  }`}
                  style={{ maxWidth: "75%" }}
                >
                  <div>{m.text}</div>
                  <small className="d-block text-muted" style={{ fontSize: "0.7rem" }}>
                    {m.user} • {new Date(m.ts).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))}
            <div ref={msgEndRef}></div>
          </div>

          {/* Input */}
          <div className="card-footer">
            <div className="input-group">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="form-control"
              />
              <button onClick={sendMessage} className="btn btn-success">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
