import React, { useState } from "react";
import {
  FaExclamationCircle,
  FaChartPie,
  FaCheckDouble,
  FaCamera,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  danger: "#FF5252",
  warning: "#FFBB33",
  success: "#00C851",
  text: "#333",
  gray: "#888",
};

const PIE_COLORS = ["#FF5252", "#FFBB33", "#4285F4", "#AA66CC"];

const QualityDefect = () => {
  // 📝 [Mock Data] 불량 통계
  const defectStats = [
    { name: "Dead Pixel", value: 45 },
    { name: "Scratch", value: 25 },
    { name: "Gap/Dan", value: 15 },
    { name: "Foreign Mt.", value: 15 },
  ];

  // 불량 리스트
  const [defects] = useState([
    {
      id: "DEF-001",
      date: "2026-01-21",
      type: "Dead Pixel",
      product: "24' Medical Monitor",
      line: "Line-A",
      status: "PENDING",
    },
    {
      id: "DEF-002",
      date: "2026-01-21",
      type: "Scratch",
      product: "AG Glass",
      line: "Line-B",
      status: "SOLVED",
    },
    {
      id: "DEF-003",
      date: "2026-01-20",
      type: "Power Fail",
      product: "Main Board",
      line: "Line-A",
      status: "SOLVED",
    },
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛡️ 품질 불량 현황 (Quality Control)</h2>

      {/* 1. 상단 차트 영역 */}
      <div style={styles.chartRow}>
        {/* 원형 차트: 불량 유형 점유율 */}
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaChartPie /> 불량 유형 분석
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={defectStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {defectStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.legend}>
            {defectStats.map((d, i) => (
              <span key={i} style={{ fontSize: "12px", marginRight: "10px" }}>
                <span style={{ color: PIE_COLORS[i] }}>●</span> {d.name}
              </span>
            ))}
          </div>
        </div>

        {/* 바 차트: 라인별 불량률 */}
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaExclamationCircle /> 라인별 불량 발생수
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Line-A", value: 12 },
                { name: "Line-B", value: 8 },
                { name: "Line-C", value: 3 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="value"
                fill={COLORS.primary}
                barSize={40}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 하단 불량 리스트 */}
      <div style={styles.listCard}>
        <h3 style={styles.cardTitle}>📋 최근 불량 접수 내역</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>접수번호</th>
              <th style={styles.th}>발생일자</th>
              <th style={styles.th}>불량유형</th>
              <th style={styles.th}>제품명</th>
              <th style={styles.th}>발생라인</th>
              <th style={styles.th}>조치상태</th>
              <th style={styles.th}>증거자료</th>
            </tr>
          </thead>
          <tbody>
            {defects.map((d) => (
              <tr key={d.id} style={styles.tr}>
                <td style={styles.td}>{d.id}</td>
                <td style={styles.td}>{d.date}</td>
                <td
                  style={{
                    ...styles.td,
                    color: COLORS.danger,
                    fontWeight: "bold",
                  }}
                >
                  {d.type}
                </td>
                <td style={styles.td}>{d.product}</td>
                <td style={styles.td}>{d.line}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "10px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      backgroundColor:
                        d.status === "SOLVED" ? "#E8F5E9" : "#FFEBEE",
                      color:
                        d.status === "SOLVED" ? COLORS.success : COLORS.danger,
                    }}
                  >
                    {d.status === "SOLVED" ? "조치완료" : "대기중"}
                  </span>
                </td>
                <td style={styles.td}>
                  <button style={styles.iconBtn}>
                    <FaCamera />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "30px", backgroundColor: COLORS.bg, minHeight: "100%" },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: COLORS.text,
  },
  chartRow: { display: "flex", gap: "20px", marginBottom: "20px" },
  chartCard: {
    flex: 1,
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  listCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legend: { textAlign: "center", marginTop: "10px" },
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" },
  th: { padding: "12px", textAlign: "left", fontSize: "13px", color: "#666" },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "12px", fontSize: "14px", color: "#333" },
  iconBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: COLORS.gray,
  },
};

export default QualityDefect;
