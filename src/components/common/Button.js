import React from "react";

const Button = ({ children, onClick, color = "#0056b3", style }) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        backgroundColor: color,
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "14px",
        transition: "0.3s",
        ...style, // 추가 스타일 덮어쓰기 가능
      }}
    >
      {children}
    </button>
  );
};

export default Button;
