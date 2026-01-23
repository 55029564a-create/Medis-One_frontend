import React, { useState, useEffect } from "react";
import {
  FaThermometerHalf,
  FaClock,
  FaExclamationTriangle,
  FaTv,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
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
  LineChart,
  Line,
} from "recharts";

// 🎨 MedisOne 테마
const COLORS = {
  primary: "#8C85FF",
  primaryLight: "#F3F1FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  text: "#333",
  gray: "#888",
  border: "#E0E0E0",
  slotEmpty: "#F8F9FA",
  slotBorder: "#DEE2E6",
};

// 가짜 데이터 생성기
const generateSlotHistory = (status) => {
  const data = [];
  let temp = 45.0;
  for (let i = 0; i < 20; i++) {
    if (status === "FAIL" && i > 15) temp += Math.random() * 5;
    else temp = 45.0 + (Math.random() * 1 - 0.5);

    data.push({
      time: `${10 + Math.floor(i / 2)}:${i % 2 === 0 ? "00" : "30"}`,
      temp: parseFloat(temp.toFixed(1)),
    });
  }
  return data;
};

const AgingStatus = () => {
  const [currentTemp, setCurrentTemp] = useState(45.2);
  const [elapsedTime, setElapsedTime] = useState(25430);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [chamberHistory, setChamberHistory] = useState(
    generateSlotHistory("NORMAL"),
  );

  const [slots, setSlots] = useState(
    Array.from({ length: 42 }, (_, i) => {
      const row = Math.floor(i / 7) + 1;
      const col = (i % 7) + 1;
      const isFail = i === 12 || i === 28;
      return {
        id: i + 1,
        lineName: `R${row}-${String(col).padStart(2, "0")}`,
        panelId: `PNL-${26012100 + i}`,
        status: isFail ? "FAIL" : i > 38 ? "EMPTY" : "TESTING",
        progress: i > 38 ? 0 : 70 + Math.random() * 20,
        temp: 45 + (Math.random() * 1 - 0.5),
        history: generateSlotHistory(isFail ? "FAIL" : "TESTING"),
      };
    }),
  );

  const totalSlots = slots.length;
  const activeSlots = slots.filter((s) => s.status !== "EMPTY").length;
  const failSlots = slots.filter((s) => s.status === "FAIL").length;
  const yieldRate =
    activeSlots > 0 ? ((activeSlots - failSlots) / activeSlots) * 100 : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      const newChamberTemp = 45.0 + (Math.random() * 0.4 - 0.2);
      setCurrentTemp(newChamberTemp);
      setElapsedTime((prev) => prev + 1);

      setSlots((prev) =>
        prev.map((slot) => {
          if (slot.status === "TESTING") {
            const nextProgress = Math.min(slot.progress + 0.05, 100);
            return {
              ...slot,
              temp: 45 + (Math.random() * 2 - 1),
              progress: nextProgress,
              status: nextProgress >= 100 ? "COMPLETE" : "TESTING",
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
    return `${h}:${m}`;
  };

  const filteredSlots = slots.filter((s) => {
    if (filter === "ALL") return true;
    if (filter === "ISSUE") return s.status === "FAIL";
    return s.status === filter;
  });

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Aging Chamber Monitoring</h2>
          <div style={styles.breadcrumb}>
            Process &gt; Aging &gt; <strong>Chamber #01</strong>
          </div>
        </div>
        <div style={styles.headerInfo}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Recipe</span>
            <span style={styles.infoValue}>IEC-60601-Std</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Target Temp</span>
            <span style={styles.infoValue}>45.0 ± 2°C</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Duration</span>
            <span style={styles.infoValue}>24h 00m</span>
          </div>
        </div>
      </div>

      {/* 메인 레이아웃 (Grid System) */}
      <div style={styles.mainLayout}>
        {/* ================= 좌측: 모니터링 영역 (Flex 3) ================= */}
        <div style={styles.leftColumn}>
          {/* 1. 챔버 환경 그래프 */}
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div style={styles.iconBox}>
                  <FaThermometerHalf />
                </div>
                <span style={styles.cardTitle}>Chamber Environment</span>
              </div>
              <span style={styles.liveBadge}>LIVE</span>
            </div>
            <div style={styles.chartContent}>
              <div style={styles.currentTempBox}>
                <span style={styles.bigTemp}>{currentTemp.toFixed(1)}°C</span>
                <span style={styles.subText}>Current Avg Temp</span>
              </div>
              <div style={{ flex: 1, height: "100%", marginLeft: "20px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chamberHistory}>
                    <defs>
                      <linearGradient
                        id="colorTemp"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS.primary}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS.primary}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eee"
                    />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[40, 50]} hide />
                    <Tooltip />
                    <ReferenceLine
                      y={45}
                      stroke="green"
                      strokeDasharray="3 3"
                    />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTemp)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 2. 랙(Rack) 모니터링 */}
          <div style={styles.rackCard}>
            <div style={styles.cardHeader}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div style={styles.iconBox}>
                  <FaTv />
                </div>
                <span style={styles.cardTitle}>Live Slot Monitor</span>
              </div>
              <div style={styles.filterGroup}>
                {["ALL", "TESTING", "ISSUE"].map((f) => (
                  <button
                    key={f}
                    style={
                      filter === f ? styles.filterBtnActive : styles.filterBtn
                    }
                    onClick={() => setFilter(f)}
                  >
                    {f === "ISSUE" ? "⚠️ ISSUES" : f}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.rackGrid}>
              {filteredSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isFail = slot.status === "FAIL";
                const isEmpty = slot.status === "EMPTY";

                let bgColor = COLORS.white;
                // 기본 테두리는 1px, 선택 시 2px로 변경 (잘림 방지)
                let borderStyle = `1px solid ${COLORS.slotBorder}`;

                if (isSelected) {
                  borderStyle = `2px solid ${COLORS.primary}`; // 선택 시 보라색 2px
                  bgColor = COLORS.primaryLight;
                } else if (isFail) {
                  bgColor = "#FFF5F5";
                  borderStyle = `1px solid ${COLORS.danger}`;
                } else if (isEmpty) {
                  bgColor = COLORS.slotEmpty;
                }

                return (
                  <div
                    key={slot.id}
                    style={{
                      ...styles.slot,
                      backgroundColor: bgColor,
                      border: borderStyle,
                      // 선택 시 미세하게 커지는 효과 유지하되, 패딩 안쪽으로 그림자 처리
                      transform: isSelected ? "scale(1.02)" : "scale(1)",
                      zIndex: isSelected ? 10 : 1, // 선택된 항목을 맨 위로
                    }}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    <div style={styles.slotHeader}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#666",
                        }}
                      >
                        {slot.lineName}
                      </span>
                      {isFail && (
                        <FaExclamationTriangle
                          size={10}
                          color={COLORS.danger}
                        />
                      )}
                    </div>

                    {!isEmpty ? (
                      <>
                        <div style={styles.slotTemp}>
                          {slot.temp.toFixed(1)}°
                        </div>
                        <div style={styles.miniProgressBg}>
                          <div
                            style={{
                              ...styles.miniProgressFill,
                              width: `${slot.progress}%`,
                              backgroundColor: isFail
                                ? COLORS.danger
                                : COLORS.success,
                            }}
                          />
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: "10px", color: "#ccc" }}>-</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= 우측: 정보 및 분석 (Flex 1) ================= */}
        <div style={styles.rightColumn}>
          {/* 3. 배치 요약 */}
          <div style={styles.summaryCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>Batch Summary</span>
            </div>
            <div style={styles.summaryContent}>
              <div style={styles.yieldCircle}>
                <span style={styles.yieldValue}>{yieldRate.toFixed(0)}%</span>
                <span style={styles.yieldLabel}>Yield Rate</span>
              </div>
              <div style={styles.statList}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>
                    <FaCheckCircle color={COLORS.success} /> Active
                  </span>
                  <span style={styles.statValue}>{activeSlots}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>
                    <FaTimesCircle color={COLORS.danger} /> Fail
                  </span>
                  <span style={styles.statValue}>{failSlots}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>
                    <FaClock color={COLORS.gray} /> Time
                  </span>
                  <span style={styles.statValue}>
                    {formatTime(elapsedTime)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. 상세 분석 패널 */}
          <div style={styles.detailCard}>
            <div style={styles.cardHeader}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div style={styles.iconBox}>
                  <FaSearch />
                </div>
                <span style={styles.cardTitle}>Deep Analysis</span>
              </div>
            </div>

            {selectedSlot ? (
              selectedSlot.status === "EMPTY" ? (
                <div style={styles.emptyMessage}>빈 슬롯입니다.</div>
              ) : (
                <div style={styles.detailContent}>
                  <div style={styles.panelInfo}>
                    <div style={styles.panelId}>{selectedSlot.panelId}</div>
                    <div
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          selectedSlot.status === "FAIL"
                            ? COLORS.danger
                            : COLORS.success,
                      }}
                    >
                      {selectedSlot.status}
                    </div>
                  </div>

                  {/* 온도 차트 */}
                  <div style={styles.analysisSection}>
                    <div style={styles.sectionTitle}>
                      <FaChartLine /> Temperature Trend
                    </div>
                    <div style={styles.miniChartBox}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedSlot.history}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis dataKey="time" hide />
                          <YAxis domain={["auto", "auto"]} hide />
                          <Tooltip contentStyle={{ fontSize: "12px" }} />
                          <ReferenceLine
                            y={45}
                            stroke="gray"
                            strokeDasharray="3 3"
                          />
                          <Line
                            type="monotone"
                            dataKey="temp"
                            stroke={
                              selectedSlot.status === "FAIL"
                                ? COLORS.danger
                                : COLORS.primary
                            }
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={styles.chartLegend}>
                      <span>Min: 44.8°C</span>
                      <span>
                        Max:{" "}
                        {selectedSlot.status === "FAIL" ? "52.1°C" : "45.5°C"}
                      </span>
                    </div>
                  </div>

                  <div style={styles.propertyList}>
                    <div style={styles.propRow}>
                      <span>Slot Location</span>
                      <strong>{selectedSlot.lineName}</strong>
                    </div>
                    <div style={styles.propRow}>
                      <span>Current Temp</span>
                      <strong>{selectedSlot.temp.toFixed(2)} °C</strong>
                    </div>
                    <div style={styles.propRow}>
                      <span>Progress</span>
                      <strong>{selectedSlot.progress.toFixed(1)} %</strong>
                    </div>
                  </div>

                  {selectedSlot.status === "FAIL" && (
                    <div style={styles.alertBox}>
                      <strong>⚠️ Abnormal Detected</strong>
                      <p>온도가 임계값(50°C)을 초과했습니다.</p>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div style={styles.emptyMessage}>
                좌측 랙에서 패널을 선택하여
                <br />
                상세 데이터를 확인하세요.
              </div>
            )}
          </div>
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
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "15px",
    flexShrink: 0,
  },
  title: { fontSize: "24px", fontWeight: "800", color: COLORS.text, margin: 0 },
  breadcrumb: { fontSize: "12px", color: COLORS.gray, marginTop: "5px" },
  headerInfo: { display: "flex", gap: "20px" },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  infoLabel: { fontSize: "11px", color: COLORS.gray, marginBottom: "2px" },
  infoValue: { fontSize: "14px", fontWeight: "bold", color: "#555" },

  // [Grid Layout]
  mainLayout: {
    display: "flex",
    gap: "20px",
    flex: 1,
    overflow: "hidden",
  },
  leftColumn: {
    flex: 3,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflow: "hidden",
  },
  rightColumn: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflow: "hidden",
  },

  // Cards
  chartCard: {
    height: "180px",
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  cardTitle: { fontSize: "16px", fontWeight: "bold", color: "#444" },
  iconBox: {
    width: "24px",
    height: "24px",
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
  },
  liveBadge: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "red",
    backgroundColor: "#FFE5E5",
    padding: "2px 6px",
    borderRadius: "4px",
    animation: "pulse 2s infinite",
  },
  chartContent: { display: "flex", flex: 1, alignItems: "center" },
  currentTempBox: { textAlign: "center", minWidth: "120px" },
  bigTemp: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#333",
    display: "block",
    lineHeight: 1,
  },
  subText: { fontSize: "11px", color: COLORS.gray },

  rackCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  filterGroup: { display: "flex", gap: "5px" },
  filterBtn: {
    border: "1px solid #eee",
    background: "white",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    cursor: "pointer",
    color: "#666",
  },
  filterBtnActive: {
    border: `1px solid ${COLORS.primary}`,
    background: COLORS.primary,
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    cursor: "pointer",
    color: "white",
    fontWeight: "bold",
  },

  // [수정] 랙 그리드 패딩 추가 (테두리 잘림 방지)
  rackGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "10px",
    overflowY: "auto",
    padding: "10px", // [핵심] 10px 여유 공간 확보하여 테두리 보호
    marginTop: "5px",
    alignContent: "start",
  },

  slot: {
    aspectRatio: "1",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "8px",
    cursor: "pointer",
    transition: "transform 0.1s ease",
    boxSizing: "border-box", // 보더가 사이즈에 포함되도록 설정
  },
  slotHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotTemp: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    margin: "5px 0",
  },
  miniProgressBg: {
    width: "100%",
    height: "4px",
    backgroundColor: "#eee",
    borderRadius: "2px",
  },
  miniProgressFill: { height: "100%", borderRadius: "2px" },

  summaryCard: {
    height: "180px",
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
  },
  summaryContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  yieldCircle: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: `6px solid ${COLORS.success}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  yieldValue: { fontSize: "18px", fontWeight: "bold", color: "#333" },
  yieldLabel: { fontSize: "9px", color: COLORS.gray },
  statList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
    marginLeft: "15px",
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
  },
  statLabel: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#666",
  },
  statValue: { fontWeight: "bold" },

  detailCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  emptyMessage: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ccc",
    fontSize: "13px",
    textAlign: "center",
    lineHeight: 1.5,
  },
  detailContent: { display: "flex", flexDirection: "column", gap: "20px" },
  panelInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  panelId: { fontSize: "16px", fontWeight: "bold", color: COLORS.primary },
  statusBadge: {
    fontSize: "11px",
    color: "white",
    padding: "4px 10px",
    borderRadius: "12px",
    fontWeight: "bold",
  },
  analysisSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: "8px",
    padding: "15px",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  miniChartBox: {
    height: "120px",
    width: "100%",
    backgroundColor: "white",
    borderRadius: "8px",
  },
  chartLegend: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10px",
    color: "#888",
    marginTop: "5px",
  },
  propertyList: { display: "flex", flexDirection: "column", gap: "10px" },
  propRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#555",
  },
  alertBox: {
    backgroundColor: "#FFF5F5",
    border: `1px solid ${COLORS.danger}40`,
    borderRadius: "8px",
    padding: "10px",
    fontSize: "12px",
    color: "#D32F2F",
  },
};

export default AgingStatus;
