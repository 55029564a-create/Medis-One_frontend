import React, { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaCalendarAlt,
  FaIndustry,
  FaChartLine,
} from "react-icons/fa";

// 🎨 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851", // 진행중/완료
  warning: "#FFBB33", // 대기
  danger: "#FF4444", // 중지/삭제
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

// 1. 초기 데이터 (Mock Data)
const initialOrders = [
  {
    id: "PO-202601-01",
    process: "Line-A (조립)",
    product: "27인치 LCD 패널",
    target: 1000,
    current: 850,
    deadline: "2026-01-20",
    worker: "김반장",
    status: "Running", // Running, Waiting, Done
    period: "Week", // 데이터 필터링용 태그
  },
  {
    id: "PO-202601-02",
    process: "Line-B (가공)",
    product: "메인보드 A타입",
    target: 2000,
    current: 2000,
    deadline: "2026-01-18",
    worker: "이조장",
    status: "Done",
    period: "Week",
  },
  {
    id: "PO-202601-03",
    process: "Line-C (포장)",
    product: "전원 케이블 세트",
    target: 5000,
    current: 1200,
    deadline: "2026-02-15",
    worker: "박물류",
    status: "Waiting",
    period: "Month",
  },
];

const ProductionOrder = () => {
  // --- 상태 관리 ---
  const [orders, setOrders] = useState(initialOrders);
  const [viewPeriod, setViewPeriod] = useState("Week"); // Week | Month | Quarter
  const [searchTerm, setSearchTerm] = useState("");

  // 모달 관련
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // --- 핸들러 ---

  // 1. 필터링 (기간 + 검색어)
  // 실제로는 기간 탭 변경 시 API를 다시 호출하거나 Date 비교 로직이 들어갑니다.
  // 여기서는 Mock 데이터의 'period' 필드나 전체 보기를 시뮬레이션합니다.
  const filteredOrders = orders.filter((order) => {
    // 검색어 필터
    const matchSearch =
      order.product.includes(searchTerm) ||
      order.process.includes(searchTerm) ||
      order.worker.includes(searchTerm);

    // 기간 필터 (여기서는 간단히 전체 데이터를 보여주되, 실제론 날짜 비교 필요)
    // const matchPeriod = viewPeriod === "Quarter" ? true : order.period === viewPeriod;

    return matchSearch;
  });

  // 2. 모달 열기 (신규)
  const handleAddNew = () => {
    const newId = `PO-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${orders.length + 1}`;
    setCurrentOrder({
      id: newId,
      process: "Line-A (조립)",
      product: "",
      target: "",
      current: 0,
      deadline: "",
      worker: "",
      status: "Waiting",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // 3. 모달 열기 (수정)
  const handleEdit = (order) => {
    setCurrentOrder({ ...order });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // 4. 저장 (추가/수정)
  const handleSave = () => {
    if (
      !currentOrder.product ||
      !currentOrder.target ||
      !currentOrder.deadline
    ) {
      return alert("필수 정보를 입력해주세요.");
    }

    if (isEditMode) {
      setOrders(
        orders.map((od) => (od.id === currentOrder.id ? currentOrder : od)),
      );
    } else {
      setOrders([currentOrder, ...orders]);
    }
    setIsModalOpen(false);
  };

  // 5. 삭제
  const handleDelete = () => {
    if (window.confirm("해당 생산 지시를 삭제하시겠습니까?")) {
      setOrders(orders.filter((od) => od.id !== currentOrder.id));
      setIsModalOpen(false);
    }
  };

  // 인풋 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder({ ...currentOrder, [name]: value });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>
            🏭 생산 지시 관리 (Production Order)
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            관리자 전용 생산 계획 수립 및 지시
          </p>
        </div>
        <button style={styles.addButton} onClick={handleAddNew}>
          <FaPlus style={{ marginRight: "5px" }} /> 생산 지시 추가
        </button>
      </div>

      {/* Filter & Period Tabs */}
      <div style={styles.toolbar}>
        {/* 기간 탭 */}
        <div style={styles.tabGroup}>
          {["Week", "Month", "Quarter"].map((tab) => (
            <button
              key={tab}
              style={viewPeriod === tab ? styles.tabActive : styles.tab}
              onClick={() => setViewPeriod(tab)}
            >
              {tab === "Week" ? "주간" : tab === "Month" ? "월간" : "분기"}
            </button>
          ))}
        </div>

        {/* 검색창 */}
        <div style={styles.searchBox}>
          <FaSearch color={COLORS.subText} />
          <input
            placeholder="품목명, 공정, 담당자 검색"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Container */}
      <div style={styles.listContainer}>
        {/* Header Row */}
        <div style={styles.listHeader}>
          <div style={{ width: "10%" }}>지시번호</div>
          <div style={{ width: "15%" }}>공정 (Line)</div>
          <div style={{ width: "20%" }}>생산 품목</div>
          <div style={{ width: "20%" }}>목표 / 생산량 (달성률)</div>
          <div style={{ width: "15%" }}>마감일 (Deadline)</div>
          <div style={{ width: "10%", textAlign: "center" }}>상태</div>
          <div style={{ width: "10%", textAlign: "right" }}>관리</div>
        </div>

        {/* Data Rows */}
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
                <div style={{ width: "10%", fontSize: "12px", color: "#666" }}>
                  {order.id}
                </div>

                <div
                  style={{
                    width: "15%",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FaIndustry color={COLORS.subText} size={12} />{" "}
                  {order.process}
                </div>

                <div
                  style={{
                    width: "20%",
                    fontWeight: "600",
                    color: COLORS.text,
                  }}
                >
                  {order.product}
                </div>

                {/* Progress Bar Section */}
                <div style={{ width: "20%", paddingRight: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ color: COLORS.primary, fontWeight: "bold" }}>
                      {percent}%
                    </span>
                    <span style={{ color: "#888" }}>
                      {order.current.toLocaleString()} /{" "}
                      {order.target.toLocaleString()}
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
                    fontSize: "13px",
                    color: COLORS.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <FaCalendarAlt color="#ccc" size={12} /> {order.deadline}
                </div>

                <div style={{ width: "10%", textAlign: "center" }}>
                  <span
                    style={
                      order.status === "Done"
                        ? styles.badgeDone
                        : order.status === "Running"
                          ? styles.badgeRunning
                          : styles.badgeWaiting
                    }
                  >
                    {order.status === "Done"
                      ? "완료"
                      : order.status === "Running"
                        ? "가동중"
                        : "대기"}
                  </span>
                </div>

                <div style={{ width: "10%", textAlign: "right" }}>
                  <button style={styles.iconButton}>
                    <FaEdit color="#999" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <FaChartLine size={40} color="#ddd" style={{ marginBottom: 10 }} />
            <p>조회된 생산 지시가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Modal (Add/Edit) */}
      {isModalOpen && currentOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{isEditMode ? "🛠️ 생산 지시 수정" : "📝 신규 생산 지시"}</h3>
              <div style={{ fontSize: "12px", color: "#888" }}>
                ID: {currentOrder.id}
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formRow}>
                <InputGroup label="공정 (Line)">
                  <select
                    name="process"
                    value={currentOrder.process}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option>Line-A (조립)</option>
                    <option>Line-B (가공)</option>
                    <option>Line-C (포장)</option>
                  </select>
                </InputGroup>
                <InputGroup label="담당자">
                  <input
                    name="worker"
                    value={currentOrder.worker}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="관리자명"
                  />
                </InputGroup>
              </div>

              <div style={styles.formRow}>
                <InputGroup label="생산 품목명">
                  <input
                    name="product"
                    value={currentOrder.product}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="예: 27인치 패널"
                  />
                </InputGroup>
              </div>

              <div style={styles.formRow}>
                <InputGroup label="목표 수량">
                  <input
                    type="number"
                    name="target"
                    value={currentOrder.target}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0"
                  />
                </InputGroup>
                <InputGroup label="현재 생산량 (수정시)">
                  <input
                    type="number"
                    name="current"
                    value={currentOrder.current}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </InputGroup>
              </div>

              <div style={styles.formRow}>
                <InputGroup label="마감 기한">
                  <input
                    type="date"
                    name="deadline"
                    value={currentOrder.deadline}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </InputGroup>
                <InputGroup label="상태">
                  <select
                    name="status"
                    value={currentOrder.status}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option value="Waiting">대기 (Waiting)</option>
                    <option value="Running">가동중 (Running)</option>
                    <option value="Done">완료 (Done)</option>
                  </select>
                </InputGroup>
              </div>
            </div>

            <div style={styles.modalFooter}>
              {isEditMode ? (
                <button style={styles.btnDelete} onClick={handleDelete}>
                  <FaTrashAlt style={{ marginRight: 5 }} /> 삭제
                </button>
              ) : (
                <div></div>
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

// --- Sub Component ---
const InputGroup = ({ label, children }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

// --- Styles ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: "20px",
    padding: "10px 20px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.4)",
  },
  // Toolbar (Tabs + Search)
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    alignItems: "center",
  },
  tabGroup: {
    display: "flex",
    backgroundColor: COLORS.white,
    padding: "5px",
    borderRadius: "12px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  tab: {
    padding: "8px 20px",
    border: "none",
    backgroundColor: "transparent",
    color: "#888",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "8px",
    fontSize: "13px",
  },
  tabActive: {
    padding: "8px 20px",
    border: "none",
    backgroundColor: COLORS.primary,
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    borderRadius: "8px",
    fontSize: "13px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: "8px 15px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    width: "250px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
    fontSize: "14px",
  },

  // List
  listContainer: { display: "flex", flexDirection: "column", gap: "15px" },
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
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    transition: "transform 0.2s",
    cursor: "pointer",
    border: "1px solid transparent",
    ":hover": {
      transform: "translateY(-2px)",
      border: `1px solid ${COLORS.primary}`,
    },
  },
  // Progress Bar
  progressBg: {
    width: "100%",
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.success,
    borderRadius: "3px",
    transition: "width 0.3s",
  },
  // Badges
  badgeRunning: {
    backgroundColor: `${COLORS.success}20`,
    color: COLORS.success,
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  badgeWaiting: {
    backgroundColor: `${COLORS.warning}20`,
    color: COLORS.warning,
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  badgeDone: {
    backgroundColor: "#eee",
    color: "#888",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  iconButton: { background: "none", border: "none", cursor: "pointer" },
  emptyState: { textAlign: "center", padding: "50px", color: "#aaa" },

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
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    width: "550px",
    padding: "30px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "15px",
  },
  modalBody: { display: "flex", flexDirection: "column", gap: "15px" },
  formRow: { display: "flex", gap: "15px" },
  label: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
    marginBottom: "5px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    width: "100%",
    boxSizing: "border-box",
    fontSize: "14px",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "25px",
    paddingTop: "20px",
    borderTop: `1px solid ${COLORS.border}`,
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnCancel: {
    backgroundColor: "#f0f0f0",
    color: "#333",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  },
  btnDelete: {
    backgroundColor: "#fff",
    color: COLORS.danger,
    border: `1px solid ${COLORS.danger}`,
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
};

export default ProductionOrder;
