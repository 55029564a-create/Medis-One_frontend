import React, { useState } from "react";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const QualityDefect = () => {
  // 입력 상태
  const [product, setProduct] = useState("");
  const [defectType, setDefectType] = useState("");
  const [qty, setQty] = useState("");

  // 데이터 목록
  const [defects, setDefects] = useState([
    {
      date: "2026-01-14 10:30",
      product: "27인치 패널",
      type: "스크래치",
      qty: "2",
      reporter: "김작업",
    },
    {
      date: "2026-01-14 11:15",
      product: "전원 케이블",
      type: "단선",
      qty: "1",
      reporter: "이검사",
    },
    {
      date: "2026-01-13 15:40",
      product: "메인보드",
      type: "납땜 불량",
      qty: "5",
      reporter: "박조장",
    },
  ]);

  // 불량 등록 핸들러
  const handleRegister = () => {
    if (!product || !qty) return alert("필수 정보를 입력하세요.");

    const newDefect = {
      date: new Date().toLocaleString(),
      product,
      type: defectType || "기타",
      qty,
      reporter: "관리자", // 로그인한 사람 이름이 들어가야 함 (임시)
    };

    setDefects([newDefect, ...defects]);
    setProduct("");
    setDefectType("");
    setQty("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>🚨 품질 불량 현황</h2>

      {/* 1. 불량 등록 폼 */}
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
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            marginBottom: "15px",
            color: "#dc3545",
          }}
        >
          ⚠️ 불량 발생 등록
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
              label="품목명"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="품목 입력"
            />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <Input
              label="불량 유형"
              value={defectType}
              onChange={(e) => setDefectType(e.target.value)}
              placeholder="예: 스크래치, 파손"
            />
          </div>
          <div style={{ flex: 0.5, minWidth: "100px" }}>
            <Input
              label="수량"
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
            />
          </div>
          <div style={{ paddingBottom: "15px" }}>
            <Button onClick={handleRegister} color="#dc3545">
              불량 등록
            </Button>
          </div>
        </div>
      </div>

      {/* 2. 불량 내역 리스트 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <h3
          style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}
        >
          📋 금일 불량 리스트
        </h3>
        <Table
          headers={["발생 시간", "품목명", "불량 유형", "수량", "보고자"]}
          data={defects}
        />
      </div>
    </div>
  );
};

export default QualityDefect;
