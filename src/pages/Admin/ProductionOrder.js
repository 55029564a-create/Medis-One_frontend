import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaCalendarAlt,
  FaIndustry,
  FaClipboardList,
  FaSpinner,
  FaCheckDouble,
} from "react-icons/fa";

// 🎨 MedisOne 테마 컬러 (Blue & Clean)
const THEME = {
  primary: "#8C85FF",
  secondary: "#6AD2FF",
  bg: "#F4F7FE",
  white: "#FFFFFF",
  text: "#2B3674",
  subText: "#A3AED0",
  border: "#E0E5F2",
  success: "#05CD99",
  warning: "#FFB547",
  danger: "#EE5D50",
};

// 1. 기간별 데이터 정의 (데이터가 다름을 보여주기 위함)
const MOCK_DATA = {
  Week: [
    {
      id: "PO-WK-001",
      process: "Line-A (조립)",
      product: "Zoll X Series (Main Unit)",
      target: 200,
      current: 145,
      deadline: "2026-01-20",
      worker: "김철수",
      status: "Running",
    },
    {
      id: "PO-WK-002",
      process: "Line-B (가공)",
      product: "Propaq M (Casing)",
      target: 500,
      current: 500,
      deadline: "2026-01-18",
      worker: "이영희",
      status: "Done",
    },
    {
      id: "PO-WK-003",
      process: "Line-C (포장)",
      product: "Power Adapter Set",
      target: 1000,
      current: 0,
      deadline: "2026-01-22",
      worker: "박지성",
      status: "Waiting",
    },
  ],
  Month: [
    {
      id: "PO-MO-101",
      process: "Line-A (조립)",
      product: "Corpuls3 (Monitor Module)",
      target: 1500,
      current: 450,
      deadline: "2026-02-10",
      worker: "정민수",
      status: "Running",
    },
    {
      id: "PO-MO-102",
      process: "Line-D (검사)",
      product: "LCD Panel 15 inch",
      target: 3000,
      current: 1200,
      deadline: "2026-02-15",
      worker: "한소희",
      status: "Running",
    },
    {
      id: "PO-MO-103",
      process: "Line-B (가공)",
      product: "Ventilator Valve",
      target: 5000,
      current: 5000,
      deadline: "2026-01-10",
      worker: "김철수",
      status: "Done",
    },
    {
      id: "PO-MO-104",
      process: "Line-C (포장)",
      product: "User Manual Pack",
      target: 2000,
      current: 0,
      deadline: "2026-02-28",
      worker: "최유리",
      status: "Waiting",
    },
  ],
  Quarter: [
    {
      id: "PO-QT-901",
      process: "Line-A (조립)",
      product: "Zoll X Series (Full Set)",
      target: 5000,
      current: 120,
      deadline: "2026-03-31",
      worker: "박준형",
      status: "Running",
    },
    {
      id: "PO-QT-902",
      process: "Ext-1 (외주)",
      product: "Lithium Battery Pack",
      target: 10000,
      current: 0,
      deadline: "2026-04-15",
      worker: "구매팀",
      status: "Waiting",
    },
  ],
};

const ProductionOrder = () => {
  // --- 상태 관리 ---
  const [viewPeriod, setViewPeriod] = useState("Week"); // Week | Month | Quarter
  const [orders, setOrders] = useState(MOCK_DATA["Week"]);
  const [searchTerm, setSearchTerm] = useState("");

  // 모달 관련
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // 🔄 탭 변경 시 데이터 교체 (useEffect)
  useEffect(() => {
    setOrders(MOCK_DATA[viewPeriod]);
  }, [viewPeriod]);

  // 📊 통계 계산 (KPI용)
  const totalCount = orders.length;
  const runningCount = orders.filter((o) => o.status === "Running").length;
  const doneCount = orders.filter((o) => o.status === "Done").length;
  const waitingCount = orders.filter((o) => o.status === "Waiting").length;

  // 🔍 필터링
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.process.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.worker.includes(searchTerm);
    return matchSearch;
  });

  // --- 핸들러 ---
  const handleAddNew = () => {
    const newId = `PO-NEW-${Math.floor(Math.random() * 1000)}`;
    setCurrentOrder({
      id: newId,
      process: "Line-A (조립)",
      product: "",
      target: 0,
      current: 0,
      deadline: "",
      worker: "",
      status: "Waiting",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (order) => {
    setCurrentOrder({ ...order });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentOrder.product || !currentOrder.target)
      return alert("필수 정보를 입력하세요.");

    let newOrders;
    if (isEditMode) {
      newOrders = orders.map((od) =>
        od.id === currentOrder.id ? currentOrder : od,
      );
    } else {
      newOrders = [currentOrder, ...orders];
    }
    setOrders(newOrders);
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setOrders(orders.filter((od) => od.id !== currentOrder.id));
      setIsModalOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder({ ...currentOrder, [name]: value });
  };

  return (
    <div style={styles.container}>
      {/* 1. Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>생산 지시 관리</h2>
          <p style={styles.subtitle}>기간별 생산 계획 수립 및 진척도 관리</p>
        </div>
        <button style={styles.addButton} onClick={handleAddNew}>
          <FaPlus /> 지시 등록
        </button>
      </div>

      {/* 2. KPI Cards (요약 정보) */}
      <div style={styles.kpiContainer}>
        <KpiCard
          title="총 지시 건수"
          value={`${totalCount}건`}
          icon={<FaClipboardList />}
          color={THEME.primary}
        />
        <KpiCard
          title="가동중 (Running)"
          value={`${runningCount}건`}
          icon={<FaSpinner />}
          color={THEME.secondary}
        />
        <KpiCard
          title="완료 (Done)"
          value={`${doneCount}건`}
          icon={<FaCheckDouble />}
          color={THEME.success}
        />
      </div>

      {/* 3. Toolbar (Tabs & Search) */}
      <div style={styles.toolbar}>
        <div style={styles.tabContainer}>
          {["Week", "Month", "Quarter"].map((tab) => (
            <button
              key={tab}
              style={viewPeriod === tab ? styles.tabActive : styles.tab}
              onClick={() => setViewPeriod(tab)}
            >
              {tab === "Week"
                ? "주간 일정"
                : tab === "Month"
                  ? "월간 일정"
                  : "분기 계획"}
            </button>
          ))}
        </div>
        <div style={styles.searchBox}>
          <FaSearch color={THEME.subText} />
          <input
            placeholder="품목, 공정, 담당자 검색"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Data List (Grid Layout) */}
      <div style={styles.listHeader}>
        <div style={{ width: "10%" }}>지시번호</div>
        <div style={{ width: "15%" }}>공정</div>
        <div style={{ width: "25%" }}>품목명</div>
        <div style={{ width: "20%" }}>진척률 (실적/목표)</div>
        <div style={{ width: "15%" }}>마감일</div>
        <div style={{ width: "10%", textAlign: "center" }}>상태</div>
        <div style={{ width: "5%" }}></div>
      </div>

      <div style={styles.listBody}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const percent = Math.min(
              Math.round((order.current / order.target) * 100),
              100,
            );
            return (
              <div
                key={order.id}
                style={styles.cardRow}
                onClick={() => handleEdit(order)}
              >
                <div style={{ width: "10%", fontSize: "12px", color: "#888" }}>
                  {order.id}
                </div>
                <div
                  style={{
                    width: "15%",
                    fontWeight: "bold",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <FaIndustry color={THEME.subText} size={12} /> {order.process}
                </div>
                <div
                  style={{ width: "25%", fontWeight: "600", color: THEME.text }}
                >
                  {order.product}
                </div>

                {/* Progress Bar */}
                <div style={{ width: "20%", paddingRight: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ color: THEME.primary, fontWeight: "bold" }}>
                      {percent}%
                    </span>
                    <span style={{ color: "#aaa" }}>
                      {order.current} / {order.target}
                    </span>
                  </div>
                  <div style={styles.progressBg}>
                    <div
                      style={{ ...styles.progressBar, width: `${percent}%` }}
                    ></div>
                  </div>
                </div>

                <div
                  style={{
                    width: "15%",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                    color: "#666",
                  }}
                >
                  <FaCalendarAlt size={12} color="#ccc" /> {order.deadline}
                </div>
                <div style={{ width: "10%", textAlign: "center" }}>
                  <StatusBadge status={order.status} />
                </div>
                <div style={{ width: "5%", textAlign: "right" }}>
                  <button style={styles.iconBtn}>
                    <FaEdit />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>데이터가 없습니다.</div>
        )}
      </div>

      {/* 5. Modal */}
      {isModalOpen && currentOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{isEditMode ? "생산 지시 수정" : "신규 생산 지시"}</h3>
              <span style={{ fontSize: "12px", color: "#999" }}>
                {currentOrder.id}
              </span>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.row}>
                <InputGroup
                  label="공정"
                  value={currentOrder.process}
                  name="process"
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="담당자"
                  value={currentOrder.worker}
                  name="worker"
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.row}>
                <InputGroup
                  label="품목명"
                  value={currentOrder.product}
                  name="product"
                  onChange={handleInputChange}
                  full
                />
              </div>
              <div style={styles.row}>
                <InputGroup
                  label="목표 수량"
                  value={currentOrder.target}
                  name="target"
                  type="number"
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="현재 실적"
                  value={currentOrder.current}
                  name="current"
                  type="number"
                  onChange={handleInputChange}
                />
              </div>
              <div style={styles.row}>
                <InputGroup
                  label="마감일"
                  value={currentOrder.deadline}
                  name="deadline"
                  type="date"
                  onChange={handleInputChange}
                />
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>상태</label>
                  <select
                    name="status"
                    value={currentOrder.status}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="Running">Running</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={styles.modalFooter}>
              {isEditMode ? (
                <button style={styles.btnDelete} onClick={handleDelete}>
                  <FaTrashAlt /> 삭제
                </button>
              ) : (
                <div />
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  style={styles.btnCancel}
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </button>
                <button style={styles.btnSave} onClick={handleSave}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Components ---
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
  const map = {
    Running: { color: THEME.secondary, bg: "#E3F2FD", text: "가동중" },
    Waiting: { color: THEME.warning, bg: "#FFF8E1", text: "대기" },
    Done: { color: THEME.success, bg: "#E8F5E9", text: "완료" },
  };
  const s = map[status] || map.Waiting;
  return (
    <span style={{ ...styles.badge, color: s.color, backgroundColor: s.bg }}>
      {s.text}
    </span>
  );
};

const InputGroup = ({ label, name, value, onChange, type = "text", full }) => (
  <div
    style={{
      flex: full ? "100%" : 1,
      display: "flex",
      flexDirection: "column",
    }}
  >
    <label style={styles.label}>{label}</label>
    <input
      style={styles.input}
      name={name}
      value={value}
      onChange={onChange}
      type={type}
    />
  </div>
);

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
    marginBottom: "30px",
  },
  title: { fontSize: "24px", fontWeight: "bold", color: THEME.text, margin: 0 },
  subtitle: { margin: "5px 0 0", color: THEME.subText, fontSize: "14px" },
  addButton: {
    backgroundColor: THEME.primary,
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 10px rgba(67, 24, 255, 0.3)",
  },

  // KPI
  kpiContainer: { display: "flex", gap: "20px", marginBottom: "30px" },
  kpiCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
  },
  kpiIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  kpiTitle: { margin: 0, fontSize: "13px", color: THEME.subText },
  kpiValue: {
    margin: "5px 0 0",
    fontSize: "20px",
    fontWeight: "bold",
    color: THEME.text,
  },

  // Toolbar
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  tabContainer: {
    display: "flex",
    backgroundColor: "#fff",
    padding: "5px",
    borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  tab: {
    padding: "8px 20px",
    border: "none",
    backgroundColor: "transparent",
    color: THEME.subText,
    cursor: "pointer",
    fontWeight: "600",
    borderRadius: "8px",
  },
  tabActive: {
    padding: "8px 20px",
    border: "none",
    backgroundColor: THEME.primary,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "10px 15px",
    borderRadius: "12px",
    width: "250px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
    fontSize: "14px",
  },

  // List
  listHeader: {
    display: "flex",
    padding: "0 25px",
    marginBottom: "10px",
    fontSize: "13px",
    fontWeight: "bold",
    color: THEME.subText,
  },
  listBody: { display: "flex", flexDirection: "column", gap: "10px" },
  cardRow: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "20px 25px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
    cursor: "pointer",
    transition: "all 0.2s",
    border: "1px solid transparent",
    ":hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
    },
  },
  progressBg: {
    width: "100%",
    height: "6px",
    backgroundColor: "#F4F7FE",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: THEME.primary,
    borderRadius: "3px",
    transition: "width 0.3s",
  },
  badge: {
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  iconBtn: {
    background: "none",
    border: "none",
    color: THEME.subText,
    cursor: "pointer",
  },
  emptyState: { textAlign: "center", padding: "50px", color: THEME.subText },

  // Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    width: "500px",
    padding: "30px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    borderBottom: `1px solid ${THEME.border}`,
    paddingBottom: "15px",
  },
  modalBody: { display: "flex", flexDirection: "column", gap: "15px" },
  row: { display: "flex", gap: "15px" },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: THEME.text,
    marginBottom: "6px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${THEME.border}`,
    width: "100%",
    boxSizing: "border-box",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "30px",
  },
  btnSave: {
    backgroundColor: THEME.primary,
    color: "#fff",
    border: "none",
    padding: "10px 25px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnCancel: {
    backgroundColor: "#F4F7FE",
    color: THEME.text,
    border: "none",
    padding: "10px 25px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  btnDelete: {
    backgroundColor: "#fff",
    color: THEME.danger,
    border: `1px solid ${THEME.danger}`,
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
};

export default ProductionOrder;
