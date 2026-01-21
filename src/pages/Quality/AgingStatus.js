import React, { useState, useEffect } from "react";
import {
  FaThermometerHalf,
  FaClock,
  FaPlay,
  FaStop,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHistory,
  FaTv,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 🎨 MedisOne 테마
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  text: "#333",
  gray: "#888",
  border: "#E0E0E0",
  dark: "#263238", // 에이징 룸의 어두운 느낌
};

const AgingStatus = () => {
  // --- 상태 관리 ---
  const [chamberStatus, setChamberStatus] = useState("RUNNING"); // RUNNING, IDLE, COOLING
  const [currentTemp, setCurrentTemp] = useState(45.2); // 현재 온도
  const [targetTemp] = useState(45.0); // 목표 온도
  const [elapsedTime, setElapsedTime] = useState(7200); // 2시간 경과 (초 단위)
  const [selectedSlot, setSelectedSlot] = useState(null); // 클릭한 슬롯 상세정보

  // 📝 [Mock Data] 랙(Rack) 슬롯 데이터 (총 24개 슬롯)
  const [slots, setSlots] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      id: i + 1,
      panelId: `PNL-AGE-${26012100 + i}`,
      status: i === 5 ? "FAIL" : i > 20 ? "EMPTY" : "TESTING", // 6번은 불량, 21~24번은 빈 슬롯
      startTime: "2026-01-21 10:00",
      progress: i > 20 ? 0 : 85 + Math.random() * 10, // 진행률
      temp: 45 + (Math.random() * 2 - 1), // 개별 패널 온도
    })),
  );

  // 📊 [Chart Data] 온도 변화 그래프
  const [tempHistory, setTempHistory] = useState([]);

  // --- 시뮬레이션 로직 ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. 챔버 온도 변화 (45도 근처에서 미세 진동)
      const noise = Math.random() * 0.4 - 0.2;
      const newTemp = 45.0 + noise;
      setCurrentTemp(newTemp);

      // 2. 시간 흐름
      setElapsedTime((prev) => prev + 1);

      // 3. 차트 데이터 업데이트
      const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
      setTempHistory((prev) => {
        const newData = [...prev, { time: timeStr, temp: newTemp }];
        if (newData.length > 20) newData.shift(); // 최근 20개만 유지
        return newData;
      });

      // 4. 슬롯별 데이터 미세 변화
      setSlots((prevSlots) =>
        prevSlots.map((slot) => {
          if (slot.status === "TESTING") {
            return {
              ...slot,
              temp: 45 + (Math.random() * 3 - 1.5), // 패널 발열 시뮬레이션
              progress: Math.min(slot.progress + 0.05, 100),
            };
          }
          return slot;
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 시간 포맷 (HH:MM:SS)
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={styles.container}>
      {/* 1. 상단 헤더 & 컨트롤 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🔥 Aging Test Monitoring (에이징)</h2>
          <p style={styles.subtitle}>
            Chamber #01 (Medical Standard: 45°C / 24hr)
          </p>
        </div>
        <div style={styles.headerControls}>
          <div style={styles.statusBadge}>
            State:{" "}
            <span style={{ color: COLORS.success, fontWeight: "bold" }}>
              {chamberStatus}
            </span>
          </div>
          <button style={styles.controlBtn}>
            {chamberStatus === "RUNNING" ? <FaStop /> : <FaPlay />}
            {chamberStatus === "RUNNING" ? "EMERGENCY STOP" : "START"}
          </button>
        </div>
      </div>

      {/* 2. 메인 대시보드 그리드 */}
      <div style={styles.gridContainer}>
        {/* [좌측] 챔버 환경 모니터링 */}
        <div style={styles.envPanel}>
          {/* 온도계 표시 */}
          <div style={styles.tempDisplay}>
            <div style={styles.tempCircle}>
              <FaThermometerHalf size={30} color={COLORS.danger} />
              <span style={styles.tempValue}>{currentTemp.toFixed(1)}°C</span>
              <span style={styles.tempLabel}>Current</span>
            </div>
            <div style={styles.tempInfo}>
              <div style={styles.infoRow}>
                <span>Target:</span> <strong>{targetTemp}°C</strong>
              </div>
              <div style={styles.infoRow}>
                <span>Limit:</span>{" "}
                <span style={{ color: COLORS.danger }}>50°C</span>
              </div>
            </div>
          </div>

          {/* 타이머 표시 */}
          <div style={styles.timerDisplay}>
            <FaClock color={COLORS.primary} size={24} />
            <div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                Elapsed Time
              </div>
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          {/* 온도 그래프 */}
          <div style={styles.chartBox}>
            <h4 style={styles.boxTitle}>Temperature Trend</h4>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={tempHistory}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.danger}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.danger}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <YAxis domain={[40, 50]} hide />
                <Tooltip />
                <ReferenceLine y={45} stroke="red" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke={COLORS.danger}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* [중앙] Rack Map (패널 슬롯 시각화) */}
        <div style={styles.rackPanel}>
          <div style={styles.panelHeader}>
            <h3 style={styles.boxTitle}>
              <FaTv /> Rack View (Live Status)
            </h3>
            <div style={styles.legend}>
              <span style={{ color: COLORS.success }}>● Testing</span>
              <span style={{ color: COLORS.danger }}>● Fail</span>
              <span style={{ color: "#ccc" }}>● Empty</span>
            </div>
          </div>

          <div style={styles.slotGrid}>
            {slots.map((slot) => {
              // 상태별 스타일 결정
              let bgColor = "#eee";
              let borderColor = "transparent";
              let iconColor = "#ccc";

              if (slot.status === "TESTING") {
                bgColor = "#E8F5E9";
                borderColor = COLORS.success;
                iconColor = COLORS.success;
              } else if (slot.status === "FAIL") {
                bgColor = "#FFEBEE";
                borderColor = COLORS.danger;
                iconColor = COLORS.danger;
              }

              const isSelected = selectedSlot?.id === slot.id;

              return (
                <div
                  key={slot.id}
                  style={{
                    ...styles.slotBox,
                    backgroundColor: bgColor,
                    border: isSelected
                      ? `2px solid ${COLORS.primary}`
                      : `1px solid ${borderColor === "transparent" ? "#ddd" : borderColor}`,
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div style={styles.slotHeader}>
                    <span style={{ fontSize: "10px", fontWeight: "bold" }}>
                      #{slot.id}
                    </span>
                    {slot.status === "FAIL" && (
                      <FaExclamationTriangle color={COLORS.danger} size={10} />
                    )}
                  </div>
                  <FaTv
                    size={24}
                    color={iconColor}
                    style={{ margin: "5px 0" }}
                  />
                  {slot.status !== "EMPTY" && (
                    <div style={{ width: "100%", padding: "0 5px" }}>
                      <div style={styles.miniProgressBg}>
                        <div
                          style={{
                            ...styles.miniProgressFill,
                            width: `${slot.progress}%`,
                            backgroundColor: iconColor,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* [우측] 상세 정보 패널 */}
        <div style={styles.detailPanel}>
          <h3 style={styles.boxTitle}>📋 Detail Info</h3>
          {selectedSlot ? (
            selectedSlot.status === "EMPTY" ? (
              <div style={styles.emptyDetail}>빈 슬롯입니다.</div>
            ) : (
              <div style={styles.detailContent}>
                <DetailItem label="Slot No." value={`#${selectedSlot.id}`} />
                <DetailItem
                  label="Panel ID"
                  value={selectedSlot.panelId}
                  highlight
                />
                <DetailItem label="Start Time" value={selectedSlot.startTime} />

                <div style={styles.divider} />

                <DetailItem
                  label="Status"
                  value={selectedSlot.status}
                  color={
                    selectedSlot.status === "FAIL"
                      ? COLORS.danger
                      : COLORS.success
                  }
                />
                <DetailItem
                  label="Current Temp"
                  value={`${selectedSlot.temp.toFixed(1)} °C`}
                />

                <div style={{ marginTop: "20px" }}>
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginBottom: "5px",
                      display: "block",
                    }}
                  >
                    Progress
                  </label>
                  <div style={styles.progressContainer}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${selectedSlot.progress}%`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginTop: "5px",
                    }}
                  >
                    {selectedSlot.progress.toFixed(1)}%
                  </div>
                </div>

                {selectedSlot.status === "FAIL" && (
                  <div style={styles.errorBox}>
                    <strong>Error Code: E-402</strong>
                    <br />
                    Local Overheat Detected
                  </div>
                )}
              </div>
            )
          ) : (
            <div style={styles.emptyDetail}>
              슬롯을 클릭하여
              <br />
              상세 정보를 확인하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---
const DetailItem = ({ label, value, highlight, color }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #f5f5f5",
    }}
  >
    <span style={{ fontSize: "13px", color: "#888" }}>{label}</span>
    <span
      style={{
        fontSize: "14px",
        fontWeight: "bold",
        color: color || (highlight ? COLORS.primary : "#333"),
      }}
    >
      {value}
    </span>
  </div>
);

// --- 스타일 ---
const styles = {
  container: { padding: "30px", backgroundColor: COLORS.bg, minHeight: "100%" },

  // 헤더
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    color: COLORS.text,
  },
  subtitle: { fontSize: "14px", color: "#666", marginTop: "5px" },
  headerControls: { display: "flex", gap: "15px", alignItems: "center" },
  statusBadge: {
    backgroundColor: "white",
    padding: "8px 15px",
    borderRadius: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#555",
  },
  controlBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.danger,
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(255, 82, 82, 0.3)",
  },

  // 그리드 레이아웃 (좌:중:우 = 1:2:1 비율 정도)
  gridContainer: { display: "flex", gap: "20px", height: "600px" },

  // 1. 좌측 (환경)
  envPanel: {
    flex: "1",
    minWidth: "250px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  tempDisplay: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  tempCircle: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: `4px solid ${COLORS.danger}30`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  tempValue: {
    fontSize: "28px",
    fontWeight: "bold",
    color: COLORS.danger,
    marginTop: "5px",
  },
  tempLabel: { fontSize: "12px", color: "#888" },
  tempInfo: { width: "100%" },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    padding: "5px 0",
    borderBottom: "1px solid #f0f0f0",
  },

  timerDisplay: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  chartBox: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    flex: 1,
  },
  boxTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 15px 0",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  // 2. 중앙 (Rack Map)
  rackPanel: {
    flex: "2",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  legend: {
    fontSize: "12px",
    display: "flex",
    gap: "10px",
    fontWeight: "bold",
  },

  slotGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "10px",
    flex: 1,
    overflowY: "auto",
    alignContent: "start",
  },
  slotBox: {
    aspectRatio: "1/1",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  slotHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniProgressBg: {
    width: "100%",
    height: "4px",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: "2px",
  },
  miniProgressFill: { height: "100%", borderRadius: "2px" },

  // 3. 우측 (상세)
  detailPanel: {
    flex: "1",
    minWidth: "250px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  detailContent: { marginTop: "10px" },
  emptyDetail: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: "#ccc",
    fontSize: "14px",
  },
  divider: { height: "1px", backgroundColor: "#eee", margin: "15px 0" },
  progressContainer: {
    width: "100%",
    height: "8px",
    backgroundColor: "#eee",
    borderRadius: "4px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    transition: "width 0.3s",
  },
  errorBox: {
    marginTop: "20px",
    backgroundColor: "#FFEBEE",
    color: COLORS.danger,
    padding: "10px",
    borderRadius: "6px",
    fontSize: "13px",
  },
};

export default AgingStatus;
