// src/pages/Dashboard/Dashboard.js
import React from "react";

const Dashboard = () => {
  return (
    <div style={{ padding: "20px", background: "#f4f6f8", minHeight: "100vh" }}>
      <h2 style={{ marginBottom: "20px" }}>대시보드</h2>

      {/* 카드 배치 영역 (그리드) */}
      <div style={gridStyle}>
        {/* 카드 1 */}
        <div style={cardStyle}>
          <h3>📊 가동률</h3>
          <p style={numberStyle}>92%</p>
          <p style={{ color: "green" }}>▲ 전일 대비 2%</p>
        </div>

        {/* 카드 2 */}
        <div style={cardStyle}>
          <h3>⚠️ 금일 불량</h3>
          <p style={{ ...numberStyle, color: "red" }}>3건</p>
          <p>확인 필요</p>
        </div>

        {/* 카드 3 */}
        <div style={cardStyle}>
          <h3>📦 입고 대기</h3>
          <p style={numberStyle}>12건</p>
        </div>

        {/* 카드 4 */}
        <div style={cardStyle}>
          <h3>📢 공지사항</h3>
          <ul
            style={{
              paddingLeft: "20px",
              textAlign: "left",
              marginTop: "10px",
            }}
          >
            <li>설비 정기 점검 안내</li>
            <li>1월 식단표 공지</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr", // 2열 배치
  gap: "20px",
};

const cardStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  textAlign: "center",
};

const numberStyle = {
  fontSize: "36px",
  fontWeight: "bold",
  margin: "10px 0",
  color: "#333",
};

export default Dashboard;
