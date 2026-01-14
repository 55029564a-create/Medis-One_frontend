import React, { useState } from "react";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const WorkReport = () => {
  const [orderNo, setOrderNo] = useState("");
  const [goodQty, setGoodQty] = useState("");
  const [badQty, setBadQty] = useState("");

  // 가짜 실적 데이터
  const [reports, setReports] = useState([
    {
      id: 1,
      date: "2026-01-14",
      orderNo: "WO-240114-01",
      item: "27인치 패널",
      good: 480,
      bad: 20,
      worker: "김철수",
    },
    {
      id: 2,
      date: "2026-01-14",
      orderNo: "WO-240114-02",
      item: "메인보드",
      good: 1000,
      bad: 0,
      worker: "이영희",
    },
  ]);

  const handleSave = () => {
    if (!orderNo || !goodQty)
      return alert("작업지시번호와 양품 수량을 입력하세요.");

    const newReport = {
      id: reports.length + 1,
      date: new Date().toISOString().split("T")[0],
      orderNo: orderNo,
      item: "자동입력 품목", // 실제론 지시번호 조회해서 가져옴
      good: goodQty,
      bad: badQty || 0,
      worker: "관리자",
    };

    setReports([newReport, ...reports]);
    setOrderNo("");
    setGoodQty("");
    setBadQty("");
    alert("실적 등록 완료!");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>📊 생산 실적 등록</h2>

      {/* 실적 입력 폼 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <h3
          style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}
        >
          실적 입력
        </h3>
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: 1, minWidth: "200px" }}>
            <Input
              label="작업지시번호"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="WO-..."
            />
          </div>
          <div style={{ flex: 0.5 }}>
            <Input
              label="양품 수량"
              type="number"
              value={goodQty}
              onChange={(e) => setGoodQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div style={{ flex: 0.5 }}>
            <Input
              label="불량 수량"
              type="number"
              value={badQty}
              onChange={(e) => setBadQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div style={{ paddingBottom: "15px" }}>
            <Button onClick={handleSave}>실적 저장</Button>
          </div>
        </div>
      </div>

      {/* 실적 리스트 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <Table
          headers={["일자", "지시번호", "품목명", "양품", "불량", "작업자"]}
          data={reports}
        />
      </div>
    </div>
  );
};

export default WorkReport;
