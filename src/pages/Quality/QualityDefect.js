import React, { useState, useEffect } from "react";
import {
  FaExclamationCircle,
  FaChartPie,
  FaCamera,
  FaCalendarAlt,
  // FaSyncAlt 제거
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

// 📡 API 호출 함수
import { getDefectLogs } from "../../api/qualityApi";

const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  danger: "#FF5252",
  warning: "#FFBB33",
  success: "#00C851",
  text: "#333",
  gray: "#888",
  border: "#E0E0E0",
};

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
  "#ff9ff3",
  "#feca57",
  "#ff6b6b",
  "#48dbfb",
  "#1dd1a1",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "6px 10px",
          borderRadius: "4px",
          fontSize: "12px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          zIndex: 9999,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          {payload[0].name.includes(" - ")
            ? payload[0].name.split(" - ")[1]
            : payload[0].name}
        </div>
        <div style={{ color: COLORS.primary }}>
          {`${payload[0].value}건 발생`}
        </div>
      </div>
    );
  }
  return null;
};

const QualityDefect = () => {
  const getToday = () => new Date().toISOString().split("T")[0];

  const [defectList, setDefectList] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getToday());

  // ✅ [자동 동기화 적용] 날짜가 바뀌거나 30초마다 데이터 갱신
  useEffect(() => {
    // 1. 즉시 호출
    fetchAllData(selectedDate);

    // 2. 인터벌 설정 (30초)
    const interval = setInterval(() => {
      fetchAllData(selectedDate);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedDate]);

  const fetchAllData = async (date) => {
    try {
      const logs = await getDefectLogs();

      if (logs && Array.isArray(logs)) {
        const filteredLogs = logs.filter((log) => {
          if (!log.createdAt && !log.date) return false;
          const logDate = (log.createdAt || log.date).substring(0, 10);
          return logDate === date;
        });

        // console.log(`📅 ${date} 자동 동기화 완료`);

        setDefectList(filteredLogs);
        processChartData(filteredLogs);
      } else {
        setDefectList([]);
        setPieData([]);
        setBarData([]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  const getLineName = (codeOrName) => {
    if (!codeOrName) return "Unknown";
    const val = codeOrName.toUpperCase();

    if (
      val.includes("CAL") ||
      val.includes("AGE") ||
      val.includes("VIB") ||
      val.includes("INS") ||
      val.includes("LINE 3")
    )
      return "C-LAB (품질)";
    if (val.endsWith("02") || val.includes("LINE 2")) return "AREX #2 (조립)";
    if (val.endsWith("01") || val.includes("LINE 1")) return "AREX #1 (조립)";
    return val;
  };

  const processChartData = (data) => {
    const combinationCount = {};
    const lineTotalCount = {};

    data.forEach((item) => {
      const rawLine = item.line || item.lineName || item.defectCode || "";
      const defectName = item.defectName || item.name || "미확인 불량";
      const lineName = getLineName(rawLine);

      const comboKey = `${lineName} - ${defectName}`;
      combinationCount[comboKey] = (combinationCount[comboKey] || 0) + 1;
      lineTotalCount[lineName] = (lineTotalCount[lineName] || 0) + 1;
    });

    const formattedPie = Object.keys(combinationCount)
      .map((key) => ({ name: key, value: combinationCount[key] }))
      .sort((a, b) => b.value - a.value);

    const formattedBar = Object.keys(lineTotalCount)
      .map((key) => ({ name: key, v: lineTotalCount[key] }))
      .sort((a, b) => b.v - a.v);

    setPieData(formattedPie);
    setBarData(formattedBar);
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h2 style={styles.title}>🛡️ 일일 품질 불량 현황</h2>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* 버튼 삭제됨 */}
          <div style={styles.datePickerWrapper}>
            <FaCalendarAlt color="#666" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>
        </div>
      </div>

      <div style={styles.chartRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaChartPie /> 상세 불량 유형 (라인별)
          </h3>
          <div style={styles.chartContent}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={styles.legendWrapper}>
              {pieData.map((d, i) => (
                <div key={i} style={styles.legendItem}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flex: 1,
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: "10px",
                        height: "10px",
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                        borderRadius: "50%",
                      }}
                    ></span>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#333",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {d.name.split(" - ")[0]}
                    </span>
                    <span
                      style={{
                        color: "#666",
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                    >
                      - {d.name.split(" - ")[1]}
                    </span>
                  </div>
                  <span
                    style={{
                      fontWeight: "bold",
                      color: COLORS.primary,
                      fontSize: "12px",
                    }}
                  >
                    {d.value}건
                  </span>
                </div>
              ))}
              {pieData.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "#999",
                    fontSize: "12px",
                    padding: "20px",
                  }}
                >
                  데이터 없음
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaExclamationCircle /> 라인별 불량 합계
          </h3>
          <div style={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f0f0f0" }}
                  contentStyle={{ fontSize: "12px", padding: "5px" }}
                />
                <Bar
                  dataKey="v"
                  fill={COLORS.primary}
                  barSize={30}
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={styles.listCard}>
        <h3 style={styles.cardTitle}>
          📋 일자별 불량 접수 내역 ({selectedDate})
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>코드</th>
                <th style={styles.th}>불량명</th>
                <th style={styles.th}>발생라인</th>
                <th style={styles.th}>발생일시</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>이미지</th>
              </tr>
            </thead>
            <tbody>
              {defectList.length > 0 ? (
                defectList.map((d, idx) => (
                  <tr key={d.logNum || idx} style={styles.tr}>
                    <td style={{ ...styles.td, color: COLORS.gray }}>
                      {d.defectCode || "-"}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: "bold",
                        color: COLORS.text,
                      }}
                    >
                      {d.defectName || "-"}
                    </td>
                    <td style={styles.td}>
                      <span
                        style={{
                          backgroundColor: "#F3F4F6",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          color: "#555",
                        }}
                      >
                        {getLineName(d.line || d.defectCode)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {d.createdAt
                        ? d.createdAt.replace("T", " ").substring(0, 16)
                        : "-"}
                    </td>
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
                        {d.status || "접수 (Pending)"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.iconBtn}>
                        <FaCamera />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#999",
                    }}
                  >
                    해당 날짜에 접수된 불량 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { fontSize: "22px", fontWeight: "800", margin: 0, color: COLORS.text },
  datePickerWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#fff",
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  dateInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#333",
    cursor: "pointer",
  },
  chartRow: {
    display: "flex",
    gap: "20px",
    marginBottom: "20px",
    height: "320px",
  },
  chartCard: {
    flex: 1,
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "bold",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#444",
  },
  chartContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  legendWrapper: {
    height: "100px",
    overflowY: "auto",
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: "10px",
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: "#f9f9f9",
  },
  listCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
    fontSize: "16px",
  },
};

export default QualityDefect;
