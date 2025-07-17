// src/App.tsx
import { useState } from "react";
import { LogProvider } from "./context/LogContext";
import AhaSlidesUI from "./components/AhaSlidesUI";
import "./index.css"; // Giữ lại CSS chung

function App() {
  const [url, setUrl] = useState("");
  const [accessCode, setAccessCode] = useState<string | null>(null);

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const urlObject = new URL(url);
      const pathParts = urlObject.pathname.split("/").filter(Boolean);
      const code = pathParts[pathParts.length - 1];

      if (code) {
        setAccessCode(code);
      } else {
        alert("URL không hợp lệ hoặc không tìm thấy Access Code.");
        setAccessCode(null);
      }
    } catch (error) {
      alert("Vui lòng nhập một URL hợp lệ.");
      setAccessCode(null);
    }
  };

  return (
    <LogProvider>
      <main>
        <div className="url-input-container">
          <h2>Nhập URL AhaSlides</h2>
          <form onSubmit={handleUrlSubmit}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://audience.ahaslides.com/..."
            />
            <button type="submit">Bắt đầu</button>
          </form>
        </div>

        {/* Component UI chính sẽ nhận accessCode và tự động fetch */}
        <AhaSlidesUI accessCode={accessCode} />
      </main>
    </LogProvider>
  );
}

export default App;
