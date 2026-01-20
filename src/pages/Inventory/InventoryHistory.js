import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaFileExcel,
  FaArrowDown,
  FaArrowUp,
  FaFilter,
} from "react-icons/fa";

// 🎨 디자인 테마
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851", // 입고
  danger: "#FF4444", // 출고
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

// Mock Data
const initialHistory = [
  {
    id: "HIS-260120-01",
    date: "2026-01-20",
    time: "14:30",
    type: "IN",
    item: "27인치 LCD 패널",
    code: "M-001",
    qty: 500,
    worker: "김자재",
    location: "A-01",
  },
  {
    id: "HIS-260120-02",
    date: "2026-01-20",
    time: "11:15",
    type: "OUT",
    item: "나사 (M4)",
    code: "M-005",
    qty: 2000,
    worker: "박생산",
    location: "Line-A",
  },
  {
    id: "HIS-260119-01",
    date: "2026-01-19",
    time: "09:20",
    type: "IN",
    item: "전원 케이블",
    code: "M-002",
    qty: 300,
    worker: "이물류",
    location: "B-02",
  },
  {
    id: "HIS-260118-03",
    date: "2026-01-18",
    time: "16:45",
    type: "OUT",
    item: "27인치 LCD 패널",
    code: "M-001",
    qty: 100,
    worker: "최조립",
    location: "Line-B",
  },
  {
    id: "HIS-260118-02",
    date: "2026-01-18",
    time: "13:00",
    type: "IN",
    item: "메인보드 A타입",
    code: "M-003",
    qty: 50,
    worker: "김자재",
    location: "A-03",
  },
];

const InventoryHistory = () => {
  // --- 상태 관리 ---
  const [historyData, setHistoryData] = useState(initialHistory);
  const [filteredData, setFilteredData] = useState(initialHistory);

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, IN, OUT

  // 날짜 기본값: 오늘 날짜
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(today);

  // --- 필터링 로직 ---
  useEffect(() => {
    let result = historyData;

    // 1. 날짜 필터
    if (startDate && endDate) {
      result = result.filter(
        (item) => item.date >= startDate && item.date <= endDate,
      );
    }

    // 2. 유형 필터 (입고/출고)
    if (filterType !== "ALL") {
      result = result.filter((item) => item.type === filterType);
    }

    // 3. 검색어 필터 (품목명, 코드, 작업자)
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.item.toLowerCase().includes(lowerTerm) ||
          item.code.toLowerCase().includes(lowerTerm) ||
          item.worker.toLowerCase().includes(lowerTerm),
      );
    }

    setFilteredData(result);
  }, [startDate, endDate, filterType, searchTerm, historyData]);

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>
            📊 입출고 이력 (History)
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            기간별 자재 및 제품의 입/출고 내역을 상세하게 조회합니다.
          </p>
        </div>
        <button style={styles.excelButton}>
          <FaFileExcel style={{ marginRight: "6px" }} /> 엑셀 다운로드
        </button>
      </div>

      {/* 필터 바 (Toolbar) */}
      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          {/* 날짜 선택 */}
          <div style={styles.datePicker}>
            <FaCalendarAlt color={COLORS.subText} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={{ color: "#aaa" }}>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          {/* 유형 선택 (탭 스타일) */}
          <div style={styles.typeToggle}>
            <button
              style={
                filterType === "ALL" ? styles.toggleActive : styles.toggleBtn
              }
              onClick={() => setFilterType("ALL")}
            >
              전체
            </button>
            <button
              style={
                filterType === "IN" ? styles.toggleActive : styles.toggleBtn
              }
              onClick={() => setFilterType("IN")}
            >
              입고
            </button>
            <button
              style={
                filterType === "OUT" ? styles.toggleActive : styles.toggleBtn
              }
              onClick={() => setFilterType("OUT")}
            >
              출고
            </button>
          </div>
        </div>

        {/* 검색창 */}
        <div style={styles.searchBox}>
          <FaSearch color={COLORS.subText} />
          <input
            placeholder="품목명, 코드, 담당자 검색"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 리스트 (카드형 테이블) */}
      <div style={styles.listContainer}>
        {/* 헤더 */}
        <div style={styles.listHeader}>
          <div style={{ width: "15%" }}>일자/시간</div>
          <div style={{ width: "10%", textAlign: "center" }}>구분</div>
          <div style={{ width: "25%" }}>품목 정보 (명/코드)</div>
          <div
            style={{ width: "15%", textAlign: "right", paddingRight: "20px" }}
          >
            수량
          </div>
          <div style={{ width: "15%" }}>위치/라인</div>
          <div style={{ width: "10%" }}>담당자</div>
          <div style={{ width: "10%", textAlign: "right" }}>이력 ID</div>
        </div>

        {/* 데이터 행 */}
        {filteredData.length > 0 ? (
          filteredData.map((row) => (
            <div key={row.id} style={styles.cardRow}>
              {/* 일자 */}
              <div
                style={{
                  width: "15%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <span style={{ fontWeight: "bold", color: "#555" }}>
                  {row.date}
                </span>
                <span style={{ fontSize: "12px", color: "#999" }}>
                  {row.time}
                </span>
              </div>

              {/* 구분 (뱃지) */}
              <div style={{ width: "10%", textAlign: "center" }}>
                <span
                  style={row.type === "IN" ? styles.badgeIn : styles.badgeOut}
                >
                  {row.type === "IN" ? (
                    <FaArrowDown size={10} />
                  ) : (
                    <FaArrowUp size={10} />
                  )}
                  {row.type === "IN" ? " 입고" : " 출고"}
                </span>
              </div>

              {/* 품목 정보 */}
              <div style={{ width: "25%" }}>
                <div style={{ fontWeight: "600", color: COLORS.text }}>
                  {row.item}
                </div>
                <div style={{ fontSize: "12px", color: COLORS.primary }}>
                  {row.code}
                </div>
              </div>

              {/* 수량 */}
              <div
                style={{
                  width: "15%",
                  textAlign: "right",
                  paddingRight: "20px",
                  fontWeight: "bold",
                  color: row.type === "IN" ? COLORS.success : COLORS.danger,
                }}
              >
                {row.type === "IN" ? "+" : "-"}
                {row.qty.toLocaleString()}
              </div>

              {/* 위치 */}
              <div style={{ width: "15%", fontSize: "14px", color: "#666" }}>
                {row.location}
              </div>

              {/* 담당자 */}
              <div style={{ width: "10%", fontSize: "14px", color: "#555" }}>
                {row.worker}
              </div>

              {/* ID */}
              <div
                style={{
                  width: "10%",
                  textAlign: "right",
                  fontSize: "12px",
                  color: "#ccc",
                }}
              >
                {row.id}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <FaFilter size={40} color="#ddd" style={{ marginBottom: 10 }} />
            <p>조건에 맞는 이력이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Pretendard', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
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
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },

  // 툴바 (필터 및 검색)
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  filterGroup: { display: "flex", gap: "15px", alignItems: "center" },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: COLORS.white,
    padding: "8px 15px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
  },
  dateInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#555",
    fontFamily: "inherit",
  },
  typeToggle: {
    display: "flex",
    backgroundColor: COLORS.white,
    padding: "4px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.border}`,
  },
  toggleBtn: {
    padding: "6px 15px",
    border: "none",
    backgroundColor: "transparent",
    color: "#888",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },
  toggleActive: {
    padding: "6px 15px",
    border: "none",
    backgroundColor: COLORS.primary,
    color: "#fff",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "20px",
    padding: "10px 20px",
    border: `1px solid ${COLORS.border}`,
    width: "300px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
    fontSize: "14px",
  },

  // 리스트 스타일
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  listHeader: {
    display: "flex",
    padding: "0 25px",
    marginBottom: "5px",
    fontSize: "13px",
    color: "#888",
    fontWeight: "bold",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "20px 25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    transition: "transform 0.2s",
    border: "1px solid transparent",
    ":hover": {
      transform: "translateY(-2px)",
      borderColor: COLORS.primary,
    },
  },
  badgeIn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: `${COLORS.success}15`,
    color: COLORS.success,
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeOut: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: `${COLORS.danger}15`,
    color: COLORS.danger,
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    color: "#aaa",
    fontSize: "15px",
  },
};

export default InventoryHistory;
