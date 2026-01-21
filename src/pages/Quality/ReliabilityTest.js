import React, { useState, useEffect } from "react";
import {
  FaWaveSquare, // 진동
  FaArrowDown, // 낙하
  FaTint, // 방수
  FaPlay,
  FaStop,
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  secondary: "#F3F1FF",
  bg: "#F5F6FA",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  text: "#333",
  white: "#FFFFFF",
  border: "#E0E0E0",
};

const ReliabilityTest = () => {
  // --- 상태 관리 ---
  const [activeTest, setActiveTest] = useState(null); // 'VIB', 'DROP', 'WATER' or null
  const [testDuration, setTestDuration] = useState(0);

  // 📊 [Chart Data] 실시간 데이터 (시뮬레이션)
  const [vibData, setVibData] = useState([]); // 진동 G값
  const [dropData, setDropData] = useState([]); // 낙하 충격량

  // 📝 [Log Data] 테스트 이력
  const [logs] = useState([
    {
      id: "REL-260121-01",
      type: "Vibration",
      model: "MED-24-MOB",
      result: "PASS",
      note: "Random 1.5G / 2hrs",
    },
    {
      id: "REL-260120-05",
      type: "Drop",
      model: "MED-TAB-10",
      result: "FAIL",
      note: "Corner Crack (70cm)",
    },
    {
      id: "REL-260120-02",
      type: "Waterproof",
      model: "MED-SURG-27",
      result: "PASS",
      note: "IPX6 Spray Test",
    },
  ]);

  // 시뮬레이션 로직
  useEffect(() => {
    let interval;
    if (activeTest === "VIB") {
      interval = setInterval(() => {
        setTestDuration((prev) => prev + 1);
        const time = new Date().toLocaleTimeString("en-US", { hour12: false });
        // 진동: 1.0G ~ 2.0G 사이 랜덤
        const gForce = 1.0 + Math.random();
        setVibData((prev) => {
          const newData = [...prev, { time, value: gForce }];
          if (newData.length > 20) newData.shift();
          return newData;
        });
      }, 500);
    } else if (activeTest === "DROP") {
      // 낙하는 간헐적 이벤트라 타이머만
      interval = setInterval(() => setTestDuration((prev) => prev + 1), 1000);
    } else if (activeTest === "WATER") {
      interval = setInterval(() => setTestDuration((prev) => prev + 1), 1000);
    }

    return () => clearInterval(interval);
  }, [activeTest]);

  // 낙하 테스트 트리거 (버튼 누르면 충격 데이터 생성)
  const triggerDrop = () => {
    const impact = 40 + Math.random() * 20; // 40G ~ 60G 충격
    const count = dropData.length + 1;
    setDropData([...dropData, { count: `#${count}`, impact }]);
  };

  const stopTest = () => {
    setActiveTest(null);
    setTestDuration(0);
    alert("테스트가 종료/중단되었습니다.");
  };

  return (
    <div style={styles.container}>
      {/* 1. 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🛡️ Reliability Test Lab (신뢰성 테스트)</h2>
          <p style={styles.subtitle}>
            Sample ID:{" "}
            <strong style={{ color: COLORS.primary }}>SMP-260121-A05</strong> |
            Standard: IEC 60601-1-11 (Medical Home Use)
          </p>
        </div>
        <div style={styles.statusBox}>
          {activeTest ? (
            <span style={styles.runningBadge}>
              Running: {activeTest} ({testDuration}s)
            </span>
          ) : (
            <span style={styles.idleBadge}>Status: IDLE</span>
          )}
        </div>
      </div>

      {/* 2. 테스트 섹션 (3열 카드) */}
      <div style={styles.grid}>
        {/* (A) Vibration Test (진동) */}
        <div
          style={{
            ...styles.card,
            borderTop:
              activeTest === "VIB" ? `4px solid ${COLORS.primary}` : "none",
          }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.titleRow}>
              <div
                style={{
                  ...styles.iconBox,
                  backgroundColor: "#E3F2FD",
                  color: "#1E88E5",
                }}
              >
                <FaWaveSquare />
              </div>
              <h3>Vibration Test</h3>
            </div>
            {activeTest === "VIB" ? (
              <button style={styles.stopBtn} onClick={stopTest}>
                <FaStop />
              </button>
            ) : (
              <button
                style={styles.startBtn}
                onClick={() => setActiveTest("VIB")}
              >
                <FaPlay />
              </button>
            )}
          </div>

          <div style={styles.chartArea}>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={vibData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <YAxis domain={[0, 3]} hide />
                <Tooltip />
                <ReferenceLine
                  y={1.5}
                  stroke="red"
                  strokeDasharray="3 3"
                  label="Limit"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1E88E5"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <div style={styles.chartLabel}>Real-time G-Force (X/Y/Z)</div>
          </div>
          <div style={styles.paramGrid}>
            <ParamItem label="Frequency" value="10~55 Hz" />
            <ParamItem label="Amplitude" value="0.35 mm" />
            <ParamItem label="Axis" value="X, Y, Z" />
          </div>
        </div>

        {/* (B) Drop Test (낙하) */}
        <div
          style={{
            ...styles.card,
            borderTop:
              activeTest === "DROP" ? `4px solid ${COLORS.warning}` : "none",
          }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.titleRow}>
              <div
                style={{
                  ...styles.iconBox,
                  backgroundColor: "#FFF8E1",
                  color: "#FFB300",
                }}
              >
                <FaArrowDown />
              </div>
              <h3>Drop Test</h3>
            </div>
            {activeTest === "DROP" ? (
              <div style={{ display: "flex", gap: "5px" }}>
                <button style={styles.triggerBtn} onClick={triggerDrop}>
                  DROP!
                </button>
                <button style={styles.stopBtn} onClick={stopTest}>
                  <FaStop />
                </button>
              </div>
            ) : (
              <button
                style={styles.startBtn}
                onClick={() => setActiveTest("DROP")}
              >
                <FaPlay />
              </button>
            )}
          </div>

          <div style={styles.chartArea}>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={dropData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="count" fontSize={10} />
                <Tooltip />
                <Bar
                  dataKey="impact"
                  fill="#FFB300"
                  radius={[4, 4, 0, 0]}
                  name="Impact(G)"
                />
              </BarChart>
            </ResponsiveContainer>
            <div style={styles.chartLabel}>Impact Shock (G) History</div>
          </div>
          <div style={styles.paramGrid}>
            <ParamItem label="Height" value="76 cm" />
            <ParamItem label="Surface" value="Concrete" />
            <ParamItem
              label="Count"
              value={`${dropData.length} / 10`}
              highlight
            />
          </div>
        </div>

        {/* (C) Waterproof Test (방수) */}
        <div
          style={{
            ...styles.card,
            borderTop:
              activeTest === "WATER" ? `4px solid ${COLORS.success}` : "none",
          }}
        >
          <div style={styles.cardHeader}>
            <div style={styles.titleRow}>
              <div
                style={{
                  ...styles.iconBox,
                  backgroundColor: "#E8F5E9",
                  color: "#43A047",
                }}
              >
                <FaTint />
              </div>
              <h3>IPX Waterproof</h3>
            </div>
            {activeTest === "WATER" ? (
              <button style={styles.stopBtn} onClick={stopTest}>
                <FaStop />
              </button>
            ) : (
              <button
                style={styles.startBtn}
                onClick={() => setActiveTest("WATER")}
              >
                <FaPlay />
              </button>
            )}
          </div>

          <div style={styles.waterVisual}>
            <div style={styles.waterLevel}>
              <FaTint
                size={40}
                color={activeTest === "WATER" ? COLORS.primary : "#ccc"}
              />
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginTop: "10px",
                }}
              >
                IPX6
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                High Pressure Spray
              </div>
            </div>
            {activeTest === "WATER" && (
              <div style={styles.sprayingBadge}>🚿 Spraying...</div>
            )}
          </div>
          <div style={styles.paramGrid}>
            <ParamItem label="Flow Rate" value="100 L/min" />
            <ParamItem label="Distance" value="3.0 m" />
            <ParamItem label="Duration" value="3 min" />
          </div>
        </div>
      </div>

      {/* 3. 테스트 로그 (하단) */}
      <div style={styles.logCard}>
        <h3 style={styles.logTitle}>
          <FaHistory /> Recent Test Logs
        </h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Test ID</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Model</th>
              <th style={styles.th}>Result</th>
              <th style={styles.th}>Note / Defects</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={styles.tr}>
                <td style={styles.td}>{log.id}</td>
                <td style={styles.td}>{log.type}</td>
                <td style={styles.td}>{log.model}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      backgroundColor:
                        log.result === "PASS" ? "#E8F5E9" : "#FFEBEE",
                      color:
                        log.result === "PASS" ? COLORS.success : COLORS.danger,
                    }}
                  >
                    {log.result === "PASS" ? (
                      <FaCheckCircle />
                    ) : (
                      <FaTimesCircle />
                    )}{" "}
                    {log.result}
                  </span>
                </td>
                <td style={styles.td}>{log.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---
const ParamItem = ({ label, value, highlight }) => (
  <div style={{ textAlign: "center", borderRight: "1px solid #eee" }}>
    <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>
      {label}
    </div>
    <div
      style={{
        fontSize: "13px",
        fontWeight: "bold",
        color: highlight ? COLORS.danger : "#333",
      }}
    >
      {value}
    </div>
  </div>
);

// --- 스타일 ---
const styles = {
  container: { padding: "30px", backgroundColor: COLORS.bg, minHeight: "100%" },

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
  statusBox: { minWidth: "200px", textAlign: "right" },
  runningBadge: {
    backgroundColor: COLORS.primary,
    color: "white",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(140, 133, 255, 0.4)",
    animation: "pulse 1s infinite",
  },
  idleBadge: {
    backgroundColor: "#e0e0e0",
    color: "#555",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "20px",
  },

  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  titleRow: { display: "flex", alignItems: "center", gap: "10px" },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
  },

  // 버튼들
  startBtn: {
    backgroundColor: COLORS.success,
    color: "white",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  stopBtn: {
    backgroundColor: COLORS.danger,
    color: "white",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  triggerBtn: {
    backgroundColor: COLORS.warning,
    color: "white",
    border: "none",
    padding: "0 15px",
    borderRadius: "18px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "12px",
  },

  // 차트 영역
  chartArea: {
    flex: 1,
    minHeight: "150px",
    marginBottom: "15px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  chartLabel: {
    textAlign: "center",
    fontSize: "11px",
    color: "#999",
    marginTop: "5px",
  },

  // 파라미터 그리드
  paramGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    borderTop: "1px solid #eee",
    paddingTop: "15px",
  },

  // 방수 비주얼
  waterVisual: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "150px",
  },
  waterLevel: { textAlign: "center" },
  sprayingBadge: {
    marginTop: "10px",
    backgroundColor: "#E3F2FD",
    color: "#1E88E5",
    padding: "4px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  // 로그 테이블
  logCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  logTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { backgroundColor: "#F9FAFB", borderBottom: "2px solid #eee" },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
  },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "12px", fontSize: "14px", color: "#333" },
};

export default ReliabilityTest;
