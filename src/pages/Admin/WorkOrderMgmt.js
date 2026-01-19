import React, { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaCalendarAlt,
  FaUser,
  FaEdit,
  FaTrashAlt,
  FaClipboardList,
} from "react-icons/fa";

// 🎨 테마 컬러 (Admin 전용 테마 적용 가능)
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

// 1. 초기 데이터 (Mock Data)
const initialOrders = [
  {
    id: "WO-260116-01",
    date: "2026-01-16",
    deadline: "2026-01-20",
    process: "Line-A (조립)",
    worker: "김철수",
    targetQty: 500,
    instruction: "27인치 패널 조립 시 베젤 유격 0.5mm 이내로 관리할 것.",
    requirements: "정전기 방지 장갑 필수 착용.",
    status: "Proceeding", // Proceeding, Pending, Done
  },
  {
    id: "WO-260115-02",
    date: "2026-01-15",
    deadline: "2026-01-18",
    process: "Line-B (포장)",
    worker: "이영희",
    targetQty: 1000,
    instruction: "박스 테이핑 시 로고 위치 정중앙 맞춤 확인.",
    requirements: "오전 10시까지 500개 우선 출하 필요.",
    status: "Done",
  },
  {
    id: "WO-260114-03",
    date: "2026-01-14",
    deadline: "2026-01-19",
    process: "Line-C (검사)",
    worker: "박민수",
    targetQty: 300,
    instruction: "전원부 커넥터 체결 상태 전수 검사 진행.",
    requirements: "불량 발생 시 즉시 사진 촬영 후 보고.",
    status: "Proceeding",
  },
];

const WorkOrderMgmt = () => {
  // --- 상태 관리 ---
  const [orders, setOrders] = useState(initialOrders);

  // 필터 상태
  const [filterDateStart, setFilterDateStart] = useState("2026-01-01");
  const [filterDateEnd, setFilterDateEnd] = useState("2026-12-31");
  const [filterWorker, setFilterWorker] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // --- 핸들러 ---

  // 1. 데이터 필터링 로직
  const filteredOrders = orders.filter((order) => {
    const isDateInRange =
      order.date >= filterDateStart && order.date <= filterDateEnd;
    const isWorkerMatch =
      filterWorker === "ALL" || order.worker === filterWorker;
    const isSearchMatch =
      order.instruction.includes(searchTerm) ||
      order.id.includes(searchTerm) ||
      order.process.includes(searchTerm);

    return isDateInRange && isWorkerMatch && isSearchMatch;
  });

  // 2. 모달 열기 (신규)
  const handleAddNew = () => {
    const newId = `WO-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${orders.length + 1}`;
    setCurrentOrder({
      id: newId,
      date: new Date().toISOString().slice(0, 10),
      deadline: "",
      process: "Line-A (조립)",
      worker: "",
      targetQty: "",
      instruction: "",
      requirements: "",
      status: "Pending",
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

  // 4. 저장 (신규/수정)
  const handleSave = () => {
    if (
      !currentOrder.worker ||
      !currentOrder.targetQty ||
      !currentOrder.instruction
    ) {
      return alert("필수 정보를 모두 입력해주세요.");
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
    if (window.confirm("정말 이 작업 지시를 삭제하시겠습니까?")) {
      setOrders(orders.filter((od) => od.id !== currentOrder.id));
      setIsModalOpen(false);
    }
  };

  // 입력값 변경
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
            📝 작업 지시 관리 (Admin)
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            관리자 전용 생산 공정 작업 지시 및 배포
          </p>
        </div>
        <button style={styles.addButton} onClick={handleAddNew}>
          <FaPlus style={{ marginRight: "5px" }} /> 작업 지시 작성
        </button>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <div style={styles.datePicker}>
            <FaCalendarAlt color={COLORS.subText} />
            <input
              type="date"
              value={filterDateStart}
              onChange={(e) => setFilterDateStart(e.target.value)}
              style={styles.dateInput}
            />
            <span>~</span>
            <input
              type="date"
              value={filterDateEnd}
              onChange={(e) => setFilterDateEnd(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          <div style={styles.selectWrapper}>
            <FaUser
              color={COLORS.subText}
              style={{ position: "absolute", left: 10 }}
            />
            <select
              style={styles.selectWithIcon}
              value={filterWorker}
              onChange={(e) => setFilterWorker(e.target.value)}
            >
              <option value="ALL">전체 작업자</option>
              <option value="김철수">김철수</option>
              <option value="이영희">이영희</option>
              <option value="박민수">박민수</option>
            </select>
          </div>
        </div>

        <div style={styles.searchBox}>
          <FaSearch color={COLORS.subText} />
          <input
            placeholder="지시사항, 공정명 검색..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Work Order List */}
      <div style={styles.listContainer}>
        {/* Header Row */}
        <div style={styles.listHeader}>
          <div style={{ width: "10%" }}>지시일자</div>
          <div style={{ width: "10%" }}>공정</div>
          <div style={{ width: "10%" }}>작업자</div>
          <div style={{ width: "30%" }}>지시사항 (요약)</div>
          <div style={{ width: "10%" }}>목표량</div>
          <div style={{ width: "10%" }}>마감기한</div>
          <div style={{ width: "10%", textAlign: "center" }}>상태</div>
          <div style={{ width: "10%", textAlign: "right" }}>관리</div>
        </div>

        {/* Data Rows */}
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              style={styles.cardRow}
              onClick={() => handleEdit(order)}
            >
              <div style={{ width: "10%", fontSize: "13px", color: "#666" }}>
                {order.date}
              </div>
              <div style={{ width: "10%", fontWeight: "bold" }}>
                {order.process.split(" ")[0]}
              </div>
              <div
                style={{
                  width: "10%",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <div style={styles.avatarSmall}>
                  <FaUser size={10} color="#fff" />
                </div>
                {order.worker}
              </div>
              <div style={{ width: "30%", color: "#555", ...styles.ellipsis }}>
                {order.instruction}
              </div>
              <div
                style={{
                  width: "10%",
                  fontWeight: "bold",
                  color: COLORS.primary,
                }}
              >
                {order.targetQty.toLocaleString()} EA
              </div>
              <div
                style={{ width: "10%", fontSize: "13px", color: COLORS.danger }}
              >
                ~ {order.deadline}
              </div>
              <div style={{ width: "10%", textAlign: "center" }}>
                <span
                  style={
                    order.status === "Done"
                      ? styles.badgeDone
                      : styles.badgeProceeding
                  }
                >
                  {order.status === "Done" ? "완료" : "진행중"}
                </span>
              </div>
              <div style={{ width: "10%", textAlign: "right" }}>
                <button style={styles.iconButton}>
                  <FaEdit color="#999" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <FaClipboardList
              size={40}
              color="#ddd"
              style={{ marginBottom: 10 }}
            />
            <p>해당 조건의 작업 지시가 없습니다.</p>
          </div>
        )}
      </div>

      {/* Modal (작성/수정) */}
      {isModalOpen && currentOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>
                {isEditMode ? "🛠️ 작업 지시 수정" : "📝 새 작업 지시 작성"}
              </h3>
              <div style={{ fontSize: "12px", color: "#888" }}>
                ID: {currentOrder.id}
              </div>
            </div>

            <div style={styles.modalBody}>
              {/* Row 1 */}
              <div style={styles.formRow}>
                <InputGroup label="공정 선택">
                  <select
                    name="process"
                    value={currentOrder.process}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    <option>Line-A (조립)</option>
                    <option>Line-B (포장)</option>
                    <option>Line-C (검사)</option>
                  </select>
                </InputGroup>
                <InputGroup label="담당 작업자">
                  <input
                    name="worker"
                    value={currentOrder.worker}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="이름 입력"
                  />
                </InputGroup>
              </div>

              {/* Row 2 */}
              <div style={styles.formRow}>
                <InputGroup label="목표 생산량">
                  <input
                    type="number"
                    name="targetQty"
                    value={currentOrder.targetQty}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0"
                  />
                </InputGroup>
                <InputGroup label="최종 마감일">
                  <input
                    type="date"
                    name="deadline"
                    value={currentOrder.deadline}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </InputGroup>
              </div>

              {/* Row 3 - Textareas */}
              <div style={styles.inputGroupFull}>
                <label style={styles.label}>📢 상세 지시 사항</label>
                <textarea
                  name="instruction"
                  value={currentOrder.instruction}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="작업자가 수행해야 할 구체적인 내용을 입력하세요."
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>⚠️ 특별 요구 사항 / 주의사항</label>
                <textarea
                  name="requirements"
                  value={currentOrder.requirements}
                  onChange={handleInputChange}
                  style={{
                    ...styles.textarea,
                    height: "60px",
                    backgroundColor: "#FFF5F5",
                    borderColor: "#FEB2B2",
                  }}
                  placeholder="안전 수칙, 품질 중점 관리 항목 등"
                />
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
                  {isEditMode ? "수정 완료" : "지시 내리기"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 서브 컴포넌트 ---
const InputGroup = ({ label, children }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);

// --- 스타일 정의 ---
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
  // Filter Bar
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  filterGroup: { display: "flex", gap: "15px" },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.white,
    padding: "8px 15px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
  },
  dateInput: {
    border: "none",
    outline: "none",
    color: "#555",
    fontSize: "14px",
  },
  selectWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  selectWithIcon: {
    padding: "8px 15px 8px 30px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    backgroundColor: COLORS.white,
    cursor: "pointer",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: "8px 15px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
    width: "300px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
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
  ellipsis: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  avatarSmall: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: "#ccc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeProceeding: {
    backgroundColor: `${COLORS.success}20`,
    color: COLORS.success,
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeDone: {
    backgroundColor: "#eee",
    color: "#999",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
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
    width: "600px",
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
  inputGroupFull: { display: "flex", flexDirection: "column", gap: "5px" },
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
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    width: "100%",
    boxSizing: "border-box",
    fontSize: "14px",
    height: "100px",
    resize: "none",
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

export default WorkOrderMgmt;
