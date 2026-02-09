import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCalendarAlt,
  FaClipboardList,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaClock,
  FaUserCircle,
  FaSyncAlt,
} from "react-icons/fa";

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
  const [todayData, setTodayData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 3초마다 자동 새로고침 (Silent Refresh)
  useEffect(() => {
    fetchData(true); // 첫 로딩은 로딩바 표시

    const interval = setInterval(() => {
      fetchData(false); // 자동 갱신은 로딩바 숨김 (깜빡임 방지)
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // isSilent: true면 로딩바 안 띄움 (자동갱신용)
  const fetchData = async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
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
      if (!isSilent) setIsLoading(false);
    }
  };

  // 수동 새로고침 버튼 핸들러
  const handleManualRefresh = () => {
    fetchData(false); // 로딩바 띄우면서 갱신
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const renderStatusBadge = (status) => {
    let color = COLORS.subText;
    let text = "대기";
    let icon = <FaClock />;

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

  const mapOrder = (order) => ({
    id: order.code,
    date: order.deadline,
    process: order.lineName || "라인 미정",
    worker: order.worker,
    product: order.productName,
    currentQty: order.currentQty || 0,
    targetQty: order.targetQty || 0,
    defectQty: order.defectQty || 0,
    status: order.status,
    desc: order.instruction,
    note: order.requirements,
  });

  return (
    <div style={styles.container}>
      {/* 헤더 */}
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
            생산 현장 작업 지시 현황 (실시간 연동)
          </p>
        </div>

        <button
          style={styles.refreshBtn}
          onClick={handleManualRefresh}
          disabled={isLoading}
        >
          <FaSyncAlt className={isLoading ? "spin" : ""} />
          {isLoading ? " 갱신 중..." : " 새로고침"}
        </button>
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
            <div style={{ width: "15%" }}>생산량 / 목표</div>
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
                      <span style={{ color: COLORS.success }}>
                        {order.currentQty}
                      </span>
                      <span style={{ color: "#999", margin: "0 4px" }}>/</span>
                      {order.targetQty}
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
          </div>

          <div style={styles.listHeader}>
            <div style={{ width: "15%" }}>마감일</div>
            <div style={{ width: "15%" }}>지시번호</div>
            <div style={{ width: "15%" }}>공정(라인)</div>
            <div style={{ width: "20%" }}>품목명</div>
            <div style={{ width: "10%" }}>달성률</div>
            <div style={{ width: "10%" }}>작업자</div>
            <div style={{ width: "15%", textAlign: "center" }}>상태</div>
          </div>

          <div style={styles.listBody}>
            {monthData.length > 0 ? (
              monthData.map((dto) => {
                const order = mapOrder(dto);
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
                    <div
                      style={{
                        width: "10%",
                        fontWeight: "bold",
                        color: percent === 100 ? COLORS.success : COLORS.text,
                      }}
                    >
                      {percent}%
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
                  label="생산 현황 (현재/목표)"
                  value={`${selectedOrder.currentQty} / ${selectedOrder.targetQty} EA`}
                  highlight
                />
                <InfoItem
                  label="현재 상태"
                  value={renderStatusBadge(selectedOrder.status)}
                />
                <InfoItem
                  label="불량 수량"
                  value={`${selectedOrder.defectQty} EA`}
                  highlight
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
  header: {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
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

  refreshBtn: {
    height: "40px",
    padding: "0 20px", // 좌우 여백
    borderRadius: "12px", // 둥근 모서리 통일
    backgroundColor: "#fff", // 배경 흰색
    color: COLORS.primary, // 글씨 보라색
    border: `1px solid ${COLORS.primary}`, // 테두리 보라색
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "bold",
    fontSize: "14px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    transition: "background 0.2s",
  },
};

export default WorkOrder;
