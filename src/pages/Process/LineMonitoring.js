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
  FaRecycle,
  FaTrashAlt,
  FaUndo,
  FaMicroscope,
} from "react-icons/fa";

// 🎨 디자인 테마
const THEME_COLOR = "#8C85FF";

// 공정 단계 (총 5단계)
const PROCESS_STEPS = [
  "광학 본딩", // 1
  "조립", // 2
  "에이징 테스트", // 3
  "캘리브레이션", // 4
  "신뢰성 테스트", // 5 (완료 기준)
];

// 우리 회사 품목 리스트
const OUR_PRODUCTS = ["Zoll X Series", "Propaq M", "Corpuls3"];

// 1. [이슈 등록용] - 정상일 때 뜸
const ISSUE_TYPES = {
  NG: {
    label: "품질 불량 (NG)",
    color: "#FF4444",
    icon: <FaTimes />,
    reasons: [
      "치수 불량",
      "스크래치/파손",
      "기능 동작 실패",
      "이물질 혼입",
      "기타",
    ],
  },
  HOLD: {
    label: "공정 보류 (Holding)",
    color: "#FF9800",
    icon: <FaPauseCircle />,
    reasons: [
      "자재 부족",
      "품질 재확인 대기",
      "작업 지시 대기",
      "도면 불일치",
      "기타",
    ],
  },
  ERROR: {
    label: "설비 이상 (Machine Error)",
    color: "#9C27B0",
    icon: <FaTools />,
    reasons: [
      "센서 오작동",
      "전원/통신 불안정",
      "모터 과부하",
      "공압 이상",
      "기타",
    ],
  },
};

// 2. [조치 필요용] - 이미 불량일 때 뜸
const ACTION_TYPES = {
  REWORK: {
    label: "재작업 (Rework)",
    color: "#2196F3",
    icon: <FaRecycle />,
    reasons: [
      "부품 교체 후 재조립",
      "이물 세척",
      "S/W 재설치",
      "단순 재조립",
      "기타",
    ],
  },
  DISCARD: {
    label: "폐기 (Scrap)",
    color: "#D32F2F",
    icon: <FaTrashAlt />,
    reasons: ["핵심 부품 파손", "회로 소손", "복구 불가 판정", "기타"],
  },
  RETURN: {
    label: "반품 (Return)",
    color: "#FF9800",
    icon: <FaUndo />,
    reasons: ["자재 입고 불량", "업체 귀책", "사양 불일치", "기타"],
  },
  REINSPECT: {
    label: "재검사 (Re-inspect)",
    color: "#009688",
    icon: <FaMicroscope />,
    reasons: ["오판정 의심", "규격 재확인", "육안 정밀 검사", "기타"],
  },
};

const LineMonitoring = () => {
  const [products, setProducts] = useState([]);

  const [filterLine, setFilterLine] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [reportType, setReportType] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [reportComment, setReportComment] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchProducts = async () => {
    try {
      const response = await client.get("/production/product-mgmt");
      if (response.ok) {
        const data = response.data;
        const filteredData = data.filter((item) =>
          OUR_PRODUCTS.includes(item.model),
        );

        const unifiedData = filteredData.map((item) => {
          let icon = <FaHeartbeat size={14} />;
          let category = "Device";
          if (item.model === "Zoll X Series") {
            category = "Defibrillator";
            icon = <FaHeartbeat size={14} />;
          } else if (item.model === "Propaq M") {
            category = "Transport Monitor";
            icon = <FaMedkit size={14} />;
          } else if (item.model === "Corpuls3") {
            category = "Modular Monitor";
            icon = <FaStethoscope size={14} />;
          }

          const step = item.step || Math.floor(Math.random() * 5) + 1;
          let lineName = "Lab";
          if (step <= 2) {
            lineName = item.id % 2 !== 0 ? 'AREX #1 (18")' : 'AREX #2 (24")';
          } else {
            lineName = "Lab";
          }

          // 데이터 위생 처리 (모든 제품에 적용)
          let currentStatus = item.testStatus || "IN_PROGRESS";

          // 1. PENDING은 무조건 IN_PROGRESS로
          if (currentStatus === "PENDING") {
            currentStatus = "IN_PROGRESS";
          }

          // 2. PASS(적합) 상태지만, 아직 5단계(신뢰성 테스트)가 아니면 IN_PROGRESS로 강제 변경
          // (Zoll X Series가 3단계에서 적합으로 뜨는 문제 해결)
          if (currentStatus === "PASS" && step < 5) {
            currentStatus = "IN_PROGRESS";
          }

          return {
            id: item.id,
            model: item.model,
            category: category,
            serial: item.serial || item.productCode || `WO-${item.id}`,
            step: step,
            operator: item.worker || "미배정",
            testStatus: currentStatus,
            productIcon: icon,
            lineName: lineName,
          };
        });

        const specialItem1 = {
          id: 9991,
          model: "Propaq M",
          category: "Transport Monitor",
          serial: "PRO-TEST-001",
          step: 3,
          operator: "김민수",
          testStatus: "IN_PROGRESS",
          productIcon: <FaMedkit size={14} />,
          lineName: 'AREX #2 (24")',
        };

        const specialItem2 = {
          id: 9992,
          model: "Zoll X Series",
          category: "Defibrillator",
          serial: "ZOLL-RND-99",
          step: 5,
          operator: "박팀장",
          testStatus: "HOLD",
          productIcon: <FaHeartbeat size={14} />,
          lineName: "OFFICE",
        };

        const finalData = [...unifiedData, specialItem1, specialItem2];
        setProducts(finalData.sort((a, b) => b.id - a.id));
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

  const getLineColor = (lineName) => {
    switch (lineName) {
      case 'AREX #1 (18")':
        return THEME_COLOR;
      case 'AREX #2 (24")':
        return THEME_COLOR;
      case "Lab":
        return "#FF9800";
      case "OFFICE":
        return "#607D8B";
      default:
        return "#999";
    }
  };

  const filteredProducts = products.filter((p) => {
    let matchLine = true;
    if (filterLine !== "All") matchLine = p.lineName === filterLine;
    let matchCategory = true;
    if (filterCategory !== "All") matchCategory = p.model === filterCategory;
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

  // 상태에 따라 모드(이슈등록 vs 조치) 결정
  const openModal = (product) => {
    setSelectedProduct(product);
    setReportComment("");

    // 이슈 여부 확인 (PASS나 IN_PROGRESS가 아니면 이슈임)
    const isIssue = ["NG", "HOLD", "ERROR", "FAIL"].includes(
      product.testStatus,
    );

    if (isIssue) {
      // 이미 불량 -> 조치(Action) 모드
      setReportType("REWORK");
      setReportReason(ACTION_TYPES["REWORK"].reasons[0]);
    } else {
      // 정상 -> 이슈 등록(Issue) 모드
      setReportType("NG");
      setReportReason(ISSUE_TYPES["NG"].reasons[0]);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // 조치 완료 시 공정 단계 확인
  const handleSaveIssue = async () => {
    if (!selectedProduct) return;

    let finalStatus = reportType;
    let label = "";

    // 1. 조치 완료(PASS) 체크 시
    if (reportType === "PASS") {
      // 마지막 단계(5단계)여야만 "적합"
      // 그 외에는 이슈가 해결되었으므로 다시 "진행중(IN_PROGRESS)"으로 복귀
      if (selectedProduct.step >= PROCESS_STEPS.length) {
        finalStatus = "PASS";
        label = "최종 적합 판정 완료";
      } else {
        finalStatus = "IN_PROGRESS";
        label = "조치 완료 및 공정 재개";
      }
    } else {
      // 일반 이슈/조치 상태 변경
      const currentTypes = getCurrentModalTypes();
      label = currentTypes[reportType]?.label || reportType;
    }

    // API 호출

    alert(`[${label.split("(")[0]}] 처리가 완료되었습니다.`);

    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id ? { ...p, testStatus: finalStatus } : p,
    );
    setProducts(updatedProducts);
    closeModal();
  };

  const getCurrentModalTypes = () => {
    if (!selectedProduct) return ISSUE_TYPES;

    const isIssue = ["NG", "HOLD", "ERROR", "FAIL"].includes(
      selectedProduct.testStatus,
    );
    return isIssue ? ACTION_TYPES : ISSUE_TYPES;
  };

  const renderStatusBadge = (status) => {
    let bg = "#E3F2FD",
      color = "#1565C0",
      text = "진행중",
      icon = <FaPauseCircle size={10} />;

    if (["FAIL", "NG"].includes(status)) {
      bg = "#FFEBEE";
      color = "#C62828";
      text = "품질 불량";
      icon = <FaTimes size={10} />;
    } else if (["HOLD", "PENDING"].includes(status)) {
      bg = "#FFF3E0";
      color = "#EF6C00";
      text = "공정 보류";
      icon = <FaPauseCircle size={10} />;
    } else if (["ERROR"].includes(status)) {
      bg = "#F3E5F5";
      color = "#7B1FA2";
      text = "설비 이상";
      icon = <FaTools size={10} />;
    } else if (status === "REWORK") {
      bg = "#E3F2FD";
      color = "#1976D2";
      text = "재작업 중";
      icon = <FaRecycle size={10} />;
    } else if (status === "DISCARD") {
      bg = "#FFEBEE";
      color = "#B71C1C";
      text = "폐기 확정";
      icon = <FaTrashAlt size={10} />;
    } else if (status === "RETURN") {
      bg = "#FFF3E0";
      color = "#E65100";
      text = "반품 처리";
      icon = <FaUndo size={10} />;
    } else if (status === "REINSPECT") {
      bg = "#E0F2F1";
      color = "#00695C";
      text = "재검사 중";
      icon = <FaMicroscope size={10} />;
    } else if (["PASS", "COMPLETED"].includes(status)) {
      bg = "#E8F5E9";
      color = "#2E7D32";
      text = "적합";
      icon = <FaCheckCircle size={10} />;
    }

    return (
      <span
        style={{
          backgroundColor: bg,
          color: color,
          padding: "4px 8px",
          borderRadius: "6px",
          fontSize: "11px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {icon} {text}
      </span>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaClipboardList size={22} color={THEME_COLOR} />
          <h2 style={styles.title}>실시간 라인 모니터링</h2>
        </div>

        <div style={styles.controls}>
          <div style={styles.searchBox}>
            <FaSearch color="#aaa" />
            <input
              type="text"
              placeholder="지시코드/모델명 검색"
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
              <option value='AREX #1 (18")'>AREX #1 (18")</option>
              <option value='AREX #2 (24")'>AREX #2 (24")</option>
              <option value="Lab">Lab</option>
              <option value="OFFICE">OFFICE</option>
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
              <option value="Zoll X Series">Zoll X Series</option>
              <option value="Propaq M">Propaq M</option>
              <option value="Corpuls3">Corpuls3</option>
            </select>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {currentProducts.map((product) => {
          const lineColor = getLineColor(product.lineName);
          const isIssue = ["FAIL", "NG", "HOLD", "ERROR"].includes(
            product.testStatus,
          );

          return (
            <div
              key={product.id}
              style={{
                ...styles.card,
                border: isIssue ? "2px solid #FF4444" : "1px solid transparent",
                animation: isIssue ? "cardPulse 2s infinite" : "none",
                boxShadow: isIssue
                  ? "0 0 15px rgba(255, 68, 68, 0.3)"
                  : styles.card.boxShadow,
              }}
            >
              <div style={styles.cardTopRow}>
                <div style={styles.categoryBadge}>
                  {product.productIcon}
                  {product.category}
                </div>

                <div
                  style={{ ...styles.lineBadge, backgroundColor: lineColor }}
                >
                  <FaMapMarkerAlt size={9} />
                  {product.lineName}
                </div>

                <button
                  style={{
                    ...styles.defectBtn,
                    backgroundColor: isIssue ? "#FF4444" : "#FFEDED",
                    color: isIssue ? "#fff" : "#FF4444",
                    border: isIssue ? "none" : "1px solid #FFEBEE",
                    animation: isIssue ? "pulse 1.5s infinite" : "none",
                    boxShadow: isIssue
                      ? "0 2px 10px rgba(255,68,68,0.4)"
                      : "none",
                  }}
                  onClick={() => openModal(product)}
                >
                  <FaExclamationTriangle
                    size={11}
                    style={{ marginRight: "4px" }}
                  />
                  {isIssue ? "조치 필요" : "이슈 등록"}
                </button>
              </div>

              <div
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={styles.modelName}>{product.model}</h3>
                  <div style={styles.subInfo}>
                    Code:{" "}
                    <span style={{ color: "#333", fontWeight: "600" }}>
                      {product.serial}
                    </span>
                    <span style={{ margin: "0 6px", color: "#ddd" }}>|</span>
                    Op:{" "}
                    <span style={{ color: "#555" }}>{product.operator}</span>
                  </div>
                </div>
                {renderStatusBadge(product.testStatus)}
              </div>

              <div style={styles.progressWrapper}>
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "25px",
                    right: "25px",
                    height: "2px",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#F0F0F0",
                    }}
                  ></div>
                  <div
                    style={{
                      position: "absolute",
                      height: "100%",
                      backgroundColor: lineColor,
                      width: `${((product.step - 1) / (PROCESS_STEPS.length - 1)) * 100}%`,
                      transition: "width 0.3s",
                    }}
                  ></div>
                </div>

                <div style={styles.stepsContainer}>
                  {PROCESS_STEPS.map((stepName, idx) => {
                    const stepNum = idx + 1;
                    const isActive = product.step >= stepNum;
                    const isCurrent = product.step === stepNum;

                    return (
                      <div key={idx} style={styles.stepItem}>
                        <div
                          style={{
                            ...styles.stepCircle,
                            backgroundColor: isActive ? lineColor : "#F0F0F0",
                            color: isActive ? "#fff" : "#ccc",
                            boxShadow: isCurrent
                              ? `0 0 0 3px ${lineColor}30`
                              : "none",
                          }}
                        >
                          {isActive && !isCurrent ? (
                            <FaCheckCircle size={10} />
                          ) : (
                            stepNum
                          )}
                        </div>
                        <div
                          style={{
                            ...styles.stepText,
                            color: isCurrent ? lineColor : "#aaa",
                            fontWeight: isCurrent ? "bold" : "normal",
                          }}
                        >
                          {stepName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div style={styles.emptyState}>데이터가 없습니다.</div>
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
          <span
            style={{
              fontSize: "13px",
              color: "#666",
              fontWeight: "600",
              alignSelf: "center",
              margin: "0 10px",
            }}
          >
            Page {currentPage} / {totalPages}
          </span>
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
                {["NG", "HOLD", "ERROR", "FAIL"].includes(
                  selectedProduct.testStatus,
                )
                  ? "🚨 불량 조치 및 처리 (Action)"
                  : "⚠️ 현장 이슈 등록 (Issue)"}
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

              <label style={styles.label}>
                {["NG", "HOLD", "ERROR", "FAIL"].includes(
                  selectedProduct.testStatus,
                )
                  ? "조치 방법 선택"
                  : "이슈 유형 선택"}
              </label>

              <div
                style={{ display: "flex", gap: "10px", marginBottom: "15px" }}
              >
                {Object.keys(getCurrentModalTypes()).map((type) => {
                  const currentTypes = getCurrentModalTypes();
                  const isSelected = reportType === type;
                  const typeInfo = currentTypes[type];
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
                      {typeInfo.label.split(" (")[0]}
                    </button>
                  );
                })}
              </div>

              <label style={styles.label}>
                세부 사유 ({getCurrentModalTypes()[reportType]?.label})
              </label>
              <select
                style={styles.fullWidthDropdown}
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                {getCurrentModalTypes()[reportType]?.reasons?.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>

              <label style={styles.label}>상세 내용 / 비고</label>
              <textarea
                rows="3"
                placeholder="상세 사유를 입력하세요."
                style={styles.textarea}
                value={reportComment}
                onChange={(e) => setReportComment(e.target.value)}
              ></textarea>

              {/* 불량 상태일 때만 PASS 체크박스 표시 */}
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
                      else {
                        setReportType("REWORK");
                        setReportReason(ACTION_TYPES["REWORK"].reasons[0]);
                      }
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
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7); } 
            70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(255, 68, 68, 0); } 
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); } 
        }
        @keyframes cardPulse { 
            0% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.4); border-color: rgba(255, 68, 68, 1); } 
            70% { box-shadow: 0 0 0 12px rgba(255, 68, 68, 0); border-color: rgba(255, 68, 68, 0.5); } 
            100% { box-shadow: 0 0 0 0 rgba(255, 68, 68, 0); border-color: rgba(255, 68, 68, 1); } 
        }
      `}</style>
    </div>
  );
};

// 스타일
const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#F4F6F9",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  title: { fontSize: "20px", fontWeight: "800", color: "#333", margin: 0 },
  controls: { display: "flex", gap: "12px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "0 15px",
    borderRadius: "8px",
    border: "1px solid #E0E0E0",
    height: "38px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    fontSize: "13px",
    width: "180px",
  },
  filterContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "0 15px",
    borderRadius: "8px",
    border: "1px solid #E0E0E0",
    height: "38px",
  },
  filterLabel: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#555",
    marginRight: "8px",
  },
  dropdown: {
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#333",
    cursor: "pointer",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },

  categoryBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    fontWeight: "bold",
    color: THEME_COLOR,
  },
  lineBadge: {
    color: "#fff",
    fontSize: "10px",
    padding: "4px 8px",
    borderRadius: "20px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },

  defectBtn: {
    fontSize: "11px",
    padding: "5px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s",
  },

  modelName: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#333",
    margin: "0 0 6px 0",
  },
  subInfo: { fontSize: "12px", color: "#888" },

  progressWrapper: {
    position: "relative",
    marginTop: "auto",
    paddingTop: "10px",
  },
  stepsContainer: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2,
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "50px",
  },
  stepCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "bold",
    marginBottom: "6px",
    backgroundColor: "#fff",
    border: "2px solid #fff",
  },
  stepText: { fontSize: "9px", textAlign: "center", whiteSpace: "nowrap" },

  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px",
    color: "#ccc",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    marginTop: "30px",
    gap: "5px",
  },
  pageBtn: {
    width: "32px",
    height: "32px",
    border: "1px solid #eee",
    backgroundColor: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#555",
  },

  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    width: "450px",
    padding: "25px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  closeBtn: {
    border: "none",
    background: "none",
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
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    marginTop: "20px",
  },
  saveBtn: {
    backgroundColor: THEME_COLOR,
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    backgroundColor: "#fff",
    color: "#666",
    border: "1px solid #ddd",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default LineMonitoring;
