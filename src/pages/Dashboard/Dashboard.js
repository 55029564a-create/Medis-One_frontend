import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaIndustry,
  FaCogs,
  FaExclamationTriangle,
  FaThermometerHalf,
  FaTint,
  FaWind,
  FaUtensils,
  FaCommentDots,
} from "react-icons/fa";
import { MdVerifiedUser } from "react-icons/md";
import { getDashboardData } from "../../api/dashboardApi";

const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  text: "#333333",
  subText: "#888888",
  background: "#F5F6FA",
  cardBg: "#FFFFFF",
};
const PIE_COLORS = ["#8C85FF", "#FFBB33", "#FF4444", "#00C851", "#33B5E5"];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const result = await getDashboardData();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data)
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        대시보드 로딩중...
      </div>
    );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>
            Smart Factory Dashboard
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            {new Date().toLocaleDateString()} | 실시간 통합 모니터링
          </p>
        </div>
      </div>

      {/* 1. KPI Cards */}
      <div style={styles.grid4}>
        <KpiCard
          title="금일 생산 달성률"
          value={data.productionKpi.value}
          subText={data.productionKpi.subText}
          icon={<FaIndustry />}
          color={COLORS.primary}
        />
        <KpiCard
          title="설비 가동률"
          value={data.equipmentKpi.value}
          subText={data.equipmentKpi.subText}
          icon={<FaCogs />}
          color={COLORS.success}
        />
        <KpiCard
          title="실시간 불량률"
          value={data.defectKpi.value}
          subText={data.defectKpi.subText}
          icon={<FaExclamationTriangle />}
          color={COLORS.danger}
          isHighlight
        />
        <CleanRoomCard temp="23.5°C" humid="45.0%" cleanClass="Class 100" />
      </div>

      {/* 2. Main Charts */}
      <div style={styles.gridChart}>
        <div style={{ ...styles.card, overflow: "visible" }}>
          <div style={styles.cardHeader}>
            <h3>📊 시간대별 생산 현황</h3>
            <span style={styles.badge}>Live</span>
          </div>
          <div style={{ height: "320px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.hourlyProduction}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={styles.tooltip}
                />
                <Legend />
                <Bar
                  dataKey="target"
                  name="목표량"
                  fill="#E0E0E0"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
                <Bar
                  dataKey="value"
                  name="실적"
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ ...styles.card, overflow: "visible" }}>
          <div style={styles.cardHeader}>
            <h3>🍩 상세 불량 유형 (현상)</h3>
          </div>
          <div style={{ height: "320px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.defectTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.defectTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Bottom Widgets */}
      <div style={styles.grid3}>
        {/* [A구역] ② 생산 라인 가동 현황 (상단 전체 배치 & 가로 카드형) */}
        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <div style={styles.cardHeader}>
            <h3>🏭 생산 라인 가동 현황</h3>
          </div>
          <div style={styles.lineGrid}>
            {" "}
            {/* Grid Layout 적용 */}
            {(data.lineStatus || []).map((line, idx) => (
              <div key={idx} style={styles.lineCard}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background:
                        line.status === "RUN" ? COLORS.success : "#E0E0E0",
                      boxShadow:
                        line.status === "RUN"
                          ? `0 0 8px ${COLORS.success}`
                          : "none",
                    }}
                  />
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: line.status === "RUN" ? COLORS.text : "#999",
                    }}
                  >
                    {line.name}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#888",
                    marginBottom: "15px",
                    height: "20px",
                  }}
                >
                  {line.description}
                </div>

                <div style={styles.lineCardFooter}>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    가동 설비:{" "}
                    <b
                      style={{
                        color: line.status === "RUN" ? COLORS.primary : "#999",
                      }}
                    >
                      {line.runningEquipment}
                    </b>{" "}
                    / {line.totalEquipment}
                  </div>
                  <div
                    style={{
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor:
                        line.status === "RUN"
                          ? `${COLORS.success}15`
                          : "#F5F5F5",
                      color: line.status === "RUN" ? COLORS.success : "#999",
                    }}
                  >
                    {line.status === "RUN" ? "가동중" : "대기"}
                  </div>
                </div>
              </div>
            ))}
            {(!data.lineStatus || data.lineStatus.length === 0) && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "20px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                등록된 라인 정보가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* [B구역] ① 자재 이슈 알림 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3>⚠️ 자재 이슈 알림</h3>
          </div>
          <ul style={styles.list}>
            {data.materialAlerts.length === 0 ? (
              <li
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                이슈 없음
              </li>
            ) : (
              data.materialAlerts.map((alert, i) => (
                <ListItem
                  key={i}
                  status={alert.status}
                  text={alert.text}
                  sub={alert.sub}
                />
              ))
            )}
          </ul>
        </div>

        {/* [C구역] ③ Today's Pick */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3>🍱 Today's Pick</h3>
          </div>
          <div style={styles.menuBox}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <FaUtensils
                style={{ marginRight: "10px", color: COLORS.primary }}
              />
              <span style={{ fontWeight: "bold", color: COLORS.text }}>
                중식 메뉴
              </span>
            </div>
            <p
              style={{
                margin: "0 0 15px 0",
                fontSize: "14px",
                color: "#555",
                lineHeight: "1.6",
              }}
            >
              흑미밥, 제육볶음, 계란찜,
              <br />
              미역국, 배추김치
            </p>
            <div style={styles.quoteBox}>
              <FaCommentDots
                style={{
                  fontSize: "12px",
                  color: COLORS.primary,
                  marginBottom: "5px",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontStyle: "italic",
                  fontSize: "12px",
                  color: "#666",
                }}
              >
                "최고의 품질은 꼼꼼한 확인에서 시작됩니다."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ... (서브 컴포넌트 동일) ...
const KpiCard = ({ title, value, subText, icon, color, isHighlight }) => (
  <div style={styles.card}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
      }}
    >
      <div>
        <p
          style={{
            margin: "0 0 10px 0",
            color: COLORS.subText,
            fontSize: "14px",
          }}
        >
          {title}
        </p>
        <h3
          style={{
            margin: "0 0 5px 0",
            fontSize: "28px",
            color: isHighlight ? color : COLORS.text,
          }}
        >
          {value}
        </h3>
        <p style={{ margin: 0, fontSize: "12px", color: COLORS.subText }}>
          {subText}
        </p>
      </div>
      <div
        style={{
          width: "45px",
          height: "45px",
          borderRadius: "12px",
          backgroundColor: `${color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          fontSize: "20px",
        }}
      >
        {icon}
      </div>
    </div>
  </div>
);

const CleanRoomCard = ({ temp, humid, cleanClass }) => (
  <div
    style={{
      ...styles.card,
      backgroundColor: "#E3F2FD",
      border: "1px solid #BBDEFB",
    }}
  >
    <div style={styles.cardHeader}>
      <h3 style={{ color: "#1565C0", margin: 0 }}>Clean Room</h3>
      <MdVerifiedUser style={{ color: "#1565C0", fontSize: "20px" }} />
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        marginTop: "15px",
      }}
    >
      <div style={styles.cleanItem}>
        <FaThermometerHalf /> {temp}
      </div>
      <div style={styles.cleanItem}>
        <FaTint /> {humid}
      </div>
      <div style={styles.cleanItem}>
        <FaWind /> {cleanClass}
      </div>
    </div>
  </div>
);

const ListItem = ({ status, text, sub }) => {
  const dotColor =
    status === "danger"
      ? COLORS.danger
      : status === "warning"
        ? COLORS.warning
        : COLORS.success;
  return (
    <li style={styles.listItem}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: dotColor,
            marginRight: "10px",
          }}
        ></span>
        <span style={{ fontSize: "14px", color: COLORS.text }}>{text}</span>
      </div>
      <span style={{ fontSize: "12px", color: COLORS.subText }}>{sub}</span>
    </li>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: COLORS.background,
    minHeight: "100vh",
  },
  header: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "70px",
  },
  gridChart: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
    marginBottom: "25px",
  },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    height: "80%",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    overflow: "visible",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    fontSize: "16px",
    fontWeight: "bold",
    color: COLORS.text,
  },
  badge: {
    backgroundColor: COLORS.danger,
    color: "#fff",
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: "bold",
  },
  cleanItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    color: "#1565C0",
    fontWeight: "500",
  },
  list: { listStyle: "none", padding: 0, margin: 0 },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },
  menuBox: {
    backgroundColor: COLORS.secondary,
    padding: "15px",
    borderRadius: "12px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  quoteBox: {
    marginTop: "auto",
    paddingTop: "15px",
    borderTop: "1px dashed #d1c4e9",
  },
  tooltip: {
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    backgroundColor: "#fff",
    padding: "10px",
  },

  // [수정] Grid Layout 및 Card 스타일
  lineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)", // 4개의 컬럼
    gap: "15px",
    marginTop: "10px",
  },
  lineCard: {
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    border: "1px solid #EEE",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    transition: "0.2s",
    cursor: "default",
  },
  lineCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto", // 하단 고정
    paddingTop: "15px",
    borderTop: "1px solid #F5F5F5",
  },
};

export default Dashboard;
