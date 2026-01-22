import React, { useState } from "react";
import {
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaTrash,
} from "react-icons/fa";

// 🎨 MedisOne 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#666",
  border: "#E0E0E0",
  success: "#4CAF50", // 입고
  danger: "#FF5252", // 출고
  info: "#2196F3", // 반납
  dark: "#424242", // 폐기
};

const MaterialHistory = () => {
  // 📝 [Mock Data] 의료용 디스플레이 자재 이력
  const [history] = useState([
    {
      id: 1,
      date: "2026-01-20 09:15",
      type: "IN", // 입고
      partCode: "PNL-24FHD-MED",
      item: "24인치 의료용 패널 (High-Bright)",
      lot: "LOT-260120-A01",
      qty: 500,
      location: "자재창고 A-01",
      worker: "김자재",
      note: "정기 입고",
    },
    {
      id: 2,
      date: "2026-01-20 10:30",
      type: "OUT", // 출고
      partCode: "PCB-MAIN-V2",
      item: "메인보드 AD Board",
      lot: "LOT-251215-B05",
      qty: 200,
      location: "Line-A (Clean Room)",
      worker: "박생산",
      note: "작업지시 WO-260120-01",
    },
    {
      id: 3,
      date: "2026-01-20 11:45",
      type: "OUT",
      partCode: "GLS-EMI-AIR",
      item: "항공용 EMI 쉴드 글래스",
      lot: "LOT-260110-C02",
      qty: 50,
      location: "Line-B (Assy)",
      worker: "최조립",
      note: "긴급 생산 투입",
    },
    {
      id: 4,
      date: "2026-01-20 13:20",
      type: "RETURN", // 반납
      partCode: "SCR-M4-10",
      item: "조립용 M4 나사 Set",
      lot: "LOT-251120-D01",
      qty: 1500,
      location: "자재창고 C-05",
      worker: "이반장",
      note: "생산 잔량 반납",
    },
    {
      id: 5,
      date: "2026-01-19 15:40",
      type: "DISCARD", // 폐기
      partCode: "PNL-24FHD-MED",
      item: "24인치 의료용 패널",
      lot: "LOT-251010-F09",
      qty: 2,
      location: "폐기창고",
      worker: "정품질",
      note: "입고 검사 불량 (Crack)",
    },
    {
      id: 6,
      date: "2026-01-19 16:00",
      type: "IN",
      partCode: "BOX-PKG-MED",
      item: "전용 포장 박스 (24인치)",
      lot: "LOT-260119-P01",
      qty: 1000,
      location: "자재창고 B-02",
      worker: "김물류",
      note: "-",
    },
  ]);

  // 필터 상태
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 필터링 로직
  const filteredHistory = history.filter((item) => {
    const typeMatch = filterType === "ALL" ? true : item.type === filterType;
    const searchMatch =
      item.item.includes(searchTerm) ||
      item.partCode.includes(searchTerm) ||
      item.lot.includes(searchTerm);
    return typeMatch && searchMatch;
  });

  return (
    <div style={styles.container}>
      {/* 1. 상단 헤더 & 버튼 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>
            📋 자재 입출고 이력 (Material History)
          </h2>
          <p style={styles.pageSubtitle}>
            모든 자재의 이동 경로와 수량 변화를 추적합니다.
          </p>
        </div>
        <button style={styles.excelBtn}>
          <FaFileExcel /> 엑셀 다운로드
        </button>
      </div>

      {/* 2. 요약 카드 (Dashboard Style) */}
      <div style={styles.summaryRow}>
        <SummaryCard
          label="금일 입고"
          value="1,500"
          color={COLORS.success}
          icon={<FaArrowUp />}
        />
        <SummaryCard
          label="금일 출고"
          value="250"
          color={COLORS.danger}
          icon={<FaArrowDown />}
        />
        <SummaryCard
          label="금일 반납"
          value="1,500"
          color={COLORS.info}
          icon={<FaExchangeAlt />}
        />
        <SummaryCard
          label="금일 폐기"
          value="2"
          color={COLORS.dark}
          icon={<FaTrash />}
        />
      </div>

      {/* 3. 메인 콘텐츠 (필터 + 테이블) */}
      <div style={styles.card}>
        {/* 필터 바 */}
        <div style={styles.filterBar}>
          <div style={styles.filterGroup}>
            <div style={styles.dateGroup}>
              <input
                type="date"
                style={styles.dateInput}
                defaultValue="2026-01-01"
              />
              <span style={{ color: "#999" }}>~</span>
              <input
                type="date"
                style={styles.dateInput}
                defaultValue="2026-01-20"
              />
            </div>

            <div style={styles.selectWrapper}>
              <FaFilter style={styles.filterIcon} />
              <select
                style={styles.select}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">전체 유형</option>
                <option value="IN">입고 (In)</option>
                <option value="OUT">출고 (Out)</option>
                <option value="RETURN">반납 (Return)</option>
                <option value="DISCARD">폐기 (Discard)</option>
              </select>
            </div>
          </div>

          <div style={styles.searchBox}>
            <FaSearch color="#999" />
            <input
              type="text"
              placeholder="품목명 / 코드 / LOT 검색"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 테이블 */}
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>일시</th>
                <th style={styles.th}>구분</th>
                <th style={styles.th}>자재코드 / 품목명</th>
                <th style={styles.th}>LOT ID</th>
                <th style={styles.th}>수량</th>
                <th style={styles.th}>위치 (Location)</th>
                <th style={styles.th}>작업자</th>
                <th style={styles.th}>비고</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyTd}>
                    데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>{item.date}</td>
                    <td style={styles.td}>
                      <TypeBadge type={item.type} />
                    </td>
                    <td style={styles.td}>
                      <div style={styles.partCode}>{item.partCode}</div>
                      <div style={styles.itemName}>{item.item}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.lotBadge}>{item.lot}</span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontWeight: "bold",
                        color: getQtyColor(item.type),
                      }}
                    >
                      {item.type === "IN" || item.type === "RETURN" ? "+" : "-"}
                      {item.qty.toLocaleString()}
                    </td>
                    <td style={styles.td}>{item.location}</td>
                    <td style={styles.td}>{item.worker}</td>
                    <td
                      style={{ ...styles.td, color: "#888", fontSize: "12px" }}
                    >
                      {item.note}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 (디자인용) */}
        <div style={styles.pagination}>
          <button style={styles.pageBtn}>&lt;</button>
          <button style={{ ...styles.pageBtn, ...styles.activePageBtn }}>
            1
          </button>
          <button style={styles.pageBtn}>2</button>
          <button style={styles.pageBtn}>3</button>
          <button style={styles.pageBtn}>&gt;</button>
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---
const SummaryCard = ({ label, value, color, icon }) => (
  <div style={styles.summaryCard}>
    <div
      style={{ ...styles.iconBox, backgroundColor: `${color}15`, color: color }}
    >
      {icon}
    </div>
    <div>
      <div style={styles.summaryLabel}>{label}</div>
      <div style={{ ...styles.summaryValue, color: color }}>{value}</div>
    </div>
  </div>
);

const TypeBadge = ({ type }) => {
  let label = "";
  let color = "";

  switch (type) {
    case "IN":
      label = "입고";
      color = COLORS.success;
      break;
    case "OUT":
      label = "출고";
      color = COLORS.danger;
      break;
    case "RETURN":
      label = "반납";
      color = COLORS.info;
      break;
    case "DISCARD":
      label = "폐기";
      color = COLORS.dark;
      break;
    default:
      label = type;
      color = COLORS.gray;
  }

  return (
    <span
      style={{
        backgroundColor: `${color}15`,
        color: color,
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "bold",
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
};

const getQtyColor = (type) => {
  if (type === "IN" || type === "RETURN") return COLORS.success;
  return COLORS.danger;
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
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "4px",
  },
  pageSubtitle: { fontSize: "13px", color: COLORS.gray },

  excelBtn: {
    backgroundColor: "#217346",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },

  // 요약 카드
  summaryRow: { display: "flex", gap: "15px", marginBottom: "20px" },
  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    padding: "15px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
  },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
  },
  summaryLabel: { fontSize: "12px", color: "#888", marginBottom: "2px" },
  summaryValue: { fontSize: "18px", fontWeight: "900" },

  // 메인 카드
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },

  // 필터 바
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  filterGroup: { display: "flex", gap: "10px", alignItems: "center" },
  dateGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#F9FAFB",
    padding: "5px 10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
  },
  dateInput: {
    border: "none",
    background: "transparent",
    fontSize: "13px",
    color: "#555",
    outline: "none",
  },

  selectWrapper: { position: "relative" },
  filterIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
    fontSize: "12px",
  },
  select: {
    padding: "8px 10px 8px 30px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "13px",
    color: "#555",
    outline: "none",
    cursor: "pointer",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    borderRadius: "8px",
    padding: "8px 12px",
    width: "250px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    marginLeft: "8px",
    fontSize: "13px",
    width: "100%",
  },

  // 테이블
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { borderBottom: "1px solid #eee", backgroundColor: "#FAFAFA" },
  th: {
    padding: "12px 10px",
    textAlign: "left",
    fontSize: "12px",
    color: "#666",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f5f5f5", transition: "background 0.2s" },
  td: {
    padding: "12px 10px",
    fontSize: "13px",
    color: "#333",
    verticalAlign: "middle",
  },
  emptyTd: {
    padding: "40px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },

  // 데이터 스타일
  partCode: { fontSize: "11px", color: "#888", marginBottom: "2px" },
  itemName: { fontSize: "13px", fontWeight: "bold", color: "#333" },
  lotBadge: {
    backgroundColor: "#F3F1FF",
    color: COLORS.primary,
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: "monospace",
  },

  // 페이지네이션
  pagination: {
    display: "flex",
    justifyContent: "center",
    gap: "5px",
    marginTop: "20px",
  },
  pageBtn: {
    border: "1px solid #eee",
    backgroundColor: "white",
    color: "#555",
    width: "30px",
    height: "30px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  activePageBtn: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    fontWeight: "bold",
  },
};

export default MaterialHistory;
