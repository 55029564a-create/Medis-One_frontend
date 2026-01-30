import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaFolder,
  FaFolderOpen,
  FaPlus,
  FaEdit,
  FaSitemap,
  FaCodeBranch,
  FaCube,
  FaHistory,
  FaChevronRight,
  FaChevronDown, // 트리 확장에 필요하여 추가
} from "react-icons/fa";

// 🎨 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  success: "#00C851",
  danger: "#FF4444",
  info: "#33B5E5",
  hover: "#F9F9F9",
};

// 📂 Mock Data
const productTreeData = [
  { id: "PROD-001", name: "환자 감시 모니터 (Model-A)", type: "Finished" },
  { id: "PROD-002", name: "휴대용 제세동기 (Model-Z)", type: "Finished" },
  { id: "PROD-003", name: "심전도 측정기 (ECG-X)", type: "Finished" },
];

const initialBomList = [
  {
    id: "BOM-001",
    level: 1,
    partCode: "LCD-24-001",
    partName: "24인치 LCD 패널",
    spec: "24inch, 4K, Medical",
    qty: 1,
    unit: "EA",
    type: "Raw Material",
    cost: 150000,
  },
  {
    id: "BOM-002",
    level: 1,
    partCode: "PCB-M-005",
    partName: "메인보드 (Main Unit)",
    spec: "Ver 2.1",
    qty: 1,
    unit: "EA",
    type: "Sub-Assy",
    cost: 85000,
  },
  {
    id: "BOM-003",
    level: 2,
    partCode: "CPU-I7-12",
    partName: "Intel Core i7",
    spec: "12th Gen",
    qty: 1,
    unit: "EA",
    type: "Raw Material",
    cost: 320000,
    parentId: "PCB-M-005",
  },
  {
    id: "BOM-004",
    level: 1,
    partCode: "CASE-PL-01",
    partName: "플라스틱 케이스 (Top)",
    spec: "ABS, White",
    qty: 1,
    unit: "EA",
    type: "Raw Material",
    cost: 12000,
  },
  {
    id: "BOM-005",
    level: 1,
    partCode: "SCR-M4-10",
    partName: "고정 나사 (M4)",
    spec: "10mm, Steel",
    qty: 8,
    unit: "EA",
    type: "Raw Material",
    cost: 50,
  },
];

const BomManagement = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bomData, setBomData] = useState([]);
  const [viewMode, setViewMode] = useState("FORWARD");

  useEffect(() => {
    if (selectedProduct) {
      setBomData(initialBomList);
    } else {
      setBomData([]);
    }
  }, [selectedProduct]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.pageTitle}>🧩 BOM 관리 (Bill of Materials)</h2>
          <p style={styles.pageSubtitle}>
            제품별 자재 명세 및 소요량을 관리합니다.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.whiteBtn}>
            <FaHistory /> 변경 이력
          </button>
          <button style={styles.primaryBtn}>
            <FaPlus /> BOM 등록
          </button>
        </div>
      </div>

      {/* Content Wrapper */}
      <div style={styles.contentWrapper}>
        {/* Left Panel: Product Tree */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <span style={styles.panelTitle}>📦 제품 목록</span>
          </div>
          <div style={styles.searchBox}>
            <FaSearch color={COLORS.subText} />
            <input placeholder="제품명 검색..." style={styles.searchInput} />
          </div>
          <div style={styles.treeContainer}>
            {productTreeData.map((node) => (
              <div
                key={node.id}
                style={{
                  ...styles.treeNode,
                  backgroundColor:
                    selectedProduct?.id === node.id
                      ? `${COLORS.primary}15`
                      : "transparent",
                  borderLeft:
                    selectedProduct?.id === node.id
                      ? `3px solid ${COLORS.primary}`
                      : "3px solid transparent",
                }}
                onClick={() => setSelectedProduct(node)}
              >
                <FaFolder
                  style={{
                    color:
                      selectedProduct?.id === node.id
                        ? COLORS.primary
                        : "#FFB74D",
                    marginRight: 10,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={styles.treeNodeName}>{node.name}</div>
                  <div style={styles.treeNodeId}>{node.id}</div>
                </div>
                {selectedProduct?.id === node.id && (
                  <FaChevronRight size={12} color={COLORS.primary} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: BOM Grid */}
        <div style={styles.rightPanel}>
          {selectedProduct ? (
            <>
              {/* BOM Header Info */}
              <div style={styles.bomHeader}>
                <div style={styles.productInfo}>
                  <span style={styles.productCodeBadge}>
                    {selectedProduct.id}
                  </span>
                  <span style={styles.productNameTitle}>
                    {selectedProduct.name}
                  </span>
                  <span style={styles.versionBadge}>Ver 1.2 (Active)</span>
                </div>

                <div style={styles.viewModeToggle}>
                  <button
                    style={
                      viewMode === "FORWARD"
                        ? styles.toggleActive
                        : styles.toggleBtn
                    }
                    onClick={() => setViewMode("FORWARD")}
                  >
                    <FaSitemap /> 정전개
                  </button>
                  <button
                    style={
                      viewMode === "REVERSE"
                        ? styles.toggleActive
                        : styles.toggleBtn
                    }
                    onClick={() => setViewMode("REVERSE")}
                  >
                    <FaCodeBranch /> 역전개
                  </button>
                </div>
              </div>

              {/* Table Area */}
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead style={styles.thead}>
                    <tr>
                      <th
                        style={{
                          ...styles.th,
                          width: "60px",
                          textAlign: "center",
                        }}
                      >
                        Lv
                      </th>
                      <th style={{ ...styles.th, width: "120px" }}>자재코드</th>
                      <th style={{ ...styles.th, minWidth: "250px" }}>
                        자재명 / 규격
                      </th>
                      <th
                        style={{
                          ...styles.th,
                          width: "100px",
                          textAlign: "center",
                        }}
                      >
                        유형
                      </th>
                      <th
                        style={{
                          ...styles.th,
                          width: "80px",
                          textAlign: "right",
                        }}
                      >
                        소요량
                      </th>
                      <th
                        style={{
                          ...styles.th,
                          width: "60px",
                          textAlign: "center",
                        }}
                      >
                        단위
                      </th>
                      <th
                        style={{
                          ...styles.th,
                          width: "100px",
                          textAlign: "right",
                        }}
                      >
                        단가
                      </th>
                      <th
                        style={{
                          ...styles.th,
                          width: "60px",
                          textAlign: "center",
                        }}
                      >
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bomData.map((item) => (
                      <tr key={item.id} style={styles.tr}>
                        {/* Level */}
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <span style={styles.levelBadge(item.level)}>
                            {item.level}
                          </span>
                        </td>
                        {/* 자재코드 */}
                        <td
                          style={{
                            ...styles.td,
                            fontWeight: "500",
                            color: "#555",
                          }}
                        >
                          {item.partCode}
                        </td>
                        {/* 자재명/규격 (트리 구조 표현) */}
                        <td style={styles.td}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              paddingLeft: `${(item.level - 1) * 20}px`,
                            }}
                          >
                            {item.level > 1 && (
                              <span style={styles.treeLine}>└</span>
                            )}
                            <div>
                              <div
                                style={{ fontWeight: "bold", color: "#333" }}
                              >
                                {item.partName}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#888",
                                  marginTop: "2px",
                                }}
                              >
                                {item.spec}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* 유형 */}
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <span style={styles.typeBadge}>{item.type}</span>
                        </td>
                        {/* 소요량 */}
                        <td
                          style={{
                            ...styles.td,
                            textAlign: "right",
                            fontWeight: "bold",
                            color: COLORS.primary,
                          }}
                        >
                          {item.qty}
                        </td>
                        {/* 단위 */}
                        <td
                          style={{
                            ...styles.td,
                            textAlign: "center",
                            color: "#666",
                          }}
                        >
                          {item.unit}
                        </td>
                        {/* 단가 */}
                        <td
                          style={{
                            ...styles.td,
                            textAlign: "right",
                            color: "#666",
                          }}
                        >
                          {item.cost.toLocaleString()}
                        </td>
                        {/* 관리 버튼 */}
                        <td style={{ ...styles.td, textAlign: "center" }}>
                          <button style={styles.iconBtn}>
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <FaCube
                size={50}
                color="#E0E0E0"
                style={{ marginBottom: "15px" }}
              />
              <p style={{ color: "#999", fontSize: "15px" }}>
                좌측 목록에서 제품을 선택하여 BOM을 조회하세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    height: "100vh", // 전체 화면 높이 사용
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box", // 패딩 포함 계산
    overflow: "hidden", // 전체 스크롤 방지 (내부 스크롤 사용)
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexShrink: 0, // 헤더 높이 고정
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: COLORS.text,
    margin: "0 0 5px 0",
  },
  pageSubtitle: { fontSize: "14px", color: COLORS.subText, margin: 0 },
  headerActions: { display: "flex", gap: "10px" },
  whiteBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: "white",
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.2s",
  },
  primaryBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: COLORS.primary,
    color: "white",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "0 4px 6px rgba(140, 133, 255, 0.2)",
  },

  // --- 레이아웃 핵심 (Flexbox) ---
  contentWrapper: {
    display: "flex",
    gap: "20px",
    flex: 1, // 남은 높이 모두 차지
    minHeight: 0, // 내부 스크롤을 위해 필수
  },

  // [Left Panel] 고정 너비
  leftPanel: {
    width: "280px",
    minWidth: "280px", // 줄어들지 않도록 고정
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${COLORS.border}`,
  },
  panelHeader: {
    padding: "18px 20px",
    borderBottom: `1px solid ${COLORS.border}`,
  },
  panelTitle: { fontWeight: "bold", fontSize: "15px", color: "#333" },
  searchBox: {
    margin: "15px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: "8px",
    padding: "10px 12px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    marginLeft: "8px",
    fontSize: "13px",
    width: "100%",
  },
  treeContainer: { flex: 1, overflowY: "auto", padding: "10px 0" }, // 트리만 스크롤
  treeNode: {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    cursor: "pointer",
    transition: "background 0.2s",
    borderLeft: "3px solid transparent",
  },
  treeNodeName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  treeNodeId: { fontSize: "11px", color: "#999", marginTop: "2px" },

  // [Right Panel] 가변 너비 (반응형 대응)
  rightPanel: {
    flex: 1, // 남은 공간 모두 차지
    minWidth: 0, // ★ 중요: Flex 자식 요소가 부모보다 커지는 것 방지 (가로 스크롤 생성 조건)
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${COLORS.border}`,
  },
  bomHeader: {
    padding: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", // 화면 좁을 때 줄바꿈 허용
    gap: "10px",
  },
  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  productCodeBadge: {
    fontSize: "12px",
    color: COLORS.primary,
    fontWeight: "bold",
    backgroundColor: `${COLORS.primary}15`,
    padding: "4px 8px",
    borderRadius: "6px",
  },
  productNameTitle: { fontSize: "18px", fontWeight: "800", color: "#333" },
  versionBadge: {
    fontSize: "11px",
    backgroundColor: "#E8F5E9",
    color: "#2E7D32",
    padding: "4px 8px",
    borderRadius: "20px",
    fontWeight: "bold",
  },
  viewModeToggle: {
    display: "flex",
    backgroundColor: "#F5F6FA",
    borderRadius: "8px",
    padding: "4px",
  },
  toggleBtn: {
    padding: "6px 14px",
    border: "none",
    background: "transparent",
    color: "#888",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "600",
  },
  toggleActive: {
    padding: "6px 14px",
    border: "none",
    background: "white",
    color: COLORS.primary,
    fontSize: "13px",
    fontWeight: "bold",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  // --- 테이블 스타일 ---
  tableContainer: {
    flex: 1,
    overflow: "auto", // ★ 중요: 내용 많으면 내부 스크롤 발생
    padding: "0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "800px", // ★ 중요: 테이블 최소 너비 설정 (찌그러짐 방지)
  },
  thead: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "#FAFAFA",
  },
  th: {
    padding: "14px 16px",
    fontSize: "13px",
    color: "#555",
    fontWeight: "700",
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: "nowrap", // 헤더 줄바꿈 방지
  },
  tr: {
    borderBottom: "1px solid #F5F5F5",
    transition: "background 0.1s",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    verticalAlign: "middle",
    whiteSpace: "nowrap", // 셀 내용 줄바꿈 방지 (긴 내용은 overflow 처리 또는 width로 조절)
  },
  levelBadge: (level) => ({
    backgroundColor: level === 1 ? COLORS.primary : "#9E9E9E",
    color: "white",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
  }),
  treeLine: { color: "#CCC", marginRight: "8px", userSelect: "none" },
  typeBadge: {
    fontSize: "11px",
    color: "#666",
    backgroundColor: "#F0F0F0",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  iconBtn: {
    border: "none",
    background: "transparent",
    color: "#999",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "4px",
    fontSize: "14px",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
};

export default BomManagement;
