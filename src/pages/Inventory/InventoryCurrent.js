import React, { useState } from "react";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";

const InventoryCurrent = () => {
  // 검색어 상태
  const [searchTerm, setSearchTerm] = useState("");

  // 재고 데이터 (Raw Data)
  // status 로직: qty < safeQty 이면 "재고 부족"
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
    }, // 부족!
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
    }, // 부족!
  ];

  // 검색 필터링 & 데이터 가공 (Table에 넣기 좋게 변환)
  const filteredData = initialData
    .filter((item) => item.name.includes(searchTerm)) // 검색어로 필터링
    .map((item) => ({
      code: item.code,
      name: item.name,
      category: item.category,
      qty: `${item.qty.toLocaleString()} 개`, // 천단위 콤마
      safeQty: `${item.safeQty.toLocaleString()} 개`,
      // 수량이 안전재고보다 적으면 빨간 글씨
      status:
        item.qty < item.safeQty ? (
          <span style={{ color: "red", fontWeight: "bold" }}>⚠️ 재고 부족</span>
        ) : (
          <span style={{ color: "green" }}>양호</span>
        ),
    }));

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        📦 실시간 재고 현황
      </h2>

      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        {/* 상단: 검색창 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
            전체 품목 리스트
          </h3>
          <div style={{ width: "300px" }}>
            <Input
              placeholder="품목명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ marginBottom: 0 }} // Input 컴포넌트 기본 마진 제거
            />
          </div>
        </div>

        {/* 하단: 재고 테이블 */}
        <Table
          headers={[
            "품목 코드",
            "품목명",
            "카테고리",
            "현재고",
            "안전재고",
            "상태",
          ]}
          data={filteredData}
        />
      </div>
    </div>
  );
};

export default InventoryCurrent;
