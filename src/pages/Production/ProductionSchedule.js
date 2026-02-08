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

// [API] 함수 임포트
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
    const interval = setInterval(() => {
      fetchSchedules(false);
    }, 3000);
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

  const openDetailModal = (item) => {
    setSelectedSchedule(item);
  };

  const closeDetailModal = () => {
    setSelectedSchedule(null);
  };

  const handleDownloadExcel = () => {
    const headers = [
      "지시일자,라인,품목명,계획수량,생산수량,진척률,담당자,상태",
    ];
    const rows = filteredSchedules.map((item) => {
      const rate =
        item.planQty > 0 ? Math.round((item.doneQty / item.planQty) * 100) : 0;
      const lineName = item.line || "-";
      const prodName = item.product || "-";
      const mgrName = item.manager || "-";
      return `${item.date},${lineName},${prodName},${item.planQty},${item.doneQty},${rate}%,${mgrName},${item.status}`;
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `생산지시서_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {/* 1. Header */}
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

      {/* 2. KPI Cards */}
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

      {/* 3. Toolbar */}
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
              title="리스트 보기"
            >
              <FaList />
            </button>
            <button
              style={
                viewMode === "grid" ? styles.toggleBtnActive : styles.toggleBtn
              }
              onClick={() => setViewMode("grid")}
              title="카드 보기"
            >
              <FaThLarge />
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            style={styles.refreshBtn}
            onClick={() => fetchSchedules(true)}
          >
            <FaSyncAlt /> 새로고침
          </button>
          <button style={styles.excelButton} onClick={handleDownloadExcel}>
            <FaFileExcel style={{ marginRight: "6px" }} /> 엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 4. Main Content */}
      {viewMode === "list" ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadTr}>
                {/* [수정] 긴급/관리 컬럼 삭제하고 핵심 컬럼만 유지 */}
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
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan="8" style={styles.emptyState}>
                    {isLoading ? "로딩 중..." : "데이터가 없습니다."}
                  </td>
                </tr>
              )}
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
            <div style={styles.modalHeader}>
              <h3
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FaClipboardList color={THEME.primary} /> 생산 지시 상세 정보
              </h3>
              <button style={styles.closeBtn} onClick={closeDetailModal}>
                <FaTimes />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoGrid}>
                <InfoItem
                  label="지시번호"
                  value={`WO-${selectedSchedule.id}`}
                />
                <InfoItem label="지시일자" value={selectedSchedule.date} />
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

              <div style={{ margin: "20px 0" }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: THEME.gray,
                    marginRight: "10px",
                  }}
                >
                  현재 상태
                </span>
                <StatusBadge status={selectedSchedule.status} size="medium" />
              </div>

              <div style={styles.divider}></div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  <FaBullhorn /> 작업 지시 사항
                </h4>
                <div style={styles.textBox}>
                  패널 조립 시 베젤 유격 0.5mm 이내 관리 요망.
                </div>
              </div>

              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  <FaEdit /> 비고 / 특이사항
                </h4>
                <div
                  style={{
                    ...styles.textBox,
                    backgroundColor: "#FFF8E1",
                    borderColor: "#FFECB3",
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

// --- Sub Components ---

const ScheduleRow = ({ item, onOpen }) => {
  const percent =
    item.planQty > 0
      ? Math.min(Math.round((item.doneQty / item.planQty) * 100), 100)
      : 0;
  return (
    <tr style={styles.tbodyTr} onClick={onOpen}>
      {/* 1. 긴급 컬럼 삭제됨 */}
      <td style={styles.td}>{item.date}</td>
      <td style={{ ...styles.td, fontWeight: "bold", color: THEME.primary }}>
        {item.line}
      </td>
      <td style={{ ...styles.td, fontWeight: "600" }}>
        {/* [수정] 긴급일 경우 품목명 옆에 빨간 점 표시 (공간 절약) */}
        {item.product}
        {item.isEmergency && (
          <span style={styles.urgentDot} title="긴급 지시"></span>
        )}
      </td>
      <td style={styles.td}>
        <MaterialBadge status={item.materialStatus} />
      </td>
      <td style={styles.td}>
        {item.planQty} /{" "}
        <span style={{ color: THEME.gray }}>{item.doneQty}</span>
      </td>
      <td style={styles.td}>
        <div style={styles.progressBarBg}>
          <div style={{ ...styles.progressBar, width: `${percent}%` }}></div>
        </div>
      </td>
      <td style={styles.td}>{item.manager}</td>
      <td style={styles.td}>
        <StatusBadge status={item.status} />
      </td>
      {/* 2. 관리 버튼 컬럼 삭제됨 */}
    </tr>
  );
};

const ScheduleCard = ({ item, onOpen }) => {
  const percent =
    item.planQty > 0
      ? Math.min(Math.round((item.doneQty / item.planQty) * 100), 100)
      : 0;
  return (
    <div style={styles.card} onClick={onOpen}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "15px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {item.isEmergency && (
            <span style={styles.emergencyBadge}>URGENT</span>
          )}
          <StatusBadge status={item.status} />
        </div>
        <button
          style={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        >
          <FaEllipsisV />
        </button>
      </div>
      <h3 style={{ margin: "0 0 5px 0", fontSize: "16px", color: THEME.text }}>
        {item.product}
      </h3>
      <p style={{ margin: "0 0 15px 0", fontSize: "13px", color: THEME.gray }}>
        {item.date} |{" "}
        <span style={{ color: THEME.primary, fontWeight: "bold" }}>
          {item.line}
        </span>
      </p>
      <div style={{ marginBottom: "15px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            marginBottom: "5px",
          }}
        >
          <span>진척률</span>
          <span style={{ fontWeight: "bold", color: THEME.primary }}>
            {percent}%
          </span>
        </div>
        <div style={{ ...styles.progressBarBg, width: "100%" }}>
          <div style={{ ...styles.progressBar, width: `${percent}%` }}></div>
        </div>
        <div
          style={{
            textAlign: "right",
            fontSize: "12px",
            color: THEME.gray,
            marginTop: "5px",
          }}
        >
          {item.doneQty} / {item.planQty} EA
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${THEME.border}`,
          paddingTop: "15px",
        }}
      >
        <MaterialBadge status={item.materialStatus} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "13px",
            color: THEME.text,
          }}
        >
          <FaUser color={THEME.gray} size={12} /> {item.manager}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, color, bold }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <span style={{ fontSize: "12px", color: "#888" }}>{label}</span>
    <span
      style={{
        fontSize: "15px",
        color: color || "#333",
        fontWeight: bold ? "bold" : "normal",
      }}
    >
      {value || "-"}
    </span>
  </div>
);

const KpiCard = ({ title, value, icon, color }) => (
  <div style={styles.kpiCard}>
    <div
      style={{ ...styles.kpiIcon, backgroundColor: `${color}15`, color: color }}
    >
      {icon}
    </div>
    <div>
      <p style={styles.kpiTitle}>{title}</p>
      <h3 style={styles.kpiValue}>{value}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status, size }) => {
  let style = { backgroundColor: "#eee", color: "#888" };
  const s = status || "예정";
  if (s === "진행중" || s === "IN_PROGRESS")
    style = { backgroundColor: `${THEME.primary}20`, color: THEME.primary };
  else if (s === "완료" || s === "COMPLETED")
    style = { backgroundColor: `${THEME.success}20`, color: THEME.success };
  else if (s === "대기" || s === "WAIT")
    style = { backgroundColor: `${THEME.warning}20`, color: THEME.warning };

  const sizeStyle =
    size === "medium"
      ? { padding: "6px 12px", fontSize: "13px" }
      : { padding: "5px 10px", fontSize: "11px" };

  return <span style={{ ...styles.badge, ...style, ...sizeStyle }}>{s}</span>;
};

const MaterialBadge = ({ status }) => {
  let color = "#888";
  let icon = <FaBox />;
  if (status === "Ready") color = THEME.success;
  else if (status === "Shortage") {
    color = THEME.danger;
    icon = <FaExclamationCircle />;
  } else if (status === "Checking") color = THEME.warning;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        color,
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {icon} {status}
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: THEME.bg,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "10px",
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
    display: "flex",
    alignItems: "center",
    padding: "5px",
    fontSize: "14px",
  },
  kpiContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
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
  kpiIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  kpiTitle: { margin: 0, fontSize: "13px", color: THEME.gray },
  kpiValue: {
    margin: "5px 0 0",
    fontSize: "22px",
    fontWeight: "bold",
    color: THEME.text,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
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
    fontSize: "14px",
  },
  toggleContainer: {
    display: "flex",
    backgroundColor: THEME.white,
    borderRadius: "10px",
    padding: "4px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
    gap: "2px",
  },
  toggleBtn: {
    border: "none",
    background: "transparent",
    padding: "8px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    color: THEME.gray,
    transition: "all 0.2s",
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
  refreshBtn: {
    backgroundColor: THEME.primary,
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "bold",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    transition: "background 0.2s",
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
  tableContainer: {
    backgroundColor: THEME.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflowX: "auto",
    flex: 1,
  },
  // [수정] minWidth 제거 -> 100%로 유연하게 맞춤
  table: { width: "100%", borderCollapse: "collapse" },
  theadTr: { borderBottom: `2px solid ${THEME.border}` },
  th: {
    padding: "15px",
    textAlign: "left",
    fontSize: "13px",
    color: THEME.gray,
    fontWeight: "bold",
    whiteSpace: "nowrap", // 글자 줄바꿈 방지
  },
  tbodyTr: {
    borderBottom: `1px solid #f5f5f5`,
    transition: "background 0.2s",
    cursor: "pointer",
  },
  td: {
    padding: "15px",
    fontSize: "14px",
    color: THEME.text,
    verticalAlign: "middle",
    whiteSpace: "nowrap", // 글자 줄바꿈 방지
  },
  // [추가] 긴급 표시용 작은 빨간 점
  urgentDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: THEME.danger,
    marginLeft: "8px",
    verticalAlign: "middle",
    boxShadow: "0 0 4px rgba(255, 68, 68, 0.4)",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: THEME.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    transition: "transform 0.2s",
    cursor: "pointer",
  },
  badge: {
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
    display: "inline-block",
  },
  emergencyBadge: {
    backgroundColor: "#FFEBEE",
    color: THEME.danger,
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
  },
  progressBarBg: {
    width: "100px",
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: THEME.primary,
    borderRadius: "3px",
  },
  actionBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#999",
    padding: "5px",
  },
  emptyState: { padding: "40px", textAlign: "center", color: THEME.gray },

  // 상세 모달 스타일
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
    width: "500px",
    padding: "30px",
    backgroundColor: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
    maxWidth: "90%",
    maxHeight: "90vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    marginBottom: "25px",
    borderBottom: `1px solid ${THEME.border}`,
    paddingBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    color: THEME.gray,
  },
  modalBody: { flex: 1, display: "flex", flexDirection: "column", gap: "10px" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  divider: { height: "1px", backgroundColor: "#eee", margin: "10px 0" },
  section: { marginTop: "15px" },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: THEME.text,
  },
  textBox: {
    padding: "12px",
    backgroundColor: "#F8F9FA",
    borderRadius: "8px",
    border: "1px solid #E0E0E0",
    fontSize: "13px",
    color: "#555",
    lineHeight: "1.5",
  },
  modalFooter: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "flex-end",
  },
  confirmBtn: {
    padding: "10px 25px",
    backgroundColor: THEME.primary,
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default ProductionSchedule;
