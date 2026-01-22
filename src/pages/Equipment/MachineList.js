import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaThermometerHalf,
  FaBoxOpen,
  FaClock,
  FaTimes,
  FaPlay,
  FaStop,
  FaTools,
  FaHistory,
  FaMicrochip,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdPrecisionManufacturing } from "react-icons/md";

// 🎨 디자인 컬러
const COLORS = {
  primary: "#8C85FF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  stop: "#9E9E9E",
  bg: "#F5F6FA",
  text: "#333",
  subText: "#888",
  cardBg: "#FFF",
};

const MachineList = () => {
  const [selectedMachine, setSelectedMachine] = useState(null);
  const navigate = useNavigate();
  const machines = [
    {
      id: "EQ-01",
      line: "가공 A라인",
      name: "CNC 1호기",
      type: "가공",
      status: "RUN",
      temp: "65°C",
      count: 1540,
      uptime: "04:20",
      operator: "김철수",
      eff: 92,
    },
    {
      id: "EQ-02",
      line: "가공 A라인",
      name: "CNC 2호기",
      type: "가공",
      status: "STOP",
      temp: "24°C",
      count: 0,
      uptime: "00:00",
      operator: "이영희",
      eff: 0,
    },
    {
      id: "EQ-03",
      line: "사출 B라인",
      name: "사출 A호기",
      type: "사출",
      status: "RUN",
      temp: "180°C",
      count: 3200,
      uptime: "08:10",
      operator: "박민수",
      eff: 88,
    },
    {
      id: "EQ-04",
      line: "사출 B라인",
      name: "사출 B호기",
      type: "사출",
      status: "ERROR",
      temp: "210°C",
      count: 450,
      uptime: "01:15",
      operator: "정수진",
      eff: 45,
    },
    {
      id: "EQ-05",
      line: "조립 C라인",
      name: "조립 로봇",
      type: "조립",
      status: "RUN",
      temp: "45°C",
      count: 890,
      uptime: "03:45",
      operator: "Robot_Admin",
      eff: 99,
    },
    {
      id: "EQ-06",
      line: "품질검사",
      name: "비전 검사",
      type: "검사",
      status: "WAIT",
      temp: "22°C",
      count: 0,
      uptime: "00:00",
      operator: "최동훈",
      eff: 0,
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={styles.titleIcon}>
            <MdPrecisionManufacturing size={24} color="#fff" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", color: COLORS.text }}>
              설비 모니터링
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: COLORS.subText }}>
              각 라인별 설비 상태를 실시간으로 확인합니다.
            </p>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {machines.map((machine) => (
          <SimpleCard
            key={machine.id}
            machine={machine}
            onClick={() => navigate(`/equipment/detail/${machine.id}`)}
          />
        ))}
      </div>

      {selectedMachine && (
        <MachineDetailModal
          machine={selectedMachine}
          onClose={() => setSelectedMachine(null)}
        />
      )}
    </div>
  );
};

// --- [수정된 카드] 겹침 해결 ---
const SimpleCard = ({ machine, onClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "RUN":
        return COLORS.success;
      case "STOP":
        return COLORS.stop;
      case "ERROR":
        return COLORS.danger;
      default:
        return COLORS.warning;
    }
  };
  const color = getStatusColor(machine.status);

  return (
    <div
      style={{ ...styles.card, borderLeft: `5px solid ${color}` }}
      onClick={onClick}
    >
      {/* 1. 상단 헤더: 라인명(왼쪽) vs 상태(오른쪽) -> 양쪽 정렬로 겹침 방지 */}
      <div style={styles.cardHeaderRow}>
        <div style={styles.lineBadge}>
          <FaMapMarkerAlt size={10} style={{ marginRight: "4px" }} />
          {machine.line}
        </div>
        <span
          style={{
            ...styles.statusBadge,
            color: color,
            backgroundColor: `${color}15`,
          }}
        >
          {machine.status}
        </span>
      </div>

      {/* 2. 설비 정보 */}
      <div style={{ marginBottom: "15px" }}>
        <span style={styles.cardType}>{machine.type}</span>
        <h3 style={styles.cardName}>{machine.name}</h3>
      </div>

      {/* 3. 하단 푸터 */}
      <div style={styles.cardFooter}>
        <span style={{ fontSize: "12px", color: COLORS.subText }}>
          ID: {machine.id}
        </span>
        <span
          style={{ fontSize: "12px", fontWeight: "bold", color: COLORS.text }}
        >
          {machine.status === "RUN"
            ? "가동중 🟢"
            : machine.status === "ERROR"
              ? "점검필요 🔴"
              : "정지 ⚪"}
        </span>
      </div>
    </div>
  );
};

// --- 모달 (이전과 동일) ---
const MachineDetailModal = ({ machine, onClose }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "RUN":
        return COLORS.success;
      case "STOP":
        return COLORS.stop;
      case "ERROR":
        return COLORS.danger;
      default:
        return COLORS.warning;
    }
  };
  const color = getStatusColor(machine.status);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div
          style={{ ...styles.modalHeader, borderBottom: `4px solid ${color}` }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ ...styles.modalIconBox, backgroundColor: color }}>
              <FaMicrochip size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "22px" }}>{machine.name}</h2>
              <span style={{ fontSize: "13px", color: COLORS.subText }}>
                {machine.id} | {machine.type}
              </span>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <FaTimes size={20} />
          </button>
        </div>

        <div style={styles.modalBody}>
          <div style={styles.statsRow}>
            <StatBox
              icon={<FaThermometerHalf />}
              label="온도"
              value={machine.temp}
              color={COLORS.primary}
            />
            <StatBox
              icon={<FaBoxOpen />}
              label="생산량"
              value={`${machine.count} EA`}
              color={COLORS.success}
            />
            <StatBox
              icon={<FaClock />}
              label="가동시간"
              value={machine.uptime}
              color={COLORS.warning}
            />
          </div>
          <div style={styles.divider} />
          <div style={styles.infoGrid}>
            <InfoItem label="소속 라인" value={machine.line} highlight />
            <InfoItem label="담당자" value={machine.operator} />
            <InfoItem label="가동 효율" value={`${machine.eff}%`} />
            <InfoItem
              label="특이사항"
              value={machine.status === "ERROR" ? "모터 과열 경고" : "없음"}
              isError={machine.status === "ERROR"}
            />
          </div>
          <div style={styles.controlPanel}>
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#666",
              }}
            >
              제어 패널
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <ControlButton
                icon={<FaPlay />}
                label="가동 시작"
                color={COLORS.success}
                disabled={machine.status === "RUN"}
              />
              <ControlButton
                icon={<FaStop />}
                label="강제 정지"
                color={COLORS.danger}
                disabled={machine.status === "STOP"}
              />
              <ControlButton
                icon={<FaTools />}
                label="점검 요청"
                color={COLORS.warning}
              />
              <ControlButton
                icon={<FaHistory />}
                label="로그 보기"
                color={COLORS.primary}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, value, color }) => (
  <div style={styles.statBox}>
    <div style={{ color: color, fontSize: "20px", marginBottom: "5px" }}>
      {icon}
    </div>
    <div style={{ fontSize: "12px", color: COLORS.subText }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: "bold", color: COLORS.text }}>
      {value}
    </div>
  </div>
);

const InfoItem = ({ label, value, highlight, isError }) => (
  <div style={styles.infoItem}>
    <span style={{ fontSize: "13px", color: COLORS.subText }}>{label}</span>
    <span
      style={{
        fontSize: "14px",
        fontWeight: "bold",
        color: isError
          ? COLORS.danger
          : highlight
            ? COLORS.primary
            : COLORS.text,
      }}
    >
      {value}
    </span>
  </div>
);

const ControlButton = ({ icon, label, color, disabled }) => (
  <button
    disabled={disabled}
    style={{
      ...styles.controlBtn,
      backgroundColor: disabled ? "#eee" : color,
      color: disabled ? "#aaa" : "#fff",
      cursor: disabled ? "not-allowed" : "pointer",
    }}
  >
    {icon} <span style={{ marginLeft: "5px" }}>{label}</span>
  </button>
);

const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: {
    marginBottom: "30px",
  },
  titleIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.3)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    display: "flex", // Flex로 레이아웃 정렬
    flexDirection: "column",
    justifyContent: "space-between", // 위아래 간격 분배
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    },
  },
  // ★ 수정된 헤더 행 (양쪽 정렬)
  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  // 라인 배지 (absolute 제거)
  lineBadge: {
    fontSize: "11px",
    fontWeight: "bold",
    color: COLORS.subText,
    backgroundColor: "#F0F0F0",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
  },
  statusBadge: {
    fontSize: "11px",
    fontWeight: "bold",
    padding: "4px 8px",
    borderRadius: "10px",
  },
  cardType: {
    fontSize: "12px",
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: "4px",
    display: "inline-block",
  },
  cardName: {
    margin: 0,
    fontSize: "18px",
    color: COLORS.text,
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #eee",
    paddingTop: "10px",
    marginTop: "auto", // 내용이 적어도 Footer는 바닥에 붙게
  },
  // --- 모달 스타일 ---
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  modalIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    border: "none",
    background: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#999",
  },
  modalBody: {
    padding: "25px",
  },
  statsRow: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: "20px",
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  divider: {
    height: "1px",
    backgroundColor: "#eee",
    margin: "20px 0",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
    marginBottom: "25px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  controlPanel: {
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "12px",
  },
  controlBtn: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default MachineList;
