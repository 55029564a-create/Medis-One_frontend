import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaPlus,
  FaUserCircle,
  FaEllipsisH,
  FaTrashAlt,
  FaEdit,
  FaPhoneAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  resignEmployee,
} from "../../api/adminApi";

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

// --- [상수 정의] ---
const DEPARTMENTS = [
  { value: "PRD1", label: "생산1팀" },
  { value: "PRD2", label: "생산2팀" },
  { value: "PM", label: "생산관리" },
  { value: "QA", label: "품질보증" },
  { value: "QC", label: "품질관리" },
  { value: "TEST", label: "신뢰성연구" },
  { value: "MM", label: "자재관리" },
  { value: "PUR", label: "구매팀" },
  { value: "MGMT", label: "경영지원" },
];

const POSITIONS = [
  { value: "STAFF", label: "사원" },
  { value: "SENIOR", label: "주임" },
  { value: "ASSISTANT_MANAGER", label: "대리" },
  { value: "MANAGER", label: "과장" },
  { value: "DEPUTY_GENERAL_MANAGER", label: "차장" },
  { value: "GENERAL_MANAGER", label: "부장" },
  { value: "EXECUTIVE", label: "임원" },
];

const LINES = [
  { value: "A-18", label: "Line A (18인치 조립)" },
  { value: "A-24", label: "Line B (24인치 조립)" },
  { value: "C-LAB", label: "Clean Lab (테스트)" },
  { value: "OFFICE", label: "사무실 (생산 외)" },
];

// 헬퍼 함수
const getDeptLabel = (code) =>
  DEPARTMENTS.find((d) => d.value === code)?.label || code;
const getRankLabel = (code) =>
  POSITIONS.find((p) => p.value === code)?.label || code;
const getLineLabel = (code) =>
  LINES.find((l) => l.value === code)?.label || code;

const EmployeeMgmt = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);

  // [1. 데이터 로드]
  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      const mappedData = data.map((emp) => ({
        id: emp.employeeNumber,
        realId: emp.employeeNumber,
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        dept: emp.department || "PRD1",
        rank: emp.position || "STAFF",
        line: emp.processes || "OFFICE",
        status: emp.status || "Active",
        permissions: [],
        joinDate: emp.joinDate,
      }));
      setEmployees(mappedData);
    } catch (error) {
      console.error("사원 목록 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // 수동 새로고침
  const handleManualRefresh = () => {
    fetchEmployees();
    alert("사원 목록이 최신 상태로 갱신되었습니다.");
  };

  // --- 핸들러 ---
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleAddNew = () => {
    const newId = `E2600${employees.length + 1}`;
    setCurrentEmp({
      employeeNumber: newId,
      password: "medis1!",
      name: "",
      email: "",
      phone: "",
      dept: "PRD1",
      rank: "STAFF",
      line: "A-18",
      status: "Active",
      permissions: [],
      joinDate: new Date().toISOString().slice(0, 10),
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (emp) => {
    setCurrentEmp({ ...emp });
    setIsEditModalOpen(true);
  };

  const handleSave = async (isEdit) => {
    if (!currentEmp.name) return alert("이름은 필수입니다.");

    const payload = {
      employeeNumber: currentEmp.employeeNumber,
      password: currentEmp.password,
      name: currentEmp.name,
      email: currentEmp.email,
      phone: currentEmp.phone,
      department: currentEmp.dept,
      position: currentEmp.rank,
      processes: currentEmp.line,
      status: currentEmp.status,
      permissions: currentEmp.permissions,
    };

    try {
      if (isEdit) {
        await updateEmployee(currentEmp.realId, payload);
        alert("수정되었습니다.");
      } else {
        await createEmployee(payload);
        alert("등록되었습니다.");
      }

      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmp((prev) => ({ ...prev, [name]: value }));
  };

  // 퇴사 처리 로직
  const handleResign = async () => {
    if (window.confirm(`${currentEmp.name}님을 퇴사 처리하시겠습니까?`)) {
      try {
        await resignEmployee(currentEmp.realId);
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === currentEmp.id ? { ...emp, status: "Resigned" } : emp,
          ),
        );
        alert("퇴사 처리되었습니다.");
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("퇴사 처리 오류:", error);
        alert("오류가 발생했습니다.");
      }
    }
  };

  const togglePermission = (perm) => {
    const hasPerm = currentEmp.permissions.includes(perm);
    const newPerms = hasPerm
      ? currentEmp.permissions.filter((p) => p !== perm)
      : [...currentEmp.permissions, perm];
    setCurrentEmp((prev) => ({ ...prev, permissions: newPerms }));
  };

  const filteredData = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.id && emp.id.toLowerCase().includes(term))
    );
  });

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
            </strong>{" "}
            명
          </p>
        </div>
        <div style={styles.actions}>
          {/* 1. 검색창 (가장 왼쪽) */}
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

          {/* 2. 새로고침 (가운데) */}
          <button style={styles.refreshBtn} onClick={handleManualRefresh}>
            <FaSyncAlt /> 새로고침
          </button>

          {/* 3. 신규 등록 (가장 오른쪽) */}
          <button style={styles.addButton} onClick={handleAddNew}>
            <FaPlus style={{ marginRight: "5px" }} /> 신규 등록
          </button>
        </div>
      </div>

      {/* List Container */}
      <div style={styles.listContainer}>
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
          <div style={{ ...styles.cell, width: "15%" }}>담당 라인</div>
          <div
            style={{ ...styles.cell, width: "5%", justifyContent: "flex-end" }}
          >
            관리
          </div>
        </div>

        {filteredData.map((emp) => (
          <div
            key={emp.id}
            style={styles.rowData}
            onClick={() => openEditModal(emp)}
          >
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

            <div
              style={{
                ...styles.cell,
                width: "10%",
                fontWeight: "bold",
                color: "#555",
                fontSize: "12px",
              }}
            >
              #{emp.id}
            </div>
            <div style={{ ...styles.cell, width: "25%", gap: "10px" }}>
              <div style={styles.avatar}>
                <FaUserCircle size={36} color="#ddd" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={styles.ellipsisText}>
                  <strong>{emp.name}</strong>
                </div>
                <div
                  style={{
                    ...styles.ellipsisText,
                    fontSize: "12px",
                    color: "#999",
                  }}
                >
                  {emp.email || "-"}
                </div>
              </div>
            </div>

            <div
              style={{
                ...styles.cell,
                width: "15%",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{ fontSize: "14px", color: "#333", fontWeight: "600" }}
              >
                {getDeptLabel(emp.dept)}
              </div>
              <div style={{ fontSize: "12px", color: "#888" }}>
                {getRankLabel(emp.rank)}
              </div>
            </div>

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

            <div
              style={{
                ...styles.cell,
                width: "15%",
                color: "#666",
                fontSize: "12px",
              }}
            >
              {getLineLabel(emp.line)}
            </div>
            <div
              style={{
                ...styles.cell,
                width: "5%",
                justifyContent: "flex-end",
              }}
            >
              <FaEllipsisH color="#999" />
            </div>
          </div>
        ))}
      </div>

      {isAddModalOpen && currentEmp && (
        <AddEmployeeModal
          currentEmp={currentEmp}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => handleSave(false)}
          onChange={handleInputChange}
        />
      )}
      {isEditModalOpen && currentEmp && (
        <EditEmployeeModal
          currentEmp={currentEmp}
          onClose={() => setIsEditModalOpen(false)}
          onSave={() => handleSave(true)}
          onChange={handleInputChange}
          onResign={handleResign}
          togglePermission={togglePermission}
        />
      )}
    </div>
  );
};

const AddEmployeeModal = ({ currentEmp, onClose, onSave, onChange }) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <div style={styles.modalHeader}>
        <h3>➕ 신규 사원 등록</h3>
        <button onClick={onClose} style={styles.closeButton}>
          X
        </button>
      </div>
      <div style={styles.modalBody}>
        <div style={styles.sectionTitle}>계정 정보</div>
        <div style={styles.formGrid}>
          <InputGroup
            label="사번 (자동생성)"
            name="employeeNumber"
            value={currentEmp.employeeNumber}
            readOnly
          />
          <InputGroup
            label="초기 비밀번호"
            name="password"
            value={currentEmp.password}
            onChange={onChange}
          />
        </div>
        <div style={styles.sectionTitle}>기본 정보</div>
        <div style={styles.formGrid}>
          <InputGroup
            label="이름"
            name="name"
            value={currentEmp.name}
            onChange={onChange}
          />
          <InputGroup
            label="이메일"
            name="email"
            value={currentEmp.email}
            onChange={onChange}
          />
          <InputGroup
            label="연락처"
            name="phone"
            value={currentEmp.phone}
            onChange={onChange}
          />

          <SelectGroup
            label="부서"
            name="dept"
            value={currentEmp.dept}
            options={DEPARTMENTS}
            onChange={onChange}
          />
          <SelectGroup
            label="직급"
            name="rank"
            value={currentEmp.rank}
            options={POSITIONS}
            onChange={onChange}
          />
          <SelectGroup
            label="담당 라인"
            name="line"
            value={currentEmp.line}
            options={LINES}
            onChange={onChange}
          />
        </div>
      </div>
      <div style={styles.modalFooter}>
        <button style={styles.cancelButton} onClick={onClose}>
          취소
        </button>
        <button style={styles.saveButton} onClick={onSave}>
          등록하기
        </button>
      </div>
    </div>
  </div>
);

const EditEmployeeModal = ({
  currentEmp,
  onClose,
  onSave,
  onChange,
  onResign,
  togglePermission,
}) => (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <div style={styles.modalHeader}>
        <h3>👤 사원 정보 수정</h3>
        <button onClick={onClose} style={styles.closeButton}>
          X
        </button>
      </div>
      <div style={styles.modalBody}>
        <div style={styles.sectionTitle}>기본 정보 수정</div>
        <div style={styles.formGrid}>
          <InputGroup
            label="사번"
            name="employeeNumber"
            value={currentEmp.employeeNumber}
            readOnly
          />
          <InputGroup
            label="성명"
            name="name"
            value={currentEmp.name}
            onChange={onChange}
          />
          <InputGroup
            label="이메일"
            name="email"
            value={currentEmp.email}
            onChange={onChange}
          />
          <InputGroup
            label="연락처"
            name="phone"
            value={currentEmp.phone}
            onChange={onChange}
          />

          <SelectGroup
            label="부서"
            name="dept"
            value={currentEmp.dept}
            options={DEPARTMENTS}
            onChange={onChange}
          />
          <SelectGroup
            label="직급"
            name="rank"
            value={currentEmp.rank}
            options={POSITIONS}
            onChange={onChange}
          />
          <SelectGroup
            label="담당 라인"
            name="line"
            value={currentEmp.line}
            options={LINES}
            onChange={onChange}
          />

          <SelectGroup
            label="상태"
            name="status"
            value={currentEmp.status}
            options={[
              { value: "Active", label: "재직중" },
              { value: "Resigned", label: "퇴사" },
            ]}
            onChange={onChange}
          />
        </div>

        <div style={styles.sectionTitle}>페이지 접근 권한</div>
        <div style={styles.permGrid}>
          {["dashboard", "production", "quality", "material", "admin"].map(
            (perm) => (
              <label key={perm} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={currentEmp.permissions?.includes(perm)}
                  onChange={() => togglePermission(perm)}
                  disabled={currentEmp.status === "Resigned"}
                />
                {perm.toUpperCase()}
              </label>
            ),
          )}
        </div>
      </div>
      <div style={styles.modalFooter}>
        {currentEmp.status === "Active" ? (
          <button style={styles.resignButton} onClick={onResign}>
            <FaTrashAlt style={{ marginRight: "5px" }} /> 퇴사 처리
          </button>
        ) : (
          <div />
        )}
        <div style={styles.displayFlex}>
          <button style={styles.cancelButton} onClick={onClose}>
            닫기
          </button>
          <button style={styles.saveButton} onClick={onSave}>
            <FaEdit style={{ marginRight: "5px" }} />
            수정 저장
          </button>
        </div>
      </div>
    </div>
  </div>
);

const InputGroup = ({ label, name, value, onChange, readOnly }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={styles.label}>{label}</label>
    <input
      name={name}
      value={value || ""}
      onChange={onChange}
      readOnly={readOnly}
      style={{
        ...styles.input,
        backgroundColor: readOnly ? "#f5f5f5" : "#fff",
        color: readOnly ? "#999" : "#333",
        cursor: readOnly ? "not-allowed" : "text",
      }}
    />
  </div>
);

const SelectGroup = ({ label, name, value, options, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={styles.label}>{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      style={styles.input}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
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
    height: "40px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "0 15px",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    border: `1px solid ${COLORS.border}`,
    boxSizing: "border-box",
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    marginLeft: "10px",
    fontSize: "14px",
    height: "100%",
    backgroundColor: "transparent",
    padding: 0,
  },

  refreshBtn: {
    height: "40px",
    padding: "0 20px",
    backgroundColor: "#fff",
    border: `1px solid ${COLORS.primary}`,
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontWeight: "bold",
    color: COLORS.primary,
    fontSize: "14px",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    transition: "background 0.2s",
  },

  addButton: {
    height: "40px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "0 20px",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.4)",
  },

  listContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  cell: {
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  rowHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 25px",
    marginBottom: "5px",
    fontSize: "13px",
    color: "#888",
    fontWeight: "bold",
  },
  rowData: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "20px 25px",
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
  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  displayFlex: { display: "flex", gap: "10px" },
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
