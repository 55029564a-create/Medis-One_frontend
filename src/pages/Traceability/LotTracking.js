import React, { useState } from "react";
import client from "../../api/client";
import {
  FaSearch,
  FaBarcode,
  FaSitemap,
  FaBoxOpen,
  FaIndustry,
  FaThermometerHalf,
  FaCalendarAlt,
  FaTruckLoading,
  FaCheckCircle,
  FaSyncAlt, // [추가]
} from "react-icons/fa";

// 🎨 디자인 시스템
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
  dark: "#2c3e50",
};

const LotTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lotData, setLotData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📡 서버 통신
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchTerm) return;

    setLoading(true);
    setLotData(null);

    try {
      const response = await client.get(`/trace/mat-lot/${searchTerm}`);
      console.log("Trace Data:", response.data);
      setLotData(response.data);
    } catch (error) {
      console.error("Trace Error:", error);
      alert("데이터를 찾을 수 없습니다. LOT 번호를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // [신규] 수동 새로고침 함수
  const handleManualRefresh = () => {
    if (searchTerm) {
      handleSearch();
      alert("최신 LOT 이력 정보로 갱신되었습니다.");
    } else {
      alert("추적할 LOT 번호를 먼저 입력해주세요.");
    }
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.pageTitle}>🔍 LOT 통합 추적 (Genealogy)</h2>
          <p style={styles.pageSubtitle}>
            원자재의 입고부터 공정 이동, 제품 생산까지의 전체 이력을 조회합니다.
          </p>
        </div>
        {/* [추가] 새로고침 버튼 */}
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={handleManualRefresh}>
            <FaSyncAlt /> 새로고침
          </button>
        </div>
      </div>

      {/* 검색 바 */}
      <div style={styles.searchSection}>
        <form onSubmit={handleSearch} style={styles.searchBar}>
          <FaBarcode size={20} color={COLORS.gray} />
          <input
            type="text"
            placeholder="Scan LOT ID (e.g., LOT-KITB-260125-001)"
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" style={styles.searchBtn}>
            <FaSearch /> 조회
          </button>
        </form>
      </div>

      {/* 결과 영역 */}
      {loading ? (
        <div style={styles.loadingArea}>데이터 추적 중...</div>
      ) : lotData ? (
        <div style={styles.resultContainer}>
          {/* [좌측] LOT 기본 정보 */}
          <div style={styles.leftPanel}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📦 LOT Information</h3>
                <StatusBadge status={lotData.status} />
              </div>

              <div style={styles.lotIdBox}>
                <span style={{ fontSize: "12px", color: "#888" }}>LOT No.</span>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: COLORS.dark,
                  }}
                >
                  {lotData.lotCode}
                </div>
              </div>

              <div style={styles.infoGrid}>
                <InfoRow label="품목명(Kit)" value={lotData.matName} />
                <InfoRow label="품목코드" value={lotData.matCode} />
                <InfoRow label="공급/제조사" value={lotData.company} />
                <InfoRow label="초기수량" value={`${lotData.initialQty} ea`} />
                <InfoRow
                  label="현재재고"
                  value={`${lotData.currentQty} ea`}
                  highlight
                />
                <InfoRow label="생성일(입고)" value={lotData.createdAt} />
              </div>

              <div style={styles.specialInfo}>
                <div style={styles.iconRow}>
                  <FaThermometerHalf color={COLORS.info} />
                  <span>보관: 실온(Room Temp)</span>
                </div>
                <div style={styles.iconRow}>
                  <FaCalendarAlt color={COLORS.warning} />
                  <span>유효기간: 정상</span>
                </div>
              </div>
            </div>
          </div>

          {/* [우측] 이력 타임라인 (Genealogy) */}
          <div style={styles.rightPanel}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>
                <FaSitemap /> Process History (이력 추적)
              </h3>

              <div style={styles.timeline}>
                {/* 1. 최초 생성(입고) 로그 */}
                <div style={styles.timelineItem}>
                  <div style={styles.timelineDotStart} />
                  <div style={styles.timelineContent}>
                    <div style={styles.stepTitle}>LOT Created (입고/생성)</div>
                    <div style={styles.stepDesc}>
                      <FaCalendarAlt style={{ marginRight: 5 }} />{" "}
                      {lotData.createdAt}
                    </div>
                    <div style={styles.stepDesc}>
                      최초 수량: {lotData.initialQty} ea
                    </div>
                  </div>
                </div>

                {/* 2. 서버에서 받은 logs 리스트 순회 */}
                {(lotData.logs || []).map((log, idx) => {
                  const isProductMade = log.serial && log.serial !== "null";

                  return (
                    <div key={idx} style={styles.timelineItem}>
                      <div style={styles.timelineLine} />
                      <div
                        style={{
                          ...styles.timelineDot,
                          backgroundColor: isProductMade
                            ? COLORS.primary
                            : COLORS.gray,
                        }}
                      >
                        {isProductMade ? (
                          <FaBoxOpen color="white" size={10} />
                        ) : (
                          <FaTruckLoading color="white" size={10} />
                        )}
                      </div>

                      <div style={styles.timelineContent}>
                        <div style={styles.stepTitle}>
                          Step {idx + 1}: {log.procName}
                        </div>

                        <div style={styles.stepDesc}>
                          <FaCalendarAlt style={{ marginRight: 5 }} />{" "}
                          {log.prodAt}
                          <span style={{ marginLeft: 10 }}>
                            수량 변동: {log.qty}
                          </span>
                        </div>

                        {isProductMade ? (
                          <div style={styles.productBadge}>
                            <span style={{ color: "#666" }}>
                              Output Product:
                            </span>
                            <span
                              style={{
                                fontWeight: "bold",
                                color: COLORS.primary,
                                marginLeft: 5,
                              }}
                            >
                              {log.serial}
                            </span>
                          </div>
                        ) : (
                          <div style={styles.infoText}>
                            * 공정 이동 / 자재 소모 단계
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(!lotData.logs || lotData.logs.length === 0) && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#999",
                    }}
                  >
                    - 추가 이동/가공 이력이 없습니다 -
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.emptyState}>
          추적할 LOT 번호를 입력해주세요.
          <br />
          (예: 원자재 LOT, 공정 LOT 등)
        </div>
      )}
    </div>
  );
};

// --- 스타일 및 서브 컴포넌트 ---
const InfoRow = ({ label, value, highlight }) => (
  <div style={styles.row}>
    <span style={{ fontSize: "13px", color: "#888" }}>{label}</span>
    <span
      style={{
        fontSize: "13px",
        fontWeight: "bold",
        color: highlight ? COLORS.primary : "#333",
      }}
    >
      {value || "-"}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const isOk = status === "AVAILABLE" || status === "IN_USE" || status === "OK";
  const color = isOk ? COLORS.success : COLORS.gray;
  return (
    <span
      style={{ ...styles.badge, color: color, backgroundColor: `${color}15` }}
    >
      {status}
    </span>
  );
};

const styles = {
  container: {
    padding: "20px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    boxSizing: "border-box",
    width: "100%",
    maxWidth: "100%",
    overflowX: "hidden",
  },

  // [수정] 헤더 flex 수정
  header: {
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: "4px",
    margin: 0,
  },
  pageSubtitle: { fontSize: "13px", color: COLORS.gray, marginTop: "4px" },

  // [추가] 새로고침 버튼 스타일
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "white",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#555",
    fontSize: "13px",
  },

  searchSection: { marginBottom: "20px" },
  searchBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "white",
    padding: "8px 15px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "500px",
    border: `1px solid ${COLORS.border}`,
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    marginLeft: "10px",
  },
  searchBtn: {
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    padding: "6px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    gap: "5px",
  },

  loadingArea: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    fontSize: "14px",
  },

  resultContainer: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    alignItems: "flex-start",
    width: "100%",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    color: "#ccc",
    fontSize: "16px",
    border: "2px dashed #e0e0e0",
    borderRadius: "12px",
    width: "100%",
    boxSizing: "border-box",
  },

  leftPanel: {
    flex: "1 1 280px",
    minWidth: "250px",
    maxWidth: "350px",
    position: "sticky",
    top: "20px",
  },
  rightPanel: {
    flex: "999 1 400px",
    minWidth: "300px",
    width: "100%",
  },

  card: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    paddingBottom: "10px",
    borderBottom: "1px solid #f0f0f0",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#333",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    margin: 0,
  },

  lotIdBox: {
    backgroundColor: "#F8F9FA",
    padding: "12px",
    borderRadius: "6px",
    textAlign: "center",
    marginBottom: "15px",
    border: `1px solid ${COLORS.border}`,
  },

  infoGrid: { display: "flex", flexDirection: "column", gap: "2px" },
  specialInfo: {
    marginTop: "15px",
    padding: "12px",
    backgroundColor: "#FFF8E1",
    borderRadius: "6px",
    border: `1px solid ${COLORS.warning}30`,
  },
  iconRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#555",
  },

  timeline: { padding: "5px 0 0 5px" },
  timelineItem: {
    position: "relative",
    paddingBottom: "25px",
    paddingLeft: "25px",
  },
  timelineLine: {
    position: "absolute",
    left: "7px",
    top: "5px",
    bottom: "-5px",
    width: "2px",
    backgroundColor: "#e0e0e0",
  },
  timelineDotStart: {
    position: "absolute",
    left: "0",
    top: "4px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    backgroundColor: COLORS.success,
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    zIndex: 2,
  },
  timelineDot: {
    position: "absolute",
    left: "0",
    top: "4px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    backgroundColor: "white",
    border: "1px solid #eee",
  },
  timelineContent: {
    backgroundColor: "#fff",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #eee",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
    fontSize: "13px",
  },
  stepTitle: {
    fontWeight: "bold",
    fontSize: "13px",
    color: "#333",
    marginBottom: "3px",
  },
  stepDesc: {
    fontSize: "11px",
    color: "#666",
    display: "flex",
    alignItems: "center",
    marginBottom: "2px",
  },

  productBadge: {
    marginTop: "6px",
    padding: "4px 8px",
    backgroundColor: "#F3F1FF",
    borderRadius: "4px",
    fontSize: "11px",
    display: "inline-flex",
    alignItems: "center",
    border: `1px solid ${COLORS.primary}30`,
    width: "fit-content",
  },
  infoText: {
    marginTop: "4px",
    fontSize: "10px",
    color: "#bbb",
    fontStyle: "italic",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #f9f9f9",
  },
  badge: {
    fontSize: "10px",
    fontWeight: "bold",
    padding: "3px 8px",
    borderRadius: "4px",
  },
};
export default LotTracking;
