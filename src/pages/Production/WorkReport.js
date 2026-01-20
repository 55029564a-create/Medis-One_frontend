import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaIndustry,
  FaSave,
  FaHistory,
} from "react-icons/fa";

// 🎨 MedisOne 테마
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#666",
  danger: "#FF5252",
  success: "#4CAF50",
  warning: "#FF9800",
  border: "#E0E0E0",
};

const WorkReport = () => {
  // --- 1. 상태 관리 ---
  const [selectedOrder, setSelectedOrder] = useState(null); // 현재 선택된 작업지시

  // 입력 폼 상태
  const [inputs, setInputs] = useState({
    goodQty: "",
    badQty: "",
    badReason: "def-01", // 기본값
    shortfallReason: "", // 미달 사유
    isShiftEnd: false, // 작업/교대 종료 여부 체크
  });

  // 📝 [Mock Data] 시스템에서 내려온 금일 작업 지시 리스트
  const [workOrders, setWorkOrders] = useState([
    {
      id: "WO-260120-A01",
      line: "Line-A (Clean Room)",
      product: "24인치 의료용 패널 (AG)",
      targetQty: 500, // 목표 수량
      currentQty: 400, // 현재까지 생산량 (80%)
      status: "RUNNING", // RUNNING, PAUSED, COMPLETED
      manager: "김반장",
    },
    {
      id: "WO-260120-B02",
      line: "Line-B (Assy)",
      product: "메인보드 PCB (MED-V2)",
      targetQty: 1000,
      currentQty: 950, // 95%
      status: "RUNNING",
      manager: "이조립",
    },
    {
      id: "WO-260120-C03",
      line: "Line-C (Packing)",
      product: "전원 어댑터 포장",
      targetQty: 2000,
      currentQty: 200, // 10%
      status: "PAUSED", // 자재 부족으로 일시정지 상태 가정
      manager: "최포장",
    },
  ]);

  // 완료된 실적 이력 (하단 리스트용)
  const [reportHistory, setReportHistory] = useState([]);

  // --- 2. 로직 함수 ---

  // 작업 지시 선택 핸들러
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setInputs({
      goodQty: "",
      badQty: "",
      badReason: "def-01",
      shortfallReason: "",
      isShiftEnd: false,
    });
  };

  // 실적 저장 및 업데이트
  const handleSubmit = () => {
    if (!selectedOrder) return;

    const addGood = Number(inputs.goodQty) || 0;
    const addBad = Number(inputs.badQty) || 0;
    const totalAdd = addGood + addBad;

    if (totalAdd === 0 && !inputs.isShiftEnd) {
      return alert("수량을 입력하거나 작업을 종료해주세요.");
    }

    // [핵심 로직] 목표 미달인데 종료하려는 경우 사유 필수
    const newTotalQty = selectedOrder.currentQty + totalAdd;
    const isShortfall = newTotalQty < selectedOrder.targetQty;

    if (inputs.isShiftEnd && isShortfall && !inputs.shortfallReason.trim()) {
      return alert("⚠️ 목표 수량 미달입니다. 미달 사유를 반드시 입력해주세요!");
    }

    // 1. 작업 지시 상태 업데이트 (화면에 바로 반영)
    const updatedOrders = workOrders.map((ord) => {
      if (ord.id === selectedOrder.id) {
        return {
          ...ord,
          currentQty: newTotalQty,
          status: inputs.isShiftEnd ? "COMPLETED" : ord.status, // 종료 체크 시 완료 처리
        };
      }
      return ord;
    });
    setWorkOrders(updatedOrders);

    // 2. 이력(History)에 추가
    const newReport = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      orderId: selectedOrder.id,
      product: selectedOrder.product,
      addedGood: addGood,
      addedBad: addBad,
      totalResult: `${newTotalQty} / ${selectedOrder.targetQty}`,
      note: inputs.isShiftEnd
        ? isShortfall
          ? `미달: ${inputs.shortfallReason}`
          : "작업 완료"
        : "중간 보고",
    };
    setReportHistory([newReport, ...reportHistory]);

    // 3. 폼 초기화 및 알림
    alert("✅ 실적이 정상적으로 보고되었습니다.");
    setSelectedOrder(null); // 선택 해제
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 생산 실적 보고 (MES)</h2>
        <p style={styles.subtitle}>
          현장 작업자가 작업 지시별 생산량을 보고하고 특이사항을 기록합니다.
        </p>
      </div>

      <div style={styles.layout}>
        {/* [좌측] 작업 지시 리스트 (To-Do List) */}
        <div style={styles.leftPanel}>
          <div style={styles.panelTitle}>
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
                  <div style={styles.cardHeader}>
                    <span style={styles.lineBadge}>{order.line}</span>
                    <span
                      style={{
                        ...styles.statusBadge,
                        backgroundColor:
                          order.status === "RUNNING"
                            ? COLORS.success
                            : order.status === "COMPLETED"
                              ? COLORS.primary
                              : COLORS.gray,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div style={styles.productName}>{order.product}</div>
                  <div style={styles.orderId}>{order.id}</div>

                  {/* 진척률 바 */}
                  <div style={styles.progressContainer}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      <span>달성률: {Math.round(progress)}%</span>
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

        {/* [우측] 실적 입력 폼 (Selected Detail) */}
        <div style={styles.rightPanel}>
          {selectedOrder ? (
            <div style={styles.formCard}>
              <h3 style={styles.formTitle}>📝 실적 등록 및 종료</h3>

              {/* 기본 정보 요약 */}
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

              {/* 입력 필드 */}
              <div style={styles.inputGroup}>
                <div style={styles.row}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.label}>양품 수량 (Good)</label>
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
                  <div style={{ flex: 1 }}>
                    <label style={{ ...styles.label, color: COLORS.danger }}>
                      불량 수량 (Bad)
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

                {/* 불량 사유 선택 (불량 수량이 있을 때만 표시) */}
                {Number(inputs.badQty) > 0 && (
                  <div style={styles.row}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.label}>불량 사유 선택</label>
                      <select
                        style={styles.select}
                        value={inputs.badReason}
                        onChange={(e) =>
                          setInputs({ ...inputs, badReason: e.target.value })
                        }
                      >
                        <option value="def-01">표면 스크래치</option>
                        <option value="def-02">치수 불량</option>
                        <option value="def-03">작동 불량</option>
                        <option value="def-04">이물질 오염</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.divider}></div>

              {/* 작업 종료 옵션 */}
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

              {/* [조건부 렌더링] 미달 사유 입력창 */}
              {inputs.isShiftEnd &&
                selectedOrder.currentQty +
                  Number(inputs.goodQty) +
                  Number(inputs.badQty) <
                  selectedOrder.targetQty && (
                  <div style={styles.warningBox}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: COLORS.danger,
                        fontWeight: "bold",
                        marginBottom: "5px",
                      }}
                    >
                      <FaExclamationTriangle /> 목표 수량 미달 (Shortfall)
                    </div>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#555",
                        marginBottom: "8px",
                      }}
                    >
                      목표({selectedOrder.targetQty}) 대비 현재(
                      {selectedOrder.currentQty +
                        Number(inputs.goodQty) +
                        Number(inputs.badQty)}
                      ) 부족합니다.
                      <br />
                      사유를 반드시 입력해야 보고가 가능합니다. (예: 설비 고장,
                      자재 결품)
                    </p>
                    <textarea
                      style={styles.textarea}
                      placeholder="미달 사유를 입력하세요..."
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
            </div>
          ) : (
            <div style={styles.emptyState}>
              <FaIndustry size={40} color="#ccc" />
              <p>좌측 목록에서 보고할 작업 지시를 선택하세요.</p>
            </div>
          )}

          {/* 하단: 금일 보고 이력 */}
          <div style={styles.historySection}>
            <h4 style={styles.historyTitle}>
              <FaHistory /> 금일 실적 보고 내역
            </h4>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  <th style={styles.th}>시간</th>
                  <th style={styles.th}>지시번호</th>
                  <th style={styles.th}>양품/불량</th>
                  <th style={styles.th}>누적현황</th>
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
                      }}
                    >
                      이력이 없습니다.
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
                        /
                        <span style={{ color: COLORS.danger }}>
                          {" "}
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
  );
};

// --- 스타일 ---
const styles = {
  container: {
    padding: "20px",
    backgroundColor: COLORS.bg,
    minHeight: "100%",
  },
  header: { marginBottom: "20px" },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "5px",
  },
  subtitle: { fontSize: "14px", color: COLORS.gray },

  layout: {
    display: "flex",
    gap: "20px",
    height: "calc(100vh - 150px)", // 화면 꽉 채우기
    minHeight: "600px",
  },

  // 왼쪽 패널 (리스트)
  leftPanel: {
    flex: "1",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  panelTitle: {
    padding: "15px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
    fontWeight: "bold",
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#fff",
  },
  orderList: {
    padding: "15px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    flex: 1,
  },

  // 작업지시 카드
  orderCard: {
    borderRadius: "8px",
    padding: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  cardHeader: {
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
    padding: "2px 8px",
    borderRadius: "10px",
    fontWeight: "bold",
  },
  productName: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "2px",
  },
  orderId: {
    fontSize: "11px",
    color: "#999",
    marginBottom: "10px",
  },
  progressContainer: { marginTop: "5px" },
  progressBarBg: {
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "3px",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },

  // 오른쪽 패널 (입력 폼)
  rightPanel: {
    flex: "1.5",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowY: "auto",
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
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
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    border: `1px solid ${COLORS.border}`,
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "15px" },
  row: { display: "flex", gap: "15px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "16px",
    fontWeight: "bold",
    textAlign: "right",
  },
  select: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
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
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.danger}`,
    minHeight: "60px",
    fontSize: "14px",
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
    marginTop: "10px",
  },

  emptyState: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "50px",
    textAlign: "center",
    color: "#999",
    border: "2px dashed #eee",
  },

  // 하단 이력
  historySection: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    flex: 1,
  },
  historyTitle: {
    fontSize: "15px",
    fontWeight: "bold",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    padding: "10px",
    borderBottom: `1px solid ${COLORS.border}`,
    textAlign: "left",
    color: "#666",
  },
  td: {
    padding: "10px",
    borderBottom: `1px solid ${COLORS.border}`,
    color: "#333",
  },
};

export default WorkReport;
