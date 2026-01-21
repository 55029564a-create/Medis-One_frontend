import React, { useState, useEffect } from "react";
import {
  FaPlay,
  FaStop,
  FaPause,
  FaMicroscope,
  FaCompressArrowsAlt,
  FaWind,
  FaCog,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
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
  dark: "#2C3E50", // 기계 느낌의 어두운 배경용
};

const ProcessBonding = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState("IDLE"); // IDLE, ALIGN, VACUUM, BONDING, CURING

  // 🎛️ 공정 파라미터 (설정값)
  const [params, setParams] = useState({
    targetVacuum: -98.5, // kPa
    bondingForce: 2500, // N
    gapTarget: 0.15, // mm (OCR 두께)
    uvTime: 30, // sec
  });

  // 📊 실시간 센서 데이터 (시뮬레이션)
  const [liveData, setLiveData] = useState({
    vacuum: 0,
    pressure: 0,
    gap: 0,
    alignX: 0,
    alignY: 0,
  });

  const [chartData, setChartData] = useState([]);

  // 시뮬레이션 로직
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        const timeStr = new Date().toLocaleTimeString("en-US", {
          hour12: false,
        });

        // 랜덤 데이터 생성 (공정 중인 것처럼)
        const newVacuum =
          currentStep === "VACUUM" || currentStep === "BONDING"
            ? -98 + Math.random() * 1
            : -0.5 + Math.random() * 0.5;

        const newPressure =
          currentStep === "BONDING" ? 2480 + Math.random() * 50 : 0;

        const newGap = 0.15 + (Math.random() * 0.005 - 0.0025);

        setLiveData({
          vacuum: newVacuum,
          pressure: newPressure,
          gap: newGap,
          alignX: 0.002 + Math.random() * 0.001,
          alignY: 0.001 + Math.random() * 0.001,
        });

        // 차트 데이터 업데이트
        setChartData((prev) => {
          const newData = [
            ...prev,
            {
              time: timeStr,
              vacuum: Math.abs(newVacuum),
              pressure: newPressure,
            },
          ];
          if (newData.length > 20) newData.shift();
          return newData;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentStep]);

  // 공정 제어 핸들러
  const handleStart = () => {
    setIsRunning(true);
    setCurrentStep("ALIGN");
    // 데모용: 3초 뒤 진공 -> 3초 뒤 본딩 -> 3초 뒤 경화 -> 완료 시나리오
    setTimeout(() => setCurrentStep("VACUUM"), 3000);
    setTimeout(() => setCurrentStep("BONDING"), 6000);
    setTimeout(() => setCurrentStep("CURING"), 9000);
    setTimeout(() => {
      setIsRunning(false);
      setCurrentStep("COMPLETE");
    }, 12000);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentStep("IDLE");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🔬 Optical Bonding Process (광학 본딩)</h2>
          <p style={styles.subtitle}>
            Line-A / Bonder #01 / OCR Type (Direct Bonding)
          </p>
        </div>
        <div style={styles.statusBox}>
          <span style={styles.statusLabel}>Current State:</span>
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: isRunning ? COLORS.success : COLORS.gray,
              color: "white",
            }}
          >
            {currentStep}
          </span>
        </div>
      </div>

      <div style={styles.dashboardGrid}>
        {/* 1. [좌측] 실시간 모니터링 (게이지 & 비전) */}
        <div style={styles.leftCol}>
          {/* 핵심 센서 게이지 */}
          <div style={styles.sensorRow}>
            <SensorCard
              icon={<FaWind />}
              label="Chamber Vacuum"
              value={liveData.vacuum.toFixed(2)}
              unit="kPa"
              color={COLORS.primary}
              isWarn={liveData.vacuum > -90 && currentStep === "VACUUM"}
            />
            <SensorCard
              icon={<FaCompressArrowsAlt />}
              label="Bonding Force"
              value={liveData.pressure.toFixed(0)}
              unit="N"
              color={COLORS.warning}
            />
            <SensorCard
              icon={<FaMicroscope />}
              label="Gap Thickness"
              value={liveData.gap.toFixed(4)}
              unit="mm"
              color={COLORS.success}
            />
          </div>

          {/* 비전 정렬 상태 (Visual) */}
          <div style={styles.visionCard}>
            <div style={styles.cardHeader}>
              <h3>
                <FaMicroscope /> Vision Align Monitor
              </h3>
              <span
                style={{
                  color: COLORS.success,
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                ● Live Cam
              </span>
            </div>
            <div style={styles.visionScreen}>
              {/* 가상의 비전 화면 */}
              <div style={styles.crosshair}></div>
              <div
                style={{
                  ...styles.glassOverlay,
                  transform: `translate(${liveData.alignX * 100}px, ${liveData.alignY * 100}px)`,
                }}
              >
                Display Panel
              </div>
              <div style={styles.visionInfo}>
                <div>
                  Align X:{" "}
                  <span style={{ color: COLORS.success }}>
                    {liveData.alignX.toFixed(4)}
                  </span>
                </div>
                <div>
                  Align Y:{" "}
                  <span style={{ color: COLORS.success }}>
                    {liveData.alignY.toFixed(4)}
                  </span>
                </div>
                <div>
                  Theta: <span style={{ color: COLORS.success }}>0.001°</span>
                </div>
              </div>
            </div>
          </div>

          {/* 트렌드 차트 */}
          <div style={styles.chartCard}>
            <h3>Vacuum & Pressure Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVac" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C85FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8C85FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis yAxisId="left" orientation="left" stroke="#8C85FF" />
                <YAxis yAxisId="right" orientation="right" stroke="#FFBB33" />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="vacuum"
                  stroke="#8C85FF"
                  fillOpacity={1}
                  fill="url(#colorVac)"
                  name="Vacuum (abs)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pressure"
                  stroke="#FFBB33"
                  dot={false}
                  name="Pressure"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. [우측] 제어 패널 (Control & Input) */}
        <div style={styles.rightCol}>
          {/* 파라미터 설정 */}
          <div style={styles.controlCard}>
            <div style={styles.cardHeader}>
              <h3>
                <FaCog /> Process Parameters
              </h3>
            </div>
            <div style={styles.inputGroup}>
              <ParamInput
                label="Target Vacuum (kPa)"
                value={params.targetVacuum}
                unit="kPa"
              />
              <ParamInput
                label="Bonding Force (N)"
                value={params.bondingForce}
                unit="N"
              />
              <ParamInput
                label="Target Gap (mm)"
                value={params.gapTarget}
                unit="mm"
              />
              <ParamInput
                label="UV Curing Time (s)"
                value={params.uvTime}
                unit="sec"
              />
            </div>
            <div style={styles.btnRow}>
              <button style={styles.updateBtn}>Update Params</button>
            </div>
          </div>

          {/* 작업 제어 버튼 */}
          <div style={styles.actionCard}>
            <div style={styles.lotDisplay}>
              <span>Current LOT:</span>
              <strong>LOT-PNL-260121-A05</strong>
            </div>
            <div style={styles.mainControls}>
              <button
                style={{
                  ...styles.bigBtn,
                  backgroundColor: isRunning ? "#ccc" : COLORS.success,
                }}
                onClick={handleStart}
                disabled={isRunning}
              >
                <FaPlay size={24} /> START
              </button>
              <button
                style={{
                  ...styles.bigBtn,
                  backgroundColor: !isRunning ? "#ccc" : COLORS.warning,
                }}
                onClick={() => setIsRunning(false)}
                disabled={!isRunning}
              >
                <FaPause size={24} /> PAUSE
              </button>
              <button
                style={{ ...styles.bigBtn, backgroundColor: COLORS.danger }}
                onClick={handleStop}
              >
                <FaStop size={24} /> RESET
              </button>
            </div>
          </div>

          {/* 공정 로그 */}
          <div style={styles.logCard}>
            <h3>📋 Process Log</h3>
            <ul style={styles.logList}>
              <li style={styles.logItem}>
                <span style={styles.logTime}>14:20:05</span> Bond Cycle Start
              </li>
              <li style={styles.logItem}>
                <span style={styles.logTime}>14:20:08</span> Align OK (X:0.002,
                Y:0.001)
              </li>
              <li style={styles.logItem}>
                <span style={styles.logTime}>14:20:15</span> Vacuum Reach
                -98.5kPa
              </li>
              <li style={{ ...styles.logItem, color: COLORS.success }}>
                <span style={styles.logTime}>14:19:50</span> Previous Cycle OK
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---
const SensorCard = ({ icon, label, value, unit, color, isWarn }) => (
  <div
    style={{
      ...styles.sensorCard,
      borderTop: `4px solid ${isWarn ? COLORS.danger : color}`,
    }}
  >
    <div
      style={{ ...styles.iconBox, color: color, backgroundColor: `${color}15` }}
    >
      {icon}
    </div>
    <div style={styles.sensorInfo}>
      <div style={styles.sensorLabel}>{label}</div>
      <div
        style={{
          ...styles.sensorValue,
          color: isWarn ? COLORS.danger : "#333",
        }}
      >
        {value} <span style={styles.sensorUnit}>{unit}</span>
      </div>
    </div>
  </div>
);

const ParamInput = ({ label, value, unit }) => (
  <div style={styles.paramRow}>
    <label style={styles.paramLabel}>{label}</label>
    <div style={styles.inputWrapper}>
      <input type="number" defaultValue={value} style={styles.input} />
      <span style={styles.unitAddon}>{unit}</span>
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
    color: COLORS.text,
    margin: 0,
  },
  subtitle: { fontSize: "14px", color: "#666", marginTop: "5px" },
  statusBox: { display: "flex", alignItems: "center", gap: "10px" },
  statusLabel: { fontWeight: "bold", color: "#555" },
  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
    fontSize: "14px",
  },

  dashboardGrid: { display: "flex", gap: "20px", flexWrap: "wrap" },
  leftCol: {
    flex: "2",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: "500px",
  },
  rightCol: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    minWidth: "300px",
  },

  // 센서 카드
  sensorRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
  },
  sensorCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
  },
  sensorLabel: { fontSize: "12px", color: "#888", marginBottom: "4px" },
  sensorValue: { fontSize: "22px", fontWeight: "bold" },
  sensorUnit: { fontSize: "12px", fontWeight: "normal", color: "#666" },

  // 비전 화면
  visionCard: {
    backgroundColor: COLORS.dark,
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    color: "white",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  visionScreen: {
    height: "250px",
    backgroundColor: "#000",
    border: "1px solid #444",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  crosshair: {
    position: "absolute",
    width: "100%",
    height: "1px",
    backgroundColor: "rgba(0, 255, 0, 0.5)",
    boxShadow: "0 0 5px rgba(0,255,0,0.5)",
  },
  glassOverlay: {
    width: "180px",
    height: "120px",
    border: "2px solid rgba(140, 133, 255, 0.8)",
    backgroundColor: "rgba(140, 133, 255, 0.1)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: "12px",
  },
  visionInfo: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontFamily: "monospace",
    textAlign: "right",
  },

  // 차트
  chartCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  // 우측 패널
  controlCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  paramRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paramLabel: { fontSize: "13px", color: "#555", fontWeight: "bold" },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    borderRadius: "6px",
    overflow: "hidden",
  },
  input: {
    border: "none",
    padding: "6px",
    width: "60px",
    textAlign: "right",
    outline: "none",
    fontSize: "14px",
  },
  unitAddon: {
    backgroundColor: "#f5f5f5",
    padding: "6px 8px",
    fontSize: "12px",
    color: "#666",
    borderLeft: "1px solid #ddd",
  },
  updateBtn: {
    width: "100%",
    marginTop: "15px",
    padding: "10px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  actionCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  lotDisplay: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "6px",
  },
  mainControls: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  bigBtn: {
    flex: 1,
    height: "60px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold",
    fontSize: "12px",
    gap: "4px",
    cursor: "pointer",
  },

  logCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    flex: 1,
  },
  logList: { listStyle: "none", padding: 0, margin: 0, fontSize: "13px" },
  logItem: { borderBottom: "1px solid #eee", padding: "8px 0", color: "#555" },
  logTime: {
    fontWeight: "bold",
    marginRight: "8px",
    color: "#999",
    fontFamily: "monospace",
  },
};

export default ProcessBonding;
