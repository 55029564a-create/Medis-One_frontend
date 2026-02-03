import React, { useState, useEffect } from "react";
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
// API 함수들 import
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

// --- [상수 정의] 백엔드 Enum과 매칭 ---
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

  // 모달 상태 (신규/수정 각각 분리)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);

  // [추가] 데이터 로드 함수

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();

      // 백엔드 DTO -> 프론트엔드 테이블 포맷 매핑

      const mappedData = data.map((emp) => ({
        id: emp.employeeNumber,
        realId: emp.employeeNumber,
        name: emp.name,
        email: emp.email,
        dept: emp.department, // "PRD1" 등 코드로 옴
        rank: emp.position, // "STAFF" 등 코드로 옴
        phone: emp.phone,
        status: emp.status || "Active",
        permissions: [], // 백엔드에서 아직 안 옴 (추후 구현)
        processes: emp.processes || "OFFICE", // 백엔드에서 아직 안 옴 (추후 구현)
        joinDate: emp.joinDate,
      }));

      setEmployees(mappedData);
    } catch (error) {
      console.error("사원 목록 불러오기 실패:", error);

      // alert("데이터 로드 실패"); // 필요 시 주석 해제
    }
  };

  // 마운트 시 데이터 조회
  useEffect(() => {
    fetchEmployees();
  }, []);

  // --- 핸들러 ---

  // 검색 필터링
  const filteredData = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    // 화면에 보여줄 땐 한글 라벨로 변환해서 검색해도 됨 (여기선 단순 코드 검색)
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.id && emp.id.toLowerCase().includes(term))
    );
  });

  // 체크박스 선택
  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // 2. [신규 등록] 초기값 설정
  const handleAddNew = () => {
    const newId = `E2600${employees.length + 1}`;
    setCurrentEmp({
      employeeNumber: newId, // 백엔드 DTO 필드명 (employeeNumber)
      password: "medis1!", // 초기 비밀번호 설정 필요
      name: "",
      email: "",
      phone: "",
      dept: "PRD1",
      rank: "STAFF",
      processes: "A-18",
      status: "Active",
      permissions: [],
      joinDate: new Date().toISOString().slice(0, 10),
    });
    setIsAddModalOpen(true);
  };

  // 수정 모달 열기
  const openEditModal = (emp) => {
    setCurrentEmp({
      ...emp,
      employeeNumber: emp.id, // 리스트의 id가 사번이므로
      dept: emp.dept,
      rank: emp.rank,
      processes: emp.processes,
      status: emp.status,
      permissions: emp.permissions,
    });
    setIsEditModalOpen(true);
  };

  // 3. [저장] 백엔드 전송 (핵심 수정 부분)
  // [저장 로직] - 기존 handleSave 유지하되 모달 닫기 로직만 추가
  const handleSave = async (isEdit) => {
    if (!currentEmp.name) return alert("이름은 필수입니다.");

    // 백엔드로 보낼 데이터 구성 (공통)
    const payload = {
      employeeNumber: currentEmp.employeeNumber,
      password: currentEmp.password, // 수정 시에는 백엔드 처리 방식에 따라 제외될 수도 있음
      name: currentEmp.name,
      email: currentEmp.email,
      phone: currentEmp.phone,
      department: currentEmp.dept, // 프론트(dept) -> 백엔드(department)
      position: currentEmp.rank, // 프론트(rank) -> 백엔드(position)
      processes: currentEmp.processes, // 프론트(line) -> 백엔드(processes)
      status: currentEmp.status, // 상태값 전송
      permissions: currentEmp.permissions,
    };

    try {
      if (isEdit) {
        // ★ 수정 API 호출 구현
        await updateEmployee(currentEmp.realId, payload);
        alert("성공적으로 수정되었습니다.");
      } else {
        // 신규 등록 API 호출
        await createEmployee(payload);
        alert("신규 사원이 등록되었습니다.");
      }

      // 모달 닫기 및 데이터 갱신
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error("실패:", error);
      alert("저장에 실패했습니다. 관리자에게 문의하세요.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmp({ ...currentEmp, [name]: value });
  };

  // 4. [퇴사] 퇴사 처리
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
      setCurrentEmp(null);
      setIsEditModalOpen(false);
      alert("퇴사 처리가 완료되었습니다.");
    }
  };

  const togglePermission = (perm) => {
    const hasPerm = currentEmp.permissions.includes(perm);
    const newPerms = hasPerm
      ? currentEmp.permissions.filter((p) => p !== perm)
      : [...currentEmp.permissions, perm];
    setCurrentEmp({ ...currentEmp, permissions: newPerms });
  };

  const getDeptLabel = (code) =>
    DEPARTMENTS.find((d) => d.value === code)?.label || code;
  const getRankLabel = (code) =>
    POSITIONS.find((p) => p.value === code)?.label || code;
  const getLineLabel = (code) =>
    LINES.find((l) => l.value === code)?.label || code;

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
            key={emp.realId}
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

      {/* 1. 신규 등록 모달 */}
      {isAddModalOpen && currentEmp && (
        <AddEmployeeModal
          currentEmp={currentEmp}
          onClose={() => setIsAddModalOpen(false)}
          onSave={() => handleSave(false)}
          onChange={handleInputChange}
        />
      )}

      {/* 2. 사원 정보 수정 모달 */}
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

// --- [신규 등록 모달 컴포넌트] ---
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

// --- [정보 수정 모달 컴포넌트] ---
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
        <div style={{ display: "flex", gap: "10px" }}>
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

// 공통 컴포넌트
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
    <select name={name} value={value} onChange={onChange} style={styles.input}>
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
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
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
