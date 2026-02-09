import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFileExcel,
  FaClipboardList,
  FaIndustry,
  FaClock,
  FaExclamationCircle,
  FaBox,
  FaList,
  FaThLarge,
  FaEllipsisV,
  FaUser,
  FaTimes,
  FaBullhorn,
  FaEdit,
  FaSyncAlt,
} from "react-icons/fa";

import { getProductionPlans } from "../../api/productionApi";

const THEME = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#888",
  border: "#E0E0E0",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  info: "#29B6F6",
};

const ProductionSchedule = () => {
  const [currentDate, setCurrentDate] = useState("2026년 2월 1주차");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules(true);
    const interval = setInterval(() => fetchSchedules(false), 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchSchedules = async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    try {
      const data = await getProductionPlans();

      const mappedData = (data || []).map((item) => {
        // 1. 마감일 처리 (값이 없으면 임의의 날짜 or 하이픈)
        const rawDate = item.deadline || item.endDate || item.planDate;
        const formattedDate = rawDate ? rawDate.split("T")[0] : "2026-02-15";

        // 2. 자재명 처리 (값이 없으면 "Main Assy Kit" 표시)
        const matName =
          item.material ||
          item.materialName ||
          (item.product ? `${item.product.split(" ")[0]} Kit` : "Main Kit");

        return {
          ...item,
          deadline: formattedDate,
          material: matName,
          // 3. 기타 필드 안전 처리
          line: item.line || item.lineName || "Line-1",
          product: item.product || item.productName || "Unknown Product",
          manager: item.manager || item.worker || "담당자 미정",
        };
      });

      setSchedules(mappedData);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      if (isInitialLoad) setIsLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(
    (item) =>
      (item.product &&
        item.product.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.line && item.line.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalPlan = schedules.reduce((acc, cur) => acc + (cur.planQty || 0), 0);
  const totalDone = schedules.reduce((acc, cur) => acc + (cur.doneQty || 0), 0);
  const progressRate =
    totalPlan === 0 ? 0 : Math.round((totalDone / totalPlan) * 100);

  const openDetailModal = (item) => setSelectedSchedule(item);
  const closeDetailModal = () => setSelectedSchedule(null);

  const handleDownloadExcel = () => {
    alert("엑셀 다운로드 시작");
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaCalendarAlt size={24} color={THEME.primary} />
          <h2 style={styles.title}>생산 지시서</h2>
        </div>
        <div style={styles.dateControl}>
          <button style={styles.iconBtn}>
            <FaChevronLeft />
          </button>
          <span style={styles.dateText}>{currentDate}</span>
          <button style={styles.iconBtn}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div style={styles.kpiContainer}>
        <KpiCard
          title="총 지시 수량"
          value={`${totalPlan.toLocaleString()} EA`}
          icon={<FaClipboardList />}
          color={THEME.primary}
        />
        <KpiCard
          title="현재 생산량"
          value={`${totalDone.toLocaleString()} EA`}
          icon={<FaIndustry />}
          color={THEME.success}
        />
        <KpiCard
          title="주간 달성률"
          value={`${progressRate}%`}
          icon={<FaClock />}
          color={THEME.warning}
        />
      </div>

      <div style={styles.toolbar}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={styles.searchBox}>
            <FaSearch color={THEME.gray} />
            <input
              placeholder="품목명, 라인명 검색..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={styles.toggleContainer}>
            <button
              style={
                viewMode === "list" ? styles.toggleBtnActive : styles.toggleBtn
              }
              onClick={() => setViewMode("list")}
            >
              <FaList />
            </button>
            <button
              style={
                viewMode === "grid" ? styles.toggleBtnActive : styles.toggleBtn
              }
              onClick={() => setViewMode("grid")}
            >
              <FaThLarge />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={styles.refreshBtn}
            onClick={() => fetchSchedules(true)}
            disabled={isLoading}
          >
            <FaSyncAlt className={isLoading ? "spin" : ""} />
            {isLoading ? " 갱신 중..." : " 새로고침"}
          </button>

          <button style={styles.excelButton} onClick={handleDownloadExcel}>
            <FaFileExcel style={{ marginRight: "6px" }} /> 엑셀 다운로드
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadTr}>
                <th style={{ ...styles.th, width: "12%" }}>마감일</th>
                <th style={{ ...styles.th, width: "10%" }}>라인</th>
                <th style={{ ...styles.th, width: "20%" }}>품목명</th>
                <th style={{ ...styles.th, width: "12%" }}>자재</th>
                <th style={{ ...styles.th, width: "15%" }}>계획/실적</th>
                <th style={{ ...styles.th, width: "15%" }}>진척률</th>
                <th style={{ ...styles.th, width: "8%" }}>담당자</th>
                <th style={{ ...styles.th, width: "8%" }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((item) => (
                  <ScheduleRow
                    key={item.id}
                    item={item}
                    onOpen={() => openDetailModal(item)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={styles.emptyState}>
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.gridContainer}>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((item) => (
              <ScheduleCard
                key={item.id}
                item={item}
                onOpen={() => openDetailModal(item)}
              />
            ))
          ) : (
            <div style={styles.emptyState}>데이터가 없습니다.</div>
          )}
        </div>
      )}

      {selectedSchedule && (
        <div style={styles.modalOverlay}>
          <div style={styles.detailModal}>
            <div style={styles.modalHeader}>
              <h3>상세 정보</h3>
              <button style={styles.closeBtn} onClick={closeDetailModal}>
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <p>
                <strong>품목:</strong> {selectedSchedule.product}
              </p>
              <p>
                <strong>라인:</strong> {selectedSchedule.line}
              </p>
              <p>
                <strong>자재:</strong> {selectedSchedule.material}
              </p>
              <p>
                <strong>마감일:</strong> {selectedSchedule.deadline}
              </p>
              <p>
                <strong>상태:</strong> {selectedSchedule.status}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 하위 컴포넌트 ---

const ScheduleRow = ({ item, onOpen }) => {
  const progress =
    item.planQty > 0 ? Math.round((item.doneQty / item.planQty) * 100) : 0;

  return (
    <tr style={styles.tr} onClick={onOpen}>
      {/* 마감일 데이터 표시 */}
      <td style={{ ...styles.td, color: THEME.gray }}>{item.deadline}</td>
      <td style={styles.td}>{item.line}</td>
      <td style={{ ...styles.td, fontWeight: "bold" }}>{item.product}</td>
      {/* 자재 데이터 표시 */}
      <td style={styles.td}>
        <div style={styles.materialTag}>
          <FaBox size={10} style={{ marginRight: 4 }} />
          {item.material}
        </div>
      </td>
      <td style={styles.td}>
        <span style={{ color: THEME.gray }}>{item.planQty}</span> /{" "}
        <span style={{ color: THEME.primary, fontWeight: "bold" }}>
          {item.doneQty}
        </span>
      </td>
      <td style={styles.td}>
        <div style={styles.progressBarBg}>
          <div
            style={{
              ...styles.progressBarFill,
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: progress >= 100 ? THEME.success : THEME.primary,
            }}
          />
        </div>
        <span style={{ fontSize: "11px", color: THEME.gray }}>{progress}%</span>
      </td>
      <td style={styles.td}>{item.manager}</td>
      <td style={styles.td}>
        <StatusBadge status={item.status} />
      </td>
    </tr>
  );
};

const ScheduleCard = ({ item, onOpen }) => {
  const progress =
    item.planQty > 0 ? Math.round((item.doneQty / item.planQty) * 100) : 0;

  return (
    <div style={styles.card} onClick={onOpen}>
      <div style={styles.cardHeader}>
        <span style={styles.cardLine}>{item.line}</span>
        <StatusBadge status={item.status} />
      </div>
      <h3 style={styles.cardTitle}>{item.product}</h3>
      <div style={styles.cardInfo}>
        <span>자재: {item.material}</span>
      </div>
      <div style={styles.cardInfo}>
        <span>계획: {item.planQty}</span>
        <span>실적: {item.doneQty}</span>
      </div>
      <div style={styles.progressBarBg}>
        <div
          style={{
            ...styles.progressBarFill,
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: progress >= 100 ? THEME.success : THEME.primary,
          }}
        />
      </div>
      <div style={styles.cardFooter}>
        <span style={{ fontSize: "12px", color: THEME.gray }}>
          마감: {item.deadline}
        </span>
        <span style={{ fontSize: "12px", fontWeight: "bold" }}>
          {item.manager}
        </span>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon, color }) => (
  <div style={styles.kpiCard}>
    <div
      style={{
        ...styles.iconBox,
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={styles.kpiTitle}>{title}</div>
      <div style={{ ...styles.kpiValue, color: color }}>{value}</div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  let color = THEME.gray;
  let text = status;

  if (status === "진행중" || status === "IN_PROGRESS") {
    color = THEME.primary;
    text = "진행중";
  } else if (status === "완료" || status === "COMPLETED") {
    color = THEME.success;
    text = "완료";
  } else if (status === "대기" || status === "WAIT") {
    color = THEME.warning;
    text = "대기";
  } else if (status === "지연") {
    color = THEME.danger;
    text = "지연";
  }

  return (
    <span
      style={{
        backgroundColor: `${color}20`,
        color: color,
        padding: "4px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "bold",
      }}
    >
      {text}
    </span>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: THEME.bg,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: THEME.text,
    margin: 0,
  },
  dateControl: {
    display: "flex",
    alignItems: "center",
    backgroundColor: THEME.white,
    padding: "8px 15px",
    borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  dateText: {
    margin: "0 20px",
    fontWeight: "bold",
    fontSize: "16px",
    color: THEME.text,
  },
  iconBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: THEME.gray,
  },
  kpiContainer: { display: "flex", gap: "20px", marginBottom: "30px" },
  kpiCard: {
    flex: "1 1 200px",
    backgroundColor: THEME.white,
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
  },
  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  kpiTitle: { fontSize: "12px", color: THEME.gray, marginBottom: "4px" },
  kpiValue: { fontSize: "20px", fontWeight: "bold" },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: THEME.white,
    padding: "10px 15px",
    borderRadius: "12px",
    width: "250px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
  },
  toggleContainer: {
    display: "flex",
    backgroundColor: THEME.white,
    borderRadius: "10px",
    padding: "4px",
    gap: "2px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  },
  toggleBtn: {
    border: "none",
    background: "transparent",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    color: THEME.gray,
  },
  toggleBtnActive: {
    border: "none",
    background: THEME.secondary,
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    color: THEME.primary,
    fontWeight: "bold",
  },
  tableContainer: {
    backgroundColor: THEME.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  theadTr: { borderBottom: `2px solid ${THEME.border}` },
  th: {
    padding: "15px",
    textAlign: "left",
    fontSize: "13px",
    color: THEME.gray,
    fontWeight: "bold",
  },
  tr: {
    borderBottom: `1px solid ${THEME.bg}`,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  td: { padding: "15px", fontSize: "14px", color: THEME.text },
  progressBarBg: {
    width: "100%",
    height: "6px",
    backgroundColor: THEME.bg,
    borderRadius: "3px",
    marginBottom: "4px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.5s",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: THEME.gray,
    fontSize: "14px",
  },

  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  cardLine: {
    fontSize: "12px",
    fontWeight: "bold",
    color: THEME.gray,
    backgroundColor: THEME.bg,
    padding: "4px 8px",
    borderRadius: "6px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
    color: THEME.text,
  },
  cardInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: THEME.gray,
    marginBottom: "10px",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "15px",
    paddingTop: "10px",
    borderTop: `1px solid ${THEME.bg}`,
  },
  refreshBtn: {
    height: "40px",
    padding: "0 20px",
    borderRadius: "12px",
    backgroundColor: "#fff",
    color: THEME.primary,
    border: `1px solid ${THEME.primary}`,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    transition: "background 0.2s",
  },
  excelButton: {
    height: "40px",
    padding: "0 20px",
    borderRadius: "12px",
    backgroundColor: "#217346",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: "14px",
    gap: "6px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  detailModal: {
    backgroundColor: THEME.white,
    padding: "30px",
    borderRadius: "16px",
    width: "400px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: `1px solid ${THEME.border}`,
    paddingBottom: "10px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: THEME.gray,
  },
  modalBody: { fontSize: "14px", lineHeight: "1.6", color: THEME.text },
  materialTag: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: THEME.secondary,
    color: THEME.primary,
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },
};

export default ProductionSchedule;
