import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaCalendarAlt,
  FaUser,
  FaClipboardList,
  FaEdit,
  FaTrashAlt,
} from "react-icons/fa";

import {
  getWorkOrders,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  getLines,
  getProductOrders,
} from "../../api/productionApi";

const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851",
  danger: "#FF4444",
  text: "#333",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  subText: "#A3AED0",
  border: "#E0E5F2",
};

const WorkOrderMgmt = () => {
  const [orders, setOrders] = useState([]);
  const [lines, setLines] = useState([]);
  const [parentPlans, setParentPlans] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrder, setCurrentOrder] = useState({
    id: null,
    productOrderId: "",
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

  // [신규 로직] 상위 계획 선택 시 제품과 수량 자동 세팅
  const handleParentPlanChange = (e) => {
    const selectedId = e.target.value;

    if (selectedId === "") {
      // 연결 안 함 선택 시
      setCurrentOrder({ ...currentOrder, productOrderId: "" });
      return;
    }

    // 선택된 상위 계획 데이터 찾기
    const selectedPlan = parentPlans.find((p) => p.id === Number(selectedId));

    if (selectedPlan) {
      setCurrentOrder({
        ...currentOrder,
        productOrderId: selectedId,
        productId: selectedPlan.productId, // [중요] 상위 계획의 제품으로 자동 변경
        targetQty: selectedPlan.targetQty - selectedPlan.currentQty, // 잔여 수량 자동 입력 (편의 기능)
        deadline: selectedPlan.deadline, // 마감일도 자동 입력
      });
    }
  };

  const fetchData = async () => {
    try {
      const [woData, lineData, poData] = await Promise.all([
        getWorkOrders(),
        getLines(),
        getProductOrders(),
      ]);
      setOrders(woData);
      setLines(lineData);
      setParentPlans(poData.filter((p) => p.status !== "COMPLETED"));
    } catch (error) {
      console.error("데이터 로드 실패", error);
    }
  };

  const handleAddNew = () => {
    setCurrentOrder({
      id: null,
      productOrderId: "",
      productId: 1,
      lineId: lines.length > 0 ? lines[0].id : 1,
      targetQty: 0,
      deadline: new Date().toISOString().slice(0, 10),
      worker: "",
      instruction: "",
      requirements: "",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (order) => {
    setCurrentOrder({
      ...order,
      // 백엔드 DTO에 추가한 productOrderId를 여기서 사용
      productOrderId: order.productOrderId || "",
      lineId: order.lineId || (lines.length > 0 ? lines[0].id : 1),
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...currentOrder,
        productOrderId: currentOrder.productOrderId || null,
      };
      if (isEditMode) {
        await updateWorkOrder(currentOrder.id, payload);
        alert("수정되었습니다.");
      } else {
        await createWorkOrder(payload);
        alert("작업 지시가 등록되었습니다.");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      const msg =
        error.response?.data?.message || error.response?.data || error.message;
      alert("저장 실패: " + msg);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteWorkOrder(currentOrder.id);
        alert("삭제되었습니다.");
        setIsModalOpen(false);
        fetchData();
      } catch (e) {
        alert("삭제 실패: " + (e.response?.data?.message || e.message));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder({ ...currentOrder, [name]: value });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📝 작업 지시 관리 (Work Order)</h2>
          <p style={styles.subtitle}>현장 라인별 작업 할당 및 지시</p>
        </div>
        <button style={styles.addButton} onClick={handleAddNew}>
          <FaPlus /> 지시 작성
        </button>
      </div>

      <div style={styles.tableWrapper}>
        <div style={styles.listHeader}>
          <div style={{ flex: 1.5, minWidth: "100px" }}>지시코드</div>
          <div style={{ flex: 1.5, minWidth: "120px" }}>배정 라인</div>
          <div style={{ flex: 1, minWidth: "80px" }}>작업자</div>
          <div style={{ flex: 2.5, minWidth: "150px" }}>품목명</div>
          <div style={{ flex: 1.5, minWidth: "100px" }}>진척률</div>
          <div style={{ flex: 1, minWidth: "80px" }}>상태</div>
        </div>

        <div style={styles.listContainer}>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                style={styles.cardRow}
                onClick={() => handleEdit(order)}
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
                <div
                  style={{
                    flex: 1.5,
                    minWidth: "120px",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <FaClipboardList color={COLORS.subText} />{" "}
                  {order.lineName || "미정"}
                </div>
                <div style={{ flex: 1, minWidth: "80px" }}>{order.worker}</div>
                <div style={{ flex: 2.5, minWidth: "150px" }}>
                  {order.productName}
                </div>
                <div
                  style={{
                    flex: 1.5,
                    minWidth: "100px",
                    color: COLORS.primary,
                    fontWeight: "bold",
                  }}
                >
                  {order.currentQty} / {order.targetQty}
                </div>
                <div style={{ flex: 1, minWidth: "80px" }}>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "15px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                      backgroundColor:
                        order.status === "IN_PROGRESS" ? "#E3F2FD" : "#FFF8E1",
                      color:
                        order.status === "IN_PROGRESS" ? "#6AD2FF" : "#FFB547",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{ textAlign: "center", padding: "50px", color: "#ccc" }}
            >
              데이터가 없습니다.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{isEditMode ? "작업 지시 수정" : "새 작업 지시"}</h3>
            </div>
            <div style={styles.modalBody}>
              <InputGroup label="상위 생산 지시 (Parent Plan)">
                <select
                  style={styles.select}
                  name="productOrderId"
                  value={currentOrder.productOrderId || ""} // null 방지
                  onChange={handleParentPlanChange} // [변경] 핸들러 교체
                  disabled={isEditMode}
                >
                  <option value="">(연결 안함 - 독립 지시)</option>
                  {parentPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.productName} (잔여:{" "}
                      {p.targetQty - p.currentQty})
                    </option>
                  ))}
                </select>
              </InputGroup>
              <div style={styles.row}>
                <InputGroup label="배정 라인 (Line)">
                  <select
                    style={styles.select}
                    name="lineId"
                    value={currentOrder.lineId}
                    onChange={handleInputChange}
                  >
                    {lines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name}
                      </option>
                    ))}
                  </select>
                </InputGroup>
                <InputGroup label="담당자">
                  <input
                    style={styles.input}
                    name="worker"
                    value={currentOrder.worker}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </div>
              <div style={styles.row}>
                <InputGroup label="목표 수량">
                  <input
                    type="number"
                    style={styles.input}
                    name="targetQty"
                    value={currentOrder.targetQty}
                    onChange={handleInputChange}
                  />
                </InputGroup>
                <InputGroup label="마감일">
                  <input
                    type="date"
                    style={styles.input}
                    name="deadline"
                    value={currentOrder.deadline}
                    onChange={handleInputChange}
                  />
                </InputGroup>
              </div>
              <InputGroup label="지시 사항">
                <textarea
                  style={styles.textarea}
                  name="instruction"
                  value={currentOrder.instruction}
                  onChange={handleInputChange}
                  placeholder="작업 내용 입력..."
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

const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
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
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.text,
    margin: 0,
  },
  subtitle: { margin: "5px 0 0", color: COLORS.subText, fontSize: "14px" },
  addButton: {
    padding: "10px 20px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.4)",
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
    color: COLORS.subText,
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
    alignItems: "center",
    padding: "20px 25px",
    backgroundColor: "white",
    borderRadius: "16px",
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
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "550px",
    padding: "30px",
    backgroundColor: "white",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
    maxWidth: "90%",
  },
  modalHeader: {
    marginBottom: "25px",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "15px",
  },
  modalBody: { display: "flex", flexDirection: "column" },
  row: { display: "flex", gap: "15px" },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "6px",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    width: "100%",
    boxSizing: "border-box",
  },
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "white",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    width: "100%",
    boxSizing: "border-box",
    minHeight: "80px",
    resize: "vertical",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "25px",
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    padding: "10px 25px",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnCancel: {
    backgroundColor: "#F4F7FE",
    color: COLORS.text,
    border: "none",
    padding: "10px 25px",
    borderRadius: "10px",
    cursor: "pointer",
  },
  btnDelete: {
    backgroundColor: "white",
    color: COLORS.danger,
    border: `1px solid ${COLORS.danger}`,
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
  },
};

export default WorkOrderMgmt;
