import React, { useState } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaHeartbeat,
  FaMedkit,
  FaBox,
  FaSearch,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";

// 테마 컬러
const THEME_COLOR = "#8C85FF";

// ✅ 5가지 공정 단계
const PROCESS_STEPS = [
  "광학 본딩",
  "조립",
  "에이징 테스트",
  "캘리브레이션",
  "신뢰성 테스트",
];

const ProductManagement = () => {
  // --- State ---
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 검색어 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [defectAction, setDefectAction] = useState("재작업");

  // ✅ Mock Data
  const products = [
    {
      id: "DEV-001",
      model: "Zoll X Series",
      category: "Defibrillator/Monitor",
      serial: "ZOLL-240101-A",
      step: 2,
      operator: "김철수",
    },
    {
      id: "DEV-002",
      model: "Propaq M",
      category: "Transport Monitor",
      serial: "PRQ-240102-B",
      step: 1,
      operator: "이영희",
    },
    {
      id: "DEV-003",
      model: "Corpuls3",
      category: "Modular Monitor",
      serial: "CPLS-240103-C",
      step: 5,
      operator: "박지성",
    },
    {
      id: "DEV-004",
      model: "Zoll X Series",
      category: "Defibrillator/Monitor",
      serial: "ZOLL-240104-D",
      step: 3,
      operator: "손흥민",
    },
  ];

  // 🔍 필터링 + 검색 로직
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      filterCategory === "All" || p.category === filterCategory;
    const matchSearch =
      p.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 모달 관련 함수
  const openModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div style={styles.container}>
      {/* ✅ 0. 상단 KPI 대시보드 */}
      <div style={styles.kpiContainer}>
        {/* 1. 생산량 (기본) */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <FaBox color="#fff" />
          </div>
          <div>
            <p style={styles.kpiLabel}>금일 생산량</p>
            <h3 style={styles.kpiValue}>
              142 <span style={styles.kpiUnit}>ea</span>
            </h3>
          </div>
        </div>

        {/* 2. 불량률 (Red Warning) */}
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: "#FFB6C1" }}>
            <FaExclamationTriangle color="#fff" />
          </div>
          <div>
            <p style={styles.kpiLabel}>공정 불량률</p>
            <h3 style={{ ...styles.kpiValue, color: "#FF4444" }}>
              1.2 <span style={styles.kpiUnit}>%</span>
            </h3>
          </div>
        </div>

        {/* 3. 가동률 (Theme Color - 수정됨) */}
        <div style={styles.kpiCard}>
          {/* 아이콘 배경: 아주 연한 키컬러, 아이콘: 키컬러 */}
          <div style={{ ...styles.kpiIconBox, backgroundColor: "#F3F1FF" }}>
            <FaChartLine color={THEME_COLOR} />
          </div>
          <div>
            <p style={styles.kpiLabel}>가동률</p>
            {/* 텍스트 색상: 키컬러 적용 */}
            <h3 style={{ ...styles.kpiValue, color: THEME_COLOR }}>
              94.5 <span style={styles.kpiUnit}>%</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 1. 헤더 */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaClipboardList size={24} color={THEME_COLOR} />
          <h2 style={styles.title}>제품 관리</h2>
        </div>

        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <FaSearch color="#aaa" />
            <input
              type="text"
              placeholder="S/N 또는 모델명 검색"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={styles.filterContainer}>
            <span style={styles.filterLabel}>장비 종류:</span>
            <select
              style={styles.dropdown}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">전체 보기</option>
              <option value="Defibrillator/Monitor">제세동기/모니터</option>
              <option value="Transport Monitor">이송용 모니터</option>
              <option value="Modular Monitor">모듈형 모니터</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. 공정 확인 (Card List) */}
      <div style={styles.grid}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.badge}>
                {product.category.includes("Monitor") ? (
                  <FaHeartbeat style={{ marginRight: 5 }} />
                ) : (
                  <FaMedkit style={{ marginRight: 5 }} />
                )}
                {product.category}
              </span>
              <button
                style={styles.defectBtn}
                onClick={() => openModal(product)}
              >
                <FaExclamationTriangle style={{ marginRight: "5px" }} /> 불량
                등록
              </button>
            </div>

            <h3 style={styles.modelName}>{product.model}</h3>
            <p style={styles.serialText}>
              S/N: {product.serial}
              <span style={styles.operatorText}> | Op: {product.operator}</span>
            </p>

            {/* Progress Bar */}
            <div style={styles.progressContainer}>
              <div style={styles.steps}>
                {PROCESS_STEPS.map((stepName, index) => {
                  const stepNum = index + 1;
                  const isCompleted = product.step > stepNum;
                  const isCurrent = product.step === stepNum;

                  return (
                    <div key={index} style={styles.stepItem}>
                      <div
                        style={{
                          ...styles.stepCircle,
                          backgroundColor:
                            product.step >= stepNum ? THEME_COLOR : "#eee",
                          color: product.step >= stepNum ? "#fff" : "#aaa",
                          border: isCurrent
                            ? `2px solid ${THEME_COLOR}`
                            : "none",
                          boxShadow: isCurrent
                            ? "0 0 0 2px rgba(140, 133, 255, 0.3)"
                            : "none",
                        }}
                      >
                        {isCompleted ? <FaCheckCircle /> : stepNum}
                      </div>
                      <span
                        style={{
                          ...styles.stepLabel,
                          color: isCurrent ? THEME_COLOR : "#aaa",
                          fontWeight: isCurrent ? "bold" : "normal",
                        }}
                      >
                        {stepName}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${((product.step - 1) / (PROCESS_STEPS.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. 불량 관리 Modal */}
      {isModalOpen && selectedProduct && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>불량/반품 등록</h3>
              <button onClick={closeModal} style={styles.closeBtn}>
                <FaTimes />
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalInfo}>
                <p style={{ margin: "0 0 5px 0" }}>
                  모델명: <strong>{selectedProduct.model}</strong>
                </p>
                <p
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  S/N: {selectedProduct.serial}
                </p>
                <p style={{ margin: 0 }}>
                  발생 공정:{" "}
                  <span style={{ color: THEME_COLOR, fontWeight: "bold" }}>
                    {PROCESS_STEPS[selectedProduct.step - 1]}
                  </span>
                </p>
              </div>
              <label style={styles.label}>처리 방법 선택</label>
              <select
                style={styles.fullWidthDropdown}
                value={defectAction}
                onChange={(e) => setDefectAction(e.target.value)}
              >
                <option value="폐기">폐기 (Scrap)</option>
                <option value="재작업">재작업 (Rework)</option>
                <option value="반품 승인">반품 승인 (Return)</option>
              </select>
              <label style={styles.label}>상세 사유</label>
              <textarea
                rows="3"
                placeholder="불량 사유 입력..."
                style={styles.textarea}
              ></textarea>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>
                취소
              </button>
              <button
                onClick={() => {
                  alert("저장되었습니다.");
                  closeModal();
                }}
                style={styles.saveBtn}
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Styles ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#F4F6F9",
    minHeight: "100vh",
    fontFamily: "'Noto Sans KR', sans-serif",
  },

  // KPI Styles
  kpiContainer: { display: "flex", gap: "20px", marginBottom: "30px" },
  kpiCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  kpiIconBox: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    backgroundColor: THEME_COLOR,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  kpiLabel: { margin: "0 0 5px 0", fontSize: "13px", color: "#888" },
  kpiValue: { margin: 0, fontSize: "24px", fontWeight: "bold", color: "#333" },
  kpiUnit: { fontSize: "14px", fontWeight: "normal", color: "#aaa" },

  // Header & Controls
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { fontSize: "24px", fontWeight: "bold", color: "#333", margin: 0 },
  controls: { display: "flex", gap: "15px", alignItems: "center" },

  // Search Styles
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "8px 15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    fontSize: "14px",
    width: "200px",
  },

  filterContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "8px 15px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  filterLabel: {
    marginRight: "10px",
    fontWeight: "bold",
    color: "#555",
    fontSize: "14px",
  },
  dropdown: {
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ddd",
    outline: "none",
    cursor: "pointer",
    fontSize: "14px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
    gap: "20px",
  },

  // Card Styles
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    position: "relative",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  badge: {
    backgroundColor: "#F3F1FF",
    color: THEME_COLOR,
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
  },
  defectBtn: {
    backgroundColor: "#FFEDED",
    color: "#FF4444",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  modelName: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
    color: "#333",
  },
  serialText: { fontSize: "13px", color: "#888", margin: "0 0 25px 0" },
  operatorText: { color: "#aaa", marginLeft: "5px" },

  // Progress Bar
  progressContainer: { position: "relative", paddingTop: "10px" },
  steps: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    transition: "all 0.3s",
    zIndex: 3,
    backgroundColor: "#fff",
  },
  stepLabel: {
    fontSize: "11px",
    marginTop: "8px",
    textAlign: "center",
    wordBreak: "keep-all",
  },
  progressBarBg: {
    position: "absolute",
    top: "24px",
    left: "15px",
    right: "15px",
    height: "3px",
    backgroundColor: "#eee",
    zIndex: 1,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: THEME_COLOR,
    transition: "width 0.3s",
  },

  // Modal
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    width: "400px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#999",
  },
  modalBody: { display: "flex", flexDirection: "column", gap: "15px" },
  modalInfo: {
    fontSize: "14px",
    color: "#555",
    backgroundColor: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "-10px",
  },
  fullWidthDropdown: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  modalFooter: {
    marginTop: "25px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
  },
  cancelBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#666",
  },
  saveBtn: {
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: THEME_COLOR,
    cursor: "pointer",
    fontWeight: "bold",
    color: "#fff",
  },
};

export default ProductManagement;
