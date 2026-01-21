import React, { useState } from "react";
import {
  FaBoxes,
  FaExclamationTriangle,
  FaSearch,
  FaChartPie,
  FaWarehouse,
  FaShoppingCart,
  FaFilter,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// 🎨 MedisOne 테마
const COLORS = {
  primary: "#8C85FF",
  bg: "#F5F6FA",
  danger: "#FF5252",
  warning: "#FFBB33",
  success: "#00C851",
  text: "#333",
  gray: "#888",
  border: "#E0E0E0",
  white: "#FFFFFF",
};

const PIE_COLORS = ["#8C85FF", "#FFBB33", "#00C851", "#4285F4"];

const InventoryCurrent = () => {
  // 상태 관리: 검색어 + 카테고리 필터
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All"); // 기본값: 전체

  // 📝 [Mock Data]
  const inventoryData = [
    {
      id: 1,
      code: "PNL-24-MED",
      name: "24인치 의료용 패널",
      category: "원자재",
      qty: 450,
      safeQty: 100,
      loc: "A-01",
      unit: "EA",
    },
    {
      id: 2,
      code: "RESIN-OCR",
      name: "OCR 레진 (광학접착)",
      category: "화학",
      qty: 5,
      safeQty: 20,
      loc: "C-02 (냉장)",
      unit: "kg",
    },
    {
      id: 3,
      code: "GLS-AG-24",
      name: "AG 커버 글라스",
      category: "원자재",
      qty: 1200,
      safeQty: 500,
      loc: "A-03",
      unit: "EA",
    },
    {
      id: 4,
      code: "SCREW-M4",
      name: "M4 조립 나사",
      category: "부자재",
      qty: 25,
      safeQty: 100,
      loc: "B-05",
      unit: "Box",
    },
    {
      id: 5,
      code: "PCB-MAIN",
      name: "메인보드 (V2)",
      category: "반제품",
      qty: 80,
      safeQty: 50,
      loc: "B-01",
      unit: "EA",
    },
    {
      id: 6,
      code: "BOX-PKG",
      name: "포장 박스",
      category: "부자재",
      qty: 2000,
      safeQty: 500,
      loc: "D-01",
      unit: "EA",
    },
    {
      id: 7,
      code: "MON-24-PRO",
      name: "의료용 모니터 완제품",
      category: "완제품",
      qty: 30,
      safeQty: 10,
      loc: "F-01",
      unit: "EA",
    },
  ];

  // 카테고리 목록 (자동 생성 또는 고정)
  const categories = ["All", "원자재", "부자재", "화학", "반제품", "완제품"];

  // 📊 차트 데이터
  const categoryStats = [
    { name: "원자재", value: 45 },
    { name: "부자재", value: 25 },
    { name: "화학", value: 10 },
    { name: "반제품", value: 20 },
  ];

  const stockComparison = [
    { name: "패널", current: 450, safe: 100 },
    { name: "글라스", current: 1200, safe: 500 },
    { name: "레진", current: 5, safe: 20 },
    { name: "나사", current: 25, safe: 100 },
  ];

  // 🔍 [필터링 로직] 검색어 AND 카테고리
  const filteredData = inventoryData.filter((item) => {
    const matchSearch =
      item.name.includes(searchTerm) || item.code.includes(searchTerm);
    const matchCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 실시간 재고 현황 (Real-time Inventory)</h2>

      {/* 1. 상단 차트 영역 */}
      <div style={styles.chartRow}>
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaChartPie /> 자재 카테고리 구성
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>
            <FaExclamationTriangle /> 주요 자재 수급 현황
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stockComparison} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Legend />
              <Bar
                dataKey="current"
                name="현재고"
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="safe"
                name="안전재고"
                fill={COLORS.warning}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 하단 리스트 영역 */}
      <div style={styles.listCard}>
        {/* [NEW] 탭 필터 & 검색바 헤더 */}
        <div style={styles.filterHeader}>
          <div style={styles.tabGroup}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={selectedCategory === cat ? styles.tabActive : styles.tab}
              >
                {cat === "All" ? "전체" : cat}
              </button>
            ))}
          </div>

          <div style={styles.searchBox}>
            <FaSearch color={COLORS.gray} />
            <input
              style={styles.input}
              placeholder="품목명 또는 코드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 테이블 */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>상태</th>
              <th style={styles.th}>자재코드</th>
              <th style={styles.th}>품목명</th>
              <th style={styles.th}>카테고리</th>
              <th style={styles.th}>현재고 / 안전재고</th>
              <th style={styles.th}>보관위치</th>
              <th style={styles.th}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const percent = (item.qty / item.safeQty) * 100;
                let status = "NORMAL";
                if (percent <= 50) status = "LOW";
                if (item.qty < item.safeQty) status = "DANGER";

                return (
                  <tr key={item.id} style={styles.tr}>
                    <td style={styles.td}>
                      <StatusDot status={status} />
                    </td>
                    <td style={styles.tdCode}>{item.code}</td>
                    <td style={{ ...styles.td, fontWeight: "bold" }}>
                      {item.name}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.categoryBadge}>{item.category}</span>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.qtyWrapper}>
                        <span
                          style={{
                            color:
                              status === "DANGER" ? COLORS.danger : COLORS.text,
                            fontWeight: "bold",
                          }}
                        >
                          {item.qty.toLocaleString()} {item.unit}
                        </span>
                        <span style={{ fontSize: "11px", color: "#999" }}>
                          {" "}
                          / {item.safeQty}
                        </span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div
                          style={{
                            ...styles.progressBarFill,
                            width: `${Math.min(percent, 100)}%`,
                            backgroundColor:
                              status === "DANGER"
                                ? COLORS.danger
                                : status === "LOW"
                                  ? COLORS.warning
                                  : COLORS.success,
                          }}
                        />
                      </div>
                    </td>
                    <td style={styles.td}>{item.loc}</td>
                    <td style={styles.td}>
                      {status !== "NORMAL" && (
                        <button style={styles.orderBtn}>
                          <FaShoppingCart /> 발주
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={styles.emptyState}>
                  검색된 자재가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---
const StatusDot = ({ status }) => {
  let color = COLORS.success;
  let text = "정상";

  if (status === "DANGER") {
    color = COLORS.danger;
    text = "부족";
  } else if (status === "LOW") {
    color = COLORS.warning;
    text = "관심";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 8px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "bold",
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
      {text}
    </span>
  );
};

// --- 스타일 ---
const styles = {
  container: { padding: "30px", backgroundColor: COLORS.bg, minHeight: "100%" },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: COLORS.text,
  },

  // 차트
  chartRow: { display: "flex", gap: "20px", marginBottom: "20px" },
  chartCard: {
    flex: 1,
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: 0,
    color: "#333",
  },

  // 리스트 영역
  listCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  // [NEW] 필터 헤더 스타일
  filterHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  tabGroup: {
    display: "flex",
    gap: "8px",
    backgroundColor: "#F5F6FA",
    padding: "4px",
    borderRadius: "8px",
  },
  tab: {
    border: "none",
    background: "transparent",
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
  },
  tabActive: {
    border: "none",
    backgroundColor: COLORS.white,
    padding: "6px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    color: COLORS.primary,
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: "20px",
    padding: "8px 15px",
    width: "250px",
  },
  input: {
    border: "none",
    background: "transparent",
    marginLeft: "10px",
    outline: "none",
    width: "100%",
    fontSize: "14px",
  },

  // 테이블
  table: { width: "100%", borderCollapse: "collapse" },
  thRow: { backgroundColor: "#f9f9f9", borderBottom: "1px solid #eee" },
  th: {
    padding: "12px",
    textAlign: "left",
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
  },
  tr: { borderBottom: "1px solid #f5f5f5", height: "50px" },
  td: {
    padding: "12px",
    fontSize: "14px",
    color: "#333",
    verticalAlign: "middle",
  },
  tdCode: {
    padding: "12px",
    fontSize: "13px",
    color: "#888",
    fontFamily: "monospace",
  },
  emptyState: { padding: "40px", textAlign: "center", color: "#999" },

  // 요소들
  categoryBadge: {
    backgroundColor: "#F0F2F5",
    color: "#555",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
  },
  qtyWrapper: {
    display: "flex",
    alignItems: "baseline",
    gap: "5px",
    marginBottom: "4px",
  },
  progressBarBg: {
    width: "100px",
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "3px",
  },
  progressBarFill: { height: "100%", borderRadius: "3px" },
  orderBtn: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    backgroundColor: COLORS.danger,
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "bold",
  },
};

export default InventoryCurrent;
