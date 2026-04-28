"use client";

import { useState } from "react";

export default function SimulatorPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Тренажёр продаж</h1>

      <div style={{ marginBottom: 20 }}>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Напишите ответ клиенту..."
      />

      <button onClick={sendMessage}>
        Отправить
      </button>
    </main>
  );
}