import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaIndustry,
  FaUserCircle,
  FaClipboardList,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaClock,
} from "react-icons/fa";

// [변경] API 함수 임포트
import {
  getTodayWorkOrders,
  getMonthlyWorkOrders,
} from "../../api/productionApi";

const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851",
  warning: "#FFBB33",
  info: "#33B5E5",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

const WorkOrder = () => {
  // 상태 관리
  const [todayData, setTodayData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 조회
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [today, monthly] = await Promise.all([
        getTodayWorkOrders(),
        getMonthlyWorkOrders(),
      ]);
      setTodayData(today || []);
      setMonthData(monthly || []);
    } catch (error) {
      console.error("작업 지시 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 열기
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // 상태 뱃지 (DB값 -> UI값 변환)
  const renderStatusBadge = (status) => {
    let color = COLORS.subText;
    let text = "대기";
    let icon = <FaClock />;

    // DB Status: IN_PROGRESS, COMPLETED, WAIT
    if (status === "IN_PROGRESS" || status === "Running") {
      color = COLORS.info;
      text = "진행중";
      icon = <FaSpinner className="spin" />;
    } else if (status === "COMPLETED" || status === "Done") {
      color = COLORS.success;
      text = "완료";
      icon = <FaCheckCircle />;
    } else if (status === "WAIT" || status === "Waiting") {
      color = COLORS.warning;
      text = "대기";
      icon = <FaClock />;
    }

    return (
      <span
        style={{ ...styles.badge, backgroundColor: `${color}20`, color: color }}
      >
        {icon} <span style={{ marginLeft: "4px" }}>{text}</span>
      </span>
    );
  };

  // DB DTO -> UI 렌더링용 변수 매핑 헬퍼
  // DTO: code, deadline, lineName, worker, productName, targetQty, status, instruction, requirements
  const mapOrder = (order) => ({
    id: order.code,
    date: order.deadline,
    process: order.lineName || "라인 미정",
    worker: order.worker,
    product: order.productName,
    qty: order.targetQty,
    status: order.status,
    desc: order.instruction,
    note: order.requirements,
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>📑 작업 지시서</h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            생산 현장 작업 지시 현황 및 이력 조회
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        {/* 1. 금일 작업 지시 (Today) */}
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <FaCalendarAlt
                style={{ marginRight: "8px", color: COLORS.primary }}
              />
              금일 작업 지시 (Today)
            </h3>
            <span style={{ fontSize: "13px", color: COLORS.subText }}>
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <div style={styles.listHeader}>
            <div style={{ width: "15%" }}>지시번호</div>
            <div style={{ width: "15%" }}>공정(라인)</div>
            <div style={{ width: "25%" }}>품목명</div>
            <div style={{ width: "15%" }}>목표 수량</div>
            <div style={{ width: "15%" }}>작업자</div>
            <div style={{ width: "15%", textAlign: "center" }}>상태</div>
          </div>

          <div style={styles.listBody}>
            {todayData.length > 0 ? (
              todayData.map((dto) => {
                const order = mapOrder(dto);
                return (
                  <div
                    key={order.id}
                    style={styles.cardRow}
                    onClick={() => openModal(order)}
                  >
                    <div
                      style={{
                        width: "15%",
                        fontWeight: "bold",
                        color: "#666",
                      }}
                    >
                      {order.id}
                    </div>
                    <div style={{ width: "15%" }}>{order.process}</div>
                    <div
                      style={{
                        width: "25%",
                        fontWeight: "600",
                        color: COLORS.text,
                      }}
                    >
                      {order.product}
                    </div>
                    <div
                      style={{
                        width: "15%",
                        color: COLORS.primary,
                        fontWeight: "bold",
                      }}
                    >
                      {order.qty.toLocaleString()} EA
                    </div>
                    <div
                      style={{
                        width: "15%",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FaUserCircle color="#ccc" /> {order.worker}
                    </div>
                    <div style={{ width: "15%", textAlign: "center" }}>
                      {renderStatusBadge(order.status)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{ textAlign: "center", padding: "30px", color: "#aaa" }}
              >
                금일 작업 지시가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 2. 월간 작업 지시 (Monthly) */}
        <div style={styles.sectionContainer}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>
              <FaClipboardList
                style={{ marginRight: "8px", color: COLORS.text }}
              />
              월간 작업 지시 이력 (Monthly)
            </h3>
            <div style={styles.searchBox}>
              <FaSearch color={COLORS.subText} />
              <input
                type="text"
                placeholder="검색..."
                style={styles.searchInput}
              />
            </div>
          </div>

          <div style={styles.listHeader}>
            <div style={{ width: "15%" }}>마감일</div>
            <div style={{ width: "15%" }}>지시번호</div>
            <div style={{ width: "15%" }}>공정(라인)</div>
            <div style={{ width: "20%" }}>품목명</div>
            <div style={{ width: "10%" }}>수량</div>
            <div style={{ width: "10%" }}>작업자</div>
            <div style={{ width: "15%", textAlign: "center" }}>상태</div>
          </div>

          <div style={styles.listBody}>
            {monthData.length > 0 ? (
              monthData.map((dto) => {
                const order = mapOrder(dto);
                return (
                  <div
                    key={order.id}
                    style={styles.cardRow}
                    onClick={() => openModal(order)}
                  >
                    <div
                      style={{ width: "15%", color: "#888", fontSize: "13px" }}
                    >
                      {order.date}
                    </div>
                    <div
                      style={{
                        width: "15%",
                        fontWeight: "bold",
                        color: "#666",
                      }}
                    >
                      {order.id}
                    </div>
                    <div style={{ width: "15%" }}>{order.process}</div>
                    <div style={{ width: "20%", fontWeight: "600" }}>
                      {order.product}
                    </div>
                    <div style={{ width: "10%" }}>
                      {order.qty.toLocaleString()}
                    </div>
                    <div style={{ width: "10%" }}>{order.worker}</div>
                    <div style={{ width: "15%", textAlign: "center" }}>
                      {renderStatusBadge(order.status)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{ textAlign: "center", padding: "30px", color: "#aaa" }}
              >
                월간 이력이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. 상세 정보 모달 */}
      {isModalOpen && selectedOrder && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FaClipboardList color={COLORS.primary} /> 작업지시 상세 정보
              </h3>
              <button onClick={closeModal} style={styles.closeButton}>
                <FaTimes />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.infoGrid}>
                <InfoItem label="지시번호" value={selectedOrder.id} />
                <InfoItem label="마감일자" value={selectedOrder.date} />
                <InfoItem label="담당 공정" value={selectedOrder.process} />
                <InfoItem label="담당자" value={selectedOrder.worker} />
                <InfoItem label="생산 품목" value={selectedOrder.product} />
                <InfoItem
                  label="목표 수량"
                  value={`${selectedOrder.qty.toLocaleString()} EA`}
                  highlight
                />
                <InfoItem
                  label="현재 상태"
                  value={renderStatusBadge(selectedOrder.status)}
                />
              </div>
              <hr style={styles.divider} />
              <div style={styles.detailBox}>
                <label style={styles.label}>📢 작업 지시 사항</label>
                <div style={styles.textBox}>
                  {selectedOrder.desc || "특이사항 없음"}
                </div>
              </div>
              <div style={styles.detailBox}>
                <label style={styles.label}>📝 비고 / 특이사항</label>
                <div
                  style={{
                    ...styles.textBox,
                    backgroundColor: "#FFF8E1",
                    color: "#5D4037",
                  }}
                >
                  {selectedOrder.note || "작성된 메모가 없습니다."}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.confirmButton} onClick={closeModal}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 서브 컴포넌트 & 스타일 ---
const InfoItem = ({ label, value, highlight }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <span style={{ fontSize: "12px", color: COLORS.subText }}>{label}</span>
    <span
      style={{
        fontSize: "14px",
        fontWeight: highlight ? "bold" : "500",
        color: highlight ? COLORS.primary : COLORS.text,
      }}
    >
      {value || "-"}
    </span>
  </div>
);

const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: { marginBottom: "30px" },
  sectionContainer: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "15px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
  },
  listHeader: {
    display: "flex",
    padding: "0 20px",
    marginBottom: "10px",
    fontSize: "13px",
    color: "#888",
    fontWeight: "bold",
  },
  listBody: { display: "flex", flexDirection: "column", gap: "10px" },
  cardRow: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "15px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    border: `1px solid ${COLORS.border}`,
    transition: "transform 0.2s",
    cursor: "pointer",
    ":hover": { transform: "translateY(-2px)", borderColor: COLORS.primary },
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "20px",
    padding: "8px 15px",
    width: "200px",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    marginLeft: "10px",
    fontSize: "13px",
    width: "100%",
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
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    width: "550px",
    padding: "30px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "15px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
  },
  modalBody: { marginBottom: "20px" },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },
  divider: {
    border: "none",
    borderTop: `1px dashed ${COLORS.border}`,
    margin: "20px 0",
  },
  detailBox: { marginBottom: "15px" },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "8px",
    display: "block",
  },
  textBox: {
    backgroundColor: "#F9F9F9",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.5",
    color: "#333",
    border: `1px solid ${COLORS.border}`,
  },
  modalFooter: { display: "flex", justifyContent: "flex-end" },
  confirmButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    padding: "10px 25px",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default WorkOrder;
