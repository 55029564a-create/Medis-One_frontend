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
import { getEmployees, createEmployee } from "../../api/adminApi"; // API 함수 import
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

const EmployeeMgmt = () => {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // [추가] 데이터 로드 함수
  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      // 백엔드 DTO -> 프론트엔드 테이블 포맷 매핑
      const mappedData = data.map((emp) => ({
        id: emp.employeeNumber,
        realId: emp.id, // 실제 DB ID (수정/삭제용)
        name: emp.name,
        email: emp.email,
        dept: emp.department, // "PRD1" 등 코드로 옴
        rank: emp.position, // "STAFF" 등 코드로 옴
        phone: emp.phone,
        status: emp.status,
        permissions: [], // 백엔드에서 아직 안 옴 (추후 구현)
        processes: emp.processes, // 백엔드에서 아직 안 옴 (추후 구현)
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
      dept: "", // Enum 값과 일치시켜야 함 (예: PRODUCTION, QUALITY 등)
      phone: "",
      // 프론트 전용 필드 (UI용)
      rank: "",
      line: "",
      status: "",
      permissions: [],
      joinDate: new Date().toISOString().slice(0, 10),
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // 수정 모달 열기
  const openEditModal = (emp) => {
    setCurrentEmp({
      ...emp,
      employeeNumber: emp.id, // 리스트의 id가 사번이므로
      dept: emp.dept, // 리스트의 dept가 department 코드
      position: emp.rank,
      processes: emp.processes,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // 3. [저장] 백엔드 전송 (핵심 수정 부분)
  const handleSave = async () => {
    if (!currentEmp.name || !currentEmp.employeeNumber) {
      return alert("이름과 부서는 필수입니다.");
    }
    try {
      if (isEditMode) {
        setEmployees(
          employees.map((emp) => (emp.id === currentEmp.id ? currentEmp : emp)),
        );
      } else {
        // ★ [핵심] 프론트엔드 State -> 백엔드 DTO 매핑
        // 백엔드 SignUpReqDto 형태에 맞춰 데이터 가공
        console.log("부서: ", currentEmp.line);
        const payload = {
          employeeNumber: currentEmp.employeeNumber,
          password: currentEmp.password,
          name: currentEmp.name,
          email: currentEmp.email,
          phone: currentEmp.phone,
          department: currentEmp.dept,
          position: currentEmp.rank,
          assignedLine: currentEmp.line,
        };

        await createEmployee(payload);
        alert("사원이 성공적으로 등록되었습니다.");
      }
      // 모달 닫기 및 목록 갱신
      setIsModalOpen(false);
      fetchEmployees(); // 목록 갱신
    } catch (error) {
      console.error("저장 실패:", error);
      const msg = error.response?.data?.message || "알 수 없는 오류";
      alert(`저장 실패: ${msg}`);
    }
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

        {/* Data Rows */}
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
            {/* 사번 */}
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
            {/* 프로필 */}
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
                  title={emp.email}
                >
                  {emp.email || "-"}
                </div>
              </div>
            </div>
            {/* 부서/직급 (변환된 라벨 표시) */}
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
            {/* 연락처/입사일 */}
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
            {/* 상태 */}
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
            {/* 담당 라인 (변환된 라벨 표시) */}
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
            {/* 관리 */}
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

      {/* Modal */}
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
                {/* ID: 수정 모드일 때 readOnly 적용 */}
                <InputGroup
                  label="사번 (ID)"
                  name="id"
                  value={currentEmp.id}
                  onChange={handleInputChange}
                  readOnly={isEditMode}
                />
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
                  label="연락처"
                  name="phone"
                  value={currentEmp.phone}
                  onChange={handleInputChange}
                />

                {/* [수정됨] 부서 선택 (Select) */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={styles.label}>부서</label>
                  <select
                    name="dept"
                    value={currentEmp.dept}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* [수정됨] 직급 선택 (Select) */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={styles.label}>직급</label>
                  <select
                    name="rank"
                    value={currentEmp.rank}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos.value} value={pos.value}>
                        {pos.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* [수정됨] 담당 라인 선택 (Select) */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={styles.label}>담당 라인 (Process)</label>
                  <select
                    name="line"
                    value={currentEmp.line}
                    onChange={handleInputChange}
                    style={styles.input}
                  >
                    {LINES.map((ln) => (
                      <option key={ln.value} value={ln.value}>
                        {ln.label}
                      </option>
                    ))}
                  </select>
                </div>

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

              {/* 페이지 접근 권한 (기존 유지) */}
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
        </div>
      )}
    </div>
  );
};

// [수정됨] readOnly 속성 지원 및 스타일 적용
const InputGroup = ({ label, name, value, onChange, readOnly }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={styles.label}>{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      style={{
        ...styles.input,
        backgroundColor: readOnly ? "#f5f5f5" : "#fff",
        color: readOnly ? "#999" : "#333",
        cursor: readOnly ? "not-allowed" : "text",
      }}
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
