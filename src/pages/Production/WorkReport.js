import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaIndustry,
  FaSave,
  FaHistory,
  FaClock,
  FaMagic,
  FaCommentDots,
} from "react-icons/fa";

const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#888",
  danger: "#FF5252",
  success: "#00C851",
  warning: "#FF9800",
  border: "#E0E0E0",
  info: "#29B6F6",
};

const WorkReport = () => {
  // 상태 관리
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);

  // 입력 폼 상태
  const [inputs, setInputs] = useState({
    goodQty: "",
    badQty: "",
    badReason: "def-01",
    shortfallReason: "",
    memo: "",
    isShiftEnd: false,
  });

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 📝 4개 카드 복구
  const [workOrders, setWorkOrders] = useState([
    {
      id: "WO-260120-A01",
      line: "Line-A (Clean Room)",
      product: "Zoll X Series",
      targetQty: 500,
      currentQty: 400, // 80%
      status: "RUNNING",
      manager: "김반장",
    },
    {
      id: "WO-260120-B02",
      line: "Line-B (Assy)",
      product: "Propaq M",
      targetQty: 1000,
      currentQty: 950, // 95%
      status: "RUNNING",
      manager: "이조립",
    },
    {
      id: "WO-260120-C03",
      line: "Line-C (Packing)",
      product: "Corpuls3",
      targetQty: 2000,
      currentQty: 200, // 10%
      status: "PAUSED",
      manager: "최포장",
    },
    {
      id: "WO-260120-D04",
      line: "Line-D (Inspection)",
      product: "Propaq M",
      targetQty: 1500,
      currentQty: 75, // 5%
      status: "PAUSED",
      manager: "박검사",
    },
  ]);

  const [reportHistory, setReportHistory] = useState([]);

  // 로직 함수

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setInputs({
      goodQty: "",
      badQty: "",
      badReason: "def-01",
      shortfallReason: "",
      memo: "",
      isShiftEnd: false,
    });
  };

  const handleFillRemaining = () => {
    if (!selectedOrder) return;
    const remaining = selectedOrder.targetQty - selectedOrder.currentQty;
    if (remaining > 0) {
      setInputs({ ...inputs, goodQty: remaining.toString() });
    }
  };

  const handleSubmit = () => {
    if (!selectedOrder) return;

    const addGood = Number(inputs.goodQty) || 0;
    const addBad = Number(inputs.badQty) || 0;
    const totalAdd = addGood + addBad;

    if (totalAdd === 0 && !inputs.isShiftEnd) {
      return alert("수량을 입력하거나 작업을 종료해주세요.");
    }

    const newTotalQty = selectedOrder.currentQty + totalAdd;
    const isShortfall = newTotalQty < selectedOrder.targetQty;

    if (inputs.isShiftEnd && isShortfall && !inputs.shortfallReason.trim()) {
      return alert("⚠️ 목표 수량 미달입니다. 미달 사유를 반드시 입력해주세요!");
    }

    const updatedOrders = workOrders.map((ord) => {
      if (ord.id === selectedOrder.id) {
        return {
          ...ord,
          currentQty: newTotalQty,
          status: inputs.isShiftEnd ? "COMPLETED" : ord.status,
        };
      }
      return ord;
    });
    setWorkOrders(updatedOrders);

    const newReport = {
      id: Date.now(),
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      orderId: selectedOrder.id,
      product: selectedOrder.product,
      addedGood: addGood,
      addedBad: addBad,
      totalResult: `${newTotalQty} / ${selectedOrder.targetQty}`,
      note: inputs.isShiftEnd
        ? isShortfall
          ? `미달: ${inputs.shortfallReason}`
          : "작업 완료"
        : inputs.memo
          ? inputs.memo
          : "중간 보고",
    };
    setReportHistory([newReport, ...reportHistory]);

    alert("✅ 실적이 보고되었습니다.");

    setInputs({
      goodQty: "",
      badQty: "",
      badReason: "def-01",
      shortfallReason: "",
      memo: "",
      isShiftEnd: false,
    });
  };

  const calculatePrediction = () => {
    if (!selectedOrder) return 0;
    const current = selectedOrder.currentQty;
    const adding = (Number(inputs.goodQty) || 0) + (Number(inputs.badQty) || 0);
    const target = selectedOrder.targetQty;
    return Math.min(((current + adding) / target) * 100, 100);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 생산 실적 보고 (MES)</h2>
          <p style={styles.subtitle}>
            현장 작업 지시별 실적 등록 및 특이사항 보고
          </p>
        </div>
        <div style={styles.clockBox}>
          <FaClock style={{ marginRight: "8px" }} />
          {currentTime.toLocaleString()}
        </div>
      </div>

      <div style={styles.layout}>
        {/* [좌측] 작업 지시 리스트 */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <FaClipboardList /> 금일 작업 지시 목록
          </div>
          <div style={styles.orderList}>
            {workOrders.map((order) => {
              const progress = Math.min(
                (order.currentQty / order.targetQty) * 100,
                100,
              );
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  style={{
                    ...styles.orderCard,
                    border: isSelected
                      ? `2px solid ${COLORS.primary}`
                      : `1px solid ${COLORS.border}`,
                    backgroundColor: isSelected ? "#F3F1FF" : "white",
                  }}
                >
                  <div style={styles.cardTop}>
                    <span style={styles.lineBadge}>{order.line}</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          order.status === "RUNNING"
                            ? COLORS.success
                            : order.status === "COMPLETED"
                              ? COLORS.primary
                              : COLORS.warning,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div style={styles.productName}>{order.product}</div>
                  <div style={styles.orderId}>{order.id}</div>

                  <div style={styles.progressContainer}>
                    <div style={styles.progressInfo}>
                      <span>
                        달성률: <strong>{Math.round(progress)}%</strong>
                      </span>
                      <span>
                        {order.currentQty} / {order.targetQty} ea
                      </span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div
                        style={{
                          ...styles.progressBarFill,
                          width: `${progress}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* [우측] 입력 폼 및 이력 */}
        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>📝 실적 등록 및 종료</h3>

            {selectedOrder ? (
              <>
                <div style={styles.infoSummary}>
                  <div>
                    <strong>지시번호:</strong> {selectedOrder.id}
                  </div>
                  <div>
                    <strong>제품명:</strong> {selectedOrder.product}
                  </div>
                  <div>
                    <strong>현재 누적:</strong> {selectedOrder.currentQty} ea
                  </div>
                </div>

                {/* 예측 시뮬레이션 바 */}
                <div style={styles.predictionBox}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "5px",
                    }}
                  >
                    <span>실적 반영 예측</span>
                    <span style={{ fontWeight: "bold", color: COLORS.primary }}>
                      {Math.round(calculatePrediction())}%
                    </span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${(selectedOrder.currentQty / selectedOrder.targetQty) * 100}%`,
                      }}
                    ></div>
                    <div
                      style={{
                        ...styles.predictionFill,
                        left: `${(selectedOrder.currentQty / selectedOrder.targetQty) * 100}%`,
                        width: `${((Number(inputs.goodQty) + Number(inputs.badQty)) / selectedOrder.targetQty) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div style={styles.inputGrid}>
                  <div style={styles.inputGroup}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "5px",
                      }}
                    >
                      <label style={styles.label}>양품 수량</label>
                      <button
                        onClick={handleFillRemaining}
                        style={styles.smallBtn}
                        title="남은 수량 자동 입력"
                      >
                        <FaMagic style={{ marginRight: "3px" }} /> 잔량
                      </button>
                    </div>
                    <input
                      type="number"
                      style={styles.input}
                      placeholder="0"
                      value={inputs.goodQty}
                      onChange={(e) =>
                        setInputs({ ...inputs, goodQty: e.target.value })
                      }
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label
                      style={{
                        ...styles.label,
                        color: COLORS.danger,
                        marginBottom: "5px",
                        marginTop: "6px",
                      }}
                    >
                      불량 수량
                    </label>
                    <input
                      type="number"
                      style={styles.input}
                      placeholder="0"
                      value={inputs.badQty}
                      onChange={(e) =>
                        setInputs({ ...inputs, badQty: e.target.value })
                      }
                    />
                  </div>
                </div>

                {Number(inputs.badQty) > 0 && (
                  <div style={{ marginTop: "15px" }}>
                    <label style={styles.label}>불량 사유 선택</label>
                    <select
                      style={styles.select}
                      value={inputs.badReason}
                      onChange={(e) =>
                        setInputs({ ...inputs, badReason: e.target.value })
                      }
                    >
                      <option value="def-01">스크래치/찍힘</option>
                      <option value="def-02">치수 불량</option>
                      <option value="def-03">조립 불량</option>
                      <option value="def-04">이물질 오염</option>
                    </select>
                  </div>
                )}

                <div style={{ marginTop: "15px" }}>
                  <label style={styles.label}>
                    <FaCommentDots style={{ marginRight: "5px" }} />
                    특이사항 메모
                  </label>
                  <input
                    type="text"
                    style={styles.textInput}
                    placeholder="예: 설비 소음 발생, 자재 박스 교체 등"
                    value={inputs.memo}
                    onChange={(e) =>
                      setInputs({ ...inputs, memo: e.target.value })
                    }
                  />
                </div>

                <div style={styles.divider}></div>

                <div style={styles.checkSection}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={inputs.isShiftEnd}
                      onChange={(e) =>
                        setInputs({ ...inputs, isShiftEnd: e.target.checked })
                      }
                      style={{ marginRight: "10px", transform: "scale(1.2)" }}
                    />
                    금일 작업(교대) 종료 또는 지시 완료
                  </label>
                </div>

                {inputs.isShiftEnd &&
                  selectedOrder.currentQty +
                    Number(inputs.goodQty) +
                    Number(inputs.badQty) <
                    selectedOrder.targetQty && (
                    <div style={styles.warningBox}>
                      <div style={styles.warningTitle}>
                        <FaExclamationTriangle /> 목표 수량 미달 (Shortfall)
                      </div>
                      <p style={styles.warningText}>
                        목표({selectedOrder.targetQty}) 대비 부족합니다. 사유를
                        입력하세요.
                      </p>
                      <textarea
                        style={styles.textarea}
                        placeholder="예: 자재 부족, 설비 고장 등..."
                        value={inputs.shortfallReason}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            shortfallReason: e.target.value,
                          })
                        }
                      />
                    </div>
                  )}

                <button onClick={handleSubmit} style={styles.submitBtn}>
                  <FaSave /> 실적 보고 및 저장
                </button>
              </>
            ) : (
              <div style={styles.emptyState}>
                <FaIndustry size={40} color="#ddd" />
                <p>좌측 목록에서 작업할 지시를 선택해주세요.</p>
              </div>
            )}
          </div>

          <div style={styles.historyCard}>
            <div style={styles.panelHeader}>
              <FaHistory /> 금일 실적 보고 내역
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={styles.th}>시간</th>
                    <th style={styles.th}>지시번호</th>
                    <th style={styles.th}>양품/불량</th>
                    <th style={styles.th}>누적</th>
                    <th style={styles.th}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          ...styles.td,
                          textAlign: "center",
                          color: "#999",
                          padding: "30px",
                        }}
                      >
                        보고된 이력이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    reportHistory.map((log) => (
                      <tr key={log.id}>
                        <td style={styles.td}>{log.time}</td>
                        <td style={styles.td}>{log.orderId}</td>
                        <td style={styles.td}>
                          <span style={{ color: COLORS.success }}>
                            +{log.addedGood}
                          </span>{" "}
                          /{" "}
                          <span style={{ color: COLORS.danger }}>
                            +{log.addedBad}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontWeight: "bold" }}>
                          {log.totalResult}
                        </td>
                        <td style={styles.td}>{log.note}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: COLORS.bg,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexShrink: 0,
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: COLORS.text,
    margin: 0,
  },
  subtitle: { fontSize: "13px", color: COLORS.gray, marginTop: "5px" },
  clockBox: {
    backgroundColor: COLORS.white,
    padding: "8px 15px",
    borderRadius: "20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    fontSize: "14px",
    fontWeight: "bold",
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
  },

  layout: {
    display: "flex",
    gap: "20px",
    flex: 1,
    overflow: "hidden",
  },

  // 좌측 패널
  leftPanel: {
    flex: "0 0 350px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panelHeader: {
    padding: "15px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
    fontWeight: "bold",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff",
    flexShrink: 0,
  },
  orderList: {
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    flex: 1,
  },
  orderCard: {
    borderRadius: "10px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.02)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  lineBadge: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#666",
    backgroundColor: "#eee",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  statusBadge: {
    fontSize: "10px",
    color: "white",
    padding: "3px 8px",
    borderRadius: "10px",
    fontWeight: "bold",
  },
  productName: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "4px",
  },
  orderId: { fontSize: "12px", color: "#999", marginBottom: "12px" },
  progressContainer: { marginTop: "5px" },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    marginBottom: "4px",
    color: "#666",
  },
  progressBarBg: {
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "3px",
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },

  // 우측 패널
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflow: "hidden",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    flexShrink: 0,
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  infoSummary: {
    backgroundColor: "#F8F9FA",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    border: `1px solid ${COLORS.border}`,
  },
  predictionBox: {
    marginBottom: "20px",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: `${COLORS.secondary}`,
  },
  predictionFill: {
    position: "absolute",
    height: "100%",
    backgroundColor: COLORS.info,
    borderRadius: "3px",
    opacity: 0.7,
    transition: "width 0.3s ease",
  },
  inputGrid: { display: "flex", gap: "20px" },
  inputGroup: { flex: 1, display: "flex", flexDirection: "column" },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#555",
    display: "flex",
    alignItems: "center",
  },
  smallBtn: {
    fontSize: "11px",
    padding: "2px 8px",
    borderRadius: "4px",
    border: `1px solid ${COLORS.primary}`,
    backgroundColor: "white",
    color: COLORS.primary,
    cursor: "pointer",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "right",
    boxSizing: "border-box",
  },
  textInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
  },
  divider: { height: "1px", backgroundColor: COLORS.border, margin: "20px 0" },

  checkSection: { marginBottom: "15px" },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  warningBox: {
    backgroundColor: "#FFF4F4",
    border: `1px solid ${COLORS.danger}`,
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  warningTitle: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: COLORS.danger,
    fontWeight: "bold",
    marginBottom: "5px",
  },
  warningText: { fontSize: "12px", color: "#555", marginBottom: "8px" },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.danger}`,
    minHeight: "60px",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  submitBtn: {
    width: "100%",
    padding: "15px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },

  emptyState: {
    padding: "60px",
    textAlign: "center",
    color: "#999",
    border: "2px dashed #eee",
    borderRadius: "8px",
  },

  // 이력 리스트
  historyCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  tableWrapper: {
    flex: 1,
    overflowY: "auto",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    padding: "12px",
    borderBottom: `1px solid ${COLORS.border}`,
    textAlign: "center",
    color: "#666",
    position: "sticky",
    top: 0,
    backgroundColor: "#f9f9f9",
  },
  td: {
    padding: "12px",
    borderBottom: `1px solid ${COLORS.border}`,
    color: "#333",
    textAlign: "center",
  },
};

export default WorkReport;
