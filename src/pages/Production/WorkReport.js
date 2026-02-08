import React, { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaExclamationTriangle,
  FaIndustry,
  FaSave,
  FaHistory,
  FaClock,
  FaCommentDots,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import {
  getTodayWorkOrders,
  reportWorkResult,
  getDefectTypes,
} from "../../api/productionApi";

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
  dangerLight: "#FFCDD2",
};

const WorkReport = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [workOrders, setWorkOrders] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);

  const [isDefectLoading, setIsDefectLoading] = useState(false);
  const [defectTypes, setDefectTypes] = useState([]);

  const [inputs, setInputs] = useState({
    goodQty: "",
    shortfallReason: "",
    memo: "",
    isShiftEnd: false,
  });

  const [defectList, setDefectList] = useState([]);
  const [currentDefect, setCurrentDefect] = useState({
    code: "",
    qty: "",
  });

  // 3초 자동 갱신
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 3000);
    return () => clearInterval(interval);
  }, []);

  // 시계
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const orderData = await getTodayWorkOrders();
      const mapped = orderData.map((item) => ({
        id: item.id,
        code: item.code,
        line: item.lineName || "미정",
        product: item.productName,
        targetQty: item.targetQty || 0,
        currentQty: item.currentQty || 0,
        defectQty: item.defectQty || 0, // [C#에서 넘어온 DB 불량 수량]
        status: item.status,
        manager: item.worker,
      }));
      setWorkOrders(mapped);

      if (selectedOrder) {
        const updated = mapped.find((o) => o.id === selectedOrder.id);
        if (updated) {
          setSelectedOrder((prev) => ({
            ...prev,
            currentQty: updated.currentQty,
            defectQty: updated.defectQty,
            status: updated.status,
          }));
        }
      }

      if (defectTypes.length === 0) {
        setIsDefectLoading(true);
        try {
          const typeData = await getDefectTypes();
          let finalData = Array.isArray(typeData)
            ? typeData
            : typeData.data || [];
          setDefectTypes(finalData);
          if (finalData.length > 0) {
            setCurrentDefect((prev) => ({ ...prev, code: finalData[0].code }));
          }
        } catch (innerErr) {
          console.error("불량 유형 로드 실패:", innerErr);
        } finally {
          setIsDefectLoading(false);
        }
      }
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  const resetInputs = () => {
    setInputs({
      goodQty: "",
      shortfallReason: "",
      memo: "",
      isShiftEnd: false,
    });
    setDefectList([]);
    if (defectTypes.length > 0) {
      setCurrentDefect({ code: defectTypes[0].code, qty: "" });
    } else {
      setCurrentDefect({ code: "", qty: "" });
    }
  };

  // [사용자가 입력한 불량 수량 합계]
  const currentInputBadQty = defectList.reduce(
    (sum, item) => sum + Number(item.qty),
    0,
  );

  // ▼▼▼ [최종 수정] C# 불량수 == 사용자 입력 불량수 일치 시 자동 종료 ▼▼▼
  useEffect(() => {
    if (!selectedOrder) return;

    // 1. C# 장비가 보낸 DB 불량 수량
    const dbBadQty = selectedOrder.defectQty;

    // 2. 사용자가 리스트에 입력한 불량 수량
    const userBadQty = currentInputBadQty;

    // 3. 총 생산량 예측 (양품 + 불량)
    const grandTotal =
      selectedOrder.currentQty + // 기존 양품
      (Number(inputs.goodQty) || 0) + // 입력 중인 양품
      dbBadQty; // 불량은 DB값 기준 (일치해야 하므로)

    const target = selectedOrder.targetQty;

    // [조건]
    // 1. 총 생산량이 목표를 달성했는가? (grandTotal >= target)
    // 2. AND 사용자가 불량 분류를 완벽하게 했는가? (dbBadQty === userBadQty)
    const isTargetMet = grandTotal >= target;
    const isDefectMatched = dbBadQty === userBadQty;

    if (isTargetMet && isDefectMatched) {
      setInputs((prev) => ({ ...prev, isShiftEnd: true }));
    } else {
      setInputs((prev) => ({ ...prev, isShiftEnd: false }));
    }
  }, [inputs.goodQty, currentInputBadQty, selectedOrder]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    resetInputs();
  };

  const handleFillRemaining = () => {
    if (!selectedOrder) return;
    const dbTotal = selectedOrder.currentQty + selectedOrder.defectQty;
    const remaining = selectedOrder.targetQty - dbTotal; // 잔량은 DB기준으로 계산

    if (remaining > 0) {
      setInputs({ ...inputs, goodQty: remaining.toString() });
    } else {
      setInputs({ ...inputs, goodQty: "0" });
    }
  };

  const handleAddDefect = () => {
    if (!currentDefect.qty || Number(currentDefect.qty) <= 0) {
      return alert("불량 수량을 입력해주세요.");
    }
    const defectType = defectTypes.find((d) => d.code === currentDefect.code);
    if (!defectType) return alert("선택된 불량 유형이 없습니다.");

    const existingIndex = defectList.findIndex(
      (d) => d.code === currentDefect.code,
    );

    if (existingIndex >= 0) {
      const newList = [...defectList];
      newList[existingIndex].qty =
        Number(newList[existingIndex].qty) + Number(currentDefect.qty);
      setDefectList(newList);
    } else {
      setDefectList([
        ...defectList,
        {
          code: defectType.code,
          name: defectType.name,
          qty: Number(currentDefect.qty),
        },
      ]);
    }
    setCurrentDefect({ ...currentDefect, qty: "" });
  };

  const handleDeleteDefect = (index) => {
    const newList = defectList.filter((_, i) => i !== index);
    setDefectList(newList);
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;

    const addGood = Number(inputs.goodQty) || 0;

    // [중요] 불량은 '이미 C#이 넣었으니까' 추가로 더하지 않을지,
    // 아니면 '분류 정보만 업데이트' 할지 정책에 따름.
    // 여기서는 요청대로 '사용자 입력값'을 보냅니다.
    const addBad = currentInputBadQty;

    const totalAdd = addGood + addBad;

    if (totalAdd === 0 && !inputs.isShiftEnd) {
      return alert("수량을 입력하거나 작업을 종료해주세요.");
    }

    // [검증 강화] 작업 종료 시, 불량 수량 일치 여부 확인
    if (inputs.isShiftEnd) {
      const dbBad = selectedOrder.defectQty;
      const userBad = currentInputBadQty;

      // 불량이 있는데 분류를 안 했거나 덜 했으면 경고
      if (dbBad > 0 && userBad !== dbBad) {
        if (
          !window.confirm(
            `경고: C# 감지 불량(${dbBad}개)와 입력 불량(${userBad}개)가 일치하지 않습니다. 그래도 종료합니까?`,
          )
        ) {
          return;
        }
      }
    }

    const currentTotal =
      selectedOrder.currentQty + selectedOrder.defectQty + totalAdd;
    const target = selectedOrder.targetQty;

    if (
      inputs.isShiftEnd &&
      currentTotal < target &&
      !inputs.shortfallReason.trim()
    ) {
      return alert(
        "❌ 목표 수량 미달입니다! 사유를 입력해야 종료할 수 있습니다.",
      );
    }

    const combinedBadReason =
      defectList.length > 0
        ? defectList.map((d) => `${d.name}(${d.qty})`).join(", ")
        : "";

    const reportData = {
      goodQty: addGood,
      badQty: addBad,
      badReason: combinedBadReason || "N/A",
      memo: inputs.memo,
      isShiftEnd: inputs.isShiftEnd,
      shortfallReason: inputs.shortfallReason,
    };

    try {
      await reportWorkResult(selectedOrder.id, reportData);
      alert("✅ 실적이 보고되었습니다.");
      await fetchData();

      const newReport = {
        id: Date.now(),
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        orderCode: selectedOrder.code,
        addedGood: addGood,
        addedBad: addBad,
        totalResult: `${currentTotal} / ${target}`,
        note: inputs.isShiftEnd ? "작업 종료" : inputs.memo || "중간 보고",
      };
      setReportHistory([newReport, ...reportHistory]);
      resetInputs();
    } catch (err) {
      alert("보고 실패: " + (err.response?.data || err.message));
    }
  };

  const calculateProgress = () => {
    if (!selectedOrder)
      return { currentPercent: 0, predictPercent: 0, totalPercent: 0 };

    const target = selectedOrder.targetQty;
    const dbTotal = selectedOrder.currentQty + selectedOrder.defectQty;
    const inputTotal = (Number(inputs.goodQty) || 0) + currentInputBadQty;

    const currentPercent = Math.min((dbTotal / target) * 100, 100);
    const totalPercent = Math.min(((dbTotal + inputTotal) / target) * 100, 100);
    const predictPercent = totalPercent - currentPercent;

    return { currentPercent, predictPercent, totalPercent };
  };

  const { currentPercent, predictPercent, totalPercent } = calculateProgress();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 생산 실적 보고</h2>
          <p style={styles.subtitle}>
            현장 작업 지시별 실적 등록 및 특이사항 보고
          </p>
        </div>
        <div style={styles.clockBox}>
          <FaClock style={{ marginRight: "8px" }} />{" "}
          {currentTime.toLocaleString()}
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <FaClipboardList /> 금일 작업 지시 목록
          </div>
          <div style={styles.orderList}>
            {workOrders.length === 0 ? (
              <div
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                진행 중인 작업 지시가 없습니다.
              </div>
            ) : (
              workOrders.map((order) => {
                const totalProduced = order.currentQty + order.defectQty;
                const progress = Math.min(
                  (totalProduced / order.targetQty) * 100,
                  100,
                );
                const isSelected = selectedOrder?.id === order.id;

                let statusText = "대기";
                let statusColor = COLORS.warning;
                if (order.status === "IN_PROGRESS") {
                  statusText = "진행중";
                  statusColor = COLORS.success;
                } else if (order.status === "COMPLETED") {
                  statusText = "완료";
                  statusColor = COLORS.gray;
                }

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
                      opacity: order.status === "COMPLETED" ? 0.6 : 1,
                    }}
                  >
                    <div style={styles.cardTop}>
                      <span style={styles.lineBadge}>{order.line}</span>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: statusColor,
                        }}
                      >
                        {statusText}
                      </span>
                    </div>
                    <div style={styles.productName}>{order.product}</div>
                    <div style={styles.orderId}>{order.code}</div>
                    <div style={styles.progressContainer}>
                      <div style={styles.progressInfo}>
                        <span>
                          달성률: <strong>{Math.round(progress)}%</strong>
                        </span>
                        <span>
                          {totalProduced} / {order.targetQty} ea
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
              })
            )}
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>📝 실적 등록 및 종료</h3>
            {selectedOrder ? (
              <>
                <div style={styles.infoSummary}>
                  <div>
                    <strong>지시번호:</strong> {selectedOrder.code}
                  </div>
                  <div>
                    <strong>제품명:</strong> {selectedOrder.product}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <strong>현재(DB):</strong>{" "}
                      <span style={{ color: COLORS.success }}>
                        {selectedOrder.currentQty}
                      </span>
                      (양) /{" "}
                      <span style={{ color: COLORS.danger }}>
                        {selectedOrder.defectQty}
                      </span>
                      (불)
                    </div>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                      (목표: {selectedOrder.targetQty})
                    </div>
                  </div>
                </div>

                <div style={styles.predictionBox}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "5px",
                    }}
                  >
                    <span>목표 달성 예측 (양품+불량)</span>
                    <span style={{ fontWeight: "bold", color: COLORS.primary }}>
                      {Math.round(totalPercent)}%
                    </span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div
                      style={{
                        ...styles.progressBarFill,
                        width: `${currentPercent}%`,
                        zIndex: 2,
                      }}
                    ></div>
                    <div
                      style={{
                        ...styles.predictionFill,
                        left: `${currentPercent}%`,
                        width: `${predictPercent}%`,
                        zIndex: 1,
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
                      >
                        잔량 채우기
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
                </div>

                <div style={styles.divider}></div>

                <div style={styles.defectSection}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <label
                      style={{
                        ...styles.label,
                        color: COLORS.danger,
                        marginBottom: "8px",
                      }}
                    >
                      불량 분류 (C# 감지: {selectedOrder.defectQty}개)
                    </label>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color:
                          currentInputBadQty === selectedOrder.defectQty
                            ? COLORS.success
                            : COLORS.danger,
                      }}
                    >
                      입력됨: {currentInputBadQty}개
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "flex-end",
                    }}
                  >
                    <div style={{ flex: 2 }}>
                      <span style={styles.miniLabel}>유형</span>
                      <select
                        style={styles.select}
                        value={currentDefect.code}
                        onChange={(e) =>
                          setCurrentDefect({
                            ...currentDefect,
                            code: e.target.value,
                          })
                        }
                      >
                        {isDefectLoading && (
                          <option value="">로딩 중...</option>
                        )}
                        {!isDefectLoading && defectTypes.length === 0 && (
                          <option value="">유형 없음</option>
                        )}
                        {!isDefectLoading &&
                          defectTypes.map((type) => (
                            <option key={type.code} value={type.code}>
                              {type.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={styles.miniLabel}>수량</span>
                      <input
                        type="number"
                        style={{ ...styles.input, textAlign: "center" }}
                        placeholder="0"
                        value={currentDefect.qty}
                        onChange={(e) =>
                          setCurrentDefect({
                            ...currentDefect,
                            qty: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button onClick={handleAddDefect} style={styles.addBtn}>
                      <FaPlus /> 추가
                    </button>
                  </div>

                  {defectList.length > 0 && (
                    <div style={styles.defectListContainer}>
                      {defectList.map((item, index) => (
                        <div key={index} style={styles.defectItem}>
                          <span style={styles.defectName}>{item.name}</span>
                          <span style={styles.defectQty}>{item.qty}개</span>
                          <button
                            onClick={() => handleDeleteDefect(index)}
                            style={styles.deleteBtn}
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      ))}
                      <div style={styles.defectTotal}>
                        총 불량: {currentInputBadQty}개
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "15px" }}>
                  <label style={styles.label}>
                    <FaCommentDots style={{ marginRight: "5px" }} /> 특이사항
                    메모
                  </label>
                  <input
                    type="text"
                    style={styles.textInput}
                    placeholder="예: 설비 소음 발생 등"
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
                    selectedOrder.defectQty +
                    Number(inputs.goodQty) <
                    selectedOrder.targetQty && (
                    <div style={styles.warningBox}>
                      <div style={styles.warningTitle}>
                        <FaExclamationTriangle /> 목표 수량 미달
                      </div>
                      <p style={styles.warningText}>
                        목표({selectedOrder.targetQty}) 대비 부족합니다. 사유를
                        입력하세요.
                      </p>
                      <textarea
                        style={styles.textarea}
                        placeholder="사유 입력..."
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
              <FaHistory /> 금일 실적 보고 내역 (세션)
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={{ background: "#f9f9f9" }}>
                    <th style={styles.th}>시간</th>
                    <th style={styles.th}>지시번호</th>
                    <th style={styles.th}>양품/불량</th>
                    <th style={styles.th}>누적(합계)</th>
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
                        <td style={styles.td}>{log.orderCode}</td>
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

  // ▼▼▼ [수정 1] 레이아웃 높이 꽉 채우기 ▼▼▼
  layout: {
    display: "flex",
    gap: "20px",
    flex: 1,
    overflow: "hidden", // 전체 스크롤 방지
    height: "100%", // 부모 높이 상속
  },

  // ▼▼▼ [수정 2] 왼쪽 패널 높이 자동 조절 ▼▼▼
  leftPanel: {
    flex: "0 0 350px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    height: "100%", // 높이 100% 강제
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
    position: "absolute",
    top: 0,
    left: 0,
  },

  // ▼▼▼ [수정 3] 오른쪽 패널을 Flex Column으로 변경 ▼▼▼
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflow: "hidden", // 내부 스크롤로 처리
    height: "100%", // 높이 100% 강제
  },

  // ▼▼▼ [수정 4] 위쪽 카드 (등록폼)는 내용만큼만 크기 차지 ▼▼▼
  formCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    flexShrink: 0, // 줄어들지 않음 (내용물 크기 유지)
    maxHeight: "65%", // 너무 길어지면 스크롤 생기게 제한 (선택사항)
    overflowY: "auto",
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
    top: 0,
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
  miniLabel: {
    fontSize: "11px",
    color: "#888",
    marginBottom: "4px",
    display: "block",
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
  addBtn: {
    height: "45px",
    padding: "0 15px",
    backgroundColor: COLORS.danger,
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "13px",
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
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    height: "45px",
  },
  divider: { height: "1px", backgroundColor: COLORS.border, margin: "20px 0" },
  defectSection: {
    backgroundColor: "#FFF9F9",
    padding: "15px",
    borderRadius: "8px",
    border: `1px dashed ${COLORS.dangerLight}`,
  },
  defectListContainer: {
    marginTop: "10px",
    backgroundColor: "white",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    padding: "10px",
  },
  defectItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "6px 0",
    borderBottom: "1px solid #eee",
    fontSize: "13px",
  },
  defectName: { color: "#333", fontWeight: "bold" },
  defectQty: { color: COLORS.danger, fontWeight: "bold" },
  defectTotal: {
    textAlign: "right",
    marginTop: "8px",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#333",
  },
  deleteBtn: {
    border: "none",
    background: "none",
    color: "#999",
    cursor: "pointer",
    padding: "4px",
  },
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

  // ▼▼▼ [수정 5] 아래쪽 카드 (내역)는 남은 공간을 모두 차지 (flex: 1) ▼▼▼
  historyCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",

    // 핵심 수정 사항: 남은 공간 꽉 채우기
    flex: 1,
    minHeight: 0, // flex 자식의 scroll 버그 방지
    marginBottom: 0, // 바닥 여백 제거

    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  tableWrapper: { flex: 1, overflowY: "auto" },
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
