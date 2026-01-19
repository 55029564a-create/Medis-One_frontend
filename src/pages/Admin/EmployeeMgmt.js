import React, { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaUserCircle,
  FaEllipsisH,
  FaTrashAlt,
  FaEdit,
  FaPhoneAlt,
} from "react-icons/fa";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

// 🎨 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  text: "#333",
  subText: "#888",
  success: "#00C851",
  danger: "#FF4444",
  border: "#E0E0E0",
  bg: "#F5F6FA",
};

// 1. 초기 데이터
const initialData = [
  {
    id: "E24001",
    name: "김관리",
    email: "manager@medisone.com",
    dept: "생산관리팀",
    rank: "과장",
    phone: "010-1234-5678",
    status: "Active",
    permissions: ["dashboard", "production", "material"],
    processes: ["Line-A", "Line-B"],
    joinDate: "2024-01-10",
  },
  {
    id: "E24002",
    name: "이품질",
    email: "quality@medisone.com",
    dept: "품질보증팀",
    rank: "대리",
    phone: "010-9876-5432",
    status: "Active",
    permissions: ["dashboard", "quality"],
    processes: ["All"],
    joinDate: "2024-02-15",
  },
  {
    id: "E24003",
    name: "박퇴사",
    email: "park@medisone.com",
    dept: "생산1팀",
    rank: "사원",
    phone: "010-5555-7777",
    status: "Resigned",
    permissions: [],
    processes: [],
    joinDate: "2023-11-01",
  },
];

const EmployeeMgmt = () => {
  const [employees, setEmployees] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // --- 핸들러 ---
  const filteredData = employees.filter(
    (emp) =>
      emp.name.includes(searchTerm) ||
      emp.dept.includes(searchTerm) ||
      emp.id.includes(searchTerm),
  );

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleAddNew = () => {
    const newId = `E2600${employees.length + 1}`;
    setCurrentEmp({
      id: newId,
      name: "",
      email: "",
      dept: "",
      rank: "",
      phone: "",
      status: "Active",
      permissions: [],
      processes: [],
      joinDate: new Date().toISOString().slice(0, 10),
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setCurrentEmp({ ...emp });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!currentEmp.name || !currentEmp.dept) {
      return alert("이름과 부서는 필수입니다.");
    }
    if (isEditMode) {
      setEmployees(
        employees.map((emp) => (emp.id === currentEmp.id ? currentEmp : emp)),
      );
    } else {
      setEmployees([...employees, currentEmp]);
    }
    setIsModalOpen(false);
  };

  const handleResign = () => {
    if (
      window.confirm(
        `${currentEmp.name} 님을 퇴사 처리 하시겠습니까?\n모든 권한이 회수됩니다.`,
      )
    ) {
      const resignedEmp = {
        ...currentEmp,
        status: "Resigned",
        permissions: [],
        processes: [],
      };
      setEmployees(
        employees.map((emp) => (emp.id === resignedEmp.id ? resignedEmp : emp)),
      );
      setIsModalOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmp({ ...currentEmp, [name]: value });
  };

  const togglePermission = (perm) => {
    const hasPerm = currentEmp.permissions.includes(perm);
    const newPerms = hasPerm
      ? currentEmp.permissions.filter((p) => p !== perm)
      : [...currentEmp.permissions, perm];
    setCurrentEmp({ ...currentEmp, permissions: newPerms });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>
            👨‍💼 사원 관리 (Employee)
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            총 인원:{" "}
            <strong style={{ color: COLORS.primary }}>
              {employees.length}
            </strong>
            명 (재직: {employees.filter((e) => e.status === "Active").length} /
            퇴사: {employees.filter((e) => e.status === "Resigned").length})
          </p>
        </div>
        <div style={styles.actions}>
          <div style={styles.searchBox}>
            <FaSearch color="#999" />
            <input
              type="text"
              placeholder="이름, 부서, 사번 검색..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button style={styles.addButton} onClick={handleAddNew}>
            <FaPlus style={{ marginRight: "5px" }} /> 신규 등록
          </button>
        </div>
      </div>

      {/* List Container */}
      <div style={styles.listContainer}>
        {/* Header Row - 너비(flex) 비율 통일 */}
        <div style={styles.rowHeader}>
          <div style={{ ...styles.cell, width: "5%" }}>선택</div>
          <div style={{ ...styles.cell, width: "10%" }}>사번</div>
          <div style={{ ...styles.cell, width: "25%" }}>
            프로필 (이름/이메일)
          </div>
          <div style={{ ...styles.cell, width: "15%" }}>부서/직급</div>
          <div style={{ ...styles.cell, width: "15%" }}>연락처/입사일</div>
          <div
            style={{ ...styles.cell, width: "10%", justifyContent: "center" }}
          >
            상태
          </div>
          <div style={{ ...styles.cell, width: "15%" }}>권한/공정</div>
          <div
            style={{ ...styles.cell, width: "5%", justifyContent: "flex-end" }}
          >
            관리
          </div>
        </div>

        {/* Data Rows - 너비(flex) 비율 통일 */}
        {filteredData.map((emp) => (
          <div
            key={emp.id}
            style={styles.rowData}
            onClick={() => openEditModal(emp)}
          >
            {/* Checkbox */}
            <div
              style={{ ...styles.cell, width: "5%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                onClick={() => toggleSelect(emp.id)}
                style={{ cursor: "pointer", color: COLORS.primary }}
              >
                {selectedIds.includes(emp.id) ? (
                  <MdCheckBox size={20} />
                ) : (
                  <MdCheckBoxOutlineBlank size={20} color="#ccc" />
                )}
              </div>
            </div>

            {/* ID */}
            <div
              style={{
                ...styles.cell,
                width: "10%",
                fontWeight: "bold",
                color: "#555",
              }}
            >
              #{emp.id}
            </div>

            {/* Profile */}
            <div style={{ ...styles.cell, width: "25%", gap: "10px" }}>
              <div style={styles.avatar}>
                <FaUserCircle size={36} color="#ddd" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.ellipsisText} title={emp.name}>
                  <strong>{emp.name}</strong>
                </div>
                <div
                  style={{
                    ...styles.ellipsisText,
                    fontSize: "12px",
                    color: "#999",
                  }}
                  title={emp.email}
                >
                  {emp.email || "-"}
                </div>
              </div>
            </div>

            {/* Dept/Rank */}
            <div
              style={{
                ...styles.cell,
                width: "15%",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: "14px", color: "#333" }}>{emp.dept}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>{emp.rank}</div>
            </div>

            {/* Contact */}
            <div
              style={{
                ...styles.cell,
                width: "15%",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <FaPhoneAlt size={10} color="#ccc" /> {emp.phone}
              </div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>
                {emp.joinDate}
              </div>
            </div>

            {/* Status */}
            <div
              style={{ ...styles.cell, width: "10%", justifyContent: "center" }}
            >
              <span
                style={
                  emp.status === "Active"
                    ? styles.badgeActive
                    : styles.badgeResign
                }
              >
                {emp.status === "Active" ? "재직중" : "퇴사"}
              </span>
            </div>

            {/* Permissions */}
            <div
              style={{
                ...styles.cell,
                width: "15%",
                flexDirection: "column",
                alignItems: "flex-start",
                fontSize: "11px",
                color: "#666",
              }}
            >
              <div style={styles.ellipsisText}>
                Pg:{" "}
                {emp.permissions.length > 0
                  ? emp.permissions.length + "개"
                  : "-"}
              </div>
              <div style={styles.ellipsisText}>
                Line:{" "}
                {emp.processes.length > 0 ? emp.processes.join(", ") : "-"}
              </div>
            </div>

            {/* Action */}
            <div
              style={{
                ...styles.cell,
                width: "5%",
                justifyContent: "flex-end",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.iconButton}>
                <FaEllipsisH color="#999" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal (동일 유지) */}
      {isModalOpen && currentEmp && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>{isEditMode ? "👤 사원 정보 수정" : "➕ 신규 사원 등록"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={styles.closeButton}
              >
                X
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.sectionTitle}>기본 정보</div>
              <div style={styles.formGrid}>
                <InputGroup
                  label="이름"
                  name="name"
                  value={currentEmp.name}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="이메일"
                  name="email"
                  value={currentEmp.email}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="부서"
                  name="dept"
                  value={currentEmp.dept}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="직급"
                  name="rank"
                  value={currentEmp.rank}
                  onChange={handleInputChange}
                />
                <InputGroup
                  label="연락처"
                  name="phone"
                  value={currentEmp.phone}
                  onChange={handleInputChange}
                />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={styles.label}>입사일</label>
                  <input
                    type="date"
                    name="joinDate"
                    value={currentEmp.joinDate}
                    onChange={handleInputChange}
                    style={styles.input}
                  />
                </div>
              </div>
              <div style={styles.sectionTitle}>페이지 접근 권한</div>
              <div style={styles.permGrid}>
                {[
                  "dashboard",
                  "production",
                  "quality",
                  "material",
                  "admin",
                ].map((perm) => (
                  <label key={perm} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={currentEmp.permissions.includes(perm)}
                      onChange={() => togglePermission(perm)}
                      disabled={currentEmp.status === "Resigned"}
                    />
                    {perm.toUpperCase()}
                  </label>
                ))}
              </div>
              <div style={styles.sectionTitle}>담당 공정 (Process)</div>
              <input
                style={styles.fullInput}
                name="processes"
                placeholder="예: Line-A, Line-B (콤마로 구분)"
                value={
                  Array.isArray(currentEmp.processes)
                    ? currentEmp.processes.join(", ")
                    : currentEmp.processes
                }
                onChange={(e) =>
                  setCurrentEmp({
                    ...currentEmp,
                    processes: e.target.value.split(", "),
                  })
                }
              />
            </div>
            <div style={styles.modalFooter}>
              {isEditMode && currentEmp.status === "Active" ? (
                <button style={styles.resignButton} onClick={handleResign}>
                  <FaTrashAlt style={{ marginRight: "5px" }} /> 퇴사 처리
                </button>
              ) : (
                <div></div>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </button>
                <button style={styles.saveButton} onClick={handleSave}>
                  <FaEdit style={{ marginRight: "5px" }} /> 저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={styles.label}>{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      style={styles.input}
      placeholder={label}
    />
  </div>
);

const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  actions: { display: "flex", gap: "15px" },
  searchBox: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    padding: "8px 15px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    fontSize: "14px",
    width: "200px",
  },
  addButton: {
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "8px 20px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.4)",
  },

  // 리스트 스타일 (정렬 문제 해결)
  listContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  // 공통 셀 스타일 (flex 사용)
  cell: {
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  // 헤더 행
  rowHeader: {
    display: "flex", // Flex 적용
    alignItems: "center", // 수직 중앙 정렬
    padding: "0 25px", // 데이터 행과 동일한 패딩
    marginBottom: "5px",
    fontSize: "13px",
    color: "#888",
    fontWeight: "bold",
  },
  // 데이터 행
  rowData: {
    display: "flex", // Flex 적용
    alignItems: "center", // 수직 중앙 정렬
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px 25px", // 헤더와 동일한 좌우 패딩
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    transition: "transform 0.2s",
    cursor: "pointer",
    border: "1px solid transparent",
    ":hover": {
      transform: "translateY(-2px)",
      border: `1px solid ${COLORS.primary}`,
    },
  },

  ellipsisText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#f0f0f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeActive: {
    backgroundColor: `${COLORS.success}20`,
    color: COLORS.success,
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeResign: {
    backgroundColor: "#eee",
    color: "#999",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
  },

  // 모달 스타일 (기존 동일)
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    width: "600px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
    marginBottom: "20px",
  },
  modalBody: { marginBottom: "20px", maxHeight: "60vh", overflowY: "auto" },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: "10px",
    marginTop: "15px",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" },
  permGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
  },
  checkboxLabel: {
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
  },
  label: { fontSize: "12px", color: "#666", marginBottom: "4px" },
  input: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  fullInput: {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
    marginLeft: "10px",
  },
  cancelButton: {
    backgroundColor: "#eee",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    cursor: "pointer",
  },
  resignButton: {
    backgroundColor: "#fff",
    color: COLORS.danger,
    border: `1px solid ${COLORS.danger}`,
    borderRadius: "8px",
    padding: "10px 15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
};

export default EmployeeMgmt;
