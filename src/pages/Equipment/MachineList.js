import React, { useState } from "react";

const MachineList = () => {
  // 가짜 설비 데이터
  const [machines, setMachines] = useState([
    {
      id: "EQ-01",
      name: "CNC 1호기",
      type: "가공",
      status: "RUN",
      temp: "65°C",
      count: 1540,
    },
    {
      id: "EQ-02",
      name: "CNC 2호기",
      type: "가공",
      status: "STOP",
      temp: "24°C",
      count: 0,
    },
    {
      id: "EQ-03",
      name: "사출 성형기 A",
      type: "사출",
      status: "RUN",
      temp: "180°C",
      count: 3200,
    },
    {
      id: "EQ-04",
      name: "사출 성형기 B",
      type: "사출",
      status: "ERROR",
      temp: "210°C",
      count: 450,
    },
    {
      id: "EQ-05",
      name: "조립 로봇 1",
      type: "조립",
      status: "RUN",
      temp: "45°C",
      count: 890,
    },
    {
      id: "EQ-06",
      name: "검사기 1",
      type: "검사",
      status: "WAIT",
      temp: "22°C",
      count: 0,
    },
  ]);

  // 상태에 따른 색상 결정 함수
  const getStatusColor = (status) => {
    switch (status) {
      case "RUN":
        return "#28a745"; // 초록 (가동)
      case "STOP":
        return "#6c757d"; // 회색 (정지)
      case "ERROR":
        return "#dc3545"; // 빨강 (에러)
      case "WAIT":
        return "#ffc107"; // 노랑 (대기)
      default:
        return "#000";
    }
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        ⚙️ 설비 실시간 모니터링
      </h2>

      {/* 설비 카드 그리드 (flex-wrap으로 자동 줄바꿈) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {machines.map((machine) => (
          <div key={machine.id} style={cardStyle}>
            {/* 헤더: 설비명 + 상태불빛 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px" }}>{machine.name}</h3>
              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: "15px",
                  backgroundColor: getStatusColor(machine.status),
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {machine.status}
              </span>
            </div>

            {/* 내용: 상세 정보 */}
            <div style={{ fontSize: "14px", color: "#666", lineHeight: "1.8" }}>
              <p style={{ margin: 0 }}>
                <strong>설비 ID:</strong> {machine.id}
              </p>
              <p style={{ margin: 0 }}>
                <strong>공정 타입:</strong> {machine.type}
              </p>
              <p style={{ margin: 0 }}>
                <strong>현재 온도:</strong> {machine.temp}
              </p>
              <p style={{ margin: 0 }}>
                <strong>금일 생산:</strong> {machine.count.toLocaleString()} EA
              </p>
            </div>

            {/* 하단: 가동률 게이지 (디자인 요소) */}
            <div
              style={{
                marginTop: "15px",
                height: "6px",
                backgroundColor: "#eee",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: machine.status === "RUN" ? "80%" : "0%",
                  height: "100%",
                  backgroundColor: getStatusColor(machine.status),
                  transition: "width 1s",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 스타일 ---
const pageStyle = { padding: "20px", minHeight: "100vh" };
const cardStyle = {
  backgroundColor: "white",
  width: "300px", // 카드 고정 너비
  padding: "25px",
  borderRadius: "10px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  border: "1px solid #f0f0f0",
};

export default MachineList;
