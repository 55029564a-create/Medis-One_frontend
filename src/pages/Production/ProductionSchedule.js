import React, { useState } from "react";
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
  FaTimes,
  FaCheck,
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
  const [currentDate, setCurrentDate] = useState("2026년 1월 3주차");
  const [searchTerm, setSearchTerm] = useState("");

  // 뷰 모드 상태 (기본값: 'list' -> 리스트가 먼저 보임)
  const [viewMode, setViewMode] = useState("list");

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 입력 폼 상태
  const [newPlan, setNewPlan] = useState({
    date: "",
    line: "Line-A",
    product: "",
    planQty: 0,
    manager: "",
    isEmergency: false,
  });

  // Mock Data
  const [schedules, setSchedules] = useState([
    {
      id: 1,
      date: "2026-01-14",
      line: "Line-A",
      product: "Zoll X Series (Main Unit)",
      planQty: 50,
      doneQty: 35,
      manager: "김철수",
      status: "진행중",
      isEmergency: true,
      materialStatus: "Ready",
    },
    {
      id: 2,
      date: "2026-01-14",
      line: "Line-B",
      product: "Propaq M (Casing)",
      planQty: 200,
      doneQty: 0,
      manager: "이영희",
      status: "대기",
      isEmergency: false,
      materialStatus: "Shortage",
    },
    {
      id: 3,
      date: "2026-01-15",
      line: "Line-A",
      product: "32인치 4K 모니터",
      planQty: 100,
      doneQty: 0,
      manager: "박지성",
      status: "예정",
      isEmergency: false,
      materialStatus: "Ready",
    },
    {
      id: 4,
      date: "2026-01-15",
      line: "Line-C",
      product: "전원 어댑터 (12V)",
      planQty: 2000,
      doneQty: 2000,
      manager: "최유리",
      status: "완료",
      isEmergency: false,
      materialStatus: "Used",
    },
    {
      id: 5,
      date: "2026-01-16",
      line: "Line-B",
      product: "Corpuls3 (Sensor Module)",
      planQty: 150,
      doneQty: 0,
      manager: "정민수",
      status: "예정",
      isEmergency: true,
      materialStatus: "Checking",
    },
  ]);

  // 필터링
  const filteredSchedules = schedules.filter(
    (item) =>
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.line.toLowerCase().includes(searchTerm.toLowerCase()),
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

  // --- 핸들러 ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPlan({
      ...newPlan,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = () => {
    if (!newPlan.date || !newPlan.product || !newPlan.planQty) {
      alert("필수 항목(날짜, 품목명, 수량)을 입력해주세요.");
      return;
    }
    const newItem = {
      id: Date.now(),
      ...newPlan,
      doneQty: 0,
      status: "예정",
      materialStatus: "Checking",
    };
    setSchedules([newItem, ...schedules]);
    setIsModalOpen(false);
    setNewPlan({
      date: "",
      line: "Line-A",
      product: "",
      planQty: 0,
      manager: "",
      isEmergency: false,
    });
    alert("등록되었습니다.");
  };

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

      {/* 3. Toolbar (뷰 전환 버튼 포함) */}
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
          {/* 뷰 모드 전환 버튼 */}
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
          <button
            style={styles.primaryBtn}
            onClick={() => setIsModalOpen(true)}
          >
            + 계획 등록
          </button>
        </div>
      </div>

      {/* 4. Main Content (조건부 렌더링: 리스트 또는 그리드) */}
      {viewMode === "list" ? (
        // [A] 리스트 뷰 (기존 테이블 형태)
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
            </tbody>
          </table>
        </div>
      ) : (
        // [B] 그리드 뷰 (카드 형태)
        <div style={styles.gridContainer}>
          {filteredSchedules.map((item) => (
            <ScheduleCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* 5. Modal (등록 팝업) */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>📝 신규 생산 계획 등록</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.closeBtn}
              >
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>생산 일자</label>
                <input
                  type="date"
                  name="date"
                  value={newPlan.date}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>라인</label>
                  <select
                    name="line"
                    value={newPlan.line}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    <option value="Line-A">Line-A (조립)</option>
                    <option value="Line-B">Line-B (가공)</option>
                    <option value="Line-C">Line-C (검사)</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>긴급 여부</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      height: "45px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="isEmergency"
                      checked={newPlan.isEmergency}
                      onChange={handleInputChange}
                      style={{ width: "20px", height: "20px" }}
                    />
                    <span
                      style={{
                        marginLeft: "8px",
                        color: newPlan.isEmergency ? THEME.danger : "#666",
                      }}
                    >
                      긴급
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>품목명</label>
                <input
                  type="text"
                  name="product"
                  value={newPlan.product}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="품목명 입력"
                />
              </div>
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>수량</label>
                  <input
                    type="number"
                    name="planQty"
                    value={newPlan.planQty}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>담당자</label>
                  <input
                    type="text"
                    name="manager"
                    value={newPlan.manager}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.cancelBtn}
              >
                취소
              </button>
              <button onClick={handleSave} style={styles.saveBtn}>
                <FaCheck style={{ marginRight: "5px" }} /> 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// [A] 리스트 뷰
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

// [B] 그리드 뷰
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

// --- Styles ---
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

  // Toggle Buttons
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

  primaryBtn: {
    backgroundColor: THEME.primary,
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.3)",
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

  // List View
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

  // Grid View
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

  // Badges & Bars
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

  // Modal
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
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    width: "500px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: `1px solid ${THEME.border}`,
    paddingBottom: "15px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "#999",
  },
  modalBody: { display: "flex", flexDirection: "column", gap: "15px" },
  formGroup: { display: "flex", flexDirection: "column", flex: 1 },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${THEME.border}`,
    fontSize: "14px",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${THEME.border}`,
    fontSize: "14px",
  },
  row: { display: "flex", gap: "15px" },
  modalFooter: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    paddingTop: "20px",
    borderTop: `1px solid ${THEME.border}`,
  },
  saveBtn: {
    backgroundColor: THEME.primary,
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#f0f0f0",
    color: "#333",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};

export default ProductionSchedule;
