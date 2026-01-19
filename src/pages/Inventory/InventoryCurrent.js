import React, { useState } from "react";
import "./InventoryCurrent.css";

const InventoryCurrent = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const initialData = [
    {
      code: "M-001",
      name: "27인치 LCD 패널",
      category: "원자재",
      qty: 1500,
      safeQty: 500,
    },
    {
      code: "M-002",
      name: "전원 케이블 (KR)",
      category: "부자재",
      qty: 120,
      safeQty: 200,
    },
    {
      code: "P-101",
      name: "의료용 모니터 A형",
      category: "완제품",
      qty: 50,
      safeQty: 30,
    },
    {
      code: "M-005",
      name: "나사 (M4)",
      category: "부자재",
      qty: 50000,
      safeQty: 1000,
    },
    {
      code: "P-102",
      name: "X-ray 디텍터",
      category: "완제품",
      qty: 5,
      safeQty: 10,
    },
  ];

  // 데이터 필터링
  const filteredData = initialData.filter((item) =>
    item.name.includes(searchTerm),
  );

  return (
    <div className="inventory-page-container">
      {/* 페이지 헤더 부분 */}
      <div className="page-header-wrapper">
        <h2 className="page-title">
          <span className="title-icon">📦</span> 실시간 재고 현황
        </h2>
        <p className="page-description">
          전체 자재 및 완제품의 재고 수량을 실시간으로 모니터링합니다.
        </p>
      </div>

      {/* 메인 컨텐츠 카드 */}
      <div className="content-card">
        <div className="card-header-row">
          <h3 className="card-sub-title">전체 품목 리스트</h3>

          <div className="search-box-wrapper">
            <svg
              className="search-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="품목명 / LOT ID 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="custom-search-input"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>품목 코드</th>
                <th>품목명</th>
                <th>카테고리</th>
                <th>현재고 (EA)</th>
                <th>안전재고 (EA)</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => {
                  const isShortage = item.qty < item.safeQty;
                  return (
                    <tr key={index}>
                      <td className="text-gray">{item.code}</td>
                      <td className="text-bold">{item.name}</td>
                      <td>
                        <span className="category-tag">{item.category}</span>
                      </td>
                      <td className={isShortage ? "text-danger-bold" : ""}>
                        {item.qty.toLocaleString()}
                      </td>
                      <td className="text-gray">
                        {item.safeQty.toLocaleString()}
                      </td>
                      <td>
                        {isShortage ? (
                          <span className="status-badge shortage">
                            ⚠️ 재고 부족
                          </span>
                        ) : (
                          <span className="status-badge good">양호</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#999",
                    }}
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryCurrent;
