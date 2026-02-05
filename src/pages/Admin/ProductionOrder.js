import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaClipboardList,
  FaCheckDouble,
  FaSpinner,
} from "react-icons/fa";

import {
  getProductOrders,
  createProductOrder,
  updateProductOrder,
  deleteProductOrder,
  getLines,
} from "../../api/productionApi";

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

const ProductionOrder = () => {
  const [orders, setOrders] = useState([]);
  const [lines, setLines] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [currentOrder, setCurrentOrder] = useState({
    id: null,
    productId: 1,
    lineId: 1,
    targetQty: 0,
    deadline: "",
    worker: "",
    instruction: "",
    requirements: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [poData, lineData] = await Promise.all([
        getProductOrders(),
        getLines(),
      ]);
      setOrders(poData);
      setLines(lineData);
    } catch (err) {
      console.error("데이터 로드 실패", err);
    }
  };

  const totalCount = orders.length;
  const runningCount = orders.filter((o) => o.status === "IN_PROGRESS").length;
  const doneCount = orders.filter((o) => o.status === "COMPLETED").length;

  const handleSave = async () => {
    if (!currentOrder.targetQty || !currentOrder.deadline)
      return alert("필수 입력값 누락");
    try {
      if (isEditMode) {
        await updateProductOrder(currentOrder.id, currentOrder);
        alert("수정되었습니다.");
      } else {
        await createProductOrder(currentOrder);
        alert("생산 계획이 등록되었습니다.");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.response?.data || err.message;
      alert("저장 실패: " + msg);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    try {
      await deleteProductOrder(currentOrder.id);
      alert("삭제되었습니다.");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg =
        err.response?.data?.message || err.response?.data || err.message;
      alert("삭제 실패: " + msg);
    }
  };

  const openModal = (order = null) => {
    if (order) {
      setIsEditMode(true);
      setCurrentOrder({
        ...order,
        lineId: order.lineId || (lines.length > 0 ? lines[0].id : 1),
      });
    } else {
      setIsEditMode(false);
      setCurrentOrder({
        id: null,
        productId: 1,
        lineId: lines.length > 0 ? lines[0].id : 1,
        targetQty: 0,
        deadline: new Date().toISOString().split("T")[0],
        worker: "",
        instruction: "",
        requirements: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder({ ...currentOrder, [name]: value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📅 생산 계획 관리 (Product Order)</h2>
          <p style={styles.subtitle}>월간/주간 생산 계획 수립 (관리자용)</p>
        </div>
        <button style={styles.addButton} onClick={() => openModal()}>
          <FaPlus /> 계획 등록
        </button>
      </div>

      <div style={styles.kpiContainer}>
        <KpiCard
          title="총 계획"
          value={totalCount}
          color={THEME.primary}
          icon={<FaClipboardList />}
        />
        <KpiCard
          title="진행중"
          value={runningCount}
          color={THEME.secondary}
          icon={<FaSpinner />}
        />
        <KpiCard
          title="완료"
          value={doneCount}
          color={THEME.success}
          icon={<FaCheckDouble />}
        />
      </div>

      {/* 리스트 영역 (가로 스크롤 지원) */}
      <div style={styles.tableWrapper}>
        <div style={styles.listHeader}>
          <div style={{ flex: 1.5, minWidth: "100px" }}>계획코드</div>
          <div style={{ flex: 2, minWidth: "150px" }}>제품명</div>
          <div style={{ flex: 1.5, minWidth: "120px" }}>라인</div>
          <div style={{ flex: 1.5, minWidth: "120px" }}>진척도</div>
          <div style={{ flex: 1.5, minWidth: "100px" }}>마감일</div>
          <div style={{ flex: 1, minWidth: "80px" }}>상태</div>
          <div style={{ flex: 0.8, minWidth: "60px", textAlign: "center" }}>
            관리
          </div>
        </div>

        <div style={styles.listContainer}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={styles.cardRow}
              onClick={() => openModal(order)}
            >
              <div
                style={{
                  flex: 1.5,
                  minWidth: "100px",
                  fontWeight: "bold",
                  fontSize: "13px",
                }}
              >
                {order.code}
              </div>
              <div style={{ flex: 2, minWidth: "150px" }}>
                {order.productName}
              </div>
              <div style={{ flex: 1.5, minWidth: "120px" }}>
                {order.lineName || "라인 미정"}
              </div>
              <div
                style={{
                  flex: 1.5,
                  minWidth: "120px",
                  color: THEME.primary,
                  fontWeight: "bold",
                }}
              >
                {order.currentQty} / {order.targetQty}
              </div>
              <div style={{ flex: 1.5, minWidth: "100px" }}>
                {order.deadline}
              </div>
              <div style={{ flex: 1, minWidth: "80px" }}>
                <StatusBadge status={order.status} />
              </div>
              <div style={{ flex: 0.8, minWidth: "60px", textAlign: "center" }}>
                <FaEdit color={THEME.subText} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{isEditMode ? "계획 수정" : "신규 계획 등록"}</h3>
            </div>
            <div style={styles.modalBody}>
              <InputGroup label="생산 라인 (Line)">
                <select
                  name="lineId"
                  value={currentOrder.lineId}
                  onChange={handleInputChange}
                  style={styles.select}
                >
                  {lines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.name}
                    </option>
                  ))}
                </select>
              </InputGroup>
              <div style={styles.row}>
                <InputGroup label="목표 수량">
                  <input
                    type="number"
                    name="targetQty"
                    style={styles.input}
                    value={currentOrder.targetQty}
                    onChange={handleInputChange}
                  />
                </InputGroup>
                <InputGroup label="마감일">
                  <input
                    type="date"
                    name="deadline"
                    style={styles.input}
                    value={currentOrder.deadline}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </div>
              <InputGroup label="담당자">
                <input
                  name="worker"
                  style={styles.input}
                  value={currentOrder.worker}
                  onChange={handleInputChange}
                />
              </InputGroup>
            </div>
            <div style={styles.modalFooter}>
              {isEditMode && (
                <button onClick={handleDelete} style={styles.btnDelete}>
                  삭제
                </button>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={styles.btnCancel}
                >
                  취소
                </button>
                <button onClick={handleSave} style={styles.btnSave}>
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

// ... Sub Components ...
const InputGroup = ({ label, children }) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      marginBottom: "15px",
    }}
  >
    <label style={styles.label}>{label}</label>
    {children}
  </div>
);
const KpiCard = ({ title, value, icon, color }) => (
  <div style={styles.kpiCard}>
    <div style={{ ...styles.kpiIcon, backgroundColor: color + "15", color }}>
      {icon}
    </div>
    <div>
      <div style={{ color: "#888", fontSize: "12px" }}>{title}</div>
      <div style={{ fontWeight: "bold", fontSize: "20px" }}>{value}</div>
    </div>
  </div>
);
const StatusBadge = ({ status }) => {
  const map = {
    IN_PROGRESS: { bg: "#E3F2FD", c: "#6AD2FF" },
    COMPLETED: { bg: "#E8F5E9", c: "#05CD99" },
    WAIT: { bg: "#FFF8E1", c: "#FFB547" },
  };
  const s = map[status] || map.WAIT;
  return (
    <span
      style={{
        padding: "5px 10px",
        borderRadius: "15px",
        backgroundColor: s.bg,
        color: s.c,
        fontWeight: "bold",
        fontSize: "11px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#F4F7FE",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "30px",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  title: { fontSize: "24px", fontWeight: "bold", color: "#2B3674", margin: 0 },
  subtitle: { margin: "5px 0 0", color: "#A3AED0", fontSize: "14px" },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#8C85FF",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  kpiContainer: {
    display: "flex",
    gap: "20px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  kpiCard: {
    flex: "1 1 200px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "16px",
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

  // 테이블 반응형 처리
  tableWrapper: {
    flex: 1,
    overflowX: "auto",
    width: "100%",
    paddingBottom: "10px",
  },
  listHeader: {
    display: "flex",
    padding: "0 25px",
    marginBottom: "10px",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#A3AED0",
    minWidth: "800px",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    minWidth: "800px",
  },
  cardRow: {
    display: "flex",
    padding: "20px 25px",
    backgroundColor: "white",
    borderRadius: "16px",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
    transition: "transform 0.2s",
  },

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
    width: "500px",
    padding: "30px",
    backgroundColor: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
    maxWidth: "90%",
  },
  modalHeader: {
    marginBottom: "25px",
    borderBottom: "1px solid #E0E5F2",
    paddingBottom: "15px",
  },
  modalBody: { display: "flex", flexDirection: "column" },
  row: { display: "flex", gap: "15px" },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#2B3674",
    marginBottom: "6px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #E0E5F2",
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #E0E5F2",
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "30px",
  },
  btnSave: {
    padding: "10px 25px",
    backgroundColor: "#8C85FF",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnCancel: {
    padding: "10px 25px",
    backgroundColor: "#F4F7FE",
    color: "#2B3674",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  btnDelete: {
    padding: "10px 20px",
    backgroundColor: "white",
    color: "#EE5D50",
    border: "1px solid #EE5D50",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default ProductionOrder;
