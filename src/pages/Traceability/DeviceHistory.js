import React, { useState } from "react";
import {
  FaSearch,
  FaFilePdf,
  FaPrint,
  FaCheckCircle,
  FaClipboardList,
  FaMicrochip,
  FaBox,
  FaFileSignature, // [수정] FaUserSignature -> FaFileSignature로 변경
  FaBarcode,
} from "react-icons/fa";

// 🎨 MedisOne 테마
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  success: "#00C851",
  warning: "#FFBB33",
  danger: "#FF4444",
  text: "#333",
  gray: "#666",
  border: "#E0E0E0",
  headerBg: "#2C3E50",
};

const DeviceHistory = () => {
  const [serialNo, setSerialNo] = useState("");
  const [dhrData, setDhrData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📝 [Mock Data] 전자 DHR 데이터베이스
  const MOCK_DHR = {
    "SN-260121-0042": {
      info: {
        model: "MED-24-4K-PRO",
        desc: "24인치 4K 수술용 모니터 (Endoscopy)",
        mfgDate: "2026-01-21 14:30",
        orderNo: "WO-260120-01",
        customer: "Samsung Medical Center",
        status: "RELEASED", // 출하 승인 완료
        qaManager: "Dr. Park (QA-01)",
      },
      // 1. 자재 투입 이력 (Genealogy)
      bom: [
        { part: "LCD Panel", lot: "LOT-PNL-251201", supplier: "LG Display" },
        { part: "Main Board", lot: "LOT-PCB-260115", supplier: "MedisOne SMT" },
        { part: "Power Unit", lot: "LOT-PWR-260101", supplier: "Delta" },
        { part: "Ag Cover Glass", lot: "LOT-GLS-260105", supplier: "Asahi" },
      ],
      // 2. 공정 이력 (Process Traveler)
      history: [
        {
          step: "100",
          name: "Incoming Inspection",
          date: "2026-01-19 09:00",
          result: "PASS",
          operator: "Kim",
          data: "OK",
        },
        {
          step: "200",
          name: "Optical Bonding",
          date: "2026-01-20 10:30",
          result: "PASS",
          operator: "Lee",
          data: "Vac: -98kPa",
        },
        {
          step: "300",
          name: "Assembly",
          date: "2026-01-20 14:00",
          result: "PASS",
          operator: "Choi",
          data: "Torque: 4.5",
        },
        {
          step: "400",
          name: "Aging Test (24hr)",
          date: "2026-01-21 10:00",
          result: "PASS",
          operator: "System",
          data: "Max: 45°C",
        },
        {
          step: "500",
          name: "DICOM Calibration",
          date: "2026-01-21 13:00",
          result: "PASS",
          operator: "Park",
          data: "Gamma 2.2",
        },
        {
          step: "600",
          name: "Final QA & Packing",
          date: "2026-01-21 14:30",
          result: "PASS",
          operator: "Dr. Park",
          data: "Approved",
        },
      ],
    },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!serialNo) return;
    setLoading(true);
    setDhrData(null);

    // 검색 시뮬레이션
    setTimeout(() => {
      const data = MOCK_DHR[serialNo] || MOCK_DHR["SN-260121-0042"];
      setDhrData(data);
      setLoading(false);
    }, 600);
  };

  return (
    <div style={styles.container}>
      {/* 1. 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📂 DHR (Device History Record)</h2>
          <p style={styles.subtitle}>
            FDA 21 CFR Part 820 준수 | 의료기기 제조 및 품질 관리 기록 조회
          </p>
        </div>
        <div style={styles.btnGroup}>
          <button style={styles.printBtn} onClick={() => window.print()}>
            <FaPrint /> Print DHR
          </button>
          <button style={styles.exportBtn}>
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* 2. 검색 바 */}
      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <FaBarcode size={20} color={COLORS.gray} />
          <input
            type="text"
            placeholder="Scan Serial No. (e.g., SN-260121-0042)"
            style={styles.searchInput}
            value={serialNo}
            onChange={(e) => setSerialNo(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn}>
            <FaSearch /> Search
          </button>
        </form>
      </div>

      {/* 3. DHR 리포트 영역 */}
      {loading ? (
        <div style={styles.loading}>Retrieving eDHR Data...</div>
      ) : dhrData ? (
        <div style={styles.reportContainer}>
          {/* (A) 마스터 정보 (Device Master Record) */}
          <div style={styles.masterCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>📦 Device Information</h3>
              <span style={styles.approvedBadge}>
                <FaCheckCircle /> QA RELEASED
              </span>
            </div>

            <div style={styles.infoGrid}>
              <InfoItem label="Model Name" value={dhrData.info.model} bold />
              <InfoItem
                label="Serial Number"
                value={serialNo || "SN-260121-0042"}
                bold
                color={COLORS.primary}
              />
              <InfoItem label="Description" value={dhrData.info.desc} />
              <InfoItem label="Mfg Date" value={dhrData.info.mfgDate} />
              <InfoItem label="Work Order" value={dhrData.info.orderNo} />
              <InfoItem label="Customer" value={dhrData.info.customer} />
            </div>

            <div style={styles.signatureBox}>
              {/* [수정] FaFileSignature 아이콘 사용 */}
              <FaFileSignature size={24} color={COLORS.primary} />
              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  Electronically Signed by:
                </div>
                <div style={{ fontWeight: "bold" }}>
                  {dhrData.info.qaManager}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.contentRow}>
            {/* (B) 자재 투입 이력 (BOM) */}
            <div style={styles.bomCard}>
              <h3 style={styles.cardTitle}>
                <FaBox /> Material Traceability
              </h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Part Name</th>
                    <th style={styles.th}>LOT ID</th>
                    <th style={styles.th}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {dhrData.bom.map((item, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "bold" }}>
                        {item.part}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          color: COLORS.primary,
                          fontFamily: "monospace",
                        }}
                      >
                        {item.lot}
                      </td>
                      <td style={{ ...styles.td, color: "#666" }}>
                        {item.supplier}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* (C) 공정 진행 이력 (Process Traveler) */}
            <div style={styles.historyCard}>
              <h3 style={styles.cardTitle}>
                <FaClipboardList /> Process Traveler
              </h3>
              <div style={styles.timeline}>
                {dhrData.history.map((step, idx) => (
                  <div key={idx} style={styles.timelineItem}>
                    <div style={styles.stepBadge}>{step.step}</div>
                    <div style={styles.stepContent}>
                      <div style={styles.stepHeader}>
                        <span style={styles.stepName}>{step.name}</span>
                        <span style={styles.stepTime}>{step.date}</span>
                      </div>
                      <div style={styles.stepData}>
                        <span>
                          Result:{" "}
                          <strong style={{ color: COLORS.success }}>
                            {step.result}
                          </strong>
                        </span>
                        <span style={styles.divider}>|</span>
                        <span>Op: {step.operator}</span>
                        <span style={styles.divider}>|</span>
                        <span>Data: {step.data}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          <FaMicrochip
            size={40}
            style={{ marginBottom: "15px", color: "#ddd" }}
          />
          <p>시리얼 번호를 입력하여 DHR을 조회하세요.</p>
        </div>
      )}
    </div>
  );
};

// --- 서브 컴포넌트 ---
const InfoItem = ({ label, value, bold, color }) => (
  <div style={styles.infoItem}>
    <div style={styles.infoLabel}>{label}</div>
    <div
      style={{
        ...styles.infoValue,
        fontWeight: bold ? "bold" : "normal",
        color: color || "#333",
      }}
    >
      {value}
    </div>
  </div>
);

// --- 스타일 ---
const styles = {
  container: { padding: "30px", backgroundColor: COLORS.bg, minHeight: "100%" },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: COLORS.text,
    margin: 0,
  },
  subtitle: { fontSize: "14px", color: COLORS.gray, marginTop: "5px" },

  btnGroup: { display: "flex", gap: "10px" },
  printBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  exportBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.danger,
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  searchSection: {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center",
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
    padding: "10px 25px",
    borderRadius: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  loading: { textAlign: "center", padding: "50px", color: "#888" },

  // 리포트 컨테이너
  reportContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  // (A) 마스터 정보
  masterCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    borderTop: `4px solid ${COLORS.primary}`,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#333",
  },
  approvedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#E8F5E9",
    color: COLORS.success,
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },

  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  infoItem: { borderBottom: "1px solid #f9f9f9", paddingBottom: "8px" },
  infoLabel: { fontSize: "12px", color: "#888", marginBottom: "4px" },
  infoValue: { fontSize: "15px" },

  signatureBox: {
    marginTop: "20px",
    backgroundColor: "#F9FAFB",
    padding: "15px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px dashed #ccc",
  },

  // 하단 컨텐츠 (BOM + History)
  contentRow: { display: "flex", gap: "20px", flexWrap: "wrap" },
  bomCard: {
    flex: "1",
    minWidth: "300px",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  historyCard: {
    flex: "1.5",
    minWidth: "400px",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  // 테이블
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" },
  th: { padding: "10px", textAlign: "left", fontSize: "12px", color: "#666" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "10px", fontSize: "13px", color: "#333" },

  // 타임라인
  timeline: { display: "flex", flexDirection: "column", gap: "15px" },
  timelineItem: { display: "flex", gap: "15px" },
  stepBadge: {
    minWidth: "40px",
    height: "24px",
    backgroundColor: "#E3F2FD",
    color: "#1976D2",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: "10px 15px",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  stepHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "5px",
  },
  stepName: { fontWeight: "bold", fontSize: "14px", color: "#333" },
  stepTime: { fontSize: "11px", color: "#999" },
  stepData: { fontSize: "13px", color: "#555" },
  divider: { margin: "0 8px", color: "#ddd" },

  emptyState: {
    textAlign: "center",
    padding: "80px",
    color: "#ccc",
    fontSize: "18px",
  },
};

export default DeviceHistory;
