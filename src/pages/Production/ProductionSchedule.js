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
      setSchedules(data || []);
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
              {filteredSchedules.map((item) => (
                <ScheduleRow
                  key={item.id}
                  item={item}
                  onOpen={() => openDetailModal(item)}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.gridContainer}>
          {filteredSchedules.map((item) => (
            <ScheduleCard
              key={item.id}
              item={item}
              onOpen={() => openDetailModal(item)}
            />
          ))}
        </div>
      )}
      {selectedSchedule && (
        <div style={styles.modalOverlay}>
          <div style={styles.detailModal}>
            {/* ... */}
            <button style={styles.closeBtn} onClick={closeDetailModal}>
              <FaTimes />
            </button>
            {/* ... */}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 하위 컴포넌트 생략 (기존 코드 유지) ---
const ScheduleRow = ({ item, onOpen }) => {
  /*...*/ return (
    <tr>
      <td>...</td>
    </tr>
  );
};
const ScheduleCard = ({ item, onOpen }) => {
  /*...*/ return <div>...</div>;
};
const KpiCard = ({ title, value, icon, color }) => (
  /*...*/ <div style={styles.kpiCard}>...</div>
);

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
  title: { fontSize: "24px", fontWeight: "bold", color: THEME.text, margin: 0 },
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
};

export default ProductionSchedule;
