import React, { useState } from "react";
import {
  FaPrint,
  FaFilePdf,
  FaCheckCircle,
  FaTimesCircle,
  FaRedo,
  FaTv,
  FaChartLine,
  FaRulerCombined,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
};

const CalibrationReport = () => {
  // 📝 [Mock Data] 리포트 기본 정보
  const reportInfo = {
    reportNo: "RPT-260121-0042",
    date: "2026-01-21 15:30:00",
    model: "MED-24-4K-PRO",
    serial: "SN-240121-A005",
    inspector: "Dr. Kim",
    result: "PASS", // PASS or FAIL
  };

  // 📊 [Chart Data] DICOM Gamma Curve (Target vs Measured)
  // JND (Just Noticeable Difference) 그래프 데이터
  const gammaData = [
    { gray: 0, target: 0.5, measured: 0.51 },
    { gray: 32, target: 5.2, measured: 5.1 },
    { gray: 64, target: 15.5, measured: 15.4 },
    { gray: 96, target: 35.0, measured: 35.2 },
    { gray: 128, target: 75.0, measured: 74.8 },
    { gray: 160, target: 140.5, measured: 140.2 },
    { gray: 192, target: 250.0, measured: 250.5 },
    { gray: 224, target: 400.5, measured: 400.1 },
    { gray: 255, target: 600.0, measured: 599.8 },
  ];

  // 📏 [Uniformity Data] 9포인트 균일도 측정 결과 (1~9번 위치)
  // 값은 기준 대비 편차(%) - 10% 이내여야 합격
  const uniformityData = [
    { id: 1, val: 1.2, status: "GOOD" },
    { id: 2, val: 0.5, status: "GOOD" },
    { id: 3, val: 1.8, status: "GOOD" },
    { id: 4, val: 0.8, status: "GOOD" },
    { id: 5, val: 0.0, status: "GOOD" },
    { id: 6, val: 0.9, status: "GOOD" },
    { id: 7, val: 2.5, status: "WARN" },
    { id: 8, val: 1.1, status: "GOOD" },
    { id: 9, val: 1.5, status: "GOOD" },
  ];

  // 📋 측정 파라미터 상세
  const details = [
    {
      label: "Max Luminance",
      value: "600.2 cd/m²",
      target: "600 ± 5%",
      status: "PASS",
    },
    {
      label: "Contrast Ratio",
      value: "1490 : 1",
      target: "> 1000 : 1",
      status: "PASS",
    },
    {
      label: "Color Temp",
      value: "7505 K",
      target: "7500 ± 100K",
      status: "PASS",
    },
    { label: "Gamma", value: "2.19", target: "DICOM Part 14", status: "PASS" },
    { label: "Max JND Error", value: "0.82", target: "< 1.0", status: "PASS" },
  ];

  const handlePdfClick = () => {
    alert(
      `[PDF Export Success]\n\n파일명: Calibration_Report_${reportInfo.serial}.pdf\n다운로드가 완료되었습니다.`,
    );
  };

  return (
    <div style={styles.container}>
      {/* 1. 상단 헤더 & 컨트롤 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📜 Calibration Report (DICOM)</h2>
          <p style={styles.subtitle}>
            Model:{" "}
            <strong style={{ color: COLORS.primary }}>
              {reportInfo.model}
            </strong>{" "}
            | SN: {reportInfo.serial}
          </p>
        </div>
        <div style={styles.btnGroup}>
          <button style={styles.printBtn} onClick={() => window.print()}>
            <FaPrint /> Print
          </button>

          <button style={styles.exportBtn} onClick={handlePdfClick}>
            <FaFilePdf /> PDF Export
          </button>
        </div>
      </div>

      {/* 2. 종합 판정 결과 (Pass/Fail) */}
      <div
        style={{
          ...styles.resultBanner,
          borderColor:
            reportInfo.result === "PASS" ? COLORS.success : COLORS.danger,
          backgroundColor: reportInfo.result === "PASS" ? "#E8F5E9" : "#FFEBEE",
        }}
      >
        <div style={styles.resultLeft}>
          {reportInfo.result === "PASS" ? (
            <FaCheckCircle size={40} color={COLORS.success} />
          ) : (
            <FaTimesCircle size={40} color={COLORS.danger} />
          )}
          <div>
            <div style={styles.resultTitle}>
              Final Judgement: {reportInfo.result}
            </div>
            <div style={styles.resultDesc}>
              Report No: {reportInfo.reportNo} | Inspector:{" "}
              {reportInfo.inspector} | Date: {reportInfo.date}
            </div>
          </div>
        </div>
        {reportInfo.result === "FAIL" && (
          <button style={styles.recalBtn}>
            <FaRedo /> Re-Calibration
          </button>
        )}
      </div>

      <div style={styles.gridContainer}>
        {/* [좌측] 감마 곡선 그래프 */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <FaChartLine /> DICOM GSDF Curve
            </h3>
            <span style={styles.badge}>Gamma 2.2</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={gammaData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="gray"
                label={{
                  value: "Gray Level (0-255)",
                  position: "insideBottomRight",
                  offset: -5,
                }}
              />
              <YAxis
                label={{
                  value: "Luminance (cd/m²)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#8884d8"
                name="Standard (GSDF)"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="measured"
                stroke={COLORS.primary}
                name="Measured"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* [우측] 9-Point Uniformity (균일도) */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>
              <FaTv /> Luminance Uniformity (9-Point)
            </h3>
            <span style={styles.badge}>Max Dev: 2.5%</span>
          </div>

          <div style={styles.uniformityGrid}>
            {uniformityData.map((point) => {
              let bg = "#F1F8E9"; // Good
              let color = COLORS.success;
              if (point.status === "WARN") {
                bg = "#FFF8E1";
                color = COLORS.warning;
              }
              if (point.status === "FAIL") {
                bg = "#FFEBEE";
                color = COLORS.danger;
              }

              return (
                <div
                  key={point.id}
                  style={{
                    ...styles.gridPoint,
                    backgroundColor: bg,
                    borderColor: color,
                  }}
                >
                  <div style={styles.pointId}>P{point.id}</div>
                  <div style={{ ...styles.pointVal, color: color }}>
                    {point.val}%
                  </div>
                </div>
              );
            })}
          </div>
          <div style={styles.uniFooter}>
            * Values represent deviation from center point (P5). <br />*
            Tolerance: ±10%
          </div>
        </div>
      </div>

      {/* 3. 하단 상세 측정 테이블 */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle}>
            <FaRulerCombined /> Measurement Details
          </h3>
        </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>Test Item</th>
              <th style={styles.th}>Measured Value</th>
              <th style={styles.th}>Target / Spec</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {details.map((row, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={{ ...styles.td, fontWeight: "bold" }}>
                  {row.label}
                </td>
                <td style={styles.td}>{row.value}</td>
                <td style={{ ...styles.td, color: "#666" }}>{row.target}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      fontWeight: "bold",
                      color:
                        row.status === "PASS" ? COLORS.success : COLORS.danger,
                    }}
                  >
                    {row.status === "PASS" ? "● PASS" : "● FAIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 스타일 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },

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

  btnGroup: { display: "flex", gap: "10px" },
  printBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.text,
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.danger,
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  // 결과 배너
  resultBanner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    borderRadius: "12px",
    border: "2px solid",
    marginBottom: "20px",
  },
  resultLeft: { display: "flex", alignItems: "center", gap: "20px" },
  resultTitle: { fontSize: "20px", fontWeight: "900", color: "#333" },
  resultDesc: { fontSize: "13px", color: "#666", marginTop: "4px" },
  recalBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.warning,
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  // 그리드
  gridContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    minWidth: "400px",
    marginBottom: "20px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#333",
  },
  badge: {
    backgroundColor: "#f0f0f0",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#666",
  },

  // 균일도 그리드 (3x3)
  uniformityGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
    height: "250px",
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
  },
  gridPoint: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    border: "1px solid",
    fontWeight: "bold",
  },
  pointId: { fontSize: "12px", color: "#888", marginBottom: "4px" },
  pointVal: { fontSize: "16px" },
  uniFooter: {
    marginTop: "15px",
    fontSize: "12px",
    color: "#888",
    textAlign: "center",
    fontStyle: "italic",
  },

  // 테이블
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
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#333",
    verticalAlign: "middle",
  },
};

export default CalibrationReport;
