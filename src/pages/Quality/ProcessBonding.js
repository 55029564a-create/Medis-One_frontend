import React, { useState, useEffect } from "react";
import {
  FaMicroscope,
  FaCompressArrowsAlt,
  FaWind,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCube,
  FaChartArea,
  FaList,
  FaHistory,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// 🎨 MedisOne Soft Theme
const COLORS = {
  primary: "#8C85FF",
  primaryLight: "#F3F1FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333333",
  subText: "#888888",
  success: "#00C851",
  danger: "#FF4444",
  warning: "#FFBB33",
  border: "#E0E0E0",
  selectBg: "#F4F3FF",
  selectBorder: "#8C85FF",
};

const SPECS = {
  vacuum: { limit: -95.0, label: "Max -95.0" },
  gap: { min: 0.13, max: 0.17, target: 0.15, label: "0.15 ± 0.02" },
  align: { limit: 0.05, label: "± 0.05" },
  pressure: { min: 2300, max: 2700, target: 2500, label: "2500 ± 200" },
};

const ProcessBonding = () => {
  const [historyData, setHistoryData] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    // 🏭 LOT 번호 포맷 (아까 만든 바코드 시스템과 통일)
    const todayPrefix = "260205A01";

    const data = Array.from({ length: 50 }).map((_, i) => {
      // 🎲 1. 불량 발생 여부 결정 (3% 확률)
      // Math.random()은 0~1 사이 난수. 0.97보다 크면(상위 3%) 불량으로 설정
      const isForceNG = Math.random() > 0.97;

      // 🛑 2. 기본값 생성 (일단은 무조건 '정상' 범위 안에서 예쁘게 생성)
      // Vacuum: -98.0 ~ -96.0 (Limit: -95.0 보다 낮아야 함) -> 안전
      let vacuum = -98.0 + Math.random() * 2.0;
      // Gap: 0.145 ~ 0.155 (Spec: 0.13 ~ 0.17 / Target: 0.15) -> 아주 정밀하게
      let gap = 0.145 + Math.random() * 0.01;
      // Align: -0.02 ~ +0.02 (Limit: ±0.05) -> 안전
      let alignX = Math.random() * 0.04 - 0.02;
      let alignY = Math.random() * 0.04 - 0.02;
      // Pressure: 2450 ~ 2550 (Limit: 2300 ~ 2700) -> 안전
      let pressure = 2450 + Math.random() * 100;

      // 💣 3. 만약 '불량 당첨(isForceNG)'이라면? -> 하나만 콕 집어서 망가뜨림
      if (isForceNG) {
        const failType = Math.floor(Math.random() * 4); // 0~3 중 하나 뽑기

        if (failType === 0) {
          vacuum = -94.0; // Vacuum NG (한계치 -95보다 높음)
        } else if (failType === 1) {
          gap = 0.18; // Gap NG (0.17 초과)
        } else if (failType === 2) {
          alignX = 0.06; // Align NG (0.05 초과)
        } else {
          pressure = 2200; // Pressure NG (2300 미만)
        }
      }

      // 🔍 4. 판정 로직 (이제 수치가 확정되었으니 진짜 NG인지 검사)
      const isVacuumNG = vacuum > SPECS.vacuum.limit;
      const isGapNG = gap < SPECS.gap.min || gap > SPECS.gap.max;
      const isAlignNG =
        Math.max(Math.abs(alignX), Math.abs(alignY)) > SPECS.align.limit;
      const isPressureNG =
        pressure < SPECS.pressure.min || pressure > SPECS.pressure.max;

      const isNG = isVacuumNG || isGapNG || isAlignNG || isPressureNG;

      let ngType = "-";
      if (isNG) {
        if (isVacuumNG) ngType = "Vacuum Leak";
        else if (isGapNG) ngType = "Gap Spec Out";
        else if (isAlignNG) ngType = "Align Fail";
        else ngType = "Press. Error";
      }

      return {
        id: `${todayPrefix}${(1000 + i).toString()}`, // LOT 번호 유지
        timestamp: `14:${(59 - (i % 60)).toString().padStart(2, "0")}:15`,
        model: "MED-27-PRO",
        result: isNG ? "NG" : "PASS",
        ngType,
        detail: {
          vacuum: parseFloat(vacuum.toFixed(2)),
          gap: parseFloat(gap.toFixed(3)),
          alignX: parseFloat(alignX.toFixed(3)),
          alignY: parseFloat(alignY.toFixed(3)),
          pressure: Math.round(pressure),
        },
        judgement: { isVacuumNG, isGapNG, isAlignNG, isPressureNG },
      };
    });

    setHistoryData(data);
    setSelectedLog(data[0]);
  }, []);

  const getChartData = (log) => {
    if (!log) return [];
    return Array.from({ length: 11 }).map((_, t) => ({
      time: `${t}s`,
      vacuum: t < 3 ? -30 * t : log.detail.vacuum + Math.random() * 0.5,
      pressure:
        t < 5
          ? 0
          : t < 8
            ? log.detail.pressure * ((t - 4) / 4)
            : log.detail.pressure,
    }));
  };

  const filteredList = historyData.filter(
    (item) => filter === "ALL" || item.result === filter,
  );

  return (
    <div style={styles.container}>
      <style>{`
        .scroll-hidden { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .scroll-hidden::-webkit-scrollbar { display: none; }
      `}</style>

      {/* 1. Header (고정 높이) */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logoIcon}>
            <FaMicroscope />
          </div>
          <div>
            <h2 style={styles.title}>Optical Bonding Inspection</h2>
            <p style={styles.subTitle}>Line A-01 Real-time Quality Monitor</p>
          </div>
        </div>
        <div style={styles.kpiGroup}>
          <KPICard label="Total" value="50" color={COLORS.text} />
          <KPICard
            label="OK"
            value={historyData.filter((d) => d.result === "PASS").length}
            color={COLORS.success}
          />
          <KPICard
            label="NG"
            value={historyData.filter((d) => d.result === "NG").length}
            color={COLORS.danger}
          />
        </div>
      </div>

      {/* 2. Main Content (헤더 제외 나머지 공간) */}
      <div style={styles.mainBody}>
        {/* [TOP] 상세 분석 (최대 55% 높이 제한, 넘치면 자체 스크롤) */}
        <div style={styles.topSection}>
          {selectedLog ? (
            <div style={styles.detailWrapper}>
              {/* 분석 헤더 */}
              <div style={styles.analysisHeader}>
                <div style={styles.analysisTitleGroup}>
                  <FaChartArea color={COLORS.primary} size={18} />
                  <h3 style={styles.detailTitle}>
                    Detail Analysis:{" "}
                    <span style={{ color: COLORS.primary, marginLeft: "8px" }}>
                      {selectedLog.id}
                    </span>
                  </h3>
                </div>
                <div style={styles.resultGroup}>
                  {selectedLog.result === "NG" ? (
                    <span style={styles.bigNgBadge}>
                      <FaExclamationTriangle /> NG: {selectedLog.ngType}
                    </span>
                  ) : (
                    <span style={styles.bigPassBadge}>
                      <FaCheckCircle /> PASS
                    </span>
                  )}
                  <span style={styles.modelBadge}>
                    Model: {selectedLog.model}
                  </span>
                </div>
              </div>

              {/* 3단 그리드 */}
              <div style={styles.gridContainer}>
                {/* (1) 측정값 */}
                <div style={styles.card}>
                  <h4 style={styles.cardTitle}>Measured Values</h4>
                  <div style={styles.sensorList}>
                    <SensorRow
                      label="Chamber Vacuum"
                      value={selectedLog.detail.vacuum}
                      unit="kPa"
                      spec={SPECS.vacuum.label}
                      isNG={selectedLog.judgement.isVacuumNG}
                      icon={<FaWind />}
                    />
                    <SensorRow
                      label="OCR Gap Thickness"
                      value={selectedLog.detail.gap}
                      unit="mm"
                      spec={SPECS.gap.label}
                      isNG={selectedLog.judgement.isGapNG}
                      icon={<FaCube />}
                    />
                    <SensorRow
                      label="Align Offset"
                      value={Math.max(
                        Math.abs(selectedLog.detail.alignX),
                        Math.abs(selectedLog.detail.alignY),
                      ).toFixed(3)}
                      unit="mm"
                      spec={SPECS.align.label}
                      isNG={selectedLog.judgement.isAlignNG}
                      icon={<FaCompressArrowsAlt />}
                    />
                  </div>
                </div>

                {/* (2) 비전 맵 */}
                <div style={styles.card}>
                  <div style={styles.cardHeaderRow}>
                    <h4 style={styles.cardTitle}>Vision Align Map</h4>
                    {selectedLog.judgement.isAlignNG ? (
                      <span
                        style={{
                          fontSize: "11px",
                          color: COLORS.danger,
                          fontWeight: "800",
                        }}
                      >
                        ❌ FAIL
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "11px",
                          color: COLORS.success,
                          fontWeight: "800",
                        }}
                      >
                        ✅ OK
                      </span>
                    )}
                  </div>
                  <div style={styles.visionMap}>
                    <div style={styles.crossX}></div>
                    <div style={styles.crossY}></div>
                    <div
                      style={{
                        ...styles.panelRect,
                        transform: `translate(${selectedLog.detail.alignX * 2500}px, ${selectedLog.detail.alignY * 2500}px)`,
                        borderColor: selectedLog.judgement.isAlignNG
                          ? COLORS.danger
                          : COLORS.success,
                        backgroundColor: selectedLog.judgement.isAlignNG
                          ? "rgba(255, 68, 68, 0.15)"
                          : "rgba(0, 200, 81, 0.1)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          color: "white",
                          textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        }}
                      >
                        Panel
                      </span>
                    </div>
                    <div style={styles.coordBox}>
                      X: {selectedLog.detail.alignX} / Y:{" "}
                      {selectedLog.detail.alignY}
                    </div>
                  </div>
                  {/* 정렬은 정상이지만 전체 불량인 경우 */}
                  {selectedLog.result === "NG" &&
                    !selectedLog.judgement.isAlignNG && (
                      <div style={styles.alignWarning}>
                        ⚠️ Align OK, but {selectedLog.ngType}
                      </div>
                    )}
                </div>

                {/* (3) 차트 */}
                <div style={styles.chartCard}>
                  <h4 style={styles.cardTitle}>Cycle Trend (10s)</h4>
                  <div style={{ flex: 1, width: "100%", minHeight: "150px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData(selectedLog)}>
                        <defs>
                          <linearGradient
                            id="colorVac"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={COLORS.primary}
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor={COLORS.primary}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#eee"
                        />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis yAxisId="left" domain={[-110, -70]} hide />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 3500]}
                          hide
                        />
                        <Tooltip
                          contentStyle={{
                            fontSize: "12px",
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <ReferenceLine
                          yAxisId="left"
                          y={SPECS.vacuum.limit}
                          stroke={COLORS.danger}
                          strokeDasharray="3 3"
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="vacuum"
                          stroke={COLORS.primary}
                          fill="url(#colorVac)"
                          strokeWidth={2}
                          name="Vacuum"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="pressure"
                          stroke={COLORS.warning}
                          strokeWidth={2}
                          dot={false}
                          name="Pressure"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyState}>데이터를 선택해주세요.</div>
          )}
        </div>

        {/* [BOTTOM] 리스트 (나머지 공간 전부 차지 - 절대 잘리지 않음) */}
        <div style={styles.bottomSection}>
          <div style={styles.listHeader}>
            <div style={styles.listTitle}>
              <FaHistory
                style={{ marginRight: "8px", color: COLORS.primary }}
              />{" "}
              Production History
            </div>
            <div style={styles.filterGroup}>
              {["ALL", "PASS", "NG"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  style={{
                    ...styles.filterBtn,
                    backgroundColor:
                      filter === type ? COLORS.primary : "transparent",
                    color: filter === type ? "white" : COLORS.subText,
                    borderColor:
                      filter === type ? COLORS.primary : COLORS.border,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 테이블 영역: 부모 높이를 꽉 채우고 내부 스크롤 */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Lot / ID</th>
                  <th style={styles.th}>Result</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Vac (kPa)</th>
                  <th style={styles.th}>Gap (mm)</th>
                  <th style={styles.th}>Align (mm)</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item) => {
                  const isSelected = selectedLog?.id === item.id;
                  // 불량 시 해당 수치 빨간색 강조
                  const vacStyle = item.judgement.isVacuumNG
                    ? styles.tdNG
                    : styles.td;
                  const gapStyle = item.judgement.isGapNG
                    ? styles.tdNG
                    : styles.td;
                  const alignStyle = item.judgement.isAlignNG
                    ? styles.tdNG
                    : styles.td;

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedLog(item)}
                      style={{
                        ...styles.tr,
                        backgroundColor: isSelected ? COLORS.selectBg : "white",
                        borderLeft: isSelected
                          ? `4px solid ${COLORS.selectBorder}`
                          : "4px solid transparent",
                      }}
                    >
                      <td style={styles.td}>{item.timestamp}</td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: "600",
                          color: COLORS.text,
                        }}
                      >
                        {item.id}
                      </td>
                      <td style={styles.td}>
                        <StatusBadge result={item.result} />
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          color: item.result === "NG" ? COLORS.danger : "#aaa",
                          fontSize: "11px",
                          fontWeight: item.result === "NG" ? "bold" : "normal",
                        }}
                      >
                        {item.ngType}
                      </td>
                      <td style={vacStyle}>{item.detail.vacuum}</td>
                      <td style={gapStyle}>{item.detail.gap}</td>
                      <td style={alignStyle}>
                        {Math.max(
                          Math.abs(item.detail.alignX),
                          Math.abs(item.detail.alignY),
                        ).toFixed(3)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Components ---
const KPICard = ({ label, value, color }) => (
  <div style={styles.kpiBadge}>
    <span
      style={{ color: COLORS.subText, fontSize: "11px", marginRight: "6px" }}
    >
      {label}:
    </span>
    <span style={{ color: color, fontWeight: "bold", fontSize: "15px" }}>
      {value}
    </span>
  </div>
);

const StatusBadge = ({ result }) => (
  <span
    style={{
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: "bold",
      backgroundColor: result === "PASS" ? "#E8F5E9" : "#FFEBEE",
      color: result === "PASS" ? COLORS.success : COLORS.danger,
      display: "inline-flex",
      alignItems: "center",
      gap: "5px",
      border: `1px solid ${result === "PASS" ? COLORS.success : COLORS.danger}20`,
    }}
  >
    {result === "PASS" ? <FaCheckCircle /> : <FaExclamationTriangle />} {result}
  </span>
);

const SensorRow = ({ label, value, unit, spec, isNG, icon }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px dashed #eee",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: isNG ? COLORS.danger : COLORS.subText,
      }}
    >
      <div
        style={{
          backgroundColor: isNG ? "#FFEBEE" : COLORS.primaryLight,
          padding: "6px",
          borderRadius: "6px",
          color: isNG ? COLORS.danger : COLORS.primary,
          fontSize: "14px",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{ fontSize: "12px", fontWeight: "600", color: COLORS.text }}
        >
          {label}
        </div>
        <div style={{ fontSize: "10px", color: "#999" }}>Spec: {spec}</div>
      </div>
    </div>
    <div style={{ textAlign: "right" }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: isNG ? COLORS.danger : COLORS.text,
        }}
      >
        {value}{" "}
        <span style={{ fontSize: "11px", fontWeight: "normal", color: "#999" }}>
          {unit}
        </span>
      </div>
      {isNG && (
        <span
          style={{
            fontSize: "10px",
            color: COLORS.danger,
            fontWeight: "bold",
            backgroundColor: "#FFEBEE",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          SPEC OUT
        </span>
      )}
    </div>
  </div>
);

// --- Styles (Height Fixes) ---
const styles = {
  // 전체 높이 고정 (100vh), 스크롤 없음
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: COLORS.bg,
    boxSizing: "border-box",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },

  // 1. Header: Fixed 70px
  header: {
    flex: "0 0 70px",
    backgroundColor: "white",
    padding: "0 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
    zIndex: 20,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "15px" },
  logoIcon: {
    width: "40px",
    height: "40px",
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  title: { fontSize: "20px", fontWeight: "700", color: COLORS.text, margin: 0 },
  subTitle: { fontSize: "12px", color: COLORS.subText, marginTop: "2px" },
  kpiGroup: { display: "flex", gap: "12px" },
  kpiBadge: {
    backgroundColor: "#F8F9FA",
    padding: "8px 16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.border}`,
  },

  // 2. Main Body: 헤더 제외한 모든 공간 (Flex 1)
  mainBody: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  // [Top] Detail Section: 내용에 맞춰 늘어나되, 최대 55%까지만 차지. 넘치면 스크롤.
  topSection: {
    flex: "0 0 auto",
    maxHeight: "55%",
    overflowY: "auto",
    padding: "20px 30px",
    boxSizing: "border-box",
  },

  detailWrapper: { display: "flex", flexDirection: "column" },
  analysisHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  analysisTitleGroup: { display: "flex", alignItems: "center", gap: "10px" },
  detailTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: COLORS.text,
    margin: 0,
  },

  resultGroup: { display: "flex", alignItems: "center", gap: "12px" },
  bigPassBadge: {
    backgroundColor: COLORS.success,
    color: "white",
    padding: "6px 16px",
    borderRadius: "30px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    boxShadow: "0 4px 10px rgba(0,200,81,0.3)",
  },
  bigNgBadge: {
    backgroundColor: COLORS.danger,
    color: "white",
    padding: "6px 16px",
    borderRadius: "30px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "13px",
    boxShadow: "0 4px 10px rgba(255,68,68,0.3)",
  },
  modelBadge: {
    fontSize: "13px",
    color: COLORS.text,
    fontWeight: "600",
    backgroundColor: "white",
    padding: "6px 12px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },

  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1.5fr",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    border: "1px solid white",
    minHeight: "260px",
  },
  chartCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    border: "1px solid white",
    minHeight: "260px",
    overflow: "hidden",
  },

  cardHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#555",
    margin: 0,
    marginBottom: "10px",
  },
  sensorList: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1,
  },

  visionMap: {
    flex: 1,
    backgroundColor: "#2D3436",
    borderRadius: "12px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: "150px",
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
  },
  crossX: {
    position: "absolute",
    width: "100%",
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  crossY: {
    position: "absolute",
    height: "100%",
    width: "1px",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  panelRect: {
    width: "60%",
    height: "45%",
    border: "2px solid",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
  },
  coordBox: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "white",
    fontSize: "11px",
    padding: "4px 8px",
    borderRadius: "6px",
    fontFamily: "monospace",
  },
  alignWarning: {
    marginTop: "10px",
    fontSize: "11px",
    color: COLORS.warning,
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#FFF8E1",
    padding: "5px",
    borderRadius: "6px",
  },

  // [BOTTOM] List Section: 남은 공간 전부 (Flex 1)
  bottomSection: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "white",
    borderTop: `1px solid ${COLORS.border}`,
    minHeight: "0",
  },

  listHeader: {
    padding: "12px 30px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  listTitle: {
    fontWeight: "700",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
  },
  filterGroup: { display: "flex", gap: "8px" },
  filterBtn: {
    padding: "6px 14px",
    border: "1px solid",
    borderRadius: "20px",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.2s",
  },

  // Table Container: Flex 1로 부모의 남은 공간을 꽉 채우고, overflow-y: auto로 내부 스크롤 활성화
  tableContainer: { flex: "1", overflowY: "auto", padding: "0 30px" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
  th: {
    position: "sticky",
    top: 0,
    backgroundColor: "#fff",
    zIndex: 5,
    padding: "12px 10px",
    textAlign: "left",
    color: COLORS.subText,
    borderBottom: `2px solid ${COLORS.border}`,
    fontWeight: "600",
    fontSize: "12px",
  },
  tr: {
    cursor: "pointer",
    borderBottom: "1px solid #f5f5f5",
    transition: "background 0.2s",
  },
  td: { padding: "12px 10px", color: COLORS.text, verticalAlign: "middle" },
  tdNG: {
    padding: "12px 10px",
    color: COLORS.danger,
    fontWeight: "700",
    verticalAlign: "middle",
  },

  emptyState: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
  },
};

export default ProcessBonding;
