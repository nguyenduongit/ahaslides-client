// src/components/AhaSlidesClient.tsx

import { useState } from "react";
import { useAhaslides } from "../hooks/useAhaslides";
import { useLog } from "../context/LogContext"; // SỬA: Import hook useLog

export const AhaSlidesClient = () => {
  const [accessCode, setAccessCode] = useState("");
  const { addLog } = useLog(); // SỬA: Lấy hàm addLog từ context
  const { data, isLoading, error, executeFetch } = useAhaslides(addLog); // SỬA: Truyền addLog vào hook

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeFetch(accessCode.trim());
  };

  return (
    <div className="container">
      <h1>AhaSlides Data Fetcher 📊</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          placeholder="Nhập Access Code..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Đang tải..." : "Lấy dữ liệu"}
        </button>
      </form>

      {error && <div className="error-box">⛔ {error}</div>}

      {data && (
        <div className="results">
          {data.presentation && (
            <div className="data-section">
              <h2>Dữ liệu trình bày</h2>
              <pre>{JSON.stringify(data.presentation, null, 2)}</pre>
            </div>
          )}
          {data.answers && (
            <div className="data-section">
              <h2>Dữ liệu câu trả lời</h2>
              <pre>{JSON.stringify(data.answers, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
