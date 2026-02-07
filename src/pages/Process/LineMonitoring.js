import client from "../../api/client";
import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaHeartbeat,
  FaSearch,
  FaClipboardList,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaTools,
  FaPauseCircle,
  FaMedkit,
  FaStethoscope,
} from "react-icons/fa";

const THEME_COLOR = "#8C85FF";

const PROCESS_STEPS = [
  "광학 본딩",
  "조립",
  "에이징 테스트",
  "캘리브레이션",
  "신뢰성 테스트",
];

// 제품군 정의 (3종)
const PRODUCT_DEFINITIONS = [
  {
    id: 0,
    model: "Zoll X Series",
    category: "Defibrillator",
    prefix: "ZXS",
    icon: <FaHeartbeat size={11} style={{ marginRight: 3 }} />,
  },
  {
    id: 1,
    model: "Propaq M",
    category: "Transport Monitor",
    prefix: "PQM",
    icon: <FaMedkit size={11} style={{ marginRight: 3 }} />,
  },
  {
    id: 2,
    model: "Corpuls3",
    category: "Modular Monitor",
    prefix: "CPS",
    icon: <FaStethoscope size={11} style={{ marginRight: 3 }} />,
  },
];

const ISSUE_TYPES = {
  NG: {
    label: "품질 불량 (NG)",
    color: "#FF4444",
    icon: <FaTimes />,
    reasons: ["치수 불량", "스크래치/파손", "기능 동작 실패", "이물질 혼입"],
  },
  HOLD: {
    label: "공정 보류 (Holding)",
    color: "#FF9800",
    icon: <FaPauseCircle />,
    reasons: [
      "자재 부족 (Shortage)",
      "품질 재확인 대기",
      "작업 지시 대기",
      "도면 불일치",
    ],
  },
  ERROR: {
    label: "설비 이상 (Machine Error)",
    color: "#9C27B0",
    icon: <FaTools />,
    reasons: ["센서 오작동", "전원/통신 불안정", "모터 과부하", "공압 이상"],
  },
};

const LineMonitoring = () => {
  const [products, setProducts] = useState([]);
  const [filterLine, setFilterLine] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [reportType, setReportType] = useState("NG");
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProducts = async () => {
    try {
      const response = await client.get("/production/product-mgmt");
      if (response.ok) {
        const data = response.data;

        const unifiedData = data.map((item, index) => {
          // 1. 공정 단계 분산 (1~5단계)
          const artificialStep = (item.id % 5) + 1;

          let prodInfo;

          // 조건 1: 신뢰성 테스트(Step 5)는 무조건 'Corpuls3' (QC 라인)
          if (artificialStep === 5) {
            prodInfo = PRODUCT_DEFINITIONS[2]; // Corpuls3
          }
          // 조건 2: 짝수 ID는 생산 2라인 -> 무조건 'Zoll X Series'
          else if (item.id % 2 === 0) {
            prodInfo = PRODUCT_DEFINITIONS[0]; // Zoll X Series
          }
          // 조건 3: 홀수 ID는 생산 1라인 -> 무조건 'Propaq M'
          else {
            prodInfo = PRODUCT_DEFINITIONS[1]; // Propaq M
          }

          return {
            ...item,
            category: prodInfo.category,
            model: prodInfo.model,
            serial: `${prodInfo.prefix}-2602-${String(item.id).padStart(4, "0")}`,
            productIcon: prodInfo.icon,
            step: artificialStep,
          };
        });

        setProducts(unifiedData.sort((a, b) => b.id - a.id));
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

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, searchTerm, filterLine]);

  const handleSaveIssue = async () => {
    if (!selectedProduct) return;

    let newStatus = reportType;
    if (reportType === "PASS") newStatus = "PASS";

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
        alert(
          `[${ISSUE_TYPES[reportType]?.label || "조치"}] 처리가 완료되었습니다.`,
        );
        closeModal();
        fetchProducts();
      } else {
        alert("저장 실패");
      }
    } catch (error) {
      console.error("저장 중 에러", error);
    }
  };

  const getCurrentLineInfo = (product) => {
    const stepIndex = product.step - 1;
    // Step 3, 4, 5는 QC 라인으로 간주
    if (stepIndex >= 2) {
      return { name: "QC 라인", color: "#FF9800" };
    }

    // Step 1, 2는 생산 라인 (ID 홀짝으로 구분)
    const lineNum = product.id % 2 !== 0 ? 1 : 2;
    return { name: `생산 ${lineNum}라인`, color: THEME_COLOR };
  };

  const filteredProducts = products.filter((p) => {
    const lineInfo = getCurrentLineInfo(p);
    let matchLine = true;

    if (filterLine === "Line1") matchLine = lineInfo.name === "생산 1라인";
    else if (filterLine === "Line2") matchLine = lineInfo.name === "생산 2라인";
    else if (filterLine === "QC") matchLine = lineInfo.name === "QC 라인";

    const matchCategory =
      filterCategory === "All" ||
      p.category === filterCategory ||
      p.model === filterCategory;

    const matchSearch =
      p.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.model.toLowerCase().includes(searchTerm.toLowerCase());

    return matchLine && matchCategory && matchSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const openModal = (product) => {
    setSelectedProduct(product);
    if (product.testStatus === "PASS" || product.testStatus === "PENDING") {
      setReportType("NG");
    } else {
      setReportType(product.testStatus);
    }
    setReportReason(ISSUE_TYPES["NG"].reasons[0]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const renderTestStatus = (status) => {
    switch (status) {
      case "FAIL":
      case "NG":
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: "#FFEBEE",
              color: "#C62828",
            }}
          >
            <FaTimes size={11} /> 품질 불량
          </span>
        );
      case "HOLD":
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: "#FFF3E0",
              color: "#EF6C00",
            }}
          >
            <FaPauseCircle size={11} /> 공정 보류
          </span>
        );
      case "ERROR":
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: "#F3E5F5",
              color: "#7B1FA2",
            }}
          >
            <FaTools size={11} /> 설비 이상
          </span>
        );
      case "PASS":
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: "#E8F5E9",
              color: "#2E7D32",
            }}
          >
            <FaCheckCircle size={11} /> 적합
          </span>
        );
      default:
        return (
          <span
            style={{
              ...styles.statusBadge,
              backgroundColor: "#E3F2FD",
              color: "#1565C0",
            }}
          >
            ⏳ 진행중
          </span>
        );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: "200px",
            flexShrink: 0,
          }}
        >
          <FaClipboardList size={22} color={THEME_COLOR} />
          <h2 style={styles.title}>실시간 라인 모니터링</h2>
        </div>

        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <FaSearch color="#aaa" />
            <input
              type="text"
              placeholder="S/N 검색"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={styles.filterContainer}>
            <span style={styles.filterLabel}>라인:</span>
            <select
              style={styles.dropdown}
              value={filterLine}
              onChange={(e) => setFilterLine(e.target.value)}
            >
              <option value="All">전체 라인</option>
              <option value="Line1">생산 1라인</option>
              <option value="Line2">생산 2라인</option>
              <option value="QC">QC 라인</option>
            </select>
          </div>
          <div style={styles.filterContainer}>
            <span style={styles.filterLabel}>장비:</span>
            <select
              style={styles.dropdown}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">전체 보기</option>
              <option value="Defibrillator">Zoll X Series</option>
              <option value="Transport Monitor">Propaq M</option>
              <option value="Modular Monitor">Corpuls3</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {currentProducts.map((product) => {
          const isIssue = ["FAIL", "NG", "HOLD", "ERROR"].includes(
            product.testStatus,
          );
          const lineInfo = getCurrentLineInfo(product);

          return (
            <div
              key={product.id}
              style={{
                ...styles.card,
                border: isIssue ? "2px solid #FF4444" : "1px solid transparent",
                boxShadow: isIssue
                  ? "0 4px 20px rgba(255, 68, 68, 0.15)"
                  : styles.card.boxShadow,
              }}
            >
              <div style={styles.cardHeader}>
                <div
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span style={styles.badge} title={product.category}>
                    {product.productIcon}
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "85px",
                      }}
                    >
                      {product.category}
                    </span>
                  </span>
                  <span
                    style={{
                      ...styles.badge,
                      backgroundColor: lineInfo.color,
                      color: "white",
                      flexShrink: 0,
                    }}
                  >
                    <FaMapMarkerAlt size={11} style={{ marginRight: 3 }} />
                    <span style={{ whiteSpace: "nowrap" }}>
                      {lineInfo.name}
                    </span>
                  </span>
                </div>

                <button
                  style={{
                    ...styles.defectBtn,
                    backgroundColor: isIssue ? "#FF4444" : "#FFEDED",
                    color: isIssue ? "#fff" : "#FF4444",
                    animation: isIssue ? "pulse 1.5s infinite" : "none",
                    boxShadow: isIssue
                      ? "0 2px 10px rgba(255,68,68,0.4)"
                      : "none",
                  }}
                  onClick={() => openModal(product)}
                >
                  <FaExclamationTriangle
                    size={11}
                    style={{ marginRight: "3px" }}
                  />
                  {isIssue ? "조치 필요" : "이슈 등록"}
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
                    const stepColor = index <= 1 ? THEME_COLOR : "#FF9800";
                    const activeColor = isCurrent
                      ? stepColor
                      : isCompleted
                        ? stepColor
                        : "#aaa";

                    return (
                      <div key={index} style={styles.stepItem}>
                        <div
                          style={{
                            ...styles.stepCircle,
                            backgroundColor:
                              product.step >= stepNum ? activeColor : "#eee",
                            color: product.step >= stepNum ? "#fff" : "#aaa",
                            border: isCurrent
                              ? `2px solid ${activeColor}`
                              : "none",
                            boxShadow: isCurrent
                              ? `0 0 0 2px ${activeColor}40`
                              : "none",
                          }}
                        >
                          {isCompleted ? <FaCheckCircle /> : stepNum}
                        </div>
                        <span
                          style={{
                            ...styles.stepLabel,
                            color: isCurrent ? activeColor : "#aaa",
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
                      backgroundColor:
                        product.step - 1 > 1 ? "#FF9800" : THEME_COLOR,
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

      {filteredProducts.length > 0 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft size={12} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              style={
                currentPage === number
                  ? { ...styles.pageBtn, ...styles.activePageBtn }
                  : styles.pageBtn
              }
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
          <button
            style={styles.pageBtn}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FaChevronRight size={12} />
          </button>
        </div>
      )}

      {isModalOpen && selectedProduct && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "18px", color: "#333" }}>
                🚨 현장 이슈 보고 및 조치
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
                <p style={{ margin: "0", fontSize: "13px", color: "#666" }}>
                  S/N: {selectedProduct.serial}
                </p>
              </div>

              <label style={styles.label}>보고 유형 선택</label>
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
              >
                {Object.keys(ISSUE_TYPES).map((type) => {
                  const isSelected = reportType === type;
                  const typeInfo = ISSUE_TYPES[type];
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setReportType(type);
                        setReportReason(typeInfo.reasons[0]);
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 5px",
                        border: isSelected
                          ? `2px solid ${typeInfo.color}`
                          : "1px solid #ddd",
                        backgroundColor: isSelected
                          ? `${typeInfo.color}15`
                          : "#fff",
                        color: isSelected ? typeInfo.color : "#666",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>{typeInfo.icon}</span>
                      {type}
                    </button>
                  );
                })}
              </div>

              <label style={styles.label}>
                세부 사유 ({ISSUE_TYPES[reportType]?.label})
              </label>
              <select
                style={styles.fullWidthDropdown}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                {ISSUE_TYPES[reportType]?.reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              <label style={styles.label}>현장 조치 내용 / 비고</label>
              <textarea
                rows="3"
                placeholder="예) 자재팀 재고 확인 요청함, 설비 재부팅 후 정상 가동 등"
                style={styles.textarea}
                value={reportComment}
                onChange={(e) => setReportComment(e.target.value)}
              ></textarea>

              {["NG", "HOLD", "ERROR", "FAIL"].includes(
                selectedProduct.testStatus,
              ) && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    backgroundColor: "#E8F5E9",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="recover"
                    checked={reportType === "PASS"}
                    onChange={(e) => {
                      if (e.target.checked) setReportType("PASS");
                      else setReportType(selectedProduct.testStatus);
                    }}
                  />
                  <label
                    htmlFor="recover"
                    style={{
                      fontSize: "13px",
                      fontWeight: "bold",
                      color: "#2E7D32",
                      cursor: "pointer",
                    }}
                  >
                    ✅ 조치 완료 및 정상화 (PASS 처리)
                  </label>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={closeModal} style={styles.cancelBtn}>
                취소
              </button>
              <button onClick={handleSaveIssue} style={styles.saveBtn}>
                보고 및 저장
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); } 70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(255, 68, 68, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); } }`}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#F4F6F9",
    minHeight: "100vh",
    fontFamily: "'Noto Sans KR', sans-serif",
    minWidth: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "nowrap",
    gap: "20px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#333",
    margin: 0,
    whiteSpace: "nowrap",
  },
  controls: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "nowrap",
    justifyContent: "flex-end",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    fontSize: "14px",
    width: "160px",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "8px 12px",
    borderRadius: "10px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: "1px solid #eee",
    whiteSpace: "nowrap",
  },
  filterLabel: {
    marginRight: "8px",
    fontWeight: "bold",
    color: "#555",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  dropdown: {
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    padding: 0,
    color: "#333",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
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
    padding: "0 8px",
    height: "26px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  },
  defectBtn: {
    border: "none",
    padding: "0 8px",
    height: "26px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s",
    whiteSpace: "nowrap",
  },
  modelName: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 5px 0",
    color: "#333",
  },
  serialText: { fontSize: "13px", color: "#888", margin: "0 0 25px 0" },
  operatorText: { color: "#aaa", marginLeft: "5px" },
  statusBadge: {
    padding: "0 8px",
    height: "26px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
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
  progressBarFill: { height: "100%", transition: "width 0.3s" },
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
    width: "450px",
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
    fontSize: "13px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "-8px",
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
    marginTop: "20px",
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
  pagination: {
    display: "flex",
    justifyContent: "center",
    marginTop: "40px",
    gap: "8px",
  },
  pageBtn: {
    width: "32px",
    height: "32px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#666",
    transition: "all 0.2s",
  },
  activePageBtn: {
    backgroundColor: THEME_COLOR,
    color: "#fff",
    border: "none",
    fontWeight: "bold",
  },
};

export default LineMonitoring;
