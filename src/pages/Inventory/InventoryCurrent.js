import React, { useState } from "react";
import {
  FaBox,
  FaSearch,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";

// 🎨 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851", // 양호
  warning: "#FFBB33", // 부족
  danger: "#FF4444", // 없음
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

// Mock Data
const initialData = [
  {
    id: 1,
    code: "M-001",
    name: "27인치 LCD 패널",
    category: "원자재",
    qty: 1500,
    safeQty: 500,
  },
  {
    id: 2,
    code: "M-002",
    name: "전원 케이블 (KR)",
    category: "부자재",
    qty: 120,
    safeQty: 200,
  },
  {
    id: 3,
    code: "P-101",
    name: "의료용 모니터 A형",
    category: "완제품",
    qty: 50,
    safeQty: 30,
  },
  {
    id: 4,
    code: "M-005",
    name: "나사 (M4)",
    category: "부자재",
    qty: 0,
    safeQty: 1000,
  },
  {
    id: 5,
    code: "P-102",
    name: "X-ray 디텍터",
    category: "완제품",
    qty: 5,
    safeQty: 10,
  },
];

const InventoryCurrent = () => {
  // 상태 관리
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All"); // All, 원자재, 부자재, 완제품

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQty, setEditQty] = useState("");

  // --- 핸들러 ---

  // 데이터 필터링 (검색어 + 카테고리)
  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.includes(searchTerm) || item.code.includes(searchTerm);
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // 상태 판별 로직 (3단계)
  const getStatus = (qty, safeQty) => {
    if (qty === 0)
      return {
        label: "재고 없음",
        color: COLORS.danger,
        icon: <FaTimesCircle />,
      };
    if (qty < safeQty)
      return {
        label: "재고 부족",
        color: COLORS.warning,
        icon: <FaExclamationTriangle />,
      };
    return { label: "양호", color: COLORS.success, icon: <FaCheckCircle /> };
  };

  // 모달 열기
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditQty(item.qty);
    setIsModalOpen(true);
  };

  // 재고 수정 저장
  const handleSave = () => {
    if (editQty < 0) return alert("수량은 0 이상이어야 합니다.");

    setData(
      data.map((d) =>
        d.id === editingItem.id ? { ...d, qty: Number(editQty) } : d,
      ),
    );
    setIsModalOpen(false);
    alert(`[${editingItem.name}] 재고가 수정되었습니다.`);
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2
            style={{
              margin: 0,
              color: COLORS.text,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaBox color={COLORS.primary} /> 실시간 재고 현황
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              fontSize: "14px",
              color: COLORS.subText,
            }}
          >
            전체 자재 및 완제품의 재고 수량을 실시간으로 모니터링하고
            관리합니다.
          </p>
        </div>
      </div>

      {/* 메인 카드 */}
      <div style={styles.card}>
        {/* 툴바 (카테고리 탭 + 검색창) */}
        <div style={styles.toolbar}>
          <div style={styles.tabGroup}>
            {["All", "원자재", "부자재", "완제품"].map((cat) => (
              <button
                key={cat}
                style={activeCategory === cat ? styles.tabActive : styles.tab}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "All" ? "전체" : cat}
              </button>
            ))}
          </div>

          <div style={styles.searchBox}>
            <FaSearch color={COLORS.subText} />
            <input
              type="text"
              placeholder="품목명 / 코드 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* 테이블 */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>품목 코드</th>
                <th style={styles.th}>품목명</th>
                <th style={styles.th}>카테고리</th>
                <th style={styles.th}>현재고 (EA)</th>
                <th style={styles.th}>안전재고 (EA)</th>
                <th style={{ ...styles.th, textAlign: "center" }}>상태</th>
                <th style={{ ...styles.th, textAlign: "center" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => {
                  const status = getStatus(item.qty, item.safeQty);
                  return (
                    <tr key={item.id} style={styles.tr}>
                      <td style={styles.tdCode}>{item.code}</td>
                      <td style={styles.tdName}>{item.name}</td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>
                          {item.category}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: "bold" }}>
                        {item.qty.toLocaleString()}
                      </td>
                      <td style={styles.tdSafe}>
                        {item.safeQty.toLocaleString()}
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            color: status.color,
                            backgroundColor: `${status.color}20`,
                          }}
                        >
                          {status.icon}{" "}
                          <span style={{ marginLeft: "4px" }}>
                            {status.label}
                          </span>
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: "center" }}>
                        <button
                          style={styles.iconButton}
                          onClick={() => openEditModal(item)}
                        >
                          <FaEdit color="#888" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={styles.emptyState}>
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 재고 수정 모달 */}
      {isModalOpen && editingItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>🛠️ 재고 수량 수정 (수동)</h3>
              <div style={{ fontSize: "13px", color: "#888" }}>
                {editingItem.name} ({editingItem.code})
              </div>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>현재 수량</label>
                <input
                  type="number"
                  value={editQty}
                  onChange={(e) => setEditQty(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>사유 (선택)</label>
                <input
                  type="text"
                  placeholder="조정 사유 입력"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.btnCancel}
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </button>
              <button style={styles.btnSave} onClick={handleSave}>
                수정 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 스타일 정의 (CSS in JS) ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Pretendard', sans-serif",
  },
  header: { marginBottom: "25px" },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    border: `1px solid ${COLORS.border}`,
  },
  // 툴바 (탭 + 검색)
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  tabGroup: {
    display: "flex",
    gap: "10px",
  },
  tab: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.white,
    color: "#666",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "0.2s",
  },
  tabActive: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(140, 133, 255, 0.3)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
    borderRadius: "20px",
    padding: "8px 16px",
    width: "240px",
  },
  searchInput: {
    border: "none",
    backgroundColor: "transparent",
    outline: "none",
    marginLeft: "10px",
    fontSize: "14px",
    width: "100%",
    color: COLORS.text,
  },
  // 테이블
  tableContainer: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    fontSize: "14px",
  },
  thRow: { backgroundColor: "#F9FAFB" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    color: "#555",
    fontWeight: "600",
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid #f0f2f5",
    transition: "background-color 0.2s",
  },
  td: {
    padding: "16px",
    borderBottom: "1px solid #f0f2f5",
    verticalAlign: "middle",
    color: COLORS.text,
  },
  tdCode: {
    padding: "16px",
    borderBottom: "1px solid #f0f2f5",
    color: "#666",
    fontSize: "13px",
  },
  tdName: {
    padding: "16px",
    borderBottom: "1px solid #f0f2f5",
    fontWeight: "600",
    color: "#111",
  },
  tdSafe: {
    padding: "16px",
    borderBottom: "1px solid #f0f2f5",
    color: "#888",
  },
  categoryBadge: {
    display: "inline-block",
    padding: "4px 8px",
    backgroundColor: "#F2F4F7",
    color: "#475467",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "500",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    borderRadius: "50%",
    transition: "background 0.2s",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    fontSize: "14px",
  },
  // 모달 스타일
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    width: "400px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    marginBottom: "20px",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "10px",
  },
  modalBody: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
  label: { fontSize: "13px", fontWeight: "bold", color: "#555" },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    outline: "none",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  btnCancel: {
    backgroundColor: "#eee",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
  },
};

export default InventoryCurrent;
