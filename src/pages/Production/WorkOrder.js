import React, { useState } from "react";
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

// 🎨 디자인 테마 (기존 스타일 유지)
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851", // 완료
  warning: "#FFBB33", // 대기
  info: "#33B5E5", // 진행중
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

// 1. Mock Data (금일 및 월간 데이터)
const todayData = [
  {
    id: "WO-260119-01",
    date: "2026-01-19",
    process: "Line-A (조립)",
    worker: "김철수",
    product: "27인치 LCD 패널",
    qty: 500,
    status: "Running",
    desc: "패널 조립 시 베젤 유격 0.5mm 이내 관리 요망.",
    note: "자재 입고 지연으로 10:00 시작함.",
  },
  {
    id: "WO-260119-02",
    date: "2026-01-19",
    process: "Line-B (포장)",
    worker: "이영희",
    product: "메인보드 A타입",
    qty: 1200,
    status: "Waiting",
    desc: "박스 포장 시 구성품(매뉴얼, 케이블) 누락 주의.",
    note: "",
  },
];

const monthData = [
  {
    id: "WO-260118-05",
    date: "2026-01-18",
    process: "Line-C (검사)",
    worker: "박민수",
    product: "전원 어댑터",
    qty: 3000,
    status: "Done",
    desc: "전수 검사 실시, 불량품 별도 적재.",
    note: "불량률 0.1% 달성.",
  },
  {
    id: "WO-260115-01",
    date: "2026-01-15",
    process: "Line-A (조립)",
    worker: "김철수",
    product: "32인치 모니터",
    qty: 400,
    status: "Done",
    desc: "신규 모델 시생산.",
    note: "",
  },
  {
    id: "WO-260110-03",
    date: "2026-01-10",
    process: "Line-B (가공)",
    worker: "최가공",
    product: "알루미늄 케이스",
    qty: 800,
    status: "Done",
    desc: "절삭유 농도 확인 후 작업 시작.",
    note: "",
  },
];

const WorkOrder = () => {
  // 상태 관리
  const [selectedOrder, setSelectedOrder] = useState(null); // 모달용 선택 데이터
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // 상태에 따른 뱃지 렌더링
  const renderStatusBadge = (status) => {
    let color = COLORS.subText;
    let text = "대기";
    let icon = <FaClock />;

    if (status === "Running") {
      color = COLORS.info;
      text = "진행중";
      icon = <FaSpinner className="spin" />; // 회전 애니메이션용 클래스 필요 시 추가
    } else if (status === "Done") {
      color = COLORS.success;
      text = "완료";
      icon = <FaCheckCircle />;
    } else if (status === "Waiting") {
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

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>📑 작업지시서 관리</h2>
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
              2026-01-19 (월)
            </span>
          </div>

          <div style={styles.listHeader}>
            <div style={{ width: "15%" }}>지시번호</div>
            <div style={{ width: "15%" }}>공정</div>
            <div style={{ width: "25%" }}>품목명</div>
            <div style={{ width: "15%" }}>목표 수량</div>
            <div style={{ width: "15%" }}>작업자</div>
            <div style={{ width: "15%", textAlign: "center" }}>상태</div>
          </div>

          <div style={styles.listBody}>
            {todayData.map((order) => (
              <div
                key={order.id}
                style={styles.cardRow}
                onClick={() => openModal(order)}
              >
                <div
                  style={{ width: "15%", fontWeight: "bold", color: "#666" }}
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
            ))}
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
            <div style={{ width: "15%" }}>지시일자</div>
            <div style={{ width: "15%" }}>지시번호</div>
            <div style={{ width: "15%" }}>공정</div>
            <div style={{ width: "20%" }}>품목명</div>
            <div style={{ width: "10%" }}>수량</div>
            <div style={{ width: "10%" }}>작업자</div>
            <div style={{ width: "15%", textAlign: "center" }}>상태</div>
          </div>

          <div style={styles.listBody}>
            {monthData.map((order) => (
              <div
                key={order.id}
                style={styles.cardRow}
                onClick={() => openModal(order)}
              >
                <div style={{ width: "15%", color: "#888", fontSize: "13px" }}>
                  {order.date}
                </div>
                <div
                  style={{ width: "15%", fontWeight: "bold", color: "#666" }}
                >
                  {order.id}
                </div>
                <div style={{ width: "15%" }}>{order.process}</div>
                <div style={{ width: "20%", fontWeight: "600" }}>
                  {order.product}
                </div>
                <div style={{ width: "10%" }}>{order.qty.toLocaleString()}</div>
                <div style={{ width: "10%" }}>{order.worker}</div>
                <div style={{ width: "15%", textAlign: "center" }}>
                  {renderStatusBadge(order.status)}
                </div>
              </div>
            ))}
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
              {/* 상단 요약 정보 */}
              <div style={styles.infoGrid}>
                <InfoItem label="지시번호" value={selectedOrder.id} />
                <InfoItem label="지시일자" value={selectedOrder.date} />
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

              {/* 상세 지시 사항 */}
              <div style={styles.detailBox}>
                <label style={styles.label}>📢 작업 지시 사항</label>
                <div style={styles.textBox}>
                  {selectedOrder.desc || "특이사항 없음"}
                </div>
              </div>

              {/* 비고/메모 */}
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

// --- 서브 컴포넌트 ---
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
      {value}
    </span>
  </div>
);

// --- 스타일 정의 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: { marginBottom: "30px" },

  // 섹션 스타일
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

  // 리스트 스타일 (Card Row)
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
    ":hover": {
      transform: "translateY(-2px)",
      borderColor: COLORS.primary,
    },
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  // 검색창
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

  // 모달 스타일
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
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
  },
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
