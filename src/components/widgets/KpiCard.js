import React from "react";

const KPICard = ({ title, value, unit, color = "black", icon }) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minWidth: "150px",
        flex: 1, // 옆으로 꽉 차게
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#888", fontSize: "14px" }}>
        {title}
      </h4>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "5px" }}>
        <span style={{ fontSize: "28px", fontWeight: "bold", color: color }}>
          {value}
        </span>
        <span style={{ fontSize: "14px", color: "#666", marginBottom: "5px" }}>
          {unit}
        </span>
      </div>
    </div>
  );
};

export default KPICard;
