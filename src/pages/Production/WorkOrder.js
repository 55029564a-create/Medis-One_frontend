import React, { useState } from "react";
// 공통 컴포넌트 불러오기 (경로가 맞는지 확인해주세요!)
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const WorkOrder = () => {
  // 1. 상태 관리 (입력값들)
  const [productName, setProductName] = useState("");
  const [targetQty, setTargetQty] = useState("");
  const [lineName, setLineName] = useState("");

  // 2. 가짜 데이터 (나중엔 서버에서 받아올 리스트)
  const [orders, setOrders] = useState([
    {
      id: "WO-240114-01",
      product: "의료용 27인치 패널",
      qty: "500",
      line: "Line-A",
      date: "2026-01-14",
      status: "생산중",
    },
    {
      id: "WO-240114-02",
      product: "X-ray 디텍터 모듈",
      qty: "120",
      line: "Line-B",
      date: "2026-01-14",
      status: "대기",
    },
    {
      id: "WO-240113-05",
      product: "초음파 진단기 케이스",
      qty: "300",
      line: "Line-C",
      date: "2026-01-13",
      status: "완료",
    },
  ]);

  // 3. 등록 버튼 눌렀을 때 실행되는 함수
  const handleAddOrder = () => {
    if (!productName || !targetQty) {
      alert("품목명과 수량을 입력해주세요!");
      return;
    }

    const newOrder = {
      id: `WO-240114-0${orders.length + 1}`, // ID 자동 생성 (임시)
      product: productName,
      qty: targetQty,
      line: lineName || "미지정",
      date: new Date().toISOString().split("T")[0], // 오늘 날짜
      status: "대기",
    };

    setOrders([newOrder, ...orders]); // 목록 맨 위에 추가

    // 입력창 초기화
    setProductName("");
    setTargetQty("");
    setLineName("");
    alert("작업 지시가 등록되었습니다.");
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📝 작업 지시 관리</h2>

      {/* --- 섹션 1: 신규 작업 지시 등록 폼 --- */}
      <div style={sectionBoxStyle}>
        <h3 style={subTitleStyle}>신규 지시 등록</h3>

        <div style={formContainerStyle}>
          {/* 공통 컴포넌트 Input 사용 */}
          <div style={{ flex: 1 }}>
            <Input
              label="품목명"
              placeholder="예: 32인치 모니터"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label="목표 수량"
              type="number"
              placeholder="0"
              value={targetQty}
              onChange={(e) => setTargetQty(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              label="배정 라인"
              placeholder="예: Line-A"
              value={lineName}
              onChange={(e) => setLineName(e.target.value)}
            />
          </div>

          {/* 등록 버튼 */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              paddingBottom: "15px",
            }}
          >
            <Button onClick={handleAddOrder} style={{ height: "42px" }}>
              + 지시 등록
            </Button>
          </div>
        </div>
      </div>

      {/* --- 섹션 2: 작업 지시 목록 리스트 --- */}
      <div style={sectionBoxStyle}>
        <h3 style={subTitleStyle}>금일 작업 지시 현황</h3>

        {/* 공통 컴포넌트 Table 사용 */}
        <Table
          headers={[
            "지시번호",
            "품목명",
            "목표수량",
            "라인",
            "지시일자",
            "상태",
          ]}
          data={orders}
        />
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const pageStyle = {
  padding: "20px",
  minHeight: "100vh",
};

const sectionBoxStyle = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  marginBottom: "20px",
};

const subTitleStyle = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "15px",
  color: "#555",
  borderLeft: "4px solid #0056b3", // 왼쪽에 파란 띠 포인트
  paddingLeft: "10px",
};

const formContainerStyle = {
  display: "flex",
  gap: "20px",
  flexWrap: "wrap", // 화면 좁아지면 줄바꿈
};

export default WorkOrder;
