import React, { useState } from "react";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";

const ProductionSchedule = () => {
  // 이번 주 생산 계획 데이터
  const [schedules, setSchedules] = useState([
    {
      date: "2026-01-14 (수)",
      line: "Line-A",
      product: "27인치 패널",
      planQty: "500",
      status: "진행중",
    },
    {
      date: "2026-01-14 (수)",
      line: "Line-B",
      product: "메인보드",
      planQty: "1000",
      status: "대기",
    },
    {
      date: "2026-01-15 (목)",
      line: "Line-A",
      product: "32인치 모니터",
      planQty: "400",
      status: "예정",
    },
    {
      date: "2026-01-15 (목)",
      line: "Line-C",
      product: "전원 어댑터",
      planQty: "2000",
      status: "예정",
    },
    {
      date: "2026-01-16 (금)",
      line: "Line-B",
      product: "의료용 디텍터",
      planQty: "150",
      status: "예정",
    },
  ]);

  return (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📅 주간 생산 계획</h2>

      {/* 1. 상단 컨트롤 (날짜 이동) */}
      <div style={controlBoxStyle}>
        <Button color="#6c757d">◀ 이전 주</Button>
        <h3 style={{ margin: "0 20px" }}>2026년 1월 3주차</h3>
        <Button color="#6c757d">다음 주 ▶</Button>
      </div>

      {/* 2. 스케줄 리스트 */}
      <div style={sectionBoxStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>상세 일정표</h3>
          <Button color="#28a745">+ 일정 추가</Button>
        </div>

        <Table
          headers={["날짜", "생산 라인", "품목명", "계획 수량", "진행 상태"]}
          data={schedules}
        />
      </div>
    </div>
  );
};

// --- 스타일 ---
const pageStyle = { padding: "20px", minHeight: "100vh" };
const controlBoxStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  marginBottom: "20px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};
const sectionBoxStyle = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
};

export default ProductionSchedule;
