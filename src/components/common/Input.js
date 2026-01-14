import React from "react";

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  style,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "15px",
        ...style,
      }}
    >
      {label && (
        <label
          style={{
            marginBottom: "5px",
            fontWeight: "bold",
            fontSize: "14px",
            color: "#333",
          }}
        >
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          padding: "10px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          fontSize: "14px",
          outline: "none",
        }}
      />
    </div>
  );
};

export default Input;
