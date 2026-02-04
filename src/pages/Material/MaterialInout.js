import React, { useState, useEffect } from "react";
import {
  FaWaveSquare,
  FaArrowDown,
  FaTint,
  FaSyncAlt,
  FaFilter,
  FaMicroscope,
  FaTimes,
  FaThumbtack,
  FaHistory,
  FaBoxOpen,
  FaCalendarAlt,
  FaSave,
  FaEye,
} from "react-icons/fa";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Area,
  LineChart,
} from "recharts";

// 🎨 디자인 시스템
const COLORS = {
  bg: "#F5F7FA",
  white: "#FFFFFF",
  primary: "#6C5CE7",
  secondary: "#00B894",
  warning: "#FFA502",
  text: "#2D3436",
  border: "#DFE6E9",
  ok: "#00B894",
  ng: "#FF7675",
  holdPrimary: "#e17055",
  holdNeighbor: "#fdcb6e",
  dark: "#2d3436",
};

// 📦 [Master] 제품 목록
const PRODUCT_LIST = [
  { code: "ZOLL-18", name: 'Zoll X Series 18"', target: "Line A" },
  { code: "ZOLL-24", name: 'Zoll X Series 24"', target: "Line A" },
  { code: "CPLS-18", name: 'Corpuls3 18"', target: "Line B" },
  { code: "CPLS-24", name: 'Corpuls3 24"', target: "Line B" },
  { code: "PRQ-18", name: 'Propaq M 18"', target: "Line C" },
  { code: "PRQ-24", name: 'Propaq M 24"', target: "Line C" },
];

// 🎲 [Logic] 유닛 데이터 생성
const createUnit = (batchId, seq) => {
  const isNG = Math.random() < 0.025;
  const isPrimaryHold = !isNG && Math.random() < 0.02;

  const vibData = Array.from({ length: 6 }, (_, t) => ({
    time: `T${t}`,
    value: isNG
      ? (Math.random() * 2.5).toFixed(2)
      : (Math.random() * 1.0).toFixed(2),
  }));

  const dropData = Array.from({ length: 3 }, (_, t) => ({
    height: `${(t + 1) * 50}cm`,
    impact:
      isNG && Math.random() > 0.5
        ? 90 + Math.random() * 20
        : 45 + Math.random() * 10,
  }));

  const waterData = Array.from({ length: 6 }, (_, t) => ({
    time: `${t}m`,
    pressure:
      isNG && Math.random() > 0.5 ? 100 - t * 15 : 100 - Math.random() * 2,
  }));

  return {
    id: `${batchId}-${String(seq).padStart(3, "0")}`,
    seq,
    rawStatus: isNG ? "NG" : isPrimaryHold ? "HOLD_P" : "OK",
    status: "OK",
    cause: isNG ? "Defect Found" : isPrimaryHold ? "Calibration Error" : "-",
    vibData,
    dropData,
    waterData,
  };
};

// 🏭 [Logic] 배치 생성 및 홀딩 전파
const generateBatch = (batchId) => {
  let units = [];
  for (let i = 1; i <= 200; i++) units.push(createUnit(batchId, i));

  const finalUnits = units.map((u) => ({
    ...u,
    status: u.rawStatus === "HOLD_P" ? "HOLD_P" : u.rawStatus,
  }));
  for (let i = 0; i < finalUnits.length; i++) {
    if (finalUnits[i].rawStatus === "HOLD_P") {
      [-2, -1, 1, 2].forEach((offset) => {
        const targetIdx = i + offset;
        if (
          targetIdx >= 0 &&
          targetIdx < 200 &&
          finalUnits[targetIdx].status === "OK"
        ) {
          finalUnits[targetIdx].status = "HOLD_N";
          finalUnits[targetIdx].cause = `Adj. Hold (#${finalUnits[i].seq})`;
        }
      });
    }
  }
  return finalUnits;
};

const ReliabilityTest = () => {
  const [selectedProductCode, setSelectedProductCode] = useState(
    PRODUCT_LIST[0].code,
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [database, setDatabase] = useState({});
  const [activeBatchId, setActiveBatchId] = useState(null);
  const [filterType, setFilterType] = useState("ALL");
  const [activeUnit, setActiveUnit] = useState(null);
  const [compareList, setCompareList] = useState([]);

  const selectedProduct = PRODUCT_LIST.find(
    (p) => p.code === selectedProductCode,
  );

  useEffect(() => {
    const batches = getBatches(selectedDate, selectedProductCode);
    if (batches.length > 0 && !activeBatchId) {
      setActiveBatchId(batches[0].id);
    } else if (batches.length === 0) {
      setActiveBatchId(null);
    }
    setActiveUnit(null);
  }, [selectedDate, selectedProductCode, database]);

  const getBatches = (date, modelCode) => {
    if (database[date] && database[date][modelCode]) {
      return database[date][modelCode];
    }
    return [];
  };

  const createNewBatch = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const batchId = `BATCH-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const newBatchData = generateBatch(batchId);

    const newBatchObj = {
      id: batchId,
      time: timeStr,
      data: newBatchData,
      ngCount: newBatchData.filter((u) => u.status === "NG").length,
      holdCount: newBatchData.filter((u) => u.status.includes("HOLD")).length,
    };

    setDatabase((prev) => {
      const dateData = prev[selectedDate] || {};
      const modelData = dateData[selectedProductCode] || [];
      return {
        ...prev,
        [selectedDate]: {
          ...dateData,
          [selectedProductCode]: [newBatchObj, ...modelData],
        },
      };
    });
    setActiveBatchId(batchId);
  };

  const currentBatchList = getBatches(selectedDate, selectedProductCode);
  const currentBatch = currentBatchList.find((b) => b.id === activeBatchId);
  const displayData = currentBatch ? currentBatch.data : [];

  const filteredData = displayData.filter((unit) => {
    if (filterType === "NG") return unit.status === "NG";
    if (filterType === "HOLD") return unit.status.includes("HOLD");
    return true;
  });

  const toggleCompare = (unit) => {
    if (compareList.find((u) => u.id === unit.id)) {
      setCompareList(compareList.filter((u) => u.id !== unit.id));
    } else {
      if (compareList.length >= 6)
        return alert("최대 6개까지만 비교 가능합니다.");
      setCompareList([...compareList, unit]);
    }
  };

  const loadComparison = (unit) => {
    setActiveUnit(unit);
    document
      .getElementById("main-content-area")
      ?.scrollTo({ top: 200, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
      `}</style>

      <div style={styles.container}>
        {/* 사이드바 */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarHeader}>
              <h3>📅 Date Selection</h3>
            </div>
            <div style={{ padding: "15px" }}>
              <div style={styles.dateInputWrapper}>
                <FaCalendarAlt color="#666" />
                <input
                  type="date"
                  style={styles.dateInput}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={styles.sidebarSection}>
            <div style={styles.sidebarHeader}>
              <h3>📦 Model Select</h3>
            </div>
            <div style={{ padding: "15px" }}>
              <select
                style={styles.selectInput}
                value={selectedProductCode}
                onChange={(e) => setSelectedProductCode(e.target.value)}
              >
                {PRODUCT_LIST.map((prod) => (
                  <option key={prod.code} value={prod.code}>
                    {prod.name}
                  </option>
                ))}
              </select>
              <div
                style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}
              >
                Target Line: <strong>{selectedProduct.target}</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              borderTop: `1px solid ${COLORS.border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={styles.sidebarHeader}>
              <h3
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                🕒 Batch History{" "}
                <span style={{ fontSize: "11px", color: "#888" }}>
                  ({currentBatchList.length})
                </span>
              </h3>
            </div>
            <div style={styles.listWrapper}>
              {currentBatchList.length === 0 ? (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: "12px",
                  }}
                >
                  No batches created yet.
                </div>
              ) : (
                currentBatchList.map((batch) => (
                  <div
                    key={batch.id}
                    onClick={() => setActiveBatchId(batch.id)}
                    style={{
                      ...styles.historyItem,
                      backgroundColor:
                        activeBatchId === batch.id ? "#E8F5E9" : "transparent",
                      borderColor:
                        activeBatchId === batch.id ? COLORS.ok : "#eee",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "bold",
                        fontSize: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{batch.time}</span>
                      <span style={{ fontSize: "10px", color: "#666" }}>
                        {batch.id}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", marginTop: "4px" }}>
                      NG:{" "}
                      <span style={{ color: COLORS.ng, fontWeight: "bold" }}>
                        {batch.ngCount}
                      </span>{" "}
                      | Hold:{" "}
                      <span
                        style={{ color: COLORS.warning, fontWeight: "bold" }}
                      >
                        {batch.holdCount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div id="main-content-area" style={styles.mainContent}>
          <div style={styles.topBar}>
            <div>
              <h2 style={styles.pageTitle}>
                {selectedProduct.name}
                {activeBatchId && (
                  <span style={styles.batchBadge}>{activeBatchId}</span>
                )}
              </h2>
              {currentBatch && (
                <div style={styles.statsRow}>
                  <span>
                    Total: <strong>200</strong>
                  </span>
                  <span style={{ color: COLORS.ok }}>
                    OK:{" "}
                    <strong>
                      {
                        currentBatch.data.filter((d) => d.status === "OK")
                          .length
                      }
                    </strong>
                  </span>
                  <span style={{ color: COLORS.ng }}>
                    NG: <strong>{currentBatch.ngCount}</strong>
                  </span>
                  <span style={{ color: COLORS.warning }}>
                    HOLD: <strong>{currentBatch.holdCount}</strong>
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={styles.filterGroup}>
                <button
                  style={
                    filterType === "ALL"
                      ? styles.activeFilter
                      : styles.filterBtn
                  }
                  onClick={() => setFilterType("ALL")}
                >
                  ALL
                </button>
                <button
                  style={
                    filterType === "NG"
                      ? { ...styles.activeFilter, background: COLORS.ng }
                      : styles.filterBtn
                  }
                  onClick={() => setFilterType("NG")}
                >
                  NG
                </button>
                <button
                  style={
                    filterType === "HOLD"
                      ? { ...styles.activeFilter, background: COLORS.warning }
                      : styles.filterBtn
                  }
                  onClick={() => setFilterType("HOLD")}
                >
                  HOLD
                </button>
              </div>
              <button style={styles.refreshBtn} onClick={createNewBatch}>
                <FaSave /> Create & Save Batch
              </button>
            </div>
          </div>

          {currentBatch ? (
            <div style={styles.gridContainer}>
              {filteredData.map((unit) => {
                const isSelected = activeUnit?.id === unit.id;
                let bgColor = COLORS.ok;
                if (unit.status === "NG") bgColor = COLORS.ng;
                else if (unit.status === "HOLD_P") bgColor = COLORS.holdPrimary;
                else if (unit.status === "HOLD_N")
                  bgColor = COLORS.holdNeighbor;

                return (
                  <div
                    key={unit.id}
                    onClick={() => setActiveUnit(unit)}
                    title={`Seq: ${unit.seq} / Status: ${unit.status}`}
                    style={{
                      ...styles.gridItem,
                      backgroundColor: bgColor,
                      boxShadow: isSelected
                        ? "0 0 0 3px #2d3436 inset"
                        : "none",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                      zIndex: isSelected ? 10 : 1,
                      opacity: filterType !== "ALL" ? 1 : isSelected ? 1 : 0.8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {unit.seq}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <FaBoxOpen size={40} color="#ddd" />
              <p>
                No batch data found for this date.
                <br />
                Click "Create & Save Batch" to generate data.
              </p>
            </div>
          )}

          {/* 상세 분석 패널 */}
          {activeUnit ? (
            <div style={styles.detailPanel}>
              <div style={styles.detailHeader}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <h3 style={styles.detailTitle}>
                    <FaMicroscope /> Unit Analysis : {activeUnit.id}
                  </h3>
                  <span
                    style={{
                      ...styles.statusTag,
                      backgroundColor:
                        activeUnit.status === "OK"
                          ? COLORS.ok
                          : activeUnit.status === "NG"
                            ? COLORS.ng
                            : COLORS.warning,
                    }}
                  >
                    {activeUnit.status === "HOLD_P"
                      ? "PRIMARY HOLD"
                      : activeUnit.status === "HOLD_N"
                        ? "NEIGHBOR HOLD"
                        : activeUnit.status}
                  </span>
                  {activeUnit.status !== "OK" && (
                    <span style={styles.defectTag}>
                      Cause: {activeUnit.cause}
                    </span>
                  )}
                </div>
                <button
                  style={styles.pinBtn}
                  onClick={() => toggleCompare(activeUnit)}
                >
                  <FaThumbtack /> Pin to Compare
                </button>
              </div>

              <div style={styles.chartRow}>
                {/* 🚨 수정: minWidth={0} 추가 */}
                <div style={styles.chartBox}>
                  <h4 style={{ ...styles.chartTitle, color: COLORS.primary }}>
                    <FaWaveSquare /> Vibration
                  </h4>
                  <div style={{ width: "100%", height: "150px" }}>
                    <ResponsiveContainer minWidth={0}>
                      <ComposedChart data={activeUnit.vibData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" fontSize={10} tickLine={false} />
                        <YAxis domain={[0, 3]} fontSize={10} width={20} />
                        <Tooltip />
                        <ReferenceLine
                          y={1.5}
                          stroke="red"
                          strokeDasharray="3 3"
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={COLORS.primary}
                          strokeWidth={2}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={styles.chartBox}>
                  <h4 style={{ ...styles.chartTitle, color: COLORS.warning }}>
                    <FaArrowDown /> Drop Impact
                  </h4>
                  <div style={{ width: "100%", height: "150px" }}>
                    <ResponsiveContainer minWidth={0}>
                      <ComposedChart data={activeUnit.dropData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="height"
                          fontSize={10}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip cursor={{ fill: "#f0f0f0" }} />
                        <Bar
                          dataKey="impact"
                          fill={COLORS.warning}
                          barSize={20}
                          radius={[4, 4, 0, 0]}
                        >
                          {activeUnit.dropData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.impact > 80 ? COLORS.ng : COLORS.warning
                              }
                            />
                          ))}
                        </Bar>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={styles.chartBox}>
                  <h4 style={{ ...styles.chartTitle, color: COLORS.secondary }}>
                    <FaTint /> Water (Pressure)
                  </h4>
                  <div style={{ width: "100%", height: "150px" }}>
                    <ResponsiveContainer minWidth={0}>
                      <ComposedChart data={activeUnit.waterData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" fontSize={10} tickLine={false} />
                        <YAxis domain={[0, 110]} fontSize={10} width={25} />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="pressure"
                          stroke={COLORS.secondary}
                          fill={`${COLORS.secondary}30`}
                        />
                        <ReferenceLine
                          y={80}
                          stroke="red"
                          strokeDasharray="3 3"
                          label="Min"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            currentBatch && (
              <div
                style={{
                  marginTop: "20px",
                  textAlign: "center",
                  color: "#999",
                  padding: "30px",
                  border: "2px dashed #eee",
                  borderRadius: "12px",
                }}
              >
                Select a unit from the grid above to view details.
              </div>
            )
          )}
        </div>

        {/* 하단 툴바 */}
        {compareList.length > 0 && (
          <div style={styles.compareBar}>
            <div style={styles.compareHeader}>
              <h4
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FaBoxOpen /> Compare Tray ({compareList.length})
              </h4>
              <button
                style={styles.clearBtn}
                onClick={() => setCompareList([])}
              >
                Clear All
              </button>
            </div>
            <div style={styles.compareWrapper}>
              <div style={styles.compareGrid}>
                {compareList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadComparison(item)}
                    style={{
                      ...styles.compareCard,
                      border:
                        activeUnit?.id === item.id
                          ? `2px solid ${COLORS.dark}`
                          : `1px solid ${COLORS.border}`,
                    }}
                  >
                    <div style={styles.compareCardHeader}>
                      <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                        {item.id.split("-")[2]}
                      </span>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <FaTimes
                          style={{ cursor: "pointer", color: "#999" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCompare(item);
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ fontSize: "11px", marginBottom: "5px" }}>
                      <span
                        style={{
                          color:
                            item.status === "OK"
                              ? COLORS.ok
                              : item.status === "NG"
                                ? COLORS.ng
                                : COLORS.warning,
                          fontWeight: "bold",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "5px",
                        fontSize: "18px",
                        color: "#ccc",
                      }}
                    >
                      <FaEye />
                    </div>

                    {/* 🚨 미니 차트에도 minWidth={0} 추가 */}
                    <div style={{ width: "100%", height: "1px", opacity: 0 }}>
                      {/* 차트 에러 방지용 더미 (레이아웃 잡는 용도) */}
                      <ResponsiveContainer minWidth={0} height={10}>
                        <LineChart data={[]} />
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "calc(100vh - 60px)",
    backgroundColor: COLORS.bg,
    overflow: "hidden",
    position: "relative",
  },
  sidebar: {
    width: "260px",
    backgroundColor: COLORS.white,
    borderRight: `1px solid ${COLORS.border}`,
    display: "flex",
    flexDirection: "column",
  },
  sidebarSection: { flexShrink: 0 },
  sidebarHeader: {
    padding: "15px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: "#fafafa",
  },
  dateInputWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    padding: "8px 12px",
    borderRadius: "8px",
    gap: "10px",
  },
  dateInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    width: "100%",
    fontFamily: "inherit",
  },
  selectInput: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: "#fff",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  },
  listWrapper: { flex: 1, overflowY: "auto" },
  historyItem: {
    padding: "12px 20px",
    marginBottom: "0",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
    transition: "0.2s",
  },
  mainContent: {
    flex: 1,
    padding: "20px 30px",
    overflowY: "auto",
    paddingBottom: "200px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "20px",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "800",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  batchBadge: {
    fontSize: "12px",
    backgroundColor: COLORS.dark,
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontWeight: "normal",
    marginLeft: "10px",
  },
  statsRow: {
    display: "flex",
    gap: "15px",
    fontSize: "14px",
    marginTop: "8px",
  },
  filterGroup: {
    display: "flex",
    gap: "5px",
    backgroundColor: "#eee",
    padding: "4px",
    borderRadius: "6px",
  },
  filterBtn: {
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    backgroundColor: "transparent",
    color: "#666",
    fontWeight: "bold",
  },
  activeFilter: {
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    backgroundColor: COLORS.primary,
    color: "white",
    fontWeight: "bold",
  },
  refreshBtn: {
    backgroundColor: COLORS.dark,
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "bold",
  },
  gridContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    marginBottom: "20px",
  },
  gridItem: {
    width: "26px",
    height: "26px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    transition: "transform 0.1s",
  },
  detailPanel: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
    animation: "fadeIn 0.3s",
  },
  detailHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  detailTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  },
  statusTag: {
    padding: "4px 10px",
    borderRadius: "12px",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    marginLeft: "10px",
  },
  defectTag: {
    fontSize: "12px",
    color: COLORS.ng,
    fontWeight: "bold",
    marginLeft: "10px",
    backgroundColor: "#FFEBEE",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  pinBtn: {
    backgroundColor: COLORS.white,
    color: COLORS.dark,
    border: `1px solid ${COLORS.dark}`,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  chartRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
  },
  chartBox: {
    backgroundColor: "#fff",
    border: `1px solid #eee`,
    borderRadius: "8px",
    padding: "10px",
  },
  chartTitle: {
    fontSize: "13px",
    margin: "0 0 10px 0",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    color: "#bbb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  compareBar: {
    position: "fixed",
    bottom: 0,
    left: "260px",
    right: 0,
    height: "150px",
    backgroundColor: "white",
    borderTop: "3px solid #333",
    boxShadow: "0 -5px 20px rgba(0,0,0,0.15)",
    padding: "15px 30px",
    display: "flex",
    flexDirection: "column",
    zIndex: 1000,
  },
  compareHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  clearBtn: {
    background: "none",
    border: "none",
    textDecoration: "underline",
    cursor: "pointer",
    color: "#666",
    fontSize: "12px",
  },
  compareWrapper: { overflowX: "auto", paddingBottom: "10px" },
  compareGrid: { display: "flex", gap: "15px" },
  compareCard: {
    minWidth: "160px",
    backgroundColor: "#F5F7FA",
    borderRadius: "8px",
    padding: "10px",
    border: `1px solid ${COLORS.border}`,
    cursor: "pointer",
    transition: "0.2s",
  },
  compareCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#666",
    marginBottom: "4px",
  },
};

export default ReliabilityTest;
