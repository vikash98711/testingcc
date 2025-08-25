
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://testingcs.vercel.app"); // change to backend URL in prod

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState("");

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

  const join = () => {
    if (user.trim()) socket.emit("user:join", user);
  };

  const sendMessage = () => {
    if (text.trim() && user.trim()) {
      socket.emit("chat:message", { user, text });
      setText("");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!user ? (
        <div>
          <input placeholder="Enter name" onChange={(e) => setUser(e.target.value)} />
          <button onClick={join}>Join</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {user}</h2>
          <div style={{ height: 300, overflowY: "auto", border: "1px solid gray", marginBottom: 10 }}>
            {messages.map((m) => (
              <div key={m.id}>
                <b>{m.user}</b>: {m.text} <small>({new Date(m.ts).toLocaleTimeString()})</small>
              </div>
            ))}
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;
