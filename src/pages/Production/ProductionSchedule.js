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
        const rawDate = item.deadline || item.endDate || item.planDate;
        const formattedDate = rawDate ? rawDate.split("T")[0] : "2026-02-15";
        const matName =
          item.material ||
          item.materialName ||
          (item.product ? `${item.product.split(" ")[0]} Kit` : "Main Kit");

        return {
          ...item,
          deadline: formattedDate,
          material: matName,
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
              <h3 style={styles.modalTitle}>
                <FaClipboardList
                  style={{ marginRight: "8px", fontSize: "16px" }}
                />
                생산 지시 상세
              </h3>
              <button style={styles.closeBtn} onClick={closeDetailModal}>
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              {/* 정보 그리드 (2열 유지하되 간격 좁힘) */}
              <div style={styles.infoGrid}>
                <InfoItem
                  label="지시번호"
                  value={selectedSchedule.id || "WO-001"}
                />
                <InfoItem
                  label="지시일자"
                  value={new Date().toISOString().split("T")[0]}
                />
                <InfoItem label="담당 라인" value={selectedSchedule.line} />
                <InfoItem label="담당자" value={selectedSchedule.manager} />
                <InfoItem
                  label="생산 품목"
                  value={selectedSchedule.product}
                  bold
                />
                <InfoItem
                  label="목표 수량"
                  value={`${selectedSchedule.planQty} EA`}
                  color={THEME.primary}
                  bold
                />
              </div>

              {/* 상태 표시 (중앙 정렬) */}
              <div style={styles.statusSection}>
                <span className="label">현재 상태</span>
                <StatusBadge status={selectedSchedule.status} />
              </div>

              {/* 지시사항 박스 */}
              <div style={styles.detailSection}>
                <label style={styles.detailLabel}>
                  <FaBullhorn style={{ marginRight: "5px" }} /> 작업 지시 사항
                </label>
                <div style={styles.detailBox}>
                  패널 조립 시 베젤 유격 0.5mm 이내 관리 요망.
                </div>
              </div>

              {/* 비고 박스 */}
              <div style={styles.detailSection}>
                <label style={styles.detailLabel}>
                  <FaEdit style={{ marginRight: "5px" }} /> 비고 / 특이사항
                </label>
                <div
                  style={{
                    ...styles.detailBox,
                    backgroundColor: "#FFF8E1",
                    color: "#5D4037",
                    border: "none",
                  }}
                >
                  자재 입고 지연으로 10:00 시작함.
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.confirmBtn} onClick={closeDetailModal}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 서브 컴포넌트 ---

const InfoItem = ({ label, value, bold, color }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
    <span style={{ fontSize: "11px", color: "#999" }}>{label}</span>
    <span
      style={{
        fontSize: "13px",
        fontWeight: bold ? "600" : "normal",
        color: color || "#333",
        letterSpacing: "-0.3px",
      }}
    >
      {value}
    </span>
  </div>
);

const ScheduleRow = ({ item, onOpen }) => {
  const progress =
    item.planQty > 0 ? Math.round((item.doneQty / item.planQty) * 100) : 0;

  return (
    <tr style={styles.tr} onClick={onOpen}>
      <td style={{ ...styles.td, color: THEME.gray }}>{item.deadline}</td>
      <td style={styles.td}>{item.line}</td>
      <td style={{ ...styles.td, fontWeight: "bold" }}>{item.product}</td>
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
        padding: "3px 8px",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "600",
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

  // Grid View Styles
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
    padding: "30px 25px",
    borderRadius: "12px",
    width: "380px",
    minHeight: "550px",
    boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: `1px solid ${THEME.border}`,
  },
  modalTitle: {
    fontSize: "17px",
    fontWeight: "bold",
    color: THEME.text,
    display: "flex",
    alignItems: "center",
    margin: 0,
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: THEME.gray,
    padding: 0,
  },
  modalBody: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "18px 10px",
    marginBottom: "25px",
  },
  statusSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    padding: "10px",
    backgroundColor: "#F9F9F9",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#666",
  },
  detailSection: {
    marginBottom: "15px",
  },
  detailLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
  },
  detailBox: {
    backgroundColor: "#F9F9F9",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "13px",
    border: `1px solid ${THEME.border}`,
    lineHeight: "1.5",
    minHeight: "60px",
  },
  modalFooter: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
  },
  confirmBtn: {
    backgroundColor: THEME.primary,
    color: "white",
    border: "none",
    padding: "10px 0",
    width: "100%",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
  },
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
