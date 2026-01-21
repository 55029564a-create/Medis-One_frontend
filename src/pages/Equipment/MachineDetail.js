import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaThermometerHalf,
  FaTachometerAlt,
  FaCogs,
  FaPlay,
  FaStop,
  FaExclamationTriangle,
  FaCheckCircle,
  FaHistory,
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

// 🎨 디자인 테마
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#666",
  border: "#E0E0E0",
  success: "#4CAF50",
  danger: "#FF5252",
  warning: "#FF9800",
};

const MachineDetail = () => {
  const { id } = useParams(); // URL에서 설비 ID 가져오기 (예: MC-001)
  const navigate = useNavigate();

  // 설비 데이터 상태
  const [machine, setMachine] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 📝 [Mock Data] 설비별 상세 스펙 (DB 대용)
  const MACHINE_DB = {
    "MC-001": {
      id: "MC-001",
      name: "Auto Dispenser #01",
      type: "Dispenser",
      model: "DS-2024-PRO",
      line: "Line-A (Clean Room)",
      status: "RUNNING", // RUNNING, STOP, ERROR
      uptime: "98.5%",
      totalCount: 1450,
      params: [
        {
          label: "Discharge Pressure",
          value: "450",
          unit: "kPa",
          icon: <FaTachometerAlt />,
        },
        {
          label: "Nozzle Temp",
          value: "42.5",
          unit: "°C",
          icon: <FaThermometerHalf />,
        },
        { label: "Cycle Time", value: "12.5", unit: "sec", icon: <FaCogs /> },
      ],
    },
    "MC-002": {
      id: "MC-002",
      name: "UV Curing Machine #01",
      type: "UV_Curing",
      model: "UV-LED-X500",
      line: "Line-A (Clean Room)",
      status: "RUNNING",
      uptime: "99.2%",
      totalCount: 1420,
      params: [
        {
          label: "UV Intensity",
          value: "850",
          unit: "mW/cm²",
          icon: <FaTachometerAlt />,
        },
        {
          label: "Chamber Temp",
          value: "65.2",
          unit: "°C",
          icon: <FaThermometerHalf />,
        },
        { label: "Curing Time", value: "30.0", unit: "sec", icon: <FaCogs /> },
      ],
    },
  };

  // 초기 데이터 로드
  useEffect(() => {
    // 실제로는 API 호출
    setTimeout(() => {
      const data = MACHINE_DB[id] || MACHINE_DB["MC-001"]; // 없으면 기본값
      setMachine(data);

      // 차트용 초기 데이터 생성
      const initChart = Array.from({ length: 20 }, (_, i) => ({
        time: `10:${30 + i}`,
        value1:
          data.type === "Dispenser"
            ? 400 + Math.random() * 50
            : 800 + Math.random() * 100, // 압력 or 광량
        value2:
          data.type === "Dispenser"
            ? 40 + Math.random() * 5
            : 60 + Math.random() * 5, // 온도
      }));
      setSensorData(initChart);
      setIsLoading(false);
    }, 500);
  }, [id]);

  // 🔄 실시간 센서 데이터 시뮬레이션 (1초마다 갱신)
  useEffect(() => {
    if (!machine || machine.status !== "RUNNING") return;

    const interval = setInterval(() => {
      setSensorData((prev) => {
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        // 설비 타입에 따라 랜덤값 범위 다르게
        const isDispenser = machine.type === "Dispenser";
        const newVal1 = isDispenser
          ? 420 + Math.random() * 60
          : 820 + Math.random() * 80; // 압력/광량
        const newVal2 = isDispenser
          ? 41 + Math.random() * 3
          : 64 + Math.random() * 3; // 온도

        // 새 데이터 추가하고 맨 앞 데이터 삭제 (큐 구조)
        const newData = [
          ...prev,
          { time: timeLabel, value1: newVal1, value2: newVal2 },
        ];
        if (newData.length > 20) newData.shift();
        return newData;
      });
    }, 2000); // 2초마다 업데이트

    return () => clearInterval(interval);
  }, [machine]);

  if (isLoading)
    return <div style={{ padding: "30px" }}>Loading Equipment Data...</div>;

  return (
    <div style={styles.container}>
      {/* 1. 상단 헤더 */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <FaArrowLeft />
          </button>
          <div>
            <h2 style={styles.title}>
              {machine.name}{" "}
              <span style={styles.modelName}>({machine.model})</span>
            </h2>
            <div style={styles.breadCrumb}>
              {machine.line} &gt; {machine.type}
            </div>
          </div>
        </div>

        {/* 상태 배지 및 컨트롤 버튼 */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <StatusBadge status={machine.status} />
          <div style={styles.btnGroup}>
            <button
              style={{ ...styles.controlBtn, backgroundColor: COLORS.success }}
            >
              <FaPlay /> Start
            </button>
            <button
              style={{ ...styles.controlBtn, backgroundColor: COLORS.danger }}
            >
              <FaStop /> Stop
            </button>
          </div>
        </div>
      </div>

      {/* 2. 주요 파라미터 카드 (KPIs) */}
      <div style={styles.kpiGrid}>
        {machine.params.map((param, idx) => (
          <div key={idx} style={styles.kpiCard}>
            <div style={styles.kpiIconBox}>{param.icon}</div>
            <div>
              <div style={styles.kpiLabel}>{param.label}</div>
              <div style={styles.kpiValue}>
                {/* 실시간으로 변하는 느낌을 주기 위해 마지막 센서값 연동 */}
                {idx === 0
                  ? sensorData[sensorData.length - 1]?.value1.toFixed(1)
                  : idx === 1
                    ? sensorData[sensorData.length - 1]?.value2.toFixed(1)
                    : param.value}
                <span style={styles.kpiUnit}>{param.unit}</span>
              </div>
            </div>
          </div>
        ))}
        {/* 가동률 카드 */}
        <div style={styles.kpiCard}>
          <div
            style={{
              ...styles.kpiIconBox,
              backgroundColor: "#E3F2FD",
              color: "#2196F3",
            }}
          >
            <FaCheckCircle />
          </div>
          <div>
            <div style={styles.kpiLabel}>Uptime (가동률)</div>
            <div style={styles.kpiValue}>{machine.uptime}</div>
          </div>
        </div>
      </div>

      {/* 3. 차트 섹션 */}
      <div style={styles.chartSection}>
        {/* 메인 차트: 압력/광량 트렌드 */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>
            {machine.type === "Dispenser"
              ? "🧴 Discharge Pressure (토출 압력)"
              : "☀️ UV Intensity (조사 광량)"}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sensorData}>
              <defs>
                <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.8}
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
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value1"
                stroke={COLORS.primary}
                fillOpacity={1}
                fill="url(#colorValue1)"
                isAnimationActive={false} // 실시간 부드러움을 위해 끔
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 서브 차트: 온도 트렌드 */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>🌡️ Temperature Trend (온도)</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sensorData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eee"
              />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value2"
                stroke={COLORS.warning}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. 최근 알람 이력 */}
      <div style={styles.logCard}>
        <div style={styles.chartTitle}>
          <FaHistory /> Recent Alarm History
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Code</th>
              <th style={styles.th}>Message</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={styles.td}>2026-01-21 09:15:22</td>
              <td
                style={{
                  ...styles.td,
                  color: COLORS.danger,
                  fontWeight: "bold",
                }}
              >
                ERR-004
              </td>
              <td style={styles.td}>
                Nozzle Clogging Warning (노즐 막힘 감지)
              </td>
              <td style={styles.td}>
                <span style={styles.resolvedBadge}>Resolved</span>
              </td>
            </tr>
            <tr>
              <td style={styles.td}>2026-01-20 14:30:05</td>
              <td
                style={{
                  ...styles.td,
                  color: COLORS.warning,
                  fontWeight: "bold",
                }}
              >
                WRN-102
              </td>
              <td style={styles.td}>Temperature Limit High (온도 상한 근접)</td>
              <td style={styles.td}>
                <span style={styles.resolvedBadge}>Resolved</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트: 상태 배지 ---
const StatusBadge = ({ status }) => {
  const isRun = status === "RUNNING";
  const bg = isRun ? COLORS.success : COLORS.danger;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        backgroundColor: `${bg}20`,
        color: bg,
        padding: "8px 16px",
        borderRadius: "20px",
        fontWeight: "bold",
        fontSize: "14px",
        border: `1px solid ${bg}`,
      }}
    >
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: bg,
          boxShadow: `0 0 8px ${bg}`,
        }}
      ></div>
      {status}
    </div>
  );
};

// --- 스타일 ---
const styles = {
  container: {
    padding: "20px",
    backgroundColor: COLORS.bg,
    minHeight: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  backBtn: {
    border: "none",
    background: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: COLORS.gray,
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.text,
    margin: 0,
  },
  modelName: { fontSize: "16px", color: COLORS.gray, fontWeight: "normal" },
  breadCrumb: {
    fontSize: "12px",
    color: COLORS.primary,
    marginTop: "4px",
    fontWeight: "bold",
  },

  btnGroup: { display: "flex", gap: "10px" },
  controlBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "none",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },

  // KPI Grid
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "20px",
  },
  kpiCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  },
  kpiIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: `${COLORS.primary}20`,
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  kpiLabel: { fontSize: "12px", color: "#888", marginBottom: "4px" },
  kpiValue: { fontSize: "24px", fontWeight: "900", color: "#333" },
  kpiUnit: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "normal",
    marginLeft: "4px",
  },

  // Chart Section
  chartSection: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr", // 왼쪽이 좀 더 크게
    gap: "20px",
    marginBottom: "20px",
  },
  chartCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  // Log Card
  logCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: `2px solid ${COLORS.border}`,
    color: "#666",
    fontSize: "13px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
    color: "#333",
  },
  resolvedBadge: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "bold",
  },
};

export default MachineDetail;
