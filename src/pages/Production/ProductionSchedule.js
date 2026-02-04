import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
  FaFileDownload,
  FaClipboardList,
  FaIndustry,
  FaClock,
  FaExclamationCircle,
  FaBox,
  FaList,
  FaThLarge,
  FaEllipsisV,
  FaUser,
} from "react-icons/fa";

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
};

const ProductionSchedule = () => {
  const [currentDate, setCurrentDate] = useState("2026년 2월 1주차");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");

  // 서버에서 받아올 데이터 상태
  const [schedules, setSchedules] = useState([]);

  // [API] 데이터 조회 함수
  const fetchSchedules = async () => {
    try {
      // 포트가 8111로 변경되었으므로 확인 필요
      const response = await fetch(
        "http://localhost:8111/api/production/plans",
      );
      if (response.ok) {
        const data = await response.json();
        // 최신순으로 정렬 (id 역순)
        const sortedData = data.sort((a, b) => b.id - a.id);
        setSchedules(sortedData);
      } else {
        console.error("데이터 로딩 실패");
      }
    } catch (error) {
      console.error("API 에러:", error);
    }
  };

  // 화면이 켜질 때(마운트) 데이터 조회 실행
  useEffect(() => {
    fetchSchedules();
  }, []);

  // 필터링 로직
  const filteredSchedules = schedules.filter(
    (item) =>
      (item.product &&
        item.product.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.line && item.line.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // KPI 계산
  const totalPlan = schedules.reduce(
    (acc, cur) => acc + parseInt(cur.planQty || 0),
    0,
  );
  const totalDone = schedules.reduce(
    (acc, cur) => acc + parseInt(cur.doneQty || 0),
    0,
  );
  const progressRate =
    totalPlan === 0 ? 0 : Math.round((totalDone / totalPlan) * 100);

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaCalendarAlt size={24} color={THEME.primary} />
          <h2 style={styles.title}>주간 생산 계획</h2>
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
          title="총 계획 수량"
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
              placeholder="검색..."
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
          <button style={styles.outlineBtn}>
            <FaFileDownload style={{ marginRight: "6px" }} /> 엑셀
          </button>
          {/* [+ 계획 등록] 버튼 제거됨 */}
        </div>
      </div>

      {/* 4. Main Content */}
      {viewMode === "list" ? (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadTr}>
                <th style={styles.th}>긴급</th>
                <th style={styles.th}>날짜</th>
                <th style={styles.th}>라인</th>
                <th style={styles.th}>품목명</th>
                <th style={styles.th}>자재</th>
                <th style={styles.th}>계획/실적</th>
                <th style={styles.th}>진척률</th>
                <th style={styles.th}>담당자</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((item) => (
                <ScheduleRow key={item.id} item={item} />
              ))}
              {filteredSchedules.length === 0 && (
                <tr>
                  <td colSpan="10" style={styles.emptyState}>
                    데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={styles.gridContainer}>
          {filteredSchedules.map((item) => (
            <ScheduleCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* 5. Modal 제거됨 */}
    </div>
  );
};

// --- Sub Components ---

const ScheduleRow = ({ item }) => {
  const percent =
    item.planQty > 0
      ? Math.min(Math.round((item.doneQty / item.planQty) * 100), 100)
      : 0;
  return (
    <tr style={styles.tbodyTr}>
      <td style={styles.td}>
        {item.isEmergency ? (
          <span style={styles.emergencyBadge}>URGENT</span>
        ) : (
          "-"
        )}
      </td>
      <td style={styles.td}>{item.date}</td>
      <td style={{ ...styles.td, fontWeight: "bold", color: THEME.primary }}>
        {item.line}
      </td>
      <td style={{ ...styles.td, fontWeight: "600" }}>{item.product}</td>
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
      <td style={styles.td}>
        <button style={styles.actionBtn}>
          <FaEllipsisV />
        </button>
      </td>
    </tr>
  );
};

const ScheduleCard = ({ item }) => {
  const percent =
    item.planQty > 0
      ? Math.min(Math.round((item.doneQty / item.planQty) * 100), 100)
      : 0;
  return (
    <div style={styles.card}>
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
        <button style={styles.actionBtn}>
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

const StatusBadge = ({ status }) => {
  let style = { backgroundColor: "#eee", color: "#888" };
  if (status === "진행중")
    style = { backgroundColor: `${THEME.primary}20`, color: THEME.primary };
  if (status === "완료")
    style = { backgroundColor: `${THEME.success}20`, color: THEME.success };
  if (status === "대기")
    style = { backgroundColor: `${THEME.warning}20`, color: THEME.warning };
  if (status === "예정")
    style = { backgroundColor: `${THEME.secondary}`, color: THEME.gray };
  return <span style={{ ...styles.badge, ...style }}>{status}</span>;
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
    fontFamily: "'Noto Sans KR', sans-serif",
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
    display: "flex",
    alignItems: "center",
    padding: "5px",
    fontSize: "14px",
  },
  kpiContainer: { display: "flex", gap: "20px", marginBottom: "30px" },
  kpiCard: {
    flex: 1,
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
  outlineBtn: {
    backgroundColor: THEME.white,
    color: THEME.text,
    border: `1px solid ${THEME.border}`,
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  tableContainer: {
    backgroundColor: THEME.white,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflowX: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "1000px" },
  theadTr: { borderBottom: `2px solid ${THEME.border}` },
  th: {
    padding: "15px",
    textAlign: "left",
    fontSize: "13px",
    color: THEME.gray,
    fontWeight: "bold",
  },
  tbodyTr: {
    borderBottom: `1px solid #f5f5f5`,
    transition: "background 0.2s",
    ":hover": { backgroundColor: "#fafafa" },
  },
  td: {
    padding: "15px",
    fontSize: "14px",
    color: THEME.text,
    verticalAlign: "middle",
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
    ":hover": { transform: "translateY(-5px)" },
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
};

export default ProductionSchedule;
