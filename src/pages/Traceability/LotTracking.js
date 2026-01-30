import React, { useState } from "react";
import {
  FaSearch,
  FaBarcode,
  FaSitemap,
  FaBoxOpen,
  FaIndustry,
  FaArrowRight,
  FaThermometerHalf,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

// 🎨 MedisOne 디자인 시스템
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#666",
  border: "#E0E0E0",
  success: "#4CAF50",
  warning: "#FF9800",
  danger: "#FF5252",
  info: "#2196F3",
};

const LotTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lotData, setLotData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📝 [Mock Data] 원자재 LOT DB
  const MOCK_DB = {
    "LOT-OCR-260121": {
      id: "LOT-OCR-260121",
      type: "Raw Material",
      materialName: "OCR Resin (High-Viscosity)",
      code: "MAT-OCR-005",
      supplier: "ChemTech Solution",
      qty: "20 kg",
      remain: "5 kg",
      status: "IN_USE", // 사용중
      storage: "Cold Storage (5°C)",
      expireDate: "2026-03-20", // 유효기간 중요
      inDate: "2026-01-10",
      // 사용 이력 (Genealogy: Forward Tracking)
      usageHistory: [
        {
          step: "Dispensing",
          date: "2026-01-20 10:00",
          machine: "Dispenser #01",
          outputLot: "WIP-PNL-260120-A", // 공정품 LOT
        },
        {
          step: "Curing",
          date: "2026-01-20 10:30",
          machine: "UV Curing #02",
          outputLot: "WIP-PNL-260120-B",
        },
      ],
      // 최종 적용된 완제품 (Final Products)
      finalProducts: [
        {
          id: "PROD-24-0015",
          model: "24인치 의료용 모니터",
          date: "2026-01-21",
        },
        {
          id: "PROD-24-0016",
          model: "24인치 의료용 모니터",
          date: "2026-01-21",
        },
        {
          id: "PROD-24-0018",
          model: "24인치 의료용 모니터",
          date: "2026-01-21",
        },
      ],
    },
    "LOT-GLS-260115": {
      id: "LOT-GLS-260115",
      type: "Raw Material",
      materialName: 'Anti-Glare Cover Glass 24"',
      code: "MAT-GLS-24AG",
      supplier: "Asahi Glass Co.",
      qty: "500 ea",
      remain: "0 ea",
      status: "CONSUMED", // 소진됨
      storage: "Room Temp",
      expireDate: "N/A",
      inDate: "2026-01-15",
      usageHistory: [
        {
          step: "Cleaning",
          date: "2026-01-16 09:00",
          machine: "Washer #03",
          outputLot: "WIP-GLS-260116-A",
        },
        {
          step: "Bonding",
          date: "2026-01-16 14:00",
          machine: "Bonder #01",
          outputLot: "WIP-PNL-260116-C",
        },
      ],
      finalProducts: [
        {
          id: "PROD-24-0001",
          model: "24인치 의료용 모니터",
          date: "2026-01-17",
        },
        {
          id: "PROD-24-0002",
          model: "24인치 의료용 모니터",
          date: "2026-01-17",
        },
      ],
    },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setLotData(null);

    // 검색 시뮬레이션
    setTimeout(() => {
      const data = MOCK_DB[searchTerm] || MOCK_DB["LOT-OCR-260121"]; // 데모용 강제 매칭
      setLotData(data);
      setLoading(false);
    }, 600);
  };

  return (
    <div style={styles.container}>
      {/* 1. 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>🔍 원자재 LOT 추적 (Lot Genealogy)</h2>
          <p style={styles.pageSubtitle}>
            원자재의 입고부터 최종 제품 적용까지의 이력을 추적합니다.
          </p>
        </div>
      </div>

      {/* 2. 검색 바 */}
      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <FaBarcode size={20} color={COLORS.gray} />
          <input
            type="text"
            placeholder="Scan LOT ID (e.g., LOT-OCR-260121)"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn}>
            <FaSearch /> Trace
          </button>
        </form>
        <div style={styles.searchHint}>
          * 테스트용: LOT-OCR-260121 (레진), LOT-GLS-260115 (글라스) 입력
        </div>
      </div>

      {/* 3. 검색 결과 영역 */}
      {loading ? (
        <div style={styles.loadingArea}>Searching Genealogy Data...</div>
      ) : lotData ? (
        <div style={styles.resultContainer}>
          {/* [좌측] 자재 기본 정보 카드 */}
          <div style={styles.leftPanel}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📦 Material Info</h3>
                <StatusBadge status={lotData.status} />
              </div>

              <div style={styles.lotIdBox}>
                <span style={{ fontSize: "12px", color: "#888" }}>LOT ID</span>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: COLORS.primary,
                  }}
                >
                  {lotData.id}
                </div>
              </div>

              <div style={styles.infoGrid}>
                <InfoRow label="품목명" value={lotData.materialName} />
                <InfoRow label="자재코드" value={lotData.code} />
                <InfoRow label="공급사" value={lotData.supplier} />
                <InfoRow label="초기수량" value={lotData.qty} />
                <InfoRow label="현재잔량" value={lotData.remain} highlight />
                <InfoRow label="입고일" value={lotData.inDate} />
              </div>

              {/* 특수 관리 항목 (유효기간, 보관조건) */}
              <div style={styles.specialInfo}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "5px",
                  }}
                >
                  <FaThermometerHalf color={COLORS.info} />
                  <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                    보관: {lotData.storage}
                  </span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <FaCalendarAlt color={COLORS.warning} />
                  <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                    만료: {lotData.expireDate}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* [우측] 추적 시각화 (Genealogy) */}
          <div style={styles.rightPanel}>
            {/* 공정 흐름 (Timeline) */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FaSitemap /> Process Genealogy (공정 흐름)
              </h3>
              <div style={styles.timeline}>
                {/* 1. 원자재 단계 */}
                <div style={styles.timelineItem}>
                  <div style={styles.timelineDotStart} />
                  <div style={styles.timelineContent}>
                    <div style={styles.stepTitle}>Raw Material In (입고)</div>
                    <div style={styles.stepDesc}>
                      {lotData.inDate} | 창고 입고 완료
                    </div>
                  </div>
                </div>

                {/* 2. 공정 사용 이력 */}
                {lotData.usageHistory.map((history, idx) => (
                  <div key={idx} style={styles.timelineItem}>
                    <div style={styles.timelineLine} />
                    <div style={styles.timelineDot} />
                    <div style={styles.timelineContent}>
                      <div style={styles.stepTitle}>
                        Step {idx + 1}: {history.step}
                      </div>
                      <div style={styles.stepDesc}>
                        <FaIndustry
                          style={{ marginRight: "5px", fontSize: "10px" }}
                        />
                        {history.machine}
                      </div>
                      <div style={styles.stepLot}>
                        Output:{" "}
                        <span style={{ color: COLORS.primary }}>
                          {history.outputLot}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 최종 적용 제품 리스트 */}
            <div style={{ ...styles.card, marginTop: "20px" }}>
              <h3 style={styles.cardTitle}>
                <FaBoxOpen /> Final Products (사용된 완제품)
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product ID</th>
                    <th style={styles.th}>Model Name</th>
                    <th style={styles.th}>Prod. Date</th>
                  </tr>
                </thead>
                <tbody>
                  {lotData.finalProducts.map((prod) => (
                    <tr key={prod.id}>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: "bold",
                          color: COLORS.text,
                        }}
                      >
                        {prod.id}
                      </td>
                      <td style={styles.td}>{prod.model}</td>
                      <td style={styles.td}>{prod.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          LOT 번호를 입력하여 추적을 시작하세요.
        </div>
      )}
    </div>
  );
};

// --- 서브 컴포넌트 ---
const InfoRow = ({ label, value, highlight }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid #f5f5f5",
    }}
  >
    <span style={{ fontSize: "13px", color: "#888" }}>{label}</span>
    <span
      style={{
        fontSize: "13px",
        fontWeight: "bold",
        color: highlight ? COLORS.primary : "#333",
      }}
    >
      {value}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const isOk = status === "IN_USE";
  const color = isOk ? COLORS.success : COLORS.gray;
  return (
    <span
      style={{
        fontSize: "11px",
        fontWeight: "bold",
        color: color,
        backgroundColor: `${color}15`,
        padding: "4px 8px",
        borderRadius: "6px",
      }}
    >
      {status}
    </span>
  );
};

// --- 스타일 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100%",
  },
  header: { marginBottom: "20px" },
  pageTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "5px",
  },
  pageSubtitle: { fontSize: "14px", color: COLORS.gray },

  // 검색바
  searchSection: {
    marginBottom: "30px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    padding: "10px 20px",
    borderRadius: "50px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "600px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "16px",
    marginLeft: "10px",
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  searchHint: {
    fontSize: "12px",
    color: "#999",
    marginTop: "8px",
    marginLeft: "20px",
  },

  // 로딩 및 결과
  loadingArea: { textAlign: "center", padding: "50px", color: "#999" },
  resultContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px",
    color: "#ccc",
    fontSize: "18px",
    border: "2px dashed #e0e0e0",
    borderRadius: "12px",
  },

  // 좌측 패널 (정보)
  leftPanel: { flex: "1", minWidth: "300px" },
  rightPanel: { flex: "2", minWidth: "400px" },

  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
  },

  lotIdBox: {
    backgroundColor: "#F8F9FA",
    padding: "15px",
    borderRadius: "8px",
    textAlign: "center",
    marginBottom: "20px",
    border: `1px solid ${COLORS.border}`,
  },
  infoGrid: { display: "flex", flexDirection: "column" },
  specialInfo: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#FFF8E1",
    borderRadius: "8px",
    border: `1px solid ${COLORS.warning}30`,
  },

  // 타임라인
  timeline: { padding: "10px 0 0 10px" },
  timelineItem: {
    position: "relative",
    paddingBottom: "30px",
    paddingLeft: "25px",
  },
  timelineLine: {
    position: "absolute",
    left: "6px",
    top: "-30px",
    bottom: "0",
    width: "2px",
    backgroundColor: "#eee",
  },
  timelineDotStart: {
    position: "absolute",
    left: "0",
    top: "5px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: COLORS.success,
    border: "2px solid white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  timelineDot: {
    position: "absolute",
    left: "2px",
    top: "5px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: COLORS.primary,
    border: "2px solid white",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  timelineContent: {
    backgroundColor: "#F9FAFB",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  stepTitle: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#333",
    marginBottom: "4px",
  },
  stepDesc: {
    fontSize: "12px",
    color: "#666",
    display: "flex",
    alignItems: "center",
  },
  stepLot: {
    fontSize: "12px",
    marginTop: "6px",
    fontWeight: "bold",
    color: "#555",
  },

  // 테이블
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  th: {
    textAlign: "left",
    padding: "10px",
    fontSize: "12px",
    color: "#666",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  td: {
    padding: "10px",
    fontSize: "13px",
    color: "#333",
    borderBottom: "1px solid #eee",
  },
};

export default LotTracking;
