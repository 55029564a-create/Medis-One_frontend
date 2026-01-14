// src/styles/GlobalStyle.js

// 1. 브랜드 컬러 (메인 색상 정의)
export const Colors = {
  primary: "#0056b3", // 메인 파랑 (버튼, 헤더)
  secondary: "#6c757d", // 서브 회색 (취소, 대기)
  success: "#28a745", // 성공 초록 (양호, 가동)
  danger: "#dc3545", // 위험 빨강 (에러, 불량)
  warning: "#ffc107", // 경고 노랑 (지연)
  dark: "#343a40", // 다크 (사이드바)
  light: "#f8f9fa", // 밝은 배경
  white: "#ffffff",
  border: "#dee2e6", // 테두리 색
  textInfo: "#17a2b8", // 정보성 하늘색
};

// 2. 공통 레이아웃 스타일
export const CommonStyles = {
  pageContainer: {
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    border: `1px solid ${Colors.border}`,
    marginBottom: "20px",
  },
  flexCenter: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  flexBetween: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
};
