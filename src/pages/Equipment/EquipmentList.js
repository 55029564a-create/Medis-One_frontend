import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEquipmentList } from "../../api/productionApi";
import {
  FaThermometerHalf,
  FaWind,
  FaBolt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStopCircle,
  FaPlayCircle,
  FaTools,
  FaHistory,
  FaMicroscope,
  FaLayerGroup,
  FaCompressArrowsAlt,
  FaSearch,
  FaFilter,
  FaRobot,
  FaWeightHanging,
  FaRulerHorizontal,
  FaSlidersH,
  FaEye,
  FaWaveSquare,
  FaTachometerAlt,
  FaSyncAlt, // [추가] 새로고침 아이콘
} from "react-icons/fa";
import { MdCleaningServices, MdOutlineViewInAr } from "react-icons/md";

// 🎨 MedisOne Soft Theme
const COLORS = {
  primary: "#8C85FF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  stop: "#9E9E9E",
  bg: "#F5F6FA",
  text: "#333",
  subText: "#888",
  cardBg: "#FFF",
  border: "#E0E0E0",
  inputBg: "#F0F2F5",
};

const EquipmentList = () => {
  const navigate = useNavigate();

  // // 🏭 [한글화 완료] 디스플레이 공정 설비 데이터
  // const machines = [
  //   // {
  //   //   id: "EQ-10",
  //   //   process: "전처리 공정", // Pre-Process
  //   //   name: "플라즈마 세정기 #01", // Plasma Cleaner
  //   //   type: "CLEANER",
  //   //   status: "RUN",
  //   //   metrics: [
  //   //     { label: "가스 유량", value: "50 sccm", icon: <FaWind /> },
  //   //     { label: "RF 파워", value: "2.5 kW", icon: <FaBolt /> },
  //   //   ],
  //   //   operator: "김세정",
  //   //   uptime: "08:12",
  //   // },
  //   // {
  //   //   id: "EQ-20",
  //   //   process: "메인 공정", // Main Process
  //   //   name: "광학 본딩기 A호기", // Optical Bonder
  //   //   type: "BONDER",
  //   //   status: "RUN",
  //   //   metrics: [
  //   //     { label: "진공도", value: "-98 kPa", icon: <FaWind /> },
  //   //     { label: "갭(Gap) 두께", value: "0.15 mm", icon: <FaLayerGroup /> },
  //   //   ],
  //   //   operator: "이민호",
  //   //   uptime: "04:30",
  //   // },
  //   // {
  //   //   id: "EQ-30",
  //   //   process: "후처리 공정", // Post Process
  //   //   name: "오토클레이브 (탈포)", // Autoclave
  //   //   type: "AUTOCLAVE",
  //   //   status: "RUN",
  //   //   metrics: [
  //   //     { label: "가압력", value: "5.0 bar", icon: <FaCompressArrowsAlt /> },
  //   //     { label: "챔버 온도", value: "60°C", icon: <FaThermometerHalf /> },
  //   //   ],
  //   //   operator: "박지성",
  //   //   uptime: "12:00",
  //   // },
  //   // {
  //   //   id: "EQ-40",
  //   //   process: "신뢰성 테스트", // Reliability
  //   //   name: "에이징 챔버 #1", // Aging Chamber
  //   //   type: "AGING",
  //   //   status: "ERROR",
  //   //   metrics: [
  //   //     { label: "내부 온도", value: "45°C", icon: <FaThermometerHalf /> },
  //   //     { label: "진행 시간", value: "2시간 10분", icon: <FaHistory /> },
  //   //   ],
  //   //   operator: "시스템",
  //   //   uptime: "02:10",
  //   // },
  //   // {
  //   //   id: "EQ-50",
  //   //   process: "신뢰성 테스트",
  //   //   name: "에이징 챔버 #2",
  //   //   type: "AGING",
  //   //   status: "RUN",
  //   //   metrics: [
  //   //     { label: "내부 온도", value: "45°C", icon: <FaThermometerHalf /> },
  //   //     { label: "진행 시간", value: "4시간 00분", icon: <FaHistory /> },
  //   //   ],
  //   //   operator: "시스템",
  //   //   uptime: "04:00",
  //   // },
  //   // {
  //   //   id: "EQ-60",
  //   //   process: "최종 검사", // Final Insp
  //   //   name: "비전 외관 검사기", // Vision Inspector
  //   //   type: "VISION",
  //   //   status: "STOP",
  //   //   metrics: [
  //   //     { label: "수율 (Yield)", value: "99.5%", icon: <FaCheckCircle /> },
  //   //     {
  //   //       label: "금일 검사량",
  //   //       value: "1,200 EA",
  //   //       icon: <MdOutlineViewInAr />,
  //   //     },
  //   //   ],
  //   //   operator: "최유나",
  //   //   uptime: "00:00",
  //   // },
  // ];
  // 1. 상태 관리
  const [machines, setMachines] = useState([]); // 전체 데이터
  const [filteredMachines, setFilteredMachines] = useState([]); // 필터링된 데이터
  const [loading, setLoading] = useState(true);

  // 2. 필터 상태
  const [selectedLine, setSelectedLine] = useState("ALL");
  const [selectedProcess, setSelectedProcess] = useState("ALL");
  const [searchText, setSearchText] = useState("");

  // 필터 옵션 목록
  const [processOptions, setProcessOptions] = useState([]);
  const [lineOptions, setLineOptions] = useState([]);

  // 3. API 호출
  useEffect(() => {
    fetchEquipmentList();
  }, []);

  const fetchEquipmentList = async () => {
    try {
      setLoading(true);
      const serverData = await getEquipmentList();

      const formattedData = serverData.map((item) => transformData(item));
      setMachines(formattedData);
      setFilteredMachines(formattedData);

      const processes = [
        "ALL",
        ...new Set(formattedData.map((m) => m.process)),
      ];
      const lines = ["ALL", ...new Set(serverData.map((m) => m.lineCode))];

      setProcessOptions(processes);
      setLineOptions(lines);
    } catch (error) {
      console.error("설비 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // [신규] 수동 새로고침 함수
  const handleManualRefresh = () => {
    fetchEquipmentList();
    alert("최신 설비 현황으로 갱신되었습니다.");
  };

  // 4. 필터링 로직
  useEffect(() => {
    let result = machines;

    if (selectedLine !== "ALL") {
      result = result.filter((m) => m.lineCode === selectedLine);
    }

    if (selectedProcess !== "ALL") {
      result = result.filter((m) => m.process === selectedProcess);
    }

    if (searchText) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchText.toLowerCase()) ||
          m.id.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    setFilteredMachines(result);
  }, [selectedLine, selectedProcess, searchText, machines]);

  // 🛠️ 데이터 변환 함수 (Backend DTO -> Frontend UI)
  const transformData = (dto) => {
    let type = "TOOLS";
    if (dto.eqName.includes("세정")) type = "CLEANER";
    else if (dto.eqName.includes("합착")) type = "BONDER";
    else if (dto.eqName.includes("탈포") || dto.eqName.includes("오토클레이브"))
      type = "AUTOCLAVE";
    else if (dto.eqName.includes("에이징")) type = "AGING";
    else if (dto.eqName.includes("검사") || dto.eqName.includes("비전"))
      type = "VISION";
    else if (dto.eqName.includes("마운터")) type = "MOUNTER";
    else if (dto.eqName.includes("로봇")) type = "ROBOT";
    else if (dto.eqName.includes("화질") || dto.eqName.includes("보정"))
      type = "CALIBRATOR";
    else if (dto.eqName.includes("신뢰성") || dto.eqName.includes("진동"))
      type = "VIBRATION";

    let status = "STOP";
    if (dto.eqStatus === "IN_PROGRESS" || dto.eqStatus === "RUN")
      status = "RUN";
    else if (dto.eqStatus === "ERROR") status = "ERROR";

    const metrics = getMetricsByType(type, dto.eqData);

    return {
      id: dto.eqCode,
      lineCode: dto.lineCode,
      process: dto.processName,
      name: dto.eqName,
      type: type,
      status: status,
      metrics: metrics,
      operator: dto.empName || "미지정",
      uptime: dto.opTime || "00:00",
    };
  };

  const getMetricsByType = (type, rawData) => {
    let val1 = "-";
    let val2 = "-";

    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        const values = Object.values(parsed);
        if (values.length > 0) val1 = values[0];
        if (values.length > 1) val2 = values[1];
      } catch (e) {
        const regex = /:\s*"?([^",}\]\s]+)"?/g;
        const matches = [];
        let match;
        while ((match = regex.exec(rawData)) !== null) {
          matches.push(match[1]);
        }
        if (matches.length > 0) val1 = matches[0];
        if (matches.length > 1) val2 = matches[1];
      }
    }

    const fmt = (v) => {
      if (v === "-" || v === null || v === undefined) return "-";
      const cleanV = String(v).replace(/["']/g, "");
      const num = Number(cleanV);
      return isNaN(num) ? cleanV : Number.isInteger(num) ? num : num.toFixed(1);
    };

    switch (type) {
      case "CLEANER":
        return [
          { label: "가스 유량", value: `${fmt(val1)} sccm`, icon: <FaWind /> },
          { label: "RF 파워", value: `${fmt(val2)} kW`, icon: <FaBolt /> },
        ];
      case "BONDER":
        return [
          { label: "진공도", value: `${fmt(val1)} kPa`, icon: <FaWind /> },
          {
            label: "갭 두께",
            value: `${fmt(val2)} mm`,
            icon: <FaLayerGroup />,
          },
        ];
      case "AUTOCLAVE":
        return [
          {
            label: "가압력",
            value: `${fmt(val1)} bar`,
            icon: <FaCompressArrowsAlt />,
          },
          {
            label: "챔버 온도",
            value: `${fmt(val2)} °C`,
            icon: <FaThermometerHalf />,
          },
        ];
      case "AGING":
        return [
          {
            label: "내부 온도",
            value: `${fmt(val1)} °C`,
            icon: <FaThermometerHalf />,
          },
          {
            label: "진행 시간",
            value: val2 !== "-" ? `${fmt(val2)} 분` : "-",
            icon: <FaHistory />,
          },
        ];
      case "VISION":
        return [
          { label: "수율", value: `${fmt(val1)} %`, icon: <FaCheckCircle /> },
          {
            label: "검사량",
            value: `${fmt(val2)} EA`,
            icon: <MdOutlineViewInAr />,
          },
        ];
      case "MOUNTER":
        return [
          {
            label: "노즐 진공",
            value: `${fmt(val1)} kPa`,
            icon: <FaCompressArrowsAlt />,
          },
          { label: "헤드 속도", value: `${fmt(val2)} m/s`, icon: <FaBolt /> },
        ];
      case "ROBOT":
        return [
          {
            label: "가반 하중",
            value: `${fmt(val1)} kg`,
            icon: <FaWeightHanging />,
          },
          {
            label: "작업 반경",
            value: `${fmt(val2)} mm`,
            icon: <FaRulerHorizontal />,
          },
        ];
      case "CALIBRATOR":
        return [
          { label: "센서 타입", value: fmt(val1), icon: <FaEye /> },
          { label: "교정 표준", value: fmt(val2), icon: <FaCheckCircle /> },
        ];
      case "VIBRATION":
        return [
          { label: "주파수 범위", value: fmt(val1), icon: <FaWaveSquare /> },
          { label: "가속도", value: fmt(val2), icon: <FaTachometerAlt /> },
        ];
      default:
        return [
          { label: "센서 1", value: fmt(val1), icon: <FaTools /> },
          { label: "센서 2", value: fmt(val2), icon: <FaTools /> },
        ];
    }
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <div style={styles.titleIcon}>
            <FaLayerGroup size={22} color="#fff" />
          </div>
          <div>
            <h2 style={styles.pageTitle}>라인 설비 모니터링</h2>
            <p style={styles.subTitle}>실시간 제조 라인 현황판</p>
          </div>
        </div>

        {/* 우측 컨트롤 (새로고침 + 범례) */}
        <div style={styles.headerControls}>
          {/* [추가] 새로고침 버튼 */}
          <button style={styles.refreshBtn} onClick={handleManualRefresh}>
            <FaSyncAlt /> 새로고침
          </button>

          <div style={styles.legend}>
            <StatusLegend color={COLORS.success} label="가동중" />
            <StatusLegend color={COLORS.danger} label="점검필요" />
            <StatusLegend color={COLORS.stop} label="비가동" />
          </div>
        </div>
      </div>

      {/* 필터 바 */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <FaFilter color={COLORS.subText} />
          <span style={styles.filterLabel}>Filter By:</span>

          <select
            style={styles.select}
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
          >
            <option value="ALL">전체 라인</option>
            {lineOptions.map(
              (line) =>
                line !== "ALL" && (
                  <option key={line} value={line}>
                    {line} 라인
                  </option>
                ),
            )}
          </select>

          <select
            style={styles.select}
            value={selectedProcess}
            onChange={(e) => setSelectedProcess(e.target.value)}
          >
            <option value="ALL">전체 공정</option>
            {processOptions.map(
              (proc) =>
                proc !== "ALL" && (
                  <option key={proc} value={proc}>
                    {proc}
                  </option>
                ),
            )}
          </select>
        </div>

        <div style={styles.searchWrapper}>
          <FaSearch color={COLORS.subText} style={{ marginRight: "8px" }} />
          <input
            type="text"
            style={styles.searchInput}
            placeholder="설비명 또는 코드 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {/* 설비 카드 그리드 */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: COLORS.subText,
          }}
        >
          데이터를 불러오는 중입니다...
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredMachines.length > 0 ? (
            filteredMachines.map((machine) => (
              <EquipmentCard
                key={machine.id}
                data={machine}
                onClick={() => navigate(`/equipment/detail/${machine.id}`)}
              />
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "40px",
                color: COLORS.subText,
              }}
            >
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EquipmentCard = ({ data, onClick }) => {
  const getStatusColor = (s) => {
    if (s === "RUN") return COLORS.success;
    if (s === "ERROR") return COLORS.danger;
    return COLORS.stop;
  };
  const statusColor = getStatusColor(data.status);

  const getStatusText = (s) => {
    if (s === "RUN") return "가동중";
    if (s === "ERROR") return "점검필요";
    return "비가동";
  };

  const getIcon = (type) => {
    switch (type) {
      case "CLEANER":
        return <MdCleaningServices />;
      case "BONDER":
        return <FaLayerGroup />;
      case "AUTOCLAVE":
        return <FaCompressArrowsAlt />;
      case "AGING":
        return <FaHistory />;
      case "VISION":
        return <FaMicroscope />;
      case "MOUNTER":
        return <FaLayerGroup />;
      case "ROBOT":
        return <FaRobot />;
      case "CALIBRATOR":
        return <FaSlidersH />;
      case "VIBRATION":
        return <FaWaveSquare />;
      default:
        return <FaTools />;
    }
  };

  return (
    <div
      style={{ ...styles.card, borderTop: `4px solid ${statusColor}` }}
      onClick={onClick}
    >
      <div style={styles.cardHeader}>
        <span style={styles.processBadge}>{data.process}</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontWeight: "bold",
            fontSize: "12px",
            color: statusColor,
          }}
        >
          {data.status === "RUN" && <FaPlayCircle size={14} />}
          {data.status === "ERROR" && <FaExclamationTriangle size={14} />}
          {data.status === "STOP" && <FaStopCircle size={14} />}
          {getStatusText(data.status)}
        </div>
      </div>

      <div style={styles.nameSection}>
        <div
          style={{
            ...styles.iconBox,
            backgroundColor: `${COLORS.primary}15`,
            color: COLORS.primary,
          }}
        >
          {getIcon(data.type)}
        </div>
        <div>
          <h3 style={styles.machineName}>{data.name}</h3>
          <span style={styles.machineId}>{data.id}</span>
        </div>
      </div>

      <div style={styles.metricGrid}>
        {data.metrics.map((m, i) => (
          <div key={i} style={styles.metricItem}>
            <span style={styles.metricLabel}>
              {m.icon} {m.label}
            </span>
            <span style={styles.metricValue}>{m.value}</span>
          </div>
        ))}
      </div>

      <div style={styles.cardFooter}>
        <div style={styles.footerItem}>
          <span style={styles.footerLabel}>담당자</span>
          <span style={styles.footerValue}>{data.operator}</span>
        </div>
        <div style={{ ...styles.footerItem, textAlign: "right" }}>
          <span style={styles.footerLabel}>가동 시간</span>
          <span style={styles.footerValue}>{data.uptime}</span>
        </div>
      </div>
    </div>
  );
};

const StatusLegend = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
    <div
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        backgroundColor: color,
      }}
    ></div>
    <span
      style={{ fontSize: "12px", color: COLORS.subText, fontWeight: "600" }}
    >
      {label}
    </span>
  </div>
);

const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "20px",
  },
  titleGroup: { display: "flex", alignItems: "center", gap: "12px" },
  titleIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    backgroundColor: COLORS.primary,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(140,133,255,0.4)",
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: COLORS.text,
    margin: 0,
  },
  subTitle: { fontSize: "13px", color: COLORS.subText, marginTop: "2px" },

  // [수정] 헤더 우측 컨트롤 영역 (버튼 + 범례)
  headerControls: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  // [추가] 새로고침 버튼 스타일
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "white",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#555",
    fontSize: "13px",
    height: "40px", // 범례 높이와 맞춤
  },
  legend: {
    display: "flex",
    gap: "15px",
    backgroundColor: "white",
    padding: "0 16px",
    height: "40px", // 높이 고정
    alignItems: "center",
    borderRadius: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },

  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: "15px 20px",
    borderRadius: "16px",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  filterLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.subText,
    marginRight: "4px",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: "500",
    outline: "none",
    cursor: "pointer",
  },
  searchWrapper: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: "8px",
    padding: "8px 12px",
    border: `1px solid transparent`,
    width: "250px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "13px",
    color: COLORS.text,
    width: "100%",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    cursor: "pointer",
    transition: "all 0.2s ease-in-out",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    },
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  processBadge: {
    fontSize: "11px",
    fontWeight: "700",
    color: COLORS.subText,
    backgroundColor: "#F5F5F5",
    padding: "4px 8px",
    borderRadius: "6px",
  },
  nameSection: { display: "flex", alignItems: "center", gap: "12px" },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  machineName: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.text,
  },
  machineId: { fontSize: "12px", color: COLORS.subText },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    backgroundColor: "#F8F9FA",
    padding: "12px",
    borderRadius: "10px",
  },
  metricItem: { display: "flex", flexDirection: "column", gap: "2px" },
  metricLabel: {
    fontSize: "11px",
    color: COLORS.subText,
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  metricValue: { fontSize: "14px", fontWeight: "700", color: COLORS.text },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: "12px",
    marginTop: "auto",
  },
  footerItem: { display: "flex", flexDirection: "column" },
  footerLabel: { fontSize: "10px", color: COLORS.subText, marginBottom: "2px" },
  footerValue: { fontSize: "12px", fontWeight: "600", color: COLORS.text },
};

export default EquipmentList;
