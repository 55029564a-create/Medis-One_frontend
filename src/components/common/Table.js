import React from "react";

const Table = ({ headers, data }) => {
  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: "2px solid #ddd",
            }}
          >
            {headers.map((head, index) => (
              <th
                key={index}
                style={{ padding: "12px", textAlign: "left", color: "#495057" }}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} style={{ borderBottom: "1px solid #eee" }}>
                {Object.values(row).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{ padding: "12px", color: "#333" }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={headers.length}
                style={{ padding: "20px", textAlign: "center", color: "#999" }}
              >
                데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
