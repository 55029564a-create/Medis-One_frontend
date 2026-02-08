import React, { useState, useEffect } from "react";
import { FaHistory, FaTimes, FaSpinner } from "react-icons/fa";
import { getBomHistory } from "../../api/bomApi"; // API 함수 임포트

const COLORS = {
  primary: "#8C85FF",
  success: "#00C851",
  danger: "#FF4444",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
};

const BomHistoryModal = ({ productId, onClose }) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [productId]);

  const fetchHistory = async () => {
    try {
      const data = await getBomHistory(productId);
      setHistory(data || []);
    } catch (error) {
      console.error("이력 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 변경 유형별 뱃지 스타일
  const getTypeBadge = (type) => {
    let bg = "#eee";
    let color = "#666";
    let label = type;

    if (type === "CREATE") {
      bg = `${COLORS.success}20`;
      color = COLORS.success;
      label = "신규 등록";
    } else if (type === "UPDATE") {
      bg = `${COLORS.primary}20`;
      color = COLORS.primary;
      label = "수정";
    } else if (type === "DELETE") {
      bg = `${COLORS.danger}20`;
      color = COLORS.danger;
      label = "삭제";
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "bold",
        }}
      >
        {label}
      </span>
    );
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>
            <FaHistory style={{ marginRight: "8px", color: COLORS.primary }} />
            BOM 변경 이력
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {isLoading ? (
            <div style={styles.loadingState}>
              <FaSpinner className="spin" size={24} color={COLORS.primary} />
              <p>이력을 불러오는 중...</p>
            </div>
          ) : history.length === 0 ? (
            <div style={styles.emptyState}>변경 이력이 없습니다.</div>
          ) : (
            <div style={styles.timeline}>
              {history.map((log) => (
                <div key={log.id} style={styles.logItem}>
                  <div style={styles.logHeader}>
                    {getTypeBadge(log.changeType)}
                    <span style={styles.date}>
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.logContent}>
                    <p style={styles.description}>{log.description}</p>
                    <div style={styles.worker}>
                      작업자: <strong>{log.worker || "시스템"}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.confirmBtn}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1200,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "500px",
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  header: {
    padding: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "bold",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
  },
  body: {
    padding: "20px",
    overflowY: "auto",
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    fontSize: "14px",
  },
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  logItem: {
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  date: {
    fontSize: "12px",
    color: "#999",
  },
  logContent: {
    fontSize: "14px",
    color: "#333",
  },
  description: {
    margin: "0 0 8px 0",
    lineHeight: "1.4",
  },
  worker: {
    fontSize: "12px",
    color: "#666",
    textAlign: "right",
  },
  footer: {
    padding: "15px 20px",
    borderTop: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "flex-end",
  },
  confirmBtn: {
    padding: "8px 20px",
    backgroundColor: COLORS.text, // 닫기는 무채색 계열로
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default BomHistoryModal;
