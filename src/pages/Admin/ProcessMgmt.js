import React from "react";
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";

const ProcessMgmt = () => {
  const processes = [
    {
      code: "L-01",
      name: "Main Assembly Line A",
      capa: "1,500 / day",
      manager: "김반장",
      status: "Active",
    },
    {
      code: "L-02",
      name: "Sub Assembly Line B",
      capa: "1,000 / day",
      manager: "이조장",
      status: "Active",
    },
    {
      code: "L-03",
      name: "Packaging Line",
      capa: "3,000 / day",
      manager: "박포장",
      status: "Maintenance",
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>
        🏭 공정 마스터 관리
      </h2>

      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "15px",
          }}
        >
          <Button color="#28a745">+ 공정 추가</Button>
        </div>

        <Table
          headers={[
            "공정 코드",
            "공정명",
            "일일 생산능력(Capa)",
            "담당자",
            "상태",
            "관리",
          ]}
          data={processes.map((p) => ({
            ...p,
            status: (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor:
                    p.status === "Active" ? "#d4edda" : "#f8d7da",
                  color: p.status === "Active" ? "#155724" : "#721c24",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
              >
                {p.status}
              </span>
            ),
            manage: (
              <Button
                color="#6c757d"
                style={{ padding: "5px 10px", fontSize: "12px" }}
              >
                수정
              </Button>
            ),
          }))}
        />
      </div>
    </div>
  );
};

export default ProcessMgmt;
