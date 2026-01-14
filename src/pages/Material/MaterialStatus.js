import React, { useState } from "react";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const MaterialStatus = () => {
  const [date, setDate] = useState("2026-01-14");

  // 입출고 이력 가짜 데이터
  const historyData = [
    {
      time: "10:30:00",
      type: "입고",
      item: "27인치 LCD 패널",
      qty: "+500",
      loc: "A-01",
      worker: "자재팀",
    },
    {
      time: "11:15:20",
      type: "출고",
      item: "나사 (M4)",
      qty: "-2000",
      loc: "Line-A",
      worker: "김생산",
    },
    {
      time: "13:40:10",
      type: "입고",
      item: "전원 케이블",
      qty: "+300",
      loc: "B-02",
      worker: "박물류",
    },
    {
      time: "15:20:55",
      type: "출고",
      item: "27인치 LCD 패널",
      qty: "-100",
      loc: "Line-B",
      worker: "이조립",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        📋 자재 입출고 이력
      </h2>

      <div
        style={{
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        {/* 검색 필터 */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginBottom: 0 }}
          />
          <Button color="#6c757d">조회</Button>
          <div style={{ marginLeft: "auto" }}>
            <Button color="#28a745">엑셀 다운로드</Button>
          </div>
        </div>

        {/* 이력 테이블 */}
        <Table
          headers={["시간", "구분", "품목명", "수량", "위치/라인", "담당자"]}
          data={historyData.map((item) => ({
            ...item,
            // 입고는 파랑, 출고는 빨강 글씨 처리
            type: (
              <span
                style={{
                  color: item.type === "입고" ? "blue" : "red",
                  fontWeight: "bold",
                }}
              >
                {item.type}
              </span>
            ),
            qty: (
              <span style={{ color: item.type === "입고" ? "blue" : "red" }}>
                {item.qty}
              </span>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default MaterialStatus;
