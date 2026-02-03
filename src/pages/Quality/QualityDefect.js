import React, { useState } from "react";
import { FaExclamationCircle, FaChartPie, FaCamera } from "react-icons/fa";
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

// SQL 기반 10개 색상 확장 (차트 시각화용)
const PIE_COLORS = [
  "#FF5252",
  "#FFBB33",
  "#4285F4",
  "#AA66CC",
  "#00D2D3",
  "#54A0FF",
  "#5F27CD",
  "#EE5253",
  "#01A3A4",
  "#2E86DE",
];

const QualityDefect = () => {
  // 1. [SQL 반영] 불량 코드별 통계 데이터 (실제 연동 전까지 Mocking)
  const [defectStats] = useState([
    { name: "표면 스크래치", value: 15, code: "D-SUR-01" },
    { name: "이물 혼입", value: 10, code: "D-SUR-02" },
    { name: "기포 발생", value: 8, code: "D-BND-01" },
    { name: "OCR 도포 불량", value: 5, code: "D-BND-02" },
    { name: "화소 불량 (Dead Pixel)", value: 25, code: "D-LCD-01" },
    { name: "백라이트 불균일 (Mura)", value: 12, code: "D-LCD-02" },
    { name: "색온도/감마 보정 오차", value: 7, code: "D-CAL-01" },
    { name: "케이스 조립 단차", value: 9, code: "D-ASS-01" },
    { name: "커넥터 체결 불량", value: 4, code: "D-ASS-02" },
    { name: "기타 외관 불량", value: 5, code: "D-ETC-99" },
  ]);

  // 2. [SQL 반영] 최근 불량 접수 리스트
  const [defects] = useState([
    {
      id: "DEF-26-001",
      date: "2026-02-01",
      type: "화소 불량 (Dead Pixel)",
      product: "24' Medical Monitor",
      line: "Line-A",
      status: "PENDING",
      code: "D-LCD-01",
    },
    {
      id: "DEF-26-002",
      date: "2026-02-01",
      type: "표면 스크래치",
      product: "AG Glass",
      line: "Line-B",
      status: "SOLVED",
      code: "D-SUR-01",
    },
    {
      id: "DEF-26-003",
      date: "2026-01-31",
      type: "케이스 조립 단차",
      product: "Standard Monitor",
      line: "Line-C",
      status: "SOLVED",
      code: "D-ASS-01",
    },
    {
      id: "DEF-26-004",
      date: "2026-01-30",
      type: "OCR 도포 불량",
      product: "Touch Panel",
      line: "Line-A",
      status: "PENDING",
      code: "D-BND-02",
    },
  ]);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🛡️ 품질 불량 현황 (Quality Control)</h2>

      <div style={styles.chartRow}>
        {/* 원형 차트: 10개 불량 코드 전체 반영 */}
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaChartPie /> 불량 유형 분석 (Code 기준)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={defectStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {defectStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}건`, name]} />
            </PieChart>
          </ResponsiveContainer>
          {/* 범례 영역 스크롤 가능하도록 개선 */}
          <div style={styles.legendContainer}>
            {defectStats.map((d, i) => (
              <span key={i} style={styles.legendItem}>
                <span style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>
                  ●
                </span>{" "}
                {d.name}
              </span>
            ))}
          </div>
        </div>

        {/* 바 차트: 라인별 발생수 */}
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaExclamationCircle /> 라인별 불량 발생 건수
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "Line-A", v: 18 },
                { name: "Line-B", v: 12 },
                { name: "Line-C", v: 5 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="v"
                fill={COLORS.primary}
                barSize={40}
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div style={styles.listCard}>
        <h3 style={styles.cardTitle}>
          📋 최근 불량 접수 내역 (Total: {defects.length}건)
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>접수번호</th>
                <th style={styles.th}>코드</th>
                <th style={styles.th}>불량유형</th>
                <th style={styles.th}>발생라인</th>
                <th style={styles.th}>조치상태</th>
                <th style={styles.th}>이미지</th>
              </tr>
            </thead>
            <tbody>
              {defects.map((d) => (
                <tr key={d.id} style={styles.tr}>
                  <td style={styles.td}>{d.id}</td>
                  <td style={{ ...styles.td, color: COLORS.gray }}>{d.code}</td>
                  <td
                    style={{
                      ...styles.td,
                      color: COLORS.danger,
                      fontWeight: "bold",
                    }}
                  >
                    {d.type}
                  </td>
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
                          d.status === "SOLVED"
                            ? COLORS.success
                            : COLORS.danger,
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
    </div>
  );
};

// 스타일 보완
const styles = {
  // ... 기존 스타일 유지 ...
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
  legendContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "5px",
    marginTop: "15px",
    maxHeight: "80px",
    overflowY: "auto",
    padding: "5px",
  },
  legendItem: {
    fontSize: "11px",
    color: "#555",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
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
