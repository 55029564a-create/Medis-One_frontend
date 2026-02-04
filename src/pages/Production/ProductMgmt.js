import React, { useState, useEffect } from "react";
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
  FaClock,
} from "react-icons/fa";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const THEME_COLOR = "#8C85FF";

// 공정 단계
const PROCESS_STEPS = [
  "광학 본딩",
  "조립",
  "에이징 테스트",
  "캘리브레이션",
  "신뢰성 테스트",
];

const ProductMgmt = () => {
  const [products, setProducts] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [defectAction, setDefectAction] = useState("재작업");

  // 1. 데이터 조회 (GET)
  const fetchProducts = async () => {
    try {
      const response = await fetch(
        "http://localhost:8111/api/production/product-mgmt",
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.sort((a, b) => b.id - a.id));
      } else {
        console.error("데이터 로딩 실패");
      }
    } catch (error) {
      console.error("API 에러:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. 저장 로직 (PUT)
  const handleSaveDefect = async () => {
    if (!selectedProduct) return;

    let newStatus = "FAIL"; // 기본값

    if (defectAction === "정상 복구") {
      newStatus = "PASS";
    } else if (defectAction === "검사 대기") {
      newStatus = "PENDING";
    }

    const updatedProduct = {
      ...selectedProduct,
      testStatus: newStatus,
    };

    try {
      const response = await fetch(
        `http://localhost:8111/api/production/product-mgmt/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedProduct),
        },
      );

      if (response.ok) {
        alert(`[${defectAction}] 처리가 완료되었습니다.`);
        closeModal();
        fetchProducts();
      } else {
        alert("저장 실패");
      }
    } catch (error) {
      console.error("저장 중 에러", error);
    }
  };

  const productionData = {
    target: 200,
    actual: products.length,
  };
  const achievementRate =
    productionData.target > 0
      ? ((productionData.actual / productionData.target) * 100).toFixed(1)
      : 0;

  const hourlyData = [
    { time: "09:00", plan: 20, actual: 18 },
    { time: "10:00", plan: 40, actual: 38 },
    { time: "11:00", plan: 60, actual: 55 },
    { time: "12:00", plan: 60, actual: 55 },
    { time: "13:00", plan: 80, actual: 72 },
    { time: "14:00", plan: 100, actual: 95 },
    { time: "15:00", plan: 120, actual: 110 },
    { time: "16:00", plan: 140, actual: 135 },
    { time: "17:00", plan: 160, actual: 144 },
    { time: "18:00", plan: 180, actual: null },
    { time: "19:00", plan: 200, actual: null },
  ];

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      filterCategory === "All" || p.category === filterCategory;
    const matchSearch =
      p.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  const openModal = (product) => {
    setSelectedProduct(product);
    setDefectAction("재작업");
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const renderTestStatus = (status) => {
    if (status === "FAIL")
      return (
        <span style={styles.statusBadgeFail}>
          <FaTimes /> 부적합 (FAIL)
        </span>
      );
    else if (status === "PASS")
      return (
        <span style={styles.statusBadgePass}>
          <FaCheckCircle /> 적합 (PASS)
        </span>
      );
    else return <span style={styles.statusBadgePending}>⏳ 검사 진행중</span>;
  };

  return (
    <div style={styles.container}>
      {/* 0. KPI 대시보드 */}
      <div style={styles.kpiContainer}>
        <div style={styles.kpiCard}>
          <div style={styles.kpiIconBox}>
            <FaBox color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: "5px",
              }}
            >
              <p style={styles.kpiLabel}>금일 생산 달성률</p>
              <span style={{ fontSize: "12px", color: "#999" }}>
                목표: {productionData.target}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "5px",
                marginBottom: "8px",
              }}
            >
              <h3 style={styles.kpiValue}>{achievementRate}%</h3>
              <span
                style={{
                  fontSize: "14px",
                  color: "#555",
                  paddingBottom: "4px",
                }}
              >
                ( {productionData.actual} / {productionData.target} )
              </span>
            </div>
            <div
              style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#F0F0F0",
                borderRadius: "4px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${achievementRate}%`,
                  height: "100%",
                  backgroundColor: THEME_COLOR,
                  borderRadius: "4px",
                  transition: "width 1s ease-in-out",
                }}
              ></div>
            </div>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: "#FFB6C1" }}>
            <FaExclamationTriangle color="#fff" />
          </div>
          <div>
            <p style={styles.kpiLabel}>공정 불량률</p>
            <h3 style={{ ...styles.kpiValue, color: "#FF4444" }}>
              1.4 <span style={styles.kpiUnit}>%</span>
            </h3>
          </div>
        </div>
        <div style={styles.kpiCard}>
          <div style={{ ...styles.kpiIconBox, backgroundColor: "#F3F1FF" }}>
            <FaChartLine color={THEME_COLOR} />
          </div>
          <div>
            <p style={styles.kpiLabel}>가동률</p>
            <h3 style={{ ...styles.kpiValue, color: THEME_COLOR }}>
              96.2 <span style={styles.kpiUnit}>%</span>
            </h3>
          </div>
        </div>
      </div>

      {/* 시간대별 생산 현황 그래프 */}
      <div style={styles.chartSection}>
        <div style={styles.cardHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaClock color={THEME_COLOR} size={18} />
            <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
              시간대별 생산 계획 대비 실적 (Hourly Production)
            </h3>
          </div>
          <span style={styles.badge}>Real-time</span>
        </div>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={hourlyData}
              margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
            >
              <CartesianGrid stroke="#f5f5f5" vertical={false} />
              <XAxis
                dataKey="time"
                scale="point"
                padding={{ left: 20, right: 20 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="plan"
                name="계획(Plan)"
                stroke="#FFB6C1"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Bar
                dataKey="actual"
                name="실적(Actual)"
                barSize={25}
                fill={THEME_COLOR}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 1. 헤더 (검색 및 필터) */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaClipboardList size={24} color={THEME_COLOR} />
          <h2 style={styles.title}>제품 목록</h2>
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
              <option value="Transport Ventilator">이송용 인공호흡기</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. 제품 카드 리스트 */}
      <div style={styles.grid}>
        {filteredProducts.map((product) => {
          const isFail = product.testStatus === "FAIL";
          return (
            <div
              key={product.id}
              style={{
                ...styles.card,
                border: isFail ? "2px solid #FF4444" : "1px solid transparent",
                boxShadow: isFail
                  ? "0 4px 20px rgba(255, 68, 68, 0.15)"
                  : styles.card.boxShadow,
              }}
            >
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
                  style={{
                    ...styles.defectBtn,
                    backgroundColor: isFail ? "#FF4444" : "#FFEDED",
                    color: isFail ? "#fff" : "#FF4444",
                    animation: isFail ? "pulse 1.5s infinite" : "none",
                    fontWeight: isFail ? "800" : "bold",
                    boxShadow: isFail
                      ? "0 2px 10px rgba(255,68,68,0.4)"
                      : "none",
                  }}
                  onClick={() => openModal(product)}
                >
                  <FaExclamationTriangle style={{ marginRight: "5px" }} />
                  {isFail ? "불량 처리 필요" : "불량 등록"}
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={styles.modelName}>{product.model}</h3>
                  <p style={styles.serialText}>
                    S/N: {product.serial}
                    <span style={styles.operatorText}>
                      {" "}
                      | Op: {product.operator}
                    </span>
                  </p>
                </div>
                <div>{renderTestStatus(product.testStatus)}</div>
              </div>
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
          );
        })}
        {filteredProducts.length === 0 && (
          <div
            style={{
              textAlign: "center",
              gridColumn: "1 / -1",
              padding: "40px",
              color: "#888",
            }}
          >
            데이터가 없습니다.
          </div>
        )}
      </div>

      {/* 3. 불량 관리 Modal */}
      {isModalOpen && selectedProduct && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3
                style={{
                  color:
                    selectedProduct.testStatus === "FAIL" ? "#FF4444" : "#333",
                }}
              >
                {selectedProduct.testStatus === "FAIL"
                  ? "⚠️ 부적합품 처리(NCR)"
                  : "불량/반품 등록"}
              </h3>
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
                <div
                  style={{
                    margin: "5px 0 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    발생 공정:{" "}
                    <span style={{ color: THEME_COLOR, fontWeight: "bold" }}>
                      {PROCESS_STEPS[selectedProduct.step - 1]}
                    </span>
                  </span>
                  {renderTestStatus(selectedProduct.testStatus)}
                </div>
              </div>
              <label style={styles.label}>처리 방법 선택</label>
              <select
                style={styles.fullWidthDropdown}
                value={defectAction}
                onChange={(e) => setDefectAction(e.target.value)}
              >
                <option value="정상 복구">✅ 정상으로 복구 (PASS)</option>
                <option value="검사 대기">
                  ⏳ 검사 진행중으로 복구 (PENDING)
                </option>
                <option value="폐기">폐기 (Scrap)</option>
                <option value="재작업">재작업 (Rework)</option>
                <option value="반품 승인">반품 승인 (Return)</option>
                <option value="특채">특채 (Concession)</option>
              </select>
              <label style={styles.label}>상세 사유</label>
              <textarea
                rows="3"
                placeholder={
                  defectAction === "정상 복구" || defectAction === "검사 대기"
                    ? "상세 사유를 입력하세요 (예: 수리 완료, 재검사 요청 등)"
                    : selectedProduct.testStatus === "FAIL"
                      ? "부적합 사유를 입력하세요"
                      : "불량 사유를 입력하세요"
                }
                style={styles.textarea}
              ></textarea>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>
                취소
              </button>
              <button onClick={handleSaveDefect} style={styles.saveBtn}>
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 68, 68, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); } }`}
      </style>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#F4F6F9",
    minHeight: "100vh",
    fontFamily: "'Noto Sans KR', sans-serif",
  },
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
    flexShrink: 0,
  },
  kpiLabel: { margin: "0 0 5px 0", fontSize: "13px", color: "#888" },
  kpiValue: { margin: 0, fontSize: "24px", fontWeight: "bold", color: "#333" },
  kpiUnit: { fontSize: "14px", fontWeight: "normal", color: "#aaa" },

  // Chart Section Styles
  chartSection: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "25px",
    marginBottom: "30px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { fontSize: "24px", fontWeight: "bold", color: "#333", margin: 0 },
  controls: { display: "flex", gap: "15px", alignItems: "center" },
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
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    position: "relative",
    transition: "all 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    alignItems: "center",
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
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s",
  },
  modelName: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
    color: "#333",
  },
  serialText: { fontSize: "13px", color: "#888", margin: "0 0 25px 0" },
  operatorText: { color: "#aaa", marginLeft: "5px" },
  statusBadgePass: {
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  statusBadgeFail: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  statusBadgePending: {
    backgroundColor: "#FFF3E0",
    color: "#EF6C00",
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
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

export default ProductMgmt;
