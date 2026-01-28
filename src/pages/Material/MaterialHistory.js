import React, { useState, useEffect } from "react";
import client from "../../api/client";
// getMaterialHistory 함수 위치 확인 필수
import { getMaterialHistory } from "../../api/materialApi";

import {
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaTrash,
  FaEye,
  FaTimes,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

// 🎨 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#666",
  border: "#E0E0E0",
  success: "#4CAF50",
  danger: "#FF5252",
  info: "#2196F3",
  dark: "#424242",
};

const MaterialHistory = () => {
  const [history, setHistory] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 🔄 [핵심 수정] 데이터 로드 로직
  const fetchData = async () => {
    try {
      const data = await getMaterialHistory(searchTerm);

      // 1. [연결 성공] 데이터가 있을 때
      if (data && data.length > 0) {
        const mappedData = data.map((item, index) => {
          let typeCode = "ETC";
          if (item.type === "입고") typeCode = "IN";
          else if (item.type === "출고") typeCode = "OUT";

          return {
            id: `HIST-${index}`,
            date: item.date
              ? item.date.replace("T", " ").substring(0, 16)
              : "-",
            type: typeCode,
            partCode: "-",
            item: item.matName,
            lot: item.lotNum,
            qty: item.changeQty,
            location: item.company || "-",
            worker: item.empName || "시스템",
            note: `이전: ${item.prevQty} → 현재: ${item.currentQty}`,
          };
        });
        setHistory(mappedData);
      }
      // 2. [연결 성공] 하지만 데이터가 0개일 때 (요청하신 부분!)
      else {
        setHistory([
          {
            id: "INFO-EMPTY",
            date: "-",
            type: "INFO", // 파란색 배지용
            partCode: "-",
            item: "✅ DB 연결 성공 (데이터 없음)", // 자재명에 표시
            lot: "-",
            qty: 0,
            location: "-",
            worker: "시스템",
            note: "DB 연결은 성공했으나 조회된 내역이 없습니다.",
          },
        ]);
      }
    } catch (error) {
      console.error("데이터 로드 실패", error);

      // 3. [연결 실패] 에러 발생 시 (요청하신 부분!)
      setHistory([
        {
          id: "ERROR",
          date: "-",
          type: "ERROR", // 빨간색 배지용
          partCode: "ERR-500",
          item: "❌ DB 연결 실패", // 자재명에 표시
          lot: "-",
          qty: 0,
          location: "-",
          worker: "시스템",
          note: "API 주소나 서버 상태를 확인하세요.",
        },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm]);

  const handleSearch = () => {
    fetchData();
  };

  // 필터링 (안내 메시지들은 필터링 무시하고 무조건 표시)
  const filteredHistory = history.filter((item) => {
    if (item.id === "ERROR" || item.id === "INFO-EMPTY") return true;

    if (!item) return false;
    const typeMatch = filterType === "ALL" ? true : item.type === filterType;
    return typeMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // 요약 계산 (안내 메시지는 제외)
  const validHistory = history.filter(
    (i) => i.id !== "ERROR" && i.id !== "INFO-EMPTY",
  );
  const summary = {
    in: validHistory
      .filter((i) => i.type === "IN")
      .reduce((acc, cur) => acc + cur.qty, 0),
    out: validHistory
      .filter((i) => i.type === "OUT")
      .reduce((acc, cur) => acc + cur.qty, 0),
    return: validHistory
      .filter((i) => i.type === "RETURN")
      .reduce((acc, cur) => acc + cur.qty, 0),
    discard: validHistory
      .filter((i) => i.type === "DISCARD")
      .reduce((acc, cur) => acc + cur.qty, 0),
  };

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <style>{`
        .history-container { padding: 20px; background-color: ${COLORS.bg}; min-height: 100vh; display: flex; flex-direction: column; }
        .desktop-table { display: table; width: 100%; border-collapse: collapse; }
        .mobile-card-list { display: none; } 

        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-card-list { display: flex; flex-direction: column; gap: 15px; }
          .summary-row { flex-direction: column; }
          .filter-bar { flex-direction: column; align-items: stretch; }
          .search-box { width: 100%; margin-top: 10px; }
        }
      `}</style>

      <div className="history-container">
        {/* 헤더 */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.pageTitle}>📋 자재 입출고 이력</h2>
            <p style={styles.pageSubtitle}>
              자재의 이동 경로와 수량 변화를 추적합니다.
            </p>
          </div>
          <button style={styles.excelBtn}>
            <FaFileExcel /> 엑셀 다운로드
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="summary-row" style={styles.summaryRow}>
          <SummaryCard
            label="총 입고"
            value={summary.in.toLocaleString()}
            color={COLORS.success}
            icon={<FaArrowUp />}
          />
          <SummaryCard
            label="총 출고"
            value={summary.out.toLocaleString()}
            color={COLORS.danger}
            icon={<FaArrowDown />}
          />
          <SummaryCard
            label="총 반납"
            value={summary.return.toLocaleString()}
            color={COLORS.info}
            icon={<FaExchangeAlt />}
          />
          <SummaryCard
            label="총 폐기"
            value={summary.discard.toLocaleString()}
            color={COLORS.dark}
            icon={<FaTrash />}
          />
        </div>

        {/* 메인 콘텐츠 */}
        <div style={styles.card}>
          {/* 필터 바 */}
          <div className="filter-bar" style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <div style={styles.selectWrapper}>
                <FaFilter style={styles.filterIcon} />
                <select
                  style={styles.select}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="ALL">전체 유형</option>
                  <option value="IN">입고</option>
                  <option value="OUT">출고</option>
                </select>
              </div>
            </div>
            <div className="search-box" style={styles.searchBox}>
              <FaSearch color="#999" />
              <input
                type="text"
                placeholder="품목명 / LOT 번호 검색"
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button onClick={handleSearch} style={styles.searchBtn}>
                검색
              </button>
            </div>
          </div>

          {/* 2. PC용 테이블 */}
          <div style={{ overflowX: "hidden" }}>
            <table className="desktop-table">
              <thead>
                <tr style={styles.thRow}>
                  <th style={{ ...styles.th, width: "15%" }}>일시</th>
                  <th
                    style={{ ...styles.th, width: "10%", textAlign: "center" }}
                  >
                    구분
                  </th>
                  <th style={{ ...styles.th, width: "20%" }}>자재명</th>
                  <th style={{ ...styles.th, width: "15%" }}>LOT ID</th>
                  <th
                    style={{ ...styles.th, width: "10%", textAlign: "right" }}
                  >
                    수량
                  </th>
                  <th style={{ ...styles.th, width: "15%" }}>업체/위치</th>
                  <th style={{ ...styles.th, width: "10%" }}>작업자</th>
                  <th
                    style={{ ...styles.th, width: "5%", textAlign: "center" }}
                  >
                    {" "}
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>{item.date}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <TypeBadge type={item.type} />
                    </td>
                    <td style={styles.td}>
                      {/* 상태에 따라 색상 변경 */}
                      <div
                        style={
                          item.id === "ERROR"
                            ? { ...styles.itemName, color: COLORS.danger }
                            : item.id === "INFO-EMPTY"
                              ? { ...styles.itemName, color: COLORS.info }
                              : styles.itemName
                        }
                      >
                        {item.id === "ERROR" && (
                          <FaExclamationCircle style={{ marginRight: 6 }} />
                        )}
                        {item.id === "INFO-EMPTY" && (
                          <FaCheckCircle style={{ marginRight: 6 }} />
                        )}
                        {item.item}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.lotBadge}>{item.lot}</span>
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        textAlign: "right",
                        fontWeight: "bold",
                        color: getQtyColor(item.type),
                      }}
                    >
                      {item.type === "IN"
                        ? "+"
                        : item.type === "OUT"
                          ? "-"
                          : ""}
                      {item.qty.toLocaleString()}
                    </td>
                    <td style={styles.td}>{item.location}</td>
                    <td style={styles.td}>{item.worker}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <button
                        style={styles.detailBtn}
                        onClick={() => openModal(item)}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. 모바일용 카드 리스트 */}
          <div className="mobile-card-list">
            {currentItems.map((item) => (
              <div
                key={item.id}
                style={styles.mobileCard}
                onClick={() => openModal(item)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <span style={styles.dateText}>{item.date}</span>
                  <TypeBadge type={item.type} />
                </div>
                <div
                  style={
                    item.id === "ERROR"
                      ? { ...styles.itemName, color: COLORS.danger }
                      : item.id === "INFO-EMPTY"
                        ? { ...styles.itemName, color: COLORS.info }
                        : styles.itemName
                  }
                >
                  {item.item}
                </div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  {item.location}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "10px",
                    alignItems: "center",
                  }}
                >
                  <span style={styles.lotBadge}>{item.lot}</span>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: getQtyColor(item.type),
                    }}
                  >
                    {item.type === "IN" ? "+" : item.type === "OUT" ? "-" : ""}{" "}
                    {item.qty.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 4. 페이지네이션 */}
          {totalPages > 0 && (
            <div style={styles.pagination}>
              <button
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === 1 ? styles.disabledBtn : {}),
                }}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    style={
                      currentPage === number
                        ? { ...styles.pageBtn, ...styles.activePageBtn }
                        : styles.pageBtn
                    }
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </button>
                ),
              )}
              <button
                style={{
                  ...styles.pageBtn,
                  ...(currentPage === totalPages ? styles.disabledBtn : {}),
                }}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {isModalOpen && selectedItem && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>상세 이력 정보</h3>
              <button style={styles.closeBtn} onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <ModalRow label="일시" value={selectedItem.date} />
              <ModalRow
                label="구분"
                value={<TypeBadge type={selectedItem.type} />}
              />
              <div style={styles.divider} />
              <ModalRow
                label="품목명"
                value={selectedItem.item}
                bold
                color={
                  selectedItem.id === "ERROR"
                    ? COLORS.danger
                    : selectedItem.id === "INFO-EMPTY"
                      ? COLORS.info
                      : null
                }
              />
              <ModalRow label="LOT ID" value={selectedItem.lot} />
              <ModalRow
                label="수량"
                value={`${selectedItem.qty.toLocaleString()} 개`}
                color={getQtyColor(selectedItem.type)}
                bold
              />
              <div style={styles.divider} />
              <ModalRow label="업체/위치" value={selectedItem.location} />
              <ModalRow label="작업자" value={selectedItem.worker} />
              <div style={styles.noteBox}>
                <div style={styles.noteLabel}>재고 변동 내역</div>
                <div style={styles.noteText}>{selectedItem.note}</div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.confirmBtn} onClick={closeModal}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
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

const ModalRow = ({ label, value, bold, color }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "12px",
      fontSize: "14px",
    }}
  >
    <span style={{ color: "#888", minWidth: "80px" }}>{label}</span>
    <span
      style={{
        fontWeight: bold ? "bold" : "normal",
        color: color || "#333",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
);

const TypeBadge = ({ type }) => {
  let label = type,
    color = COLORS.gray;
  if (type === "IN") {
    label = "입고";
    color = COLORS.success;
  } else if (type === "OUT") {
    label = "출고";
    color = COLORS.danger;
  } else if (type === "ERROR") {
    label = "연결 오류";
    color = COLORS.danger;
  } else if (type === "INFO") {
    label = "상태 확인";
    color = COLORS.info;
  } // [NEW] 성공/빈값용

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
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
};

const getQtyColor = (type) =>
  type === "IN" ? COLORS.success : type === "OUT" ? COLORS.danger : COLORS.gray;

// --- 스타일 (기존 유지) ---
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
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
  },
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
    minWidth: "150px",
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
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
  },
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  filterGroup: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
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
    minWidth: "200px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    marginLeft: "8px",
    fontSize: "13px",
    width: "100%",
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  thRow: { borderBottom: "1px solid #eee", backgroundColor: "#FAFAFA" },
  th: {
    padding: "12px 10px",
    textAlign: "left",
    fontSize: "12px",
    color: "#666",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: {
    padding: "12px 10px",
    fontSize: "13px",
    color: "#333",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyTd: {
    padding: "40px",
    textAlign: "center",
    color: "#999",
    fontSize: "14px",
  },
  itemName: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#333",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  lotBadge: {
    backgroundColor: "#F3F1FF",
    color: COLORS.primary,
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    fontFamily: "monospace",
  },
  detailBtn: {
    border: `1px solid ${COLORS.border}`,
    backgroundColor: "white",
    padding: "4px 8px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "#555",
    margin: "0 auto",
  },
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
  disabledBtn: {
    color: "#ccc",
    cursor: "not-allowed",
    backgroundColor: "#f9f9f9",
  },
  mobileCard: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    padding: "15px",
    backgroundColor: "white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    cursor: "pointer",
  },
  dateText: { fontSize: "12px", color: "#888" },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "400px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    animation: "fadeIn 0.2s",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  closeBtn: {
    border: "none",
    background: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
  },
  modalBody: { marginBottom: "20px" },
  divider: { height: "1px", backgroundColor: "#eee", margin: "10px 0" },
  noteBox: {
    backgroundColor: "#F9FAFB",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
  },
  noteLabel: {
    fontSize: "11px",
    color: "#888",
    marginBottom: "4px",
    fontWeight: "bold",
  },
  noteText: { fontSize: "13px", color: "#333", lineHeight: "1.4" },
  modalFooter: { textAlign: "center" },
  confirmBtn: {
    width: "100%",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default MaterialHistory;
