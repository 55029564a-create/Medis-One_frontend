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

// 작성한 API 파일 임포트 (경로가 맞는지 확인해주세요)
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getProcesses,
} from "../../api/productionApi";

// 🎨 테마 컬러
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
  // --- 상태 관리 ---
  const [viewPeriod, setViewPeriod] = useState("Week"); // "Week" | "Month"
  const [orders, setOrders] = useState([]); // 전체 데이터
  const [filteredList, setFilteredList] = useState([]); // 필터링된 데이터
  const [searchTerm, setSearchTerm] = useState("");
  const [processes, setProcesses] = useState([]); // 공정 목록 (콤보박스용)

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // 입력 폼 상태 (DTO 구조에 맞춤)
  const [currentOrder, setCurrentOrder] = useState({
    id: null,
    productId: 1, // 기본값 (추후 제품 선택 기능 추가 시 변경)
    productProcessId: 1,
    targetQty: 0,
    deadline: "",
    worker: "",
    instruction: "",
    requirements: "",
  });

  // 1. 초기 데이터 로드 (작업지시 목록 + 공정 목록)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Promise.all로 두 API 동시 호출
      const [orderData, processData] = await Promise.all([
        getOrders(),
        getProcesses(),
      ]);

      console.log("불러온 주문 데이터:", orderData);
      console.log("불러온 공정 데이터:", processData);

      setOrders(orderData);
      setProcesses(processData);
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
    }
  };

  // 2. 필터링 로직 (검색어 & 기간)
  useEffect(() => {
    filterOrders();
  }, [orders, viewPeriod, searchTerm]);

  const filterOrders = () => {
    const today = new Date();
    // 시간 부분 초기화 (날짜 비교 정확도를 위해)
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const result = orders.filter((order) => {
      if (!order.deadline) return false;

      const deadline = new Date(order.deadline);
      deadline.setHours(0, 0, 0, 0);

      // 1. 기간 필터
      let isPeriodMatch = false;
      if (viewPeriod === "Week") {
        // 오늘 ~ 7일 후
        isPeriodMatch = deadline >= today && deadline <= nextWeek;
      } else {
        // Month: 같은 연도, 같은 달
        isPeriodMatch =
          deadline.getMonth() === today.getMonth() &&
          deadline.getFullYear() === today.getFullYear();
      }

      // 2. 검색어 필터 (Null Check 포함)
      const term = searchTerm.toLowerCase();
      const isSearchMatch =
        (order.code && order.code.toLowerCase().includes(term)) ||
        (order.productName && order.productName.toLowerCase().includes(term)) ||
        (order.processName && order.processName.toLowerCase().includes(term)) ||
        (order.worker && order.worker.toLowerCase().includes(term));

      return isPeriodMatch && isSearchMatch;
    });

    setFilteredList(result);
  };

  // --- KPI 계산 ---
  const totalCount = orders.length;
  const runningCount = orders.filter((o) => o.status === "IN_PROGRESS").length;
  const doneCount = orders.filter((o) => o.status === "COMPLETED").length;

  // --- 핸들러 ---
  const handleAddNew = () => {
    setCurrentOrder({
      id: null,
      productId: 1, // 임시 고정
      productProcessId: processes.length > 0 ? processes[0].id : 1,
      targetQty: 0,
      deadline: new Date().toISOString().slice(0, 10), // 오늘 날짜
      worker: "",
      instruction: "",
      requirements: "",
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (order) => {
    // 수정 시 기존 데이터를 폼에 채워넣기
    setCurrentOrder({
      id: order.id,
      productId: order.productId || 1,
      productProcessId: order.productProcessId || 1,
      targetQty: order.targetQty,
      deadline: order.deadline,
      worker: order.worker,
      currentQty: order.currentQty, // 보여주기용 (수정불가)
      instruction: order.instruction || "",
      requirements: order.requirements || "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    // 유효성 검사
    if (
      !currentOrder.worker ||
      !currentOrder.targetQty ||
      !currentOrder.deadline
    ) {
      return alert("필수 정보(담당자, 수량, 마감일)를 모두 입력해주세요.");
    }

    try {
      if (isEditMode) {
        // 수정 (PUT)
        await updateOrder(currentOrder.id, currentOrder);
        alert("성공적으로 수정되었습니다.");
      } else {
        // 등록 (POST)
        await createOrder(currentOrder);
        alert("새로운 작업 지시가 등록되었습니다.");
      }
      setIsModalOpen(false);
      fetchData(); // 목록 새로고침
    } catch (error) {
      const msg = error.response?.data || "서버 오류가 발생했습니다.";
      alert("저장 실패: " + msg);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm("정말 이 지시를 삭제하시겠습니까? (되돌릴 수 없습니다)")
    ) {
      try {
        await deleteOrder(currentOrder.id);
        alert("삭제되었습니다.");
        setIsModalOpen(false);
        fetchData();
      } catch (error) {
        const msg = error.response?.data || "삭제 중 오류 발생";
        alert("삭제 실패: " + msg);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentOrder({ ...currentOrder, [name]: value });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>생산 지시 관리</h2>
          <p style={styles.subtitle}>
            생산 계획 수립 및 실시간 진척도 관리 (Admin)
          </p>
        </div>
        <button style={styles.addButton} onClick={handleAddNew}>
          <FaPlus /> 지시 등록
        </button>
      </div>

      {/* KPI Cards */}
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

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.tabContainer}>
          {["Week", "Month"].map((tab) => (
            <button
              key={tab}
              style={viewPeriod === tab ? styles.tabActive : styles.tab}
              onClick={() => setViewPeriod(tab)}
            >
              {tab === "Week" ? "주간 일정" : "월간 일정"}
            </button>
          ))}
        </div>
        <div style={styles.searchBox}>
          <FaSearch color={THEME.subText} />
          <input
            placeholder="지시코드, 품목, 담당자 검색"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List Header */}
      <div style={styles.listHeader}>
        <div style={{ width: "12%" }}>지시코드</div>
        <div style={{ width: "15%" }}>공정</div>
        <div style={{ width: "23%" }}>품목명</div>
        <div style={{ width: "20%" }}>진척률 (실적/목표)</div>
        <div style={{ width: "15%" }}>마감일</div>
        <div style={{ width: "10%", textAlign: "center" }}>상태</div>
        <div style={{ width: "5%" }}></div>
      </div>

      {/* List Body */}
      <div style={styles.listBody}>
        {filteredList.length > 0 ? (
          filteredList.map((order) => {
            // 진척률 계산 (0~100%)
            const percent =
              order.targetQty > 0
                ? Math.min(
                    Math.round((order.currentQty / order.targetQty) * 100),
                    100,
                  )
                : 0;

            return (
              <div
                key={order.id}
                style={styles.cardRow}
                onClick={() => handleEdit(order)}
              >
                <div
                  style={{
                    width: "12%",
                    fontSize: "12px",
                    color: "#888",
                    fontWeight: "bold",
                  }}
                >
                  {order.code}
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
                  <FaIndustry color={THEME.subText} size={12} />{" "}
                  {order.processName || "공정 미정"}
                </div>
                <div
                  style={{ width: "23%", fontWeight: "600", color: THEME.text }}
                >
                  {order.productName || "제품 정보 없음"}
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
                      {order.currentQty} / {order.targetQty}
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
          <div style={styles.emptyState}>조건에 맞는 데이터가 없습니다.</div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{isEditMode ? "생산 지시 수정" : "신규 생산 지시 등록"}</h3>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.row}>
                <InputGroup label="공정 선택">
                  <select
                    name="productProcessId"
                    value={currentOrder.productProcessId}
                    onChange={handleInputChange}
                    style={styles.select}
                  >
                    {processes.length > 0 ? (
                      processes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    ) : (
                      <option value="1">기본 공정</option>
                    )}
                  </select>
                </InputGroup>
                <InputGroup label="담당자">
                  <input
                    name="worker"
                    value={currentOrder.worker}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="담당자 이름"
                  />
                </InputGroup>
              </div>

              <div style={styles.row}>
                <InputGroup label="제품 ID (임시)">
                  <input
                    type="number"
                    name="productId"
                    value={currentOrder.productId}
                    onChange={handleInputChange}
                    style={styles.input}
                    readOnly={isEditMode} // 수정 시 제품 변경 불가 등 정책에 따라
                  />
                </InputGroup>
                <InputGroup label="마감 기한">
                  <input
                    type="date"
                    name="deadline"
                    value={currentOrder.deadline}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </InputGroup>
              </div>

              <div style={styles.row}>
                <InputGroup label="목표 수량">
                  <input
                    type="number"
                    name="targetQty"
                    value={currentOrder.targetQty}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </InputGroup>
                <InputGroup label="현재 실적 (수정불가)">
                  <input
                    value={currentOrder.currentQty || 0}
                    readOnly
                    style={{
                      ...styles.input,
                      backgroundColor: "#f5f5f5",
                      color: "#888",
                    }}
                  />
                </InputGroup>
              </div>

              <InputGroup label="작업 지시 사항">
                <textarea
                  name="instruction"
                  value={currentOrder.instruction}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="작업자에게 전달할 구체적인 내용..."
                />
              </InputGroup>
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
    IN_PROGRESS: { color: THEME.secondary, bg: "#E3F2FD", text: "가동중" },
    WAIT: { color: THEME.warning, bg: "#FFF8E1", text: "대기" },
    COMPLETED: { color: THEME.success, bg: "#E8F5E9", text: "완료" },
    STOP: { color: THEME.danger, bg: "#FFEBEE", text: "중지" },
  };
  const s = map[status] || map.WAIT;
  return (
    <span style={{ ...styles.badge, color: s.color, backgroundColor: s.bg }}>
      {s.text}
    </span>
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
  modalBody: { display: "flex", flexDirection: "column" },
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
  select: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${THEME.border}`,
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${THEME.border}`,
    width: "100%",
    boxSizing: "border-box",
    minHeight: "80px",
    resize: "vertical",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
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
