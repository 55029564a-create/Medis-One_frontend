import React from "react";

const MaterialInout = () => {
  return (
    <div style={pageStyle}>
      <h2 style={titleStyle}>📦 입/출고 관리</h2>

      {/* 1. 상단: 입/출고 등록 폼 */}
      <div style={sectionBoxStyle}>
        <h3 style={subTitleStyle}>신규 등록</h3>
        <div style={formRowStyle}>
          {/* 구분 */}
          <select style={inputStyle}>
            <option>입고 (In)</option>
            <option>출고 (Out)</option>
          </select>

          {/* 품목 선택 */}
          <input
            type="text"
            placeholder="품목명 / 코드 검색"
            style={inputStyle}
          />

          {/* 수량 */}
          <input type="number" placeholder="수량" style={inputStyle} />

          {/* Lot 번호 (자동생성 가정) */}
          <input
            type="text"
            placeholder="Lot ID (자동생성)"
            disabled
            style={{ ...inputStyle, backgroundColor: "#eee" }}
          />

          {/* 등록 버튼 */}
          <button style={buttonStyle}>등록하기</button>
        </div>
      </div>

      {/* 2. 하단: 금일 처리 목록 (테이블) */}
      <div style={sectionBoxStyle}>
        <h3 style={subTitleStyle}>금일 입출고 내역</h3>

        {/* 테이블 형태 */}
        <table style={tableStyle}>
          <thead>
            <tr style={thRowStyle}>
              <th style={thStyle}>시간</th>
              <th style={thStyle}>구분</th>
              <th style={thStyle}>품목명</th>
              <th style={thStyle}>Lot ID</th>
              <th style={thStyle}>수량</th>
              <th style={thStyle}>담당자</th>
            </tr>
          </thead>
          <tbody>
            {/* 데이터 예시 */}
            <tr>
              <td style={tdStyle}>10:30</td>
              <td style={{ ...tdStyle, color: "blue" }}>입고</td>
              <td style={tdStyle}>27인치 패널</td>
              <td style={tdStyle}>LOT-20260114-01</td>
              <td style={tdStyle}>100 EA</td>
              <td style={tdStyle}>김사원</td>
            </tr>
            <tr>
              <td style={tdStyle}>11:00</td>
              <td style={{ ...tdStyle, color: "red" }}>출고</td>
              <td style={tdStyle}>메인보드 A타입</td>
              <td style={tdStyle}>LOT-20260110-05</td>
              <td style={tdStyle}>50 EA</td>
              <td style={tdStyle}>박대리</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 스타일 (복사해서 다른 페이지에도 써도 됨) ---
const pageStyle = {
  padding: "20px",
  background: "#f5f7fa",
  minHeight: "100vh",
};
const titleStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
};
const subTitleStyle = {
  fontSize: "18px",
  fontWeight: "bold",
  marginBottom: "15px",
};
const sectionBoxStyle = {
  background: "white",
  padding: "25px",
  borderRadius: "10px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  marginBottom: "20px",
};
const formRowStyle = { display: "flex", gap: "10px", alignItems: "center" };
const inputStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
  flex: 1,
};
const buttonStyle = {
  padding: "10px 20px",
  background: "#0056b3",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};
const thRowStyle = { background: "#f8f9fa", borderBottom: "2px solid #ddd" };
const thStyle = { padding: "12px", textAlign: "left", fontWeight: "bold" };
const tdStyle = { padding: "12px", borderBottom: "1px solid #eee" };

export default MaterialInout;
