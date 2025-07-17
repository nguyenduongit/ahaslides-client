// src/hooks/useAhaslides.ts
import { useState, useCallback } from "react";
import { fetchAhaslidesData, fetchAhaslidesAnswers } from "../api";
import type { LogType } from "../context/LogContext";

// ... Dán toàn bộ code của hook useAhaslides của bạn vào đây ...
// Ví dụ:
export const useAhaslides = (
  addLog: (
    message: string,
    source: string,
    type?: LogType,
    payload?: any
  ) => void
) => {
  // ... Toàn bộ logic hook của bạn
  const [data, setData] = useState<{
    presentation?: any;
    answers?: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeFetch = useCallback(
    async (accessCode: string) => {
      if (!accessCode) {
        const msg = "Access Code không hợp lệ để thực hiện yêu cầu.";
        setError(msg);
        addLog(msg, "AhaSlidesPlugin", "error");
        return;
      }

      const msgStart = `Bắt đầu quy trình lấy dữ liệu cho Access Code: ${accessCode}`;
      addLog(msgStart, "AhaSlidesPlugin", "info");
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        // --- Bước 1: Lấy dữ liệu trình bày chính ---
        addLog(
          "Bước 1: Lấy dữ liệu trình bày chính...",
          "AhaSlidesPlugin",
          "info"
        );
        const presentationData = await fetchAhaslidesData(accessCode);
        addLog(
          "Lấy dữ liệu trình bày thành công!",
          "AhaSlidesPlugin",
          "success",
          presentationData
        );

        // --- Bước 2: Trích xuất activeSlide và lấy dữ liệu câu trả lời ---
        const activeSlideId = presentationData?.activeSlide;

        if (activeSlideId) {
          addLog(
            `Bước 2: Tìm thấy activeSlide ID: ${activeSlideId}. Bắt đầu lấy dữ liệu câu trả lời...`,
            "AhaSlidesPlugin",
            "info"
          );

          const answersData = await fetchAhaslidesAnswers(
            accessCode,
            activeSlideId
          );

          setData({ presentation: presentationData, answers: answersData });
          addLog(
            "Lấy dữ liệu câu trả lời thành công!",
            "AhaSlidesPlugin",
            "success",
            answersData
          );
        } else {
          setData({ presentation: presentationData, answers: null });
          addLog(
            "Không tìm thấy 'activeSlide' hợp lệ. Chỉ hiển thị dữ liệu trình bày.",
            "AhaSlidesPlugin",
            "warning"
          );
        }
      } catch (err: any) {
        const errorMsg = `Lỗi trong quá trình lấy dữ liệu: ${err.message}`;
        setError(errorMsg);
        addLog(errorMsg, "AhaSlidesPlugin", "error");
      } finally {
        setIsLoading(false);
        addLog("Quy trình lấy dữ liệu đã hoàn tất.", "AhaSlidesPlugin", "info");
      }
    },
    [addLog]
  );

  return { data, isLoading, error, executeFetch };
};
