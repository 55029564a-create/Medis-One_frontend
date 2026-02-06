import React, { useState, useEffect } from "react";
import axios from "axios"; // 서버 통신을 위한 라이브러리
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

// 🎨 차트용 색상
const PIE_COLORS = ["#8C85FF", "#FFBB33", "#00C851", "#4285F4"];
const CHART_COLORS = {
  primary: "#8C85FF",
  warning: "#FFBB33",
  danger: "#FF5252",
  success: "#00C851",
};

const InventoryCurrent = () => {
  // 상태 관리: 검색어 + 카테고리 필터
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // // 📝 [Mock Data]
  // const inventoryData = [
  //   {
  //     id: 1,
  //     code: "PNL-24-MED",
  //     name: "24인치 의료용 패널",
  //     category: "원자재",
  //     qty: 450,
  //     safeQty: 100,
  //     loc: "A-01",
  //     unit: "EA",
  //   },
  //   {
  //     id: 2,
  //     code: "RESIN-OCR",
  //     name: "OCR 레진 (광학접착)",
  //     category: "화학",
  //     qty: 5,
  //     safeQty: 20,
  //     loc: "C-02 (냉장)",
  //     unit: "kg",
  //   },
  //   {
  //     id: 3,
  //     code: "GLS-AG-24",
  //     name: "AG 커버 글라스",
  //     category: "원자재",
  //     qty: 1200,
  //     safeQty: 500,
  //     loc: "A-03",
  //     unit: "EA",
  //   },
  //   {
  //     id: 4,
  //     code: "SCREW-M4",
  //     name: "M4 조립 나사",
  //     category: "부자재",
  //     qty: 25,
  //     safeQty: 100,
  //     loc: "B-05",
  //     unit: "Box",
  //   },
  //   {
  //     id: 5,
  //     code: "PCB-MAIN",
  //     name: "메인보드 (V2)",
  //     category: "반제품",
  //     qty: 80,
  //     safeQty: 50,
  //     loc: "B-01",
  //     unit: "EA",
  //   },
  //   {
  //     id: 6,
  //     code: "BOX-PKG",
  //     name: "포장 박스",
  //     category: "부자재",
  //     qty: 2000,
  //     safeQty: 500,
  //     loc: "D-01",
  //     unit: "EA",
  //   },
  //   {
  //     id: 7,
  //     code: "MON-24-PRO",
  //     name: "의료용 모니터 완제품",
  //     category: "완제품",
  //     qty: 30,
  //     safeQty: 10,
  //     loc: "F-01",
  //     unit: "EA",
  //   },
  // ];

  // 카테고리 목록
  const categories = ["All", "원자재", "부자재", "화학", "반제품", "완제품"];

  // // 📊 차트 데이터
  // const categoryStats = [
  //   { name: "원자재", value: 45 },
  //   { name: "부자재", value: 25 },
  //   { name: "화학", value: 10 },
  //   { name: "반제품", value: 20 },
  // ];

  // const stockComparison = [
  //   { name: "패널", current: 450, safe: 100 },
  //   { name: "글라스", current: 1200, safe: 500 },
  //   { name: "레진", current: 5, safe: 20 },
  //   { name: "나사", current: 25, safe: 100 },
  // ];

  // // 🔍 [필터링 로직]
  // const filteredData = inventoryData.filter((item) => {
  //   const matchSearch =
  //     item.name.includes(searchTerm) || item.code.includes(searchTerm);
  //   const matchCategory =
  //     selectedCategory === "All" || item.category === selectedCategory;
  //   return matchSearch && matchCategory;
  // });

  // API 데이터 호출 로직
  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      // 백엔드 컨트롤러 주소와 매개변수(params) 연결
      const response = await axios.get(
        "http://localhost:8111/api/inventory/state",
        {
          params: {
            category: selectedCategory === "All" ? "" : selectedCategory,
            searchTerm: searchTerm,
          },
        },
      );
      setDashboardData(response.data); // 서버에서 받은 DTO 저장
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect: 필터 변경 시 자동 새로고침
  useEffect(() => {
    fetchInventoryData();
  }, [selectedCategory, searchTerm]);

  if (loading && !dashboardData)
    return <div className="empty-state">데이터를 불러오는 중...</div>;
  if (!dashboardData)
    return <div className="empty-state">서버 연결 상태를 확인하세요.</div>;

  const { categoryStats, itemList } = dashboardData;

  // 📊 차트용 데이터 가공
  const pieData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value,
  }));
  const barData = (itemList || []).slice(0, 5); // 상위 5개만 차트 표시

  return (
    <>
      <style>{`
        /* 전체 컨테이너 */
        .inventory-page-container {
          padding: 2rem;
          background-color: #f5f7fa;
          min-height: 100vh;
          font-family: "Pretendard", sans-serif;
          color: #333;
        }

        /* 헤더 */
        .page-header-wrapper {
          margin-bottom: 2rem;
        }
        .page-title {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111;
          margin-bottom: 0.5rem;
        }
        .title-icon {
          margin-right: 0.8rem;
          font-size: 1.6rem;
          color: #8C85FF;
        }
        .page-description {
          font-size: 0.95rem;
          color: #666;
          margin-left: 2.4rem;
        }

        /* 차트 영역 (Flex) */
        .chart-row {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }
        .chart-card {
          flex: 1;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid #eaecf0;
        }
        .card-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .card-sub-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* 메인 리스트 카드 */
        .content-card {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid #eaecf0;
        }

        /* 필터 헤더 */
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 10px;
        }

        /* 탭 그룹 */
        .tab-group {
          display: flex;
          gap: 8px;
          background-color: #f2f4f7;
          padding: 4px;
          border-radius: 8px;
        }
        .tab-btn {
          border: none;
          background: transparent;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          color: #666;
          font-weight: 600;
          transition: all 0.2s;
        }
        .tab-btn.active {
          background-color: #ffffff;
          color: #8C85FF;
          font-weight: 700;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        /* 검색창 */
        .search-box-wrapper {
          width: 240px;
          display: flex;
          align-items: center;
          background-color: #f2f4f7;
          border-radius: 50px;
          padding: 8px 16px;
        }
        .search-icon {
          width: 16px;
          height: 16px;
          color: #9ca3af;
          margin-right: 8px;
        }
        .custom-search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.9rem;
          width: 100%;
          color: #333;
        }
        .custom-search-input::placeholder {
          color: #9ca3af;
        }

        /* 테이블 */
        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }
        .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .custom-table th {
          background-color: #f9fafb;
          color: #555;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #eaecf0;
        }
        .custom-table td {
          padding: 16px;
          font-size: 0.95rem;
          color: #333;
          border-bottom: 1px solid #f0f2f5;
          vertical-align: middle;
        }
        .custom-table tr:hover td {
          background-color: #fcfcfd;
        }

        /* 텍스트 및 뱃지 스타일 */
        .category-tag {
          display: inline-block;
          padding: 4px 8px;
          background-color: #f2f4f7;
          color: #475467;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          gap: 6px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        /* 상태별 색상 */
        .badge-normal { background-color: #ecfdf5; color: #027a48; }
        .dot-normal { background-color: #027a48; }

        .badge-low { background-color: #fffaeb; color: #b54708; }
        .dot-low { background-color: #b54708; }

        .badge-danger { background-color: #fef3f2; color: #b42318; }
        .dot-danger { background-color: #b42318; }

        /* 수량 및 프로그레스 바 */
        .qty-wrapper {
          display: flex;
          align-items: baseline;
          gap: 5px;
          margin-bottom: 6px;
        }
        .progress-bar-bg {
          width: 100px;
          height: 6px;
          background-color: #f2f4f7;
          border-radius: 3px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
        }

        /* 버튼 */
        .order-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #FF5252;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .order-btn:hover {
          background-color: #ff3b3b;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: #999;
          font-size: 0.95rem;
        }
      `}</style>

      <div className="inventory-page-container">
        {/* 페이지 헤더 */}
        <div className="page-header-wrapper">
          <div className="page-title">
            <FaWarehouse className="title-icon" />
            실시간 재고 현황 (Real-time Inventory)
          </div>
          <div className="page-description">
            현재 보유 중인 모든 자재의 수량과 상태를 실시간으로 모니터링합니다.
          </div>
        </div>

        {/* 1. 상단 차트 영역 */}
        <div className="chart-row">
          {/* 파이 차트 */}
          <div className="chart-card">
            <div className="card-header-row">
              <div className="card-sub-title">
                <FaChartPie /> 자재 카테고리 구성
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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

          {/* 바 차트 */}
          <div className="chart-card">
            <div className="card-header-row">
              <div className="card-sub-title">
                <FaExclamationTriangle /> 주요 자재 수급 현황
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData} barSize={20}>
                {" "}
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Legend />
                <Bar
                  dataKey="qty"
                  name="현재고"
                  fill={CHART_COLORS.primary}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="safeQty"
                  name="안전재고"
                  fill={CHART_COLORS.warning}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. 하단 리스트 영역 */}
        <div className="content-card">
          <div className="filter-header">
            <div className="tab-group">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`tab-btn ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === "All" ? "전체" : cat}
                </button>
              ))}
            </div>

            <div className="search-box-wrapper">
              <FaSearch className="search-icon" />
              <input
                className="custom-search-input"
                placeholder="품목명 또는 코드 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>상태</th>
                  <th>자재코드</th>
                  <th>품목명</th>
                  <th>카테고리</th>
                  <th>현재고 / 안전재고</th>
                  <th>보관위치</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {itemList && itemList.length > 0 ? (
                  itemList.map((item) => {
                    const percent = (item.qty / item.safeQty) * 100;
                    let statusClass = "badge-normal";
                    let dotClass = "dot-normal";
                    let statusText = "정상";
                    let barColor = CHART_COLORS.success;

                    if (item.qty < item.safeQty) {
                      statusClass = "badge-danger";
                      dotClass = "dot-danger";
                      statusText = "부족";
                      barColor = CHART_COLORS.danger;
                    } else if (percent <= 150) {
                      statusClass = "badge-low";
                      dotClass = "dot-low";
                      statusText = "관심";
                      barColor = CHART_COLORS.warning;
                    }

                    return (
                      <tr key={item.id}>
                        <td>
                          <span className={`status-badge ${statusClass}`}>
                            <div className={`status-dot ${dotClass}`} />
                            {statusText}
                          </span>
                        </td>
                        <td style={{ fontFamily: "monospace", color: "#666" }}>
                          {item.code}
                        </td>
                        <td style={{ fontWeight: "600", color: "#333" }}>
                          {item.name}
                        </td>
                        <td>
                          <span className="category-tag">{item.category}</span>
                        </td>
                        <td>
                          <div className="qty-wrapper">
                            <span
                              style={{
                                fontWeight: "700",
                                color:
                                  statusText === "부족" ? "#d92d20" : "#333",
                              }}
                            >
                              {item.qty.toLocaleString()} {item.unit || "EA"}
                            </span>
                            <span style={{ fontSize: "0.8rem", color: "#999" }}>
                              {" "}
                              / {item.safeQty}
                            </span>
                          </div>
                          <div className="progress-bar-bg">
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${Math.min(percent, 100)}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                        </td>
                        <td>{item.loc}</td>
                        <td>
                          {statusText !== "정상" && (
                            <button className="order-btn">
                              <FaShoppingCart /> 발주
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      검색된 자재가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default InventoryCurrent;
