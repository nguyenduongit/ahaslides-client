import { useState } from "react";
import axios from "axios";
import styles from "./AutoVote.module.css";
import { useLog } from "../context/LogContext";

interface AnswerOption {
  id: number;
  title: string;
  votesCount: number;
  imageCropped: string;
}

interface AutoVoteProps {
  accessCode: string;
  presentationId: number;
  slideId: number;
  initialAnswerOptions: AnswerOption[];
}

function generateAudience() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

function generateSlideTimestamp() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function AutoVote({
  accessCode,
  presentationId,
  slideId,
  initialAnswerOptions,
}: AutoVoteProps) {
  const { addLog } = useLog();
  const [answerOptions, setAnswerOptions] = useState(initialAnswerOptions);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(
    initialAnswerOptions[0]?.id || null
  );
  const [isVoting, setIsVoting] = useState(false);

  // --- THAY ĐỔI: State cho số lượng vote tùy chỉnh ---
  const [customVoteCount, setCustomVoteCount] = useState("10");

  // --- THAY ĐỔI: Hàm xử lý submit form ---
  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn form tải lại trang

    const voteCount = parseInt(customVoteCount, 10);
    if (isNaN(voteCount) || voteCount <= 0) {
      addLog(
        "Lỗi: Vui lòng nhập một số lượng vote hợp lệ.",
        "AutoVote",
        "error"
      );
      return;
    }

    if (selectedOptionId === null) {
      addLog("Lỗi: Vui lòng chọn một tiết mục để vote.", "AutoVote", "error");
      return;
    }

    setIsVoting(true);
    let successfulVotes = 0;
    const selectedTitle =
      answerOptions.find((opt) => opt.id === selectedOptionId)?.title ||
      `ID: ${selectedOptionId}`;
    addLog(
      `Bắt đầu gửi ${voteCount} phiếu cho tiết mục "${selectedTitle}"`,
      "AutoVote",
      "info"
    );

    for (let i = 0; i < voteCount; i++) {
      const payload = {
        presentation: presentationId,
        slide: slideId,
        accessCode,
        config: {
          timeToAnswer: 60,
          quizTimestamp: [],
          multipleChoice: false,
          isCorrectGetPoint: true,
          stopSubmission: false,
          fastAnswerGetMorePoint: false,
          otherCorrectQuiz: [],
          showVotingResultsOnAudience: true,
          version: 5,
        },
        type: "imageChoice",
        vote: [selectedOptionId],
        audience: generateAudience(),
        slideTimestamp: generateSlideTimestamp(),
      };

      try {
        await axios.post(
          "https://audience.ahaslides.com/api/stream/answers/poll",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
        successfulVotes++;
        setAnswerOptions((prevOptions) =>
          prevOptions.map((opt) =>
            opt.id === selectedOptionId
              ? { ...opt, votesCount: opt.votesCount + 1 }
              : opt
          )
        );
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          addLog(`Lỗi 400 (bỏ qua) ở phiếu ${i + 1}`, "AutoVote", "warning");
        } else {
          addLog(
            `Lỗi khi gửi phiếu thứ ${i + 1}: ${error.message}`,
            "AutoVote",
            "error"
          );
        }
      }
      await new Promise((r) => setTimeout(r, 50)); // Giảm delay để vote nhanh hơn
    }

    addLog(
      `Hoàn tất! Đã gửi ${successfulVotes}/${voteCount} phiếu.`,
      "AutoVote",
      "success"
    );
    setIsVoting(false);
  };

  // --- THAY ĐỔI: Giao diện JSX mới ---
  return (
    <div className={styles.autoVoteContainer}>
      <h3>🗳️ Bình chọn</h3>
      <form onSubmit={handleVoteSubmit}>
        <div className={styles.voteSection}>
          <p className={styles.fieldLabel}>1. Chọn đáp án:</p>
          <div className={styles.radioList}>
            {answerOptions.map((option) => (
              <label key={option.id} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="voteOption"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                />
                <img
                  src={option.imageCropped}
                  alt={option.title}
                  className={styles.radioImage}
                />
                <span className={styles.radioTitle}>{option.title}</span>
                <span className={styles.currentVotes}>
                  ({option.votesCount} phiếu)
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.voteSection}>
          <p className={styles.fieldLabel}>2. Nhập số lượng và gửi:</p>
          <div className={styles.customVoteActions}>
            <input
              type="number"
              className={styles.voteInput}
              value={customVoteCount}
              onChange={(e) => setCustomVoteCount(e.target.value)}
              placeholder="Số vote"
              min="1"
              disabled={isVoting}
              required
            />
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isVoting || selectedOptionId === null}
            >
              {isVoting ? "Đang gửi..." : `Gửi ${customVoteCount || 0} Vote`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AutoVote;
