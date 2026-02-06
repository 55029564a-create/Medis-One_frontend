import React, { useState } from "react";
import client from "../../api/client";
import {
  FaSearch,
  FaPrint,
  FaCheckCircle,
  FaClipboardList,
  FaMicrochip,
  FaBox,
  FaFileSignature,
  FaBarcode,
} from "react-icons/fa";

// 🎨 스타일 상수
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  success: "#00C851",
  text: "#333",
  gray: "#666",
  border: "#E0E0E0",
};

const DeviceHistory = () => {
  const [serialNo, setSerialNo] = useState("");
  const [dhrData, setDhrData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📡 서버 통신 함수
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!serialNo) return;

    setLoading(true);
    setDhrData(null);

    try {
      // ✅ [핵심] 백엔드 Controller 주소와 정확히 일치 (/trace/sn/{code})
      // Controller: @GetMapping("/sn/{snCode}")
      const response = await client.get(`/trace/sn/${serialNo}`);

      console.log("✅ 서버 응답 데이터:", response.data);
      setDhrData(response.data);
    } catch (error) {
      console.error("❌ 조회 에러:", error);
      // 백엔드가 500을 주더라도 프론트는 멈추지 않고 알림만 띄움
      alert(
        "데이터 조회 중 오류가 발생했습니다. (시리얼 번호 또는 서버 상태 확인)",
      );
    } finally {
      setLoading(false);
    }
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
            <FaPrint /> Print Report
          </button>
        </div>
      </div>

      {/* 2. 검색 바 */}
      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <FaBarcode size={20} color={COLORS.gray} />
          <input
            type="text"
            placeholder="Scan Serial No. (e.g. SN-260205-01-A-02)"
            style={styles.searchInput}
            value={serialNo}
            onChange={(e) => setSerialNo(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn}>
            <FaSearch /> Search
          </button>
        </form>
      </div>

      {/* 3. 리포트 영역 */}
      {loading ? (
        <div style={styles.loading}>데이터 조회 중...</div>
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
              {/* ✅ DTO 변수명 매칭: productName, serialCode, productCode ... */}
              <InfoItem label="Product Name" value={dhrData.productName} bold />
              <InfoItem
                label="Serial Number"
                value={dhrData.serialCode}
                bold
                color={COLORS.primary}
              />
              <InfoItem label="Product Code" value={dhrData.productCode} />
              <InfoItem label="Work Order" value={dhrData.workOrderCode} />
              <InfoItem
                label="Finished Date"
                value={dhrData.finishedAt || "진행 중 (In Progress)"}
              />
            </div>

            <div style={styles.signatureBox}>
              <FaFileSignature size={24} color={COLORS.primary} />
              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  Electronically Signed by System
                </div>
                <div style={{ fontWeight: "bold" }}>MedisOne MES</div>
              </div>
            </div>
          </div>

          <div style={styles.contentRow}>
            {/* (B) 자재 투입 이력 (BOM Traceability) */}
            <div style={styles.bomCard}>
              <h3 style={styles.cardTitle}>
                <FaBox /> Material Traceability (BOM)
              </h3>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Material / Kit</th>
                    <th style={styles.th}>Lot ID</th>
                    <th style={styles.th}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {/* ✅ DTO 변수명 매칭: matLots (List) */}
                  {(dhrData.matLots || []).map((lot, idx) => (
                    <tr key={idx} style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "bold" }}>
                        {lot.materialName}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          color: COLORS.primary,
                          fontFamily: "monospace",
                        }}
                      >
                        {lot.logCode}
                      </td>
                      <td style={{ ...styles.td, color: "#666" }}>
                        {lot.company}
                      </td>
                    </tr>
                  ))}
                  {(!dhrData.matLots || dhrData.matLots.length === 0) && (
                    <tr>
                      <td
                        colSpan="3"
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#ccc",
                        }}
                      >
                        - 투입 자재 없음 -
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* (C) 공정 기록 (Process Traveler) */}
            <div style={styles.historyCard}>
              <h3 style={styles.cardTitle}>
                <FaClipboardList /> Process Traveler
              </h3>
              <div style={styles.timeline}>
                {/* ✅ DTO 변수명 매칭: prodLogs (List) */}
                {(dhrData.prodLogs || []).map((log, idx) => (
                  <div key={idx} style={styles.timelineItem}>
                    <div style={styles.stepBadge}>{idx + 1}</div>
                    <div style={styles.stepContent}>
                      <div style={styles.stepHeader}>
                        {/* processName, createdAt */}
                        <span style={styles.stepName}>{log.processName}</span>
                        <span style={styles.stepTime}>{log.createdAt}</span>
                      </div>
                      <div style={styles.stepData}>
                        {/* result, operatorName, data */}
                        <span>
                          Result:{" "}
                          <strong
                            style={{
                              color:
                                log.result === "PASS" ? COLORS.success : "#333",
                            }}
                          >
                            {log.result}
                          </strong>
                        </span>
                        <span style={styles.divider}>|</span>
                        <span>Op: {log.operatorName}</span>
                        <br />
                        <span style={{ color: "#555", fontSize: "12px" }}>
                          Data: {log.data || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {(!dhrData.prodLogs || dhrData.prodLogs.length === 0) && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#ccc",
                    }}
                  >
                    - 공정 이력 없음 -
                  </div>
                )}
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
          <p>시리얼 번호를 스캔하거나 입력하세요.</p>
        </div>
      )}
    </div>
  );
};

// --- 서브 컴포넌트 & 스타일 ---
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
      {value || "-"}
    </div>
  </div>
);

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
  reportContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
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
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" },
  th: { padding: "10px", textAlign: "left", fontSize: "12px", color: "#666" },
  tr: { borderBottom: "1px solid #f5f5f5" },
  td: { padding: "10px", fontSize: "13px", color: "#333" },
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
