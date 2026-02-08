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
  FaUserEdit,
  FaTimes,
  FaUndo,
  FaCheckCircle,
} from "react-icons/fa";

import {
  getTodayWorkOrders,
  reportWorkResult,
  getDefectTypes,
  getTodayWorkReports,
  cancelWorkReport,
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

  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [inputs, setInputs] = useState({
    shortfallReason: "",
    memo: "",
    worker: "",
    isShiftEnd: false,
  });

  const [defectList, setDefectList] = useState([]);
  const [currentDefect, setCurrentDefect] = useState({
    code: "",
    qty: "",
  });

  useEffect(() => {
    fetchData();
    fetchHistory();
    const interval = setInterval(() => {
      // 주기적 업데이트
      fetchData(true, true);
      fetchHistory(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedOrder?.id]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (isSilent = false, maintainSelection = true) => {
    try {
      const orderData = await getTodayWorkOrders();
      const mapped = orderData.map((item) => ({
        id: item.id,
        code: item.code,
        line: item.lineName || "미정",
        product: item.productName,
        targetQty: item.targetQty || 0,
        currentQty: item.currentQty || 0,
        defectQty: item.defectQty || 0,
        status: item.status,
        manager: item.worker,
      }));

      // 정렬: 진행중 -> 대기 -> 완료
      mapped.sort((a, b) => {
        const score = (status) => {
          if (status === "IN_PROGRESS") return 0;
          if (status === "WAITING") return 1;
          return 2; // COMPLETED
        };
        return score(a.status) - score(b.status);
      });

      setWorkOrders(mapped);

      if (maintainSelection && selectedOrder) {
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
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (isSilent = false) => {
    try {
      const historyData = await getTodayWorkReports();
      if (!historyData || !Array.isArray(historyData)) {
        setReportHistory([]);
        return;
      }
      const mappedHistory = historyData.map((log) => {
        const reportedBad = log.badQty ?? log.addedBad ?? 0;
        return {
          id: log.id,
          time: new Date(log.reportTime).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          orderCode: log.workOrderCode,
          displayTotalGood: log.currentTotalGood || 0,
          reportedBad: Number(reportedBad),
          badReason: log.badReason,
          worker: log.workerName || log.worker || "-",
          note: log.memo || "-",
        };
      });
      setReportHistory(mappedHistory);
    } catch (err) {
      console.error(err);
    }
  };

  // [기능 분리] 데이터를 폼에 채워넣는 로직 (재사용을 위해 분리함)
  const fillFormWithLog = (log, order) => {
    setSelectedOrder(order);
    setEditingId(log.id); // 수정 모드 활성화

    setInputs({
      shortfallReason: "",
      memo: log.note === "-" || !log.note ? "" : log.note,
      worker: log.worker === "-" || !log.worker ? "" : log.worker,
      isShiftEnd: false,
    });

    if (log.badReason && log.badReason !== "N/A" && defectTypes.length > 0) {
      const restoredDefects = [];
      const parts = log.badReason.split(", ");
      parts.forEach((part) => {
        const match = part.match(/(.+)\((\d+)\)/);
        if (match) {
          const name = match[1].trim();
          const qty = parseInt(match[2], 10);
          const type = defectTypes.find((t) => t.name === name);
          if (type) {
            restoredDefects.push({
              code: type.code,
              name: type.name,
              qty: qty,
            });
          }
        }
      });
      setDefectList(restoredDefects);
    } else {
      setDefectList([]);
    }
  };

  // [핵심 수정] 카드 선택 시 -> 이미 내역이 있으면 '수정 모드'로 직행
  const handleSelectOrder = (order) => {
    // 1. 토글 (이미 선택된 거 누르면 닫기)
    if (selectedOrder?.id === order.id) {
      setSelectedOrder(null);
      setEditingId(null);
      return;
    }

    // 2. 이 오더에 대한 기존 보고 내역이 있는지 찾기
    const existingLogs = reportHistory.filter(
      (log) => log.orderCode === order.code,
    );

    if (existingLogs.length > 0) {
      // 내역이 있다면? -> 가장 최신 내역(ID가 큰 것)을 불러오기
      const latestLog = existingLogs.sort((a, b) => b.id - a.id)[0];

      // [중복 방지] 새 등록이 아니라 기존 내역 수정으로 모드 전환
      fillFormWithLog(latestLog, order);
    } else {
      // 내역이 없다면? -> 새 등록 모드
      setSelectedOrder(order);
      resetInputs(order);
    }
  };

  const resetInputs = (order = selectedOrder) => {
    setInputs({
      shortfallReason: "",
      memo: "",
      worker: order?.manager || "",
      isShiftEnd: false,
    });
    setDefectList([]);
    if (defectTypes.length > 0) {
      setCurrentDefect({ code: defectTypes[0].code, qty: "" });
    }
    setEditingId(null);
  };

  // 내역 리스트에서 클릭했을 때 (여전히 명시적으로 수정 의사를 물어봄)
  const handleEditHistory = (log) => {
    const targetOrder = workOrders.find((o) => o.code === log.orderCode);
    if (!targetOrder) {
      alert("✅ 이미 완료된 보고입니다.\n(수정할 수 없습니다)");
      return;
    }
    if (!window.confirm("이 내역을 수정하시겠습니까?")) return;

    fillFormWithLog(log, targetOrder);
  };

  const handleCancelEdit = () => {
    setSelectedOrder(null);
    setEditingId(null);
  };

  const currentInputBadQty = defectList.reduce(
    (sum, item) => sum + Number(item.qty),
    0,
  );

  const handleAddDefect = () => {
    if (!currentDefect.qty || Number(currentDefect.qty) <= 0)
      return alert("수량 입력 필요");
    const defectType = defectTypes.find((d) => d.code === currentDefect.code);
    if (!defectType) return;

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

  const handleDeleteReport = async (reportId, silent = false) => {
    if (!silent && !window.confirm("내역을 삭제하시겠습니까?")) return;
    try {
      await cancelWorkReport(reportId);
      setReportHistory((prev) => prev.filter((item) => item.id !== reportId));
      if (!silent) {
        fetchData(false, true);
        if (editingId === reportId) {
          setSelectedOrder(null);
          setEditingId(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;
    if (isSubmitting) return;

    const addBad = currentInputBadQty;

    if (addBad === 0 && !inputs.isShiftEnd) {
      return alert("불량 내역을 입력하거나 작업을 종료해주세요.");
    }

    if (inputs.isShiftEnd) {
      const dbBad = selectedOrder.defectQty;
      const userBad = currentInputBadQty;
      if (dbBad > 0 && userBad !== dbBad) {
        if (!window.confirm("불량 수량이 일치하지 않습니다. 종료합니까?"))
          return;
      }
    }

    setIsSubmitting(true);

    if (editingId) {
      try {
        await cancelWorkReport(editingId);
      } catch (err) {
        setIsSubmitting(false);
        alert("수정 전 기존 내역 삭제 실패. 다시 시도해주세요.");
        return;
      }
    }

    const combinedBadReason = defectList
      .map((d) => `${d.name}(${d.qty})`)
      .join(", ");

    const reportData = {
      goodQty: 0,
      badQty: addBad,
      badReason: combinedBadReason || "N/A",
      memo: inputs.memo,
      worker: inputs.worker,
      isShiftEnd: inputs.isShiftEnd,
      shortfallReason: inputs.shortfallReason,
    };

    try {
      await reportWorkResult(selectedOrder.id, reportData);

      const isEdit = !!editingId;
      resetInputs();

      // 저장 완료 후, 선택을 풀어버려서 화면을 비워줌 (중복 클릭 방지)
      await fetchData(false, false);
      await fetchHistory();

      setSelectedOrder(null);
      setEditingId(null);

      alert(isEdit ? "✅ 수정 완료" : "✅ 불량 보고 완료");
    } catch (err) {
      alert("실패: " + (err.response?.data || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    if (!selectedOrder)
      return { currentPercent: 0, predictPercent: 0, totalPercent: 0 };
    const target = selectedOrder.targetQty;
    const dbTotal = selectedOrder.currentQty + selectedOrder.defectQty;
    const inputTotal = currentInputBadQty;
    const currentPercent = Math.min((dbTotal / target) * 100, 100);
    const totalPercent = Math.min(((dbTotal + inputTotal) / target) * 100, 100);
    const predictPercent = totalPercent - currentPercent;
    return { currentPercent, predictPercent, totalPercent };
  };

  const { currentPercent, predictPercent, totalPercent } = calculateProgress();

  return (
    <div style={styles.container}>
      <style>{`.hidden-scroll::-webkit-scrollbar { display: none; } .hidden-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📊 생산 불량 보고</h2>
          <p style={styles.subtitle}>기계 자동 양품 카운트 / 수동 불량 등록</p>
        </div>
        <div style={styles.clockBox}>
          <FaClock style={{ marginRight: "8px" }} />{" "}
          {currentTime.toLocaleString()}
        </div>
      </div>

      {/* Top List */}
      <div style={styles.topListContainer}>
        <div style={styles.sectionHeader}>
          <FaClipboardList /> 금일 작업 지시 목록 (클릭시 선택/해제)
        </div>
        <div style={styles.horizontalList} className="hidden-scroll">
          {workOrders.length === 0 ? (
            <div style={styles.emptyList}>진행 중인 작업 지시가 없습니다.</div>
          ) : (
            workOrders.map((order) => {
              const totalProduced = order.currentQty + order.defectQty;
              const progress = Math.min(
                (totalProduced / order.targetQty) * 100,
                100,
              );
              const isSelected = selectedOrder?.id === order.id;

              let statusText = "대기",
                statusColor = COLORS.warning;
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
                        <strong>{Math.round(progress)}%</strong>
                      </span>
                      <span>
                        {totalProduced}/{order.targetQty}
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

      {/* Bottom Section */}
      <div style={styles.bottomContainer}>
        {/* Form Panel */}
        <div style={styles.formPanel}>
          <div style={styles.panelTitle}>
            <FaSave /> {editingId ? "불량 내역 수정" : "불량 등록"}
            {editingId && (
              <button onClick={handleCancelEdit} style={styles.cancelEditBtn}>
                <FaUndo size={11} style={{ marginRight: "3px" }} /> 닫기
              </button>
            )}
          </div>
          {selectedOrder ? (
            <div style={styles.formContent} className="hidden-scroll">
              <div style={styles.infoSummary}>
                <div style={{ flex: 1 }}>
                  <strong>{selectedOrder.product}</strong>
                  <span
                    style={{
                      fontSize: "12px",
                      marginLeft: "8px",
                      color: COLORS.gray,
                    }}
                  >
                    {selectedOrder.code}
                  </span>

                  <div style={styles.inlineWorkerEdit}>
                    <FaUserEdit
                      size={12}
                      color="#666"
                      style={{ marginRight: "5px" }}
                    />
                    <input
                      type="text"
                      value={inputs.worker}
                      onChange={(e) =>
                        setInputs({ ...inputs, worker: e.target.value })
                      }
                      placeholder={selectedOrder.manager || "작업자 입력"}
                      style={styles.inlineInput}
                    />
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: "100px" }}>
                  <div style={{ fontSize: "11px", color: "#888" }}>
                    현재 생산 실적
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: "bold" }}>
                    <span style={{ color: COLORS.success }}>
                      {selectedOrder.currentQty}
                    </span>{" "}
                    /{" "}
                    <span style={{ color: COLORS.danger }}>
                      {selectedOrder.defectQty}
                    </span>
                  </div>
                </div>
              </div>

              <div style={styles.predictionBox}>
                <div style={styles.predHeader}>
                  <span>예측 달성률</span>
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

              <div
                style={
                  editingId
                    ? {
                        ...styles.fullWidthBox,
                        borderColor: COLORS.warning,
                        borderWidth: "2px",
                      }
                    : styles.fullWidthBox
                }
              >
                <div style={styles.labelRow}>
                  <label style={{ ...styles.label, color: COLORS.danger }}>
                    불량 등록
                  </label>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color:
                        currentInputBadQty === selectedOrder.defectQty
                          ? COLORS.success
                          : COLORS.danger,
                    }}
                  >
                    {currentInputBadQty === selectedOrder.defectQty ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaCheckCircle /> 일치
                      </span>
                    ) : currentInputBadQty > 0 ? (
                      `입력:${currentInputBadQty}`
                    ) : (
                      "-"
                    )}
                  </span>
                </div>

                <div
                  style={{ display: "flex", gap: "5px", marginBottom: "8px" }}
                >
                  <select
                    style={{ ...styles.select, flex: 3 }}
                    value={currentDefect.code}
                    onChange={(e) =>
                      setCurrentDefect({
                        ...currentDefect,
                        code: e.target.value,
                      })
                    }
                  >
                    {!isDefectLoading &&
                      defectTypes.map((t) => (
                        <option key={t.code} value={t.code}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                  <input
                    type="number"
                    style={{ ...styles.subInput, width: "60px" }}
                    placeholder="0"
                    value={currentDefect.qty}
                    onChange={(e) =>
                      setCurrentDefect({
                        ...currentDefect,
                        qty: e.target.value,
                      })
                    }
                  />
                  <button onClick={handleAddDefect} style={styles.addBtnIcon}>
                    <FaPlus />
                  </button>
                </div>

                <div style={styles.miniDefectList} className="hidden-scroll">
                  {defectList.length === 0 ? (
                    <div
                      style={{
                        color: "#ccc",
                        fontSize: "11px",
                        textAlign: "center",
                        padding: "15px",
                      }}
                    >
                      등록된 불량 없음
                    </div>
                  ) : (
                    defectList.map((d, i) => (
                      <div key={i} style={styles.miniDefectItem}>
                        <span
                          style={{
                            fontSize: "12px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "80%",
                          }}
                        >
                          {d.name}
                        </span>
                        <span style={{ display: "flex", alignItems: "center" }}>
                          <b
                            style={{
                              color: COLORS.danger,
                              marginRight: "10px",
                            }}
                          >
                            {d.qty}
                          </b>
                          <FaTrash
                            style={{ cursor: "pointer", color: "#aaa" }}
                            onClick={() => handleDeleteDefect(i)}
                          />
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ marginTop: "15px" }}>
                <input
                  type="text"
                  style={styles.memoInput}
                  placeholder="메모 입력..."
                  value={inputs.memo}
                  onChange={(e) =>
                    setInputs({ ...inputs, memo: e.target.value })
                  }
                />
              </div>

              <div style={styles.checkSection}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={inputs.isShiftEnd}
                    onChange={(e) =>
                      setInputs({ ...inputs, isShiftEnd: e.target.checked })
                    }
                    style={{
                      marginRight: "10px",
                      width: "18px",
                      height: "18px",
                    }}
                  />
                  작업 종료 처리
                </label>
              </div>

              {inputs.isShiftEnd &&
                selectedOrder.currentQty + selectedOrder.defectQty <
                  selectedOrder.targetQty && (
                  <div style={styles.warningBox}>
                    <div style={styles.warningTitle}>
                      <FaExclamationTriangle /> 미달 사유 입력
                    </div>
                    <textarea
                      style={styles.textarea}
                      placeholder="사유 입력"
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

              <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    ...styles.submitBtn,
                    backgroundColor: isSubmitting
                      ? COLORS.gray
                      : editingId
                        ? COLORS.warning
                        : COLORS.primary,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                >
                  <FaSave />{" "}
                  {isSubmitting
                    ? "처리 중..."
                    : editingId
                      ? "수정 완료"
                      : "불량 보고 저장"}
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <FaIndustry size={40} color="#ddd" />
              <p>작업 지시를 선택하세요.</p>
            </div>
          )}
        </div>

        {/* History Panel */}
        <div style={styles.historyPanel}>
          <div style={styles.panelTitle}>
            <FaHistory /> 보고 내역 (클릭 시 수정)
          </div>
          <div style={styles.historyListScroll} className="hidden-scroll">
            {reportHistory.length === 0 ? (
              <div style={styles.emptyStateSimple}>내역 없음</div>
            ) : (
              reportHistory.map((log) => (
                <div
                  key={log.id}
                  style={{
                    ...styles.historyRowItem,
                    cursor: "pointer",
                    border:
                      editingId === log.id
                        ? `2px solid ${COLORS.warning}`
                        : `1px solid ${COLORS.border}`,
                    backgroundColor:
                      editingId === log.id ? "#FFF8E1" : "#F9FAFB",
                  }}
                  onClick={() => handleEditHistory(log)}
                >
                  <div style={styles.historyRowTop}>
                    <span style={styles.histTime}>{log.time}</span>
                    <span style={{ fontSize: "11px", color: "#555" }}>
                      {log.worker}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReport(log.id);
                      }}
                      style={styles.deleteReportBtn}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>

                  <div style={styles.historyRowMid}>
                    <span
                      style={{
                        fontSize: "13px",
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "#555" }}>
                        현재 양품(누적){" "}
                        <b
                          style={{
                            color: COLORS.success,
                            fontSize: "14px",
                          }}
                        >
                          {log.displayTotalGood}
                        </b>
                      </span>
                      <span style={{ color: "#555" }}>
                        불량 신고{" "}
                        <b style={{ color: COLORS.danger, fontSize: "14px" }}>
                          {log.reportedBad}
                        </b>
                      </span>
                    </span>
                  </div>

                  {log.note && log.note !== "-" && (
                    <div style={styles.historyRowBot}>
                      <FaCommentDots size={10} style={{ marginRight: "4px" }} />{" "}
                      {log.note}
                    </div>
                  )}
                </div>
              ))
            )}
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
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
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
  topListContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    padding: "15px",
    marginBottom: "15px",
    height: "180px",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    fontSize: "14px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  horizontalList: {
    display: "flex",
    gap: "15px",
    overflowX: "auto",
    paddingBottom: "10px",
    height: "100%",
    alignItems: "center",
  },
  emptyList: {
    width: "100%",
    textAlign: "center",
    color: "#ccc",
    marginTop: "30px",
  },
  orderCard: {
    minWidth: "220px",
    height: "100%",
    borderRadius: "10px",
    padding: "12px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "relative",
    boxSizing: "border-box",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2px",
  },
  lineBadge: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "#666",
    backgroundColor: "#eee",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  statusBadge: {
    fontSize: "10px",
    color: "white",
    padding: "2px 6px",
    borderRadius: "8px",
    fontWeight: "bold",
  },
  productName: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  orderId: { fontSize: "11px", color: "#999" },
  progressContainer: { marginTop: "5px" },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "11px",
    marginBottom: "2px",
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
  bottomContainer: { display: "flex", gap: "15px", alignItems: "flex-start" },
  formPanel: {
    flex: 2.2,
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
  },
  panelTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#333",
  },
  formContent: { flex: 1, display: "flex", flexDirection: "column" },
  infoSummary: {
    backgroundColor: "#F8F9FA",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    fontSize: "14px",
    border: `1px solid ${COLORS.border}`,
    alignItems: "center",
  },

  inlineWorkerEdit: {
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "4px",
    padding: "2px 5px",
    border: `1px solid ${COLORS.border}`,
    maxWidth: "180px",
  },
  inlineInput: {
    border: "none",
    fontSize: "13px",
    width: "100%",
    outline: "none",
    color: "#333",
    background: "transparent",
  },

  predictionBox: {
    marginBottom: "15px",
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: `${COLORS.secondary}`,
  },
  predHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    marginBottom: "5px",
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

  fullWidthBox: {
    width: "100%",
    minHeight: "160px",
    backgroundColor: "#fff",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
  },

  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    whiteSpace: "nowrap",
  },
  label: { fontSize: "14px", fontWeight: "bold", color: "#555" },
  subInput: {
    padding: "8px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    textAlign: "center",
  },
  select: {
    padding: "8px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "13px",
    minWidth: 0,
  },
  addBtnIcon: {
    backgroundColor: COLORS.danger,
    color: "white",
    border: "none",
    borderRadius: "6px",
    width: "35px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  miniDefectList: {
    marginTop: "8px",
    backgroundColor: "#f9f9f9",
    borderRadius: "4px",
    flex: 1,
    overflowY: "auto",
    padding: "0 5px",
  },
  miniDefectItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    padding: "6px 2px",
    borderBottom: "1px dashed #ddd",
  },
  memoInput: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    boxSizing: "border-box",
  },
  checkSection: { marginTop: "15px", marginBottom: "15px" },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#333",
  },
  warningBox: {
    backgroundColor: "#FFF4F4",
    border: `1px solid ${COLORS.danger}`,
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "15px",
  },
  warningTitle: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: COLORS.danger,
    fontWeight: "bold",
    marginBottom: "5px",
    fontSize: "13px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.danger}`,
    minHeight: "50px",
    fontSize: "13px",
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
    gap: "8px",
    marginTop: "auto",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#ccc",
  },
  historyPanel: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  historyListScroll: { display: "flex", flexDirection: "column", gap: "10px" },
  historyRowItem: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "10px",
    fontSize: "13px",
    backgroundColor: "#F9FAFB",
    position: "relative",
  },
  historyRowTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
    color: "#666",
    fontSize: "12px",
  },
  histTime: { color: COLORS.gray },
  historyRowMid: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
    alignItems: "center",
  },
  historyRowBot: {
    marginTop: "5px",
    paddingTop: "5px",
    borderTop: "1px dashed #eee",
    fontSize: "12px",
    color: "#666",
    display: "flex",
    alignItems: "center",
  },
  emptyStateSimple: {
    textAlign: "center",
    color: "#ccc",
    marginTop: "30px",
    fontSize: "13px",
  },
  deleteReportBtn: {
    border: "none",
    background: "transparent",
    color: "#999",
    cursor: "pointer",
    padding: "0 5px",
    transition: "color 0.2s",
    ":hover": { color: COLORS.danger },
  },
  cancelEditBtn: {
    marginLeft: "10px",
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#666",
  },
};

export default WorkReport;
