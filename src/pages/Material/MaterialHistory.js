import React, { useState } from "react";
import { FaFileExcel, FaSearch } from "react-icons/fa";

const COLORS = {
  primary: "#8C85FF",
  success: "#00C851", // 입고
  danger: "#FF4444", // 출고
  bg: "#F5F6FA",
  text: "#333",
  border: "#E0E0E0",
};

const MaterialHistory = () => {
  // 이력 Mock Data
  const [history, setHistory] = useState([
    {
      id: 1,
      date: "2026-01-14 10:30",
      type: "IN",
      item: "27인치 LCD 패널",
      lot: "LOT-240114-01",
      qty: 500,
      worker: "김자재",
    },
    {
      id: 2,
      date: "2026-01-14 11:15",
      type: "OUT",
      item: "나사 (M4)",
      lot: "LOT-240110-03",
      qty: 2000,
      worker: "박생산",
      target: "Line-A",
    },
    {
      id: 3,
      date: "2026-01-14 13:40",
      type: "IN",
      item: "전원 케이블",
      lot: "LOT-240114-02",
      qty: 300,
      worker: "이물류",
    },
    {
      id: 4,
      date: "2026-01-14 15:20",
      type: "OUT",
      item: "27인치 LCD 패널",
      lot: "LOT-240114-01",
      qty: 100,
      worker: "최조립",
      target: "Line-B",
    },
  ]);

  const [filterType, setFilterType] = useState("ALL"); // ALL, IN, OUT

  const filteredHistory = history.filter((item) =>
    filterType === "ALL" ? true : item.type === filterType,
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ margin: 0, color: COLORS.text }}>
          📋 자재 입출고 이력 (History)
        </h2>
        <button style={styles.excelButton}>
          <FaFileExcel style={{ marginRight: "5px" }} /> 엑셀 다운로드
        </button>
      </div>

      <div style={styles.card}>
        {/* 필터 영역 */}
        <div style={styles.filterBar}>
          <div style={{ display: "flex", gap: "10px" }}>
            <input type="date" style={styles.dateInput} />
            <span style={{ alignSelf: "center" }}>~</span>
            <input type="date" style={styles.dateInput} />
            <select
              style={styles.select}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">전체 유형</option>
              <option value="IN">입고 (In)</option>
              <option value="OUT">출고 (Out)</option>
            </select>
          </div>
          <div style={styles.searchBox}>
            <FaSearch color="#999" />
            <input
              type="text"
              placeholder="품목명 / LOT ID 검색"
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* 테이블 */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>일시</th>
              <th style={styles.th}>구분</th>
              <th style={styles.th}>품목명</th>
              <th style={styles.th}>LOT ID</th>
              <th style={styles.th}>수량</th>
              <th style={styles.th}>작업자</th>
              <th style={styles.th}>비고 (위치)</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{item.date}</td>
                <td style={styles.td}>
                  <span
                    style={
                      item.type === "IN" ? styles.badgeIn : styles.badgeOut
                    }
                  >
                    {item.type === "IN" ? "입고" : "출고"}
                  </span>
                </td>
                <td style={{ ...styles.td, fontWeight: "bold" }}>
                  {item.item}
                </td>
                <td style={styles.td}>{item.lot}</td>
                <td
                  style={{
                    ...styles.td,
                    color: item.type === "IN" ? COLORS.success : COLORS.danger,
                  }}
                >
                  {item.type === "IN" ? "+" : "-"}
                  {item.qty}
                </td>
                <td style={styles.td}>{item.worker}</td>
                <td style={styles.td}>{item.target || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  dateInput: { padding: "8px", borderRadius: "8px", border: "1px solid #ddd" },
  select: { padding: "8px", borderRadius: "8px", border: "1px solid #ddd" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "20px",
    padding: "8px 15px",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    marginLeft: "10px",
  },
  excelButton: {
    backgroundColor: "#217346",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  thRow: { borderBottom: `2px solid ${COLORS.border}` },
  th: {
    padding: "15px 10px",
    textAlign: "left",
    color: "#666",
    fontWeight: "bold",
  },
  tr: { borderBottom: "1px solid #eee" },
  td: { padding: "15px 10px", color: COLORS.text },
  badgeIn: {
    backgroundColor: `${COLORS.success}20`,
    color: COLORS.success,
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeOut: {
    backgroundColor: `${COLORS.danger}20`,
    color: COLORS.danger,
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
};

export default MaterialHistory;
