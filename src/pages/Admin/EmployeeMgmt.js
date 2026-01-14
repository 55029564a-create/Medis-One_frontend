import React, { useState } from "react";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";

const EmployeeMgmt = () => {
  const [empData, setEmpData] = useState([
    {
      id: "E24001",
      name: "김관리",
      dept: "생산관리팀",
      rank: "과장",
      phone: "010-1234-5678",
    },
    {
      id: "E24002",
      name: "이품질",
      dept: "품질보증팀",
      rank: "대리",
      phone: "010-9876-5432",
    },
    {
      id: "E24005",
      name: "박현장",
      dept: "생산1팀",
      rank: "사원",
      phone: "010-5555-7777",
    },
  ]);

  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("");

  const handleAdd = () => {
    if (!newName || !newDept) return alert("이름과 부서를 입력하세요.");
    const newEmp = {
      id: `E2400${empData.length + 5}`,
      name: newName,
      dept: newDept,
      rank: "수습",
      phone: "010-0000-0000",
    };
    setEmpData([...empData, newEmp]);
    setNewName("");
    setNewDept("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px", color: "#333" }}>👨‍💼 임직원 관리</h2>

      {/* 사원 등록 폼 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
          marginBottom: "20px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          display: "flex",
          gap: "10px",
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            label="이름"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="홍길동"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Input
            label="부서"
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="생산팀"
            style={{ marginBottom: 0 }}
          />
        </div>
        <Button onClick={handleAdd} color="#0056b3">
          신규 등록
        </Button>
      </div>

      {/* 사원 리스트 */}
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <Table
          headers={["사번", "이름", "부서", "직급", "연락처"]}
          data={empData}
        />
      </div>
    </div>
  );
};

export default EmployeeMgmt;
