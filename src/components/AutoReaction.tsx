// src/components/AutoReaction.tsx

import { useState } from "react";
import axios from "axios";
import styles from "./AutoReaction.module.css";
import { useLog } from "../context/LogContext";

interface AutoReactionProps {
  accessCode: string;
  presentationId: number;
  slideId: number;
  presentationVersion: number;
  availableReactions: string[];
}

function generateAudienceId() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

function AutoReaction({
  accessCode,
  presentationId,
  slideId,
  presentationVersion,
  availableReactions,
}: AutoReactionProps) {
  const { addLog } = useLog();
  const [selectedReaction, setSelectedReaction] = useState(
    availableReactions[0] || ""
  );
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  const reactionEmojis: { [key: string]: string } = {
    like: "👍",
    heart: "❤️",
    laugh: "😂",
    wow: "😮",
    sad: "😢",
    question: "❓",
  };

  const handleReactionSubmit = async (reactionCount: number) => {
    if (!selectedReaction) {
      addLog("Lỗi: Vui lòng chọn một loại biểu cảm.", "AutoReaction", "error");
      return;
    }

    setIsSending(true);
    setSentCount(0);
    setTotalCount(reactionCount);
    setActiveButton(reactionCount);
    let successfulSends = 0;
    addLog(
      `Bắt đầu gửi ${reactionCount} biểu cảm '${selectedReaction}'`,
      "AutoReaction",
      "info"
    );

    for (let i = 0; i < reactionCount; i++) {
      const payload = {
        accessCode: accessCode,
        audienceId: generateAudienceId(),
        audienceName: "",
        slideId,
        presentationId,
        reactionType: selectedReaction,
        presentationVersion,
      };

      try {
        // --- SỬA LỖI: Quay lại gọi axios trực tiếp ---
        await axios.post(
          "https://audience.ahaslides.com/api/stream/reactions",
          payload,
          { headers: { "Content-Type": "application/json" } }
        );
        // --- KẾT THÚC SỬA LỖI ---
        successfulSends++;
      } catch (error: any) {
        addLog(
          `Lỗi khi gửi biểu cảm thứ ${i + 1}: ${error.message}`,
          "AutoReaction",
          "error"
        );
      }

      setSentCount((prev) => prev + 1);
      await new Promise((r) => setTimeout(r, 100));
    }

    addLog(
      `Hoàn tất! Đã gửi ${successfulSends}/${reactionCount} biểu cảm.`,
      "AutoReaction",
      "success"
    );
    setIsSending(false);
    setActiveButton(null);
  };

  const reactionOptions = [10, 50, 100, 200, 500];

  return (
    <div className={styles.reactionContainer}>
      <h3>❤️👍😂 Thả biểu cảm</h3>
      <div>
        <p className={styles.fieldLabel}>1. Chọn loại biểu cảm:</p>
        <div className={styles.reactionSelector}>
          {availableReactions.map((reaction) => (
            <label
              key={reaction}
              className={`${styles.radioLabel} ${
                selectedReaction === reaction ? styles.selected : ""
              }`}
            >
              <input
                type="radio"
                name="reactionType"
                value={reaction}
                checked={selectedReaction === reaction}
                onChange={() => setSelectedReaction(reaction)}
                className={styles.hiddenRadio}
              />
              <span className={styles.emoji}>
                {reactionEmojis[reaction] || reaction}
              </span>
            </label>
          ))}
        </div>
        <p className={styles.fieldLabel}>2. Chọn số lượng và gửi:</p>
        <div className={styles.controlGroup}>
          {reactionOptions.map((count) => (
            <button
              key={count}
              onClick={() => handleReactionSubmit(count)}
              className={styles.submitButton}
              disabled={isSending || !selectedReaction}
            >
              {isSending && activeButton === count
                ? `Đang gửi... (${sentCount}/${totalCount})`
                : `Thả ${count}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AutoReaction;
