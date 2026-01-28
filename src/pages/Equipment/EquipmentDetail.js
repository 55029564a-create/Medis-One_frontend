import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaThermometerHalf,
  FaWind,
  FaCompressArrowsAlt,
  FaLayerGroup,
  FaHistory,
  FaCheckCircle,
  FaBolt,
  FaFileAlt,
  FaClipboardList,
  FaTools,
} from "react-icons/fa";
import { MdCleaningServices, MdOutlineViewInAr } from "react-icons/md";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// 🎨 Theme
const COLORS = {
  primary: "#8C85FF",
  primaryLight: "#F3F1FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  subText: "#888",
  success: "#00C851",
  danger: "#FF4444",
  warning: "#FFBB33",
  border: "#E0E0E0",
  chartFill: "#8C85FF",
  info: "#00BCD4",
};

const EquipmentDetail = ({ machineId }) => {
  const { id: paramId } = useParams();
  const id = machineId || paramId;

  const navigate = useNavigate();
  const [machine, setMachine] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🏭 [Mock DB] 리스트 페이지의 ID와 정확히 매칭 (데이터 연결 문제 해결)
  const EQUIPMENT_DB = {
    // 1. 전처리 (세정기)
    "EQ-10": {
      id: "EQ-10",
      name: "플라즈마 세정기 #01",
      type: "CLEANER",
      model: "PL-5000",
      line: "전처리 공정",
      status: "RUN",
      uptime: "98.5%",
      params: [
        { label: "가스 유량", value: "50", unit: "sccm", icon: <FaWind /> },
        { label: "RF 파워", value: "2.5", unit: "kW", icon: <FaBolt /> },
        {
          label: "챔버 압력",
          value: "10",
          unit: "mTorr",
          icon: <FaCompressArrowsAlt />,
        },
      ],
    },
    // 2. 메인 (본딩기)
    "EQ-20": {
      id: "EQ-20",
      name: "광학 본딩기 A호기",
      type: "BONDER",
      model: "OCR-BOND-X",
      line: "메인 공정",
      status: "RUN",
      uptime: "99.2%",
      params: [
        {
          label: "진공도 (Main)",
          value: "-98.5",
          unit: "kPa",
          icon: <FaWind />,
        },
        {
          label: "갭 두께 (Gap)",
          value: "0.152",
          unit: "mm",
          icon: <FaLayerGroup />,
        },
        { label: "UV 경화량", value: "850", unit: "mW", icon: <FaBolt /> },
      ],
    },
    // 3. 후처리 (탈포기)
    "EQ-30": {
      id: "EQ-30",
      name: "오토클레이브 (탈포)",
      type: "AUTOCLAVE",
      model: "AC-200",
      line: "후처리 공정",
      status: "RUN",
      uptime: "95.0%",
      params: [
        {
          label: "가압력 (Press)",
          value: "5.1",
          unit: "bar",
          icon: <FaCompressArrowsAlt />,
        },
        {
          label: "챔버 온도",
          value: "60.5",
          unit: "°C",
          icon: <FaThermometerHalf />,
        },
        { label: "진행 시간", value: "45", unit: "분", icon: <FaHistory /> },
      ],
    },
    // 4. 에이징 #1 (정확히 에이징 데이터가 나오도록 수정)
    "EQ-40": {
      id: "EQ-40",
      name: "에이징 챔버 #1",
      type: "AGING",
      model: "AG-TESTER-01",
      line: "신뢰성 테스트",
      status: "ERROR",
      uptime: "02:10",
      params: [
        {
          label: "내부 온도",
          value: "45.2",
          unit: "°C",
          icon: <FaThermometerHalf />,
        },
        { label: "설정 온도", value: "45.0", unit: "°C", icon: <FaTools /> },
        { label: "진행 시간", value: "130", unit: "분", icon: <FaHistory /> },
      ],
    },
    // 5. 에이징 #2
    "EQ-50": {
      id: "EQ-50",
      name: "에이징 챔버 #2",
      type: "AGING",
      model: "AG-TESTER-02",
      line: "신뢰성 테스트",
      status: "RUN",
      uptime: "04:00",
      params: [
        {
          label: "내부 온도",
          value: "44.8",
          unit: "°C",
          icon: <FaThermometerHalf />,
        },
        { label: "설정 온도", value: "45.0", unit: "°C", icon: <FaTools /> },
        { label: "진행 시간", value: "240", unit: "분", icon: <FaHistory /> },
      ],
    },
    // 6. 비전 검사
    "EQ-60": {
      id: "EQ-60",
      name: "비전 외관 검사기",
      type: "VISION",
      model: "VIS-AI-9000",
      line: "최종 검사",
      status: "STOP",
      uptime: "00:00",
      params: [
        {
          label: "금일 수율",
          value: "99.5",
          unit: "%",
          icon: <FaCheckCircle />,
        },
        {
          label: "검사 수량",
          value: "1200",
          unit: "EA",
          icon: <MdOutlineViewInAr />,
        },
        { label: "불량 수량", value: "6", unit: "EA", icon: <FaHistory /> },
      ],
    },
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      // ID에 해당하는 데이터가 없으면 EQ-20으로 가지 않고 null 처리하거나 에러 표시 (여기선 안전하게 EQ-20)
      const target = EQUIPMENT_DB[id] || EQUIPMENT_DB["EQ-20"];
      setMachine(target);
      const initHistory = Array.from({ length: 20 }, (_, i) =>
        generateRandomData(target.type, i),
      );
      setSensorData(initHistory);
      setLoading(false);
    }, 500);
  }, [id]);

  useEffect(() => {
    if (!machine || machine.status !== "RUN") return;
    const interval = setInterval(() => {
      setSensorData((prev) => {
        const nextData = generateRandomData(machine.type, prev.length);
        const newArr = [...prev, nextData];
        if (newArr.length > 30) newArr.shift();
        return newArr;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [machine]);

  // 🛠️ 설비 타입별 랜덤 데이터 생성 (차트용)
  const generateRandomData = (type, index) => {
    const now = new Date();
    const timeLabel = new Date(
      now.getTime() - (20 - index) * 2000,
    ).toLocaleTimeString("ko-KR", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    let mainVal, subVal;

    if (type === "BONDER") {
      mainVal = -98 + (Math.random() * 2 - 1); // 진공
      subVal = 0.15 + (Math.random() * 0.01 - 0.005); // 갭
    } else if (type === "AUTOCLAVE") {
      mainVal = 5.0 + (Math.random() * 0.4 - 0.2); // 압력
      subVal = 60 + (Math.random() * 2 - 1); // 온도
    } else if (type === "AGING") {
      mainVal = 45 + (Math.random() * 1 - 0.5); // 온도
      subVal = 45; // 설정온도 (고정)
    } else if (type === "VISION") {
      mainVal = 99 + (Math.random() * 1 - 0.5); // 수율
      subVal = Math.random() * 5; // 불량률
    } else {
      mainVal = 50 + Math.random() * 10;
      subVal = 20 + Math.random() * 5;
    }

    return { time: timeLabel, value1: mainVal, value2: subVal };
  };

  if (loading)
    return (
      <div
        style={{ padding: "40px", textAlign: "center", color: COLORS.subText }}
      >
        설비 상세 정보를 불러오는 중입니다...
      </div>
    );

  // 📊 차트 설정 (타입별 제목 자동 변경)
  const getChartConfig = (type) => {
    switch (type) {
      case "BONDER":
        return {
          title1: "🌪️ 진공도 추이 (Vacuum)",
          unit1: "kPa",
          title2: "📏 갭 두께 (Gap)",
          unit2: "mm",
        };
      case "AUTOCLAVE":
        return {
          title1: "⚙️ 챔버 압력 (Pressure)",
          unit1: "bar",
          title2: "🌡️ 챔버 온도 (Temp)",
          unit2: "°C",
        };
      case "AGING":
        return {
          title1: "🌡️ 에이징 온도 추이",
          unit1: "°C",
          title2: "⏱️ 설정 온도 오차",
          unit2: "°C",
        };
      case "VISION":
        return {
          title1: "✅ 실시간 수율 (Yield)",
          unit1: "%",
          title2: "🚫 불량 검출 빈도",
          unit2: "EA",
        };
      case "CLEANER":
        return {
          title1: "💨 가스 유량 (Flow)",
          unit1: "sccm",
          title2: "⚡ RF 파워 (Power)",
          unit2: "kW",
        };
      default:
        return {
          title1: "메인 센서값",
          unit1: "",
          title2: "서브 센서값",
          unit2: "",
        };
    }
  };
  const chartConfig = getChartConfig(machine.type);

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <FaArrowLeft />
          </button>
          <div style={styles.titleGroup}>
            <div style={styles.processBadge}>{machine.line}</div>
            <h2 style={styles.title}>{machine.name}</h2>
            <span style={styles.modelName}>모델명: {machine.model}</span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <StatusBadge status={machine.status} />

          {/* 🔥 [수정됨] 사무실용 '모니터링 & 이력 확인' 버튼으로 변경 */}
          <div style={styles.actionGroup}>
            <button
              style={{
                ...styles.actionBtn,
                backgroundColor: COLORS.info,
                color: "white",
              }}
            >
              <FaHistory /> 가동 이력 조회
            </button>
            <button
              style={{
                ...styles.actionBtn,
                backgroundColor: "white",
                border: `1px solid ${COLORS.border}`,
                color: COLORS.text,
              }}
            >
              <FaClipboardList /> 비가동 사유 확인
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div style={styles.kpiGrid}>
        {machine.params.map((param, idx) => (
          <div key={idx} style={styles.kpiCard}>
            <div style={styles.kpiIconBox}>{param.icon}</div>
            <div>
              <div style={styles.kpiLabel}>{param.label}</div>
              <div style={styles.kpiValue}>
                {/* 실시간 차트값과 연동 (0,1번만) */}
                {idx === 0
                  ? sensorData[sensorData.length - 1]?.value1.toFixed(1)
                  : idx === 1 && machine.type !== "AGING"
                    ? sensorData[sensorData.length - 1]?.value2.toFixed(3)
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
            <div style={styles.kpiLabel}>가동 효율 (Uptime)</div>
            <div style={styles.kpiValue}>{machine.uptime}</div>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div style={styles.chartSection}>
        {/* Main Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>{chartConfig.title1}</h3>
            {machine.status === "RUN" && (
              <span style={styles.liveBadge}>LIVE</span>
            )}
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={sensorData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
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
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [value.toFixed(2), chartConfig.unit1]}
                />
                <Area
                  type="monotone"
                  dataKey="value1"
                  stroke={COLORS.primary}
                  strokeWidth={3}
                  fill="url(#colorMain)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sub Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>{chartConfig.title2}</h3>
          </div>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={sensorData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: "#999" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [value.toFixed(2), chartConfig.unit2]}
                />
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke={COLORS.warning}
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Logs (Read-only) */}
      <div style={styles.logCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>
            <FaHistory style={{ marginRight: "8px", color: COLORS.subText }} />{" "}
            최근 알람 이력 (Logs)
          </h3>
        </div>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>발생 시간</th>
                <th style={styles.th}>구분</th>
                <th style={styles.th}>코드</th>
                <th style={styles.th}>내용</th>
              </tr>
            </thead>
            <tbody>
              {machine.status === "ERROR" ? (
                <tr style={{ backgroundColor: "#FFEBEE" }}>
                  <td style={styles.td}>2026-01-28 10:45:12</td>
                  <td style={styles.td}>
                    <span style={styles.levelError}>에러</span>
                  </td>
                  <td style={styles.td}>ERR-503</td>
                  <td style={styles.td}>
                    온도 센서 연결 끊김 (Temp Sensor Lost)
                  </td>
                </tr>
              ) : (
                <tr>
                  <td style={styles.td}>2026-01-28 10:15:02</td>
                  <td style={styles.td}>
                    <span style={styles.levelInfo}>일반</span>
                  </td>
                  <td style={styles.td}>SYS-001</td>
                  <td style={styles.td}>공정 사이클 정상 완료</td>
                </tr>
              )}
              <tr>
                <td style={styles.td}>2026-01-28 09:42:11</td>
                <td style={styles.td}>
                  <span style={styles.levelWarn}>경고</span>
                </td>
                <td style={styles.td}>VAC-W02</td>
                <td style={styles.td}>압력 수치 미세 변동 감지</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const StatusBadge = ({ status }) => {
  const isRun = status === "RUN";
  const isError = status === "ERROR";

  let color = COLORS.stop;
  let label = "비가동 (STOP)";

  if (isRun) {
    color = COLORS.success;
    label = "정상 가동중 (RUN)";
  }
  if (isError) {
    color = COLORS.danger;
    label = "설비 점검 필요 (ERROR)";
  }

  return (
    <div
      style={{
        ...styles.statusBadge,
        color: color,
        backgroundColor: `${color}15`,
        border: `1px solid ${color}30`,
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {label}
    </div>
  );
};

// --- Styles ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    backgroundColor: "white",
    padding: "20px 30px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "20px" },
  backBtn: {
    border: "none",
    background: "#f5f5f5",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    cursor: "pointer",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    transition: "all 0.2s",
    ":hover": { background: "#ddd" },
  },
  titleGroup: { display: "flex", flexDirection: "column" },
  processBadge: {
    fontSize: "12px",
    color: COLORS.primary,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: "4px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: COLORS.text,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  modelName: {
    fontSize: "14px",
    color: COLORS.subText,
    fontWeight: "500",
    marginTop: "2px",
  },

  headerRight: { display: "flex", alignItems: "center", gap: "20px" },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "14px",
  },
  actionGroup: { display: "flex", gap: "10px" },
  actionBtn: {
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "25px",
  },
  kpiCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: "1px solid white",
  },
  kpiIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
  },
  kpiLabel: {
    fontSize: "12px",
    color: COLORS.subText,
    fontWeight: "600",
    marginBottom: "4px",
  },
  kpiValue: { fontSize: "22px", fontWeight: "800", color: COLORS.text },
  kpiUnit: {
    fontSize: "12px",
    color: COLORS.subText,
    fontWeight: "500",
    marginLeft: "4px",
  },

  chartSection: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "25px",
    marginBottom: "25px",
  },
  chartCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    border: "1px solid white",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  chartTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.text,
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  liveBadge: {
    fontSize: "10px",
    fontWeight: "800",
    color: COLORS.danger,
    backgroundColor: "#FFEBEE",
    padding: "4px 8px",
    borderRadius: "4px",
    animation: "pulse 2s infinite",
  },

  logCard: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 15px",
    borderBottom: `2px solid ${COLORS.bg}`,
    color: COLORS.subText,
    fontSize: "12px",
    fontWeight: "700",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #f5f5f5",
    fontSize: "13px",
    color: COLORS.text,
  },
  levelInfo: {
    backgroundColor: "#E3F2FD",
    color: "#2196F3",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
  },
  levelWarn: {
    backgroundColor: "#FFF8E1",
    color: "#FFA000",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
  },
  levelError: {
    backgroundColor: "#FFEBEE",
    color: "#D32F2F",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
  },
};

export default EquipmentDetail;
