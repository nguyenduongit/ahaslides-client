import { useEffect } from "react";
import { useAhaslides } from "../hooks/useAhaslides";
import styles from "./AhaSlidesUI.module.css";
import { useLog } from "../context/LogContext";
import AutoVote from "./AutoVote";
import AutoReaction from "./AutoReaction";

interface AhaSlidesUIProps {
  accessCode: string | null;
}

interface AnswerOption {
  id: number;
  title: string;
  imageCropped: string;
  order: number;
  votesCount: number;
}

function AhaSlidesUI({ accessCode }: AhaSlidesUIProps) {
  const { addLog } = useLog();
  const { data, isLoading, error, executeFetch } = useAhaslides(addLog);

  useEffect(() => {
    if (accessCode) {
      executeFetch(accessCode);
    }
  }, [accessCode]);

  const presentationData = data?.presentation;
  const answerOptions: AnswerOption[] = data?.answers?.rows || [];

  const availableReactions = presentationData?.reactions
    ? Object.keys(presentationData.reactions).filter(
        (key) =>
          (presentationData.reactions as Record<string, boolean>)[key] === true
      )
    : [];

  return (
    <div className={styles.container}>
      {isLoading && (
        <p className={styles.status}>Đang tải dữ liệu từ AhaSlides...</p>
      )}
      {error && (
        <p className={styles.error}>
          Đã xảy ra lỗi: {error}. Vui lòng kiểm tra lại URL hoặc Access Code.
        </p>
      )}

      {/* --- PHẦN AUTO VOTE --- */}
      {!isLoading && presentationData && answerOptions.length > 0 && (
        <AutoVote
          accessCode={presentationData.uniqueAccessCode}
          presentationId={presentationData.id}
          slideId={presentationData.activeSlide}
          initialAnswerOptions={answerOptions.map((opt) => ({
            id: opt.id,
            title: opt.title,
            votesCount: opt.votesCount,
            imageCropped: opt.imageCropped,
          }))}
        />
      )}

      {/* --- PHẦN AUTO REACTION --- */}
      {!isLoading && presentationData && availableReactions.length > 0 && (
        // --- SỬA LỖI TẠI ĐÂY ---
        <AutoReaction
          accessCode={presentationData.uniqueAccessCode} // <-- THUỘC TÍNH BỊ THIẾU ĐÃ ĐƯỢC THÊM
          presentationId={presentationData.id}
          slideId={presentationData.activeSlide}
          presentationVersion={presentationData.version}
          availableReactions={availableReactions}
        />
        // --- KẾT THÚC SỬA LỖI ---
      )}

      {!isLoading && !data && !error && (
        <p className={styles.status}>
          Nhập URL của AhaSlides vào ô ở trên và nhấn "Bắt đầu" để tải dữ liệu.
        </p>
      )}
    </div>
  );
}

export default AhaSlidesUI;
