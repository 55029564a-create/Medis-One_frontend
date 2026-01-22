import React, { useState, useEffect } from "react";
import {
  FaThermometerHalf,
  FaClock,
  FaPlay,
  FaStop,
  FaExclamationTriangle,
  FaTv,
  FaChartPie,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  YAxis,
  CartesianGrid,
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
  slotEmpty: "#F0F2F5",
};

const AgingStatus = () => {
  const [chamberStatus, setChamberStatus] = useState("RUNNING");
  const [currentTemp, setCurrentTemp] = useState(45.2);
  const [targetTemp] = useState(45.0);
  const [elapsedTime, setElapsedTime] = useState(7200);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // 📝 [Mock Data] 30개 슬롯 (5x6) + 라인 이름 추가
  const [slots, setSlots] = useState(
    Array.from({ length: 30 }, (_, i) => {
      const row = Math.floor(i / 6) + 1; // 1~5행
      const col = (i % 6) + 1; // 1~6열
      return {
        id: i + 1,
        lineName: `L${row}-${String(col).padStart(2, "0")}`, // 예: L1-01, L2-03
        panelId: `PNL-AGE-${26012100 + i}`,
        status: i === 5 || i === 12 ? "FAIL" : i > 25 ? "EMPTY" : "TESTING",
        startTime: "10:00:00",
        progress: i > 25 ? 0 : 85 + Math.random() * 10,
        temp: 45 + (Math.random() * 2 - 1),
      };
    }),
  );

  const [tempHistory, setTempHistory] = useState([]);

  // ... (통계 계산 및 시뮬레이션 로직은 기존과 동일)
  const totalSlots = slots.length;
  const activeSlots = slots.filter((s) => s.status !== "EMPTY").length;
  const failSlots = slots.filter((s) => s.status === "FAIL").length;
  const yieldRate =
    activeSlots > 0 ? ((activeSlots - failSlots) / activeSlots) * 100 : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const newTemp = 45.0 + (Math.random() * 0.4 - 0.2);
      setCurrentTemp(newTemp);
      setElapsedTime((prev) => prev + 1);

      const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
      setTempHistory((prev) => {
        const newData = [...prev, { time: timeStr, temp: newTemp }];
        if (newData.length > 20) newData.shift();
        return newData;
      });

      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.status === "TESTING") {
            return {
              ...slot,
              temp: 45 + (Math.random() * 3 - 1.5),
              progress: Math.min(slot.progress + 0.02, 100),
            };
          }
          return slot;
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((sec % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const filteredSlots = slots.filter((s) => {
    if (filter === "ALL") return true;
    return s.status === filter;
  });

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🔥 Aging Chamber #01 Monitor</h2>
          <p style={styles.subtitle}>Standard: IEC-60601 | 45°C ± 2°C | 24Hr</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.kpiBadge}>
            <span style={{ fontSize: "12px", color: "#fff", opacity: 0.8 }}>
              Yield Rate
            </span>
            <span
              style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}
            >
              {yieldRate.toFixed(1)}%
            </span>
          </div>
          <button
            style={{
              ...styles.controlBtn,
              backgroundColor:
                chamberStatus === "RUNNING" ? COLORS.danger : COLORS.success,
            }}
            onClick={() =>
              setChamberStatus(
                chamberStatus === "RUNNING" ? "STOPPED" : "RUNNING",
              )
            }
          >
            {chamberStatus === "RUNNING" ? <FaStop /> : <FaPlay />}
            {chamberStatus === "RUNNING" ? "STOP TEST" : "START TEST"}
          </button>
        </div>
      </div>

      {/* 메인 그리드 */}
      <div style={styles.gridContainer}>
        {/* [좌측] 환경 정보 */}
        <div style={styles.leftPanel}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FaThermometerHalf /> Chamber Temp
            </div>
            <div style={styles.tempCircle}>
              <span style={styles.tempMain}>{currentTemp.toFixed(1)}°C</span>
              <span style={styles.tempSub}>Target: {targetTemp}°C</span>
            </div>
            <div style={{ height: "120px", marginTop: "20px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={tempHistory}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.danger}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.danger}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[40, 50]} hide />
                  <CartesianGrid vertical={false} stroke="#eee" />
                  <ReferenceLine y={45} stroke="red" strokeDasharray="3 3" />
                  <Area
                    type="monotone"
                    dataKey="temp"
                    stroke={COLORS.danger}
                    fill="url(#grad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <FaChartPie /> Batch Summary
            </div>
            <div style={styles.statRow}>
              <span>Total Slots</span> <strong>{totalSlots}</strong>
            </div>
            <div style={styles.statRow}>
              <span>Active</span>{" "}
              <strong style={{ color: COLORS.primary }}>{activeSlots}</strong>
            </div>
            <div style={styles.statRow}>
              <span>Failed</span>{" "}
              <strong style={{ color: COLORS.danger }}>{failSlots}</strong>
            </div>
            <div style={styles.divider} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <FaClock color={COLORS.gray} />
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                }}
              >
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
        </div>

        {/* [중앙] Rack View */}
        <div style={styles.centerPanel}>
          <div style={styles.centerHeader}>
            <div style={styles.tabs}>
              {["ALL", "TESTING", "FAIL"].map((f) => (
                <button
                  key={f}
                  style={filter === f ? styles.activeTab : styles.tab}
                  onClick={() => setFilter(f)}
                >
                  {f === "ALL" ? "전체 보기" : f}
                </button>
              ))}
            </div>
            <div style={styles.legend}>
              <span style={{ color: COLORS.success }}>● 정상</span>
              <span style={{ color: COLORS.danger }}>● 불량</span>
            </div>
          </div>

          <div style={styles.rackGrid}>
            {filteredSlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              let statusColor = COLORS.slotEmpty;
              let iconColor = "#ccc";

              if (slot.status === "TESTING") {
                statusColor = "#E8F5E9";
                iconColor = COLORS.success;
              } else if (slot.status === "FAIL") {
                statusColor = "#FFEBEE";
                iconColor = COLORS.danger;
              }

              return (
                <div
                  key={slot.id}
                  style={{
                    ...styles.slotItem,
                    backgroundColor: statusColor,
                    // [수정] 테두리 짤림 방지를 위해 border 속성 직접 사용
                    border: isSelected
                      ? `2px solid ${COLORS.primary}`
                      : "2px solid transparent",
                    transform: isSelected ? "scale(0.98)" : "scale(1)", // 눌리는 효과
                  }}
                  onClick={() => setSelectedSlot(slot)}
                >
                  <div style={styles.slotTop}>
                    {/* [추가] 라인 이름 표시 */}
                    <span style={styles.lineBadge}>{slot.lineName}</span>
                    {slot.status === "FAIL" && (
                      <FaExclamationTriangle color={COLORS.danger} size={12} />
                    )}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaTv size={28} color={iconColor} />
                  </div>

                  {slot.status !== "EMPTY" && (
                    <div style={{ width: "100%", marginTop: "5px" }}>
                      <div style={styles.miniBarBg}>
                        <div
                          style={{
                            ...styles.miniBarFill,
                            width: `${slot.progress}%`,
                            backgroundColor: iconColor,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#888",
                          textAlign: "right",
                          marginTop: "2px",
                        }}
                      >
                        {Math.round(slot.progress)}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* [우측] 상세 정보 */}
        <div style={styles.rightPanel}>
          <div style={styles.cardHeader}>📋 Selected Panel</div>
          {selectedSlot ? (
            selectedSlot.status === "EMPTY" ? (
              <div style={styles.emptyState}>빈 슬롯입니다.</div>
            ) : (
              <div style={styles.detailBody}>
                <div style={styles.detailRow}>
                  <label>Location</label>
                  <div style={{ fontWeight: "bold" }}>
                    {selectedSlot.lineName} (Slot #{selectedSlot.id})
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <label>Panel ID</label>
                  <div style={{ color: COLORS.primary, fontWeight: "bold" }}>
                    {selectedSlot.panelId}
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <label>Status</label>
                  <div
                    style={{
                      color:
                        selectedSlot.status === "FAIL"
                          ? COLORS.danger
                          : COLORS.success,
                      fontWeight: "bold",
                    }}
                  >
                    {selectedSlot.status}
                  </div>
                </div>
                <div style={styles.detailRow}>
                  <label>Surface Temp</label>
                  <div>{selectedSlot.temp.toFixed(1)} °C</div>
                </div>

                <div style={styles.divider} />

                <label style={styles.label}>Progress</label>
                <div style={styles.bigProgressBg}>
                  <div
                    style={{
                      ...styles.bigProgressFill,
                      width: `${selectedSlot.progress}%`,
                    }}
                  />
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  {selectedSlot.progress.toFixed(1)}%
                </div>

                {selectedSlot.status === "FAIL" && (
                  <div style={styles.errorAlert}>
                    <FaExclamationTriangle />
                    <span>Error: Overheat (Code 404)</span>
                  </div>
                )}
              </div>
            )
          ) : (
            <div style={styles.emptyState}>
              <FaTv size={40} color="#ddd" style={{ marginBottom: "10px" }} />
              슬롯을 선택하여
              <br />
              상세 정보를 확인하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: COLORS.bg,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexShrink: 0,
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.text,
    margin: 0,
  },
  subtitle: { fontSize: "13px", color: COLORS.gray, marginTop: "4px" },
  headerRight: { display: "flex", gap: "15px", alignItems: "center" },
  kpiBadge: {
    backgroundColor: COLORS.primary,
    padding: "5px 15px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    lineHeight: 1.2,
  },
  controlBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    height: "44px",
  },
  gridContainer: { display: "flex", gap: "20px", flex: 1, overflow: "hidden" },

  // 패널 스타일 (공통)
  leftPanel: {
    width: "260px",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    overflowY: "auto",
  },
  centerPanel: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  rightPanel: {
    width: "280px",
    flexShrink: 0,
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
  },

  // 내부 컴포넌트
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardHeader: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tempCircle: {
    textAlign: "center",
    border: `4px solid ${COLORS.danger}20`,
    borderRadius: "50%",
    width: "120px",
    height: "120px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  tempMain: { fontSize: "24px", fontWeight: "bold", color: COLORS.danger },
  tempSub: { fontSize: "11px", color: "#888" },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "8px",
    borderBottom: "1px dashed #eee",
    paddingBottom: "4px",
  },
  centerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexShrink: 0,
  },
  tabs: {
    display: "flex",
    gap: "5px",
    backgroundColor: "#f5f5f5",
    padding: "4px",
    borderRadius: "8px",
  },
  tab: {
    border: "none",
    background: "transparent",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#666",
  },
  activeTab: {
    border: "none",
    background: "white",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    color: COLORS.primary,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  legend: {
    display: "flex",
    gap: "10px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  rackGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", // 슬롯 크기 조정
    gap: "12px",
    overflowY: "auto",
    padding: "5px", // 내부 패딩
    alignContent: "start",
  },
  slotItem: {
    aspectRatio: "1",
    borderRadius: "8px",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    transition: "all 0.1s",
    boxSizing: "border-box", // 테두리 포함 크기 계산
  },
  slotTop: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lineBadge: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "#555",
    backgroundColor: "#fff",
    padding: "2px 6px",
    borderRadius: "4px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  miniBarBg: {
    width: "100%",
    height: "4px",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: "2px",
  },
  miniBarFill: { height: "100%", borderRadius: "2px" },
  detailBody: { display: "flex", flexDirection: "column", gap: "12px" },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    borderBottom: "1px solid #f5f5f5",
    paddingBottom: "8px",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    marginBottom: "4px",
    display: "block",
  },
  bigProgressBg: {
    width: "100%",
    height: "10px",
    backgroundColor: "#eee",
    borderRadius: "5px",
    overflow: "hidden",
  },
  bigProgressFill: { height: "100%", backgroundColor: COLORS.primary },
  errorAlert: {
    marginTop: "15px",
    backgroundColor: "#FFEBEE",
    color: "#D32F2F",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#ccc",
    fontSize: "14px",
    textAlign: "center",
  },
  divider: { height: "1px", backgroundColor: "#eee", margin: "10px 0" },
};

export default AgingStatus;
