import React, { useState, useEffect } from "react";
// 아이콘 Import
import {
  FaUsers,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaUserCircle,
  FaCog,
  FaEdit,
  FaTimes, // 모달 닫기용
  FaTrash, // 삭제용
  FaPlus, // 추가용
} from "react-icons/fa";

// 공통 컴포넌트 및 스타일 Import
import Table from "../../components/common/Table";
import Button from "../../components/common/Button";
import { Colors, CommonStyles } from "../../styles/GlobalStyle";

// [첨부 2]에서 만든 API 함수 Import
import {
  getProcesses,
  createProcess,
  updateProcess,
  deleteProcess,
  getLineStatus,
} from "../../api/productionApi";

// --- 스타일 정의 (기존 스타일 유지 + 모달 스타일 추가) ---
const DashboardStyles = {
  card: {
    backgroundColor: "#fff",
    borderRadius: "15px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
    border: "none",
    marginBottom: "20px",
  },
  kpiIconBox: (color) => ({
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    backgroundColor: `${color}20`,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    marginBottom: "10px",
  }),
  timeBlock: (status) => ({
    flex: 1,
    height: "30px",
    backgroundColor:
      status === "RUN"
        ? Colors.success
        : status === "STOP"
          ? Colors.secondary
          : status === "ERR"
            ? Colors.danger
            : "#eee",
    margin: "0 1px",
    borderRadius: "2px",
    position: "relative",
    cursor: "pointer",
  }),
  // 모달 관련 스타일 추가
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
    borderRadius: "16px",
    width: "500px",
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
  inputGroup: { marginBottom: "15px" },
  label: {
    display: "block",
    marginBottom: "5px",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#555",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    boxSizing: "border-box",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },
};

const ProcessMgmt = () => {
  // 1. 데이터 상태 관리 (초기값 빈 배열로 설정하여 API 데이터 대기)
  const [lines, setLines] = useState([]);
  const [processes, setProcesses] = useState([]);

  // 2. 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("CREATE"); // "CREATE" or "EDIT"
  const [currentProcess, setCurrentProcess] = useState(null); // 입력 폼 데이터

  // 3. 데이터 로드 (마운트 시 실행)
  useEffect(() => {
    fetchProcessData(); // 공정 마스터 데이터 로드
    fetchLineData(); // 라인 현황 데이터 로드

    // 10초마다 라인 현황 자동 갱신 (실시간 모니터링 효과)
    const interval = setInterval(fetchLineData, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- API 호출 함수 ---
  const fetchProcessData = async () => {
    try {
      const data = await getProcesses();
      setProcesses(data);
    } catch (err) {
      console.error("공정 목록 로드 실패:", err);
    }
  };

  const fetchLineData = async () => {
    try {
      const data = await getLineStatus();
      setLines(data);
    } catch (err) {
      console.error("라인 현황 로드 실패:", err);
    }
  };

  // --- KPI 계산 (API에서 받아온 lines 데이터 기반 자동 계산) ---
  const totalPersonnel = lines.reduce((acc, cur) => acc + cur.personnel, 0);

  const avgRate =
    lines.length > 0
      ? Math.round(
          lines.reduce((acc, cur) => {
            const rate = cur.target > 0 ? (cur.current / cur.target) * 100 : 0;
            return acc + rate;
          }, 0) / lines.length,
        )
      : 0;

  const activeLines = lines.filter((l) => l.status === "RUN").length;

  const getPercentage = (current, target) =>
    target > 0 ? Math.round((current / target) * 100) : 0;

  const getProgressColor = (percent) => {
    if (percent >= 95) return Colors.success;
    if (percent >= 70) return Colors.primary;
    if (percent >= 40) return Colors.warning;
    return Colors.danger;
  };

  const timeLabels = ["09", "10", "11", "12", "13", "14", "15", "16"];

  // --- 핸들러 함수들 (모달 & CRUD) ---

  // 신규 등록 모달 열기
  const handleOpenCreate = () => {
    setModalMode("CREATE");
    setCurrentProcess({
      code: "",
      name: "",
      capa: "",
      manager: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  // 수정 모달 열기
  const handleOpenEdit = (proc) => {
    setModalMode("EDIT");
    setCurrentProcess({ ...proc }); // 선택한 행의 데이터 복사
    setIsModalOpen(true);
  };

  // 저장 (등록/수정)
  const handleSaveProcess = async () => {
    if (!currentProcess.code || !currentProcess.name) {
      return alert("공정 코드와 공정명은 필수입니다.");
    }

    try {
      if (modalMode === "CREATE") {
        await createProcess(currentProcess);
        alert("공정이 등록되었습니다.");
      } else {
        await updateProcess(currentProcess.id, currentProcess);
        alert("공정이 수정되었습니다.");
      }
      setIsModalOpen(false);
      fetchProcessData(); // 목록 갱신
    } catch (err) {
      alert(
        "저장 실패: " + (err.response?.data?.message || "오류가 발생했습니다."),
      );
    }
  };

  // 삭제
  const handleDeleteProcess = async () => {
    if (!window.confirm("정말 이 공정을 삭제하시겠습니까?")) return;
    try {
      await deleteProcess(currentProcess.id);
      alert("삭제되었습니다.");
      setIsModalOpen(false);
      fetchProcessData(); // 목록 갱신
    } catch (err) {
      alert(
        "삭제 실패: " + (err.response?.data?.message || "오류가 발생했습니다."),
      );
    }
  };

  return (
    <div style={{ ...CommonStyles.pageContainer, backgroundColor: "#F8F9FE" }}>
      {/* Header */}
      <div style={CommonStyles.flexBetween}>
        <div>
          <h2 style={{ marginBottom: "5px", color: "#2c3e50" }}>
            🏭 통합 공정 관리
          </h2>
          <p
            style={{
              color: "#7f8c8d",
              fontSize: "14px",
              marginBottom: "30px",
            }}
          >
            실시간 가동 현황 모니터링 및 공정 기준 정보 관리
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "12px", color: "#999" }}>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Cards (DB 데이터 연동됨) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div style={DashboardStyles.card}>
          <div style={CommonStyles.flexBetween}>
            <div>
              <div style={DashboardStyles.kpiIconBox(Colors.success)}>
                <FaChartLine />
              </div>
              <span style={{ color: "#8898aa", fontSize: "14px" }}>
                가동 중 라인
              </span>
              <h3 style={{ fontSize: "24px", margin: "5px 0" }}>
                {activeLines} / {lines.length}
              </h3>
            </div>
          </div>
        </div>
        <div style={DashboardStyles.card}>
          <div>
            <div style={DashboardStyles.kpiIconBox(Colors.primary)}>
              <FaUsers />
            </div>
            <span style={{ color: "#8898aa", fontSize: "14px" }}>
              총 투입 인원
            </span>
            <h3 style={{ fontSize: "24px", margin: "5px 0" }}>
              {totalPersonnel}명
            </h3>
          </div>
        </div>
        <div style={DashboardStyles.card}>
          <div>
            <div style={DashboardStyles.kpiIconBox("#FF9800")}>
              <FaClock />
            </div>
            <span style={{ color: "#8898aa", fontSize: "14px" }}>
              평균 달성률
            </span>
            <h3 style={{ fontSize: "24px", margin: "5px 0" }}>{avgRate}%</h3>
          </div>
        </div>
        <div style={DashboardStyles.card}>
          <div>
            <div style={DashboardStyles.kpiIconBox(Colors.danger)}>
              <FaExclamationTriangle />
            </div>
            <span style={{ color: "#8898aa", fontSize: "14px" }}>
              설비/품질 이슈
            </span>
            <h3 style={{ fontSize: "24px", margin: "5px 0" }}>0건</h3>
          </div>
        </div>
      </div>

      {/* SECTION 2: Line Monitoring Table (DB 데이터 연동됨) */}
      <div style={DashboardStyles.card}>
        <div style={{ ...CommonStyles.flexBetween, marginBottom: "20px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            📈 라인별 실시간 가동 현황
          </h3>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* 범례 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: Colors.success,
                  marginRight: 5,
                }}
              ></div>{" "}
              가동
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: Colors.secondary,
                  marginRight: 5,
                }}
              ></div>{" "}
              휴식/정지
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: "12px",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: Colors.danger,
                  marginRight: 5,
                }}
              ></div>{" "}
              장애
            </div>
          </div>
        </div>

        <Table
          headers={[
            "",
            "라인명",
            "책임자",
            "작업 시간",
            "타임테이블 (09~17)",
            "진행률 (목표/현재)",
            "상태",
          ]}
          data={lines.map((line) => ({
            id: (
              <div
                style={{ fontWeight: "bold", fontSize: "14px", color: "#555" }}
              >
                {line.id}
              </div>
            ),
            lineInfo: (
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {line.id}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {line.product}
                </div>
              </div>
            ),
            workerInfo: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <FaUserCircle
                  size={24}
                  color="#ccc"
                  style={{ marginRight: "8px" }}
                />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: "500" }}>
                    {line.worker}
                  </div>
                  <div style={{ fontSize: "11px", color: "#666" }}>
                    외 {line.personnel - 1}명
                  </div>
                </div>
              </div>
            ),
            timeInfo: (
              <div style={{ fontSize: "13px" }}>
                <div>{line.workTime}</div>
                <div style={{ fontSize: "11px", color: "#888" }}>
                  Start: {line.startTime}
                </div>
              </div>
            ),
            timetable: (
              <div style={{ width: "180px" }}>
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    marginBottom: "4px",
                  }}
                >
                  {line.timeline &&
                    line.timeline.map((status, idx) => (
                      <div
                        key={idx}
                        style={DashboardStyles.timeBlock(status)}
                        title={`${timeLabels[idx]}:00 - ${status}`}
                      ></div>
                    ))}
                </div>
              </div>
            ),
            progress: (
              <div style={{ width: "120px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: getProgressColor(
                        getPercentage(line.current, line.target),
                      ),
                    }}
                  >
                    {getPercentage(line.current, line.target)}%
                  </span>
                  <span style={{ fontSize: "10px", color: "#888" }}>
                    {line.current}/{line.target}
                  </span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "6px",
                    backgroundColor: "#edf2f7",
                    borderRadius: "3px",
                  }}
                >
                  <div
                    style={{
                      width: `${getPercentage(line.current, line.target)}%`,
                      height: "100%",
                      backgroundColor: getProgressColor(
                        getPercentage(line.current, line.target),
                      ),
                      borderRadius: "3px",
                    }}
                  ></div>
                </div>
              </div>
            ),
            status: (
              <span
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  color:
                    line.status === "RUN"
                      ? Colors.success
                      : line.status === "STOP"
                        ? "#555"
                        : Colors.danger,
                  backgroundColor:
                    line.status === "RUN"
                      ? "#e8f5e9"
                      : line.status === "STOP"
                        ? "#f5f5f5"
                        : "#ffebee",
                  border: `1px solid ${
                    line.status === "RUN"
                      ? Colors.success
                      : line.status === "STOP"
                        ? "#ddd"
                        : Colors.danger
                  }`,
                }}
              >
                {line.status === "RUN"
                  ? "가동중"
                  : line.status === "STOP"
                    ? "대기"
                    : "점검필요"}
              </span>
            ),
          }))}
        />
      </div>

      {/* SECTION 3: Process Master Management (DB 연동됨) */}
      <div style={DashboardStyles.card}>
        <div style={{ ...CommonStyles.flexBetween, marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                backgroundColor: Colors.secondary,
                padding: "8px",
                borderRadius: "8px",
                display: "flex",
              }}
            >
              <FaCog color="#666" />
            </div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "#333",
                margin: 0,
              }}
            >
              공정 마스터 관리
            </h3>
          </div>
          <Button color={Colors.primary} onClick={handleOpenCreate}>
            <FaPlus style={{ marginRight: "5px" }} /> 공정 추가
          </Button>
        </div>

        <Table
          headers={[
            "공정 코드",
            "공정명",
            "생산능력(Capa)",
            "담당자",
            "상태",
            "관리",
          ]}
          data={processes.map((p) => ({
            code: (
              <span style={{ fontWeight: "bold", color: "#555" }}>
                {p.code}
              </span>
            ),
            name: p.name,
            capa: p.capa || "-",
            manager: (
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <FaUserCircle color="#ccc" /> {p.manager || "-"}
              </div>
            ),
            status: (
              <span
                style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor:
                    p.status === "Active" ? "#d4edda" : "#f8d7da",
                  color: p.status === "Active" ? "#155724" : "#721c24",
                }}
              >
                {p.status}
              </span>
            ),
            manage: (
              <Button
                color={Colors.secondary}
                style={{ padding: "6px 10px", fontSize: "12px", color: "#333" }}
                onClick={() => handleOpenEdit(p)}
              >
                <FaEdit style={{ marginRight: "4px" }} /> 수정
              </Button>
            ),
          }))}
        />
      </div>

      {/* === [Modal] 공정 추가/수정 (통합 구현) === */}
      {isModalOpen && currentProcess && (
        <div style={DashboardStyles.modalOverlay}>
          <div style={DashboardStyles.modalContent}>
            <div style={DashboardStyles.modalHeader}>
              <h3>
                {modalMode === "CREATE"
                  ? "🛠️ 신규 공정 등록"
                  : "🔧 공정 정보 수정"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* 모달 Body */}
            <div>
              <div style={DashboardStyles.inputGroup}>
                <label style={DashboardStyles.label}>공정 코드</label>
                <input
                  style={DashboardStyles.input}
                  value={currentProcess.code}
                  onChange={(e) =>
                    setCurrentProcess({
                      ...currentProcess,
                      code: e.target.value,
                    })
                  }
                  readOnly={modalMode === "EDIT"} // 수정 시 코드 변경 불가
                  placeholder="예: PA-1"
                />
              </div>
              <div style={DashboardStyles.inputGroup}>
                <label style={DashboardStyles.label}>공정명</label>
                <input
                  style={DashboardStyles.input}
                  value={currentProcess.name}
                  onChange={(e) =>
                    setCurrentProcess({
                      ...currentProcess,
                      name: e.target.value,
                    })
                  }
                  placeholder="예: Surface Prep"
                />
              </div>
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ ...DashboardStyles.inputGroup, flex: 1 }}>
                  <label style={DashboardStyles.label}>생산 능력 (Capa)</label>
                  <input
                    style={DashboardStyles.input}
                    value={currentProcess.capa}
                    onChange={(e) =>
                      setCurrentProcess({
                        ...currentProcess,
                        capa: e.target.value,
                      })
                    }
                    placeholder="예: 1000 / day"
                  />
                </div>
                <div style={{ ...DashboardStyles.inputGroup, flex: 1 }}>
                  <label style={DashboardStyles.label}>담당자</label>
                  <input
                    style={DashboardStyles.input}
                    value={currentProcess.manager}
                    onChange={(e) =>
                      setCurrentProcess({
                        ...currentProcess,
                        manager: e.target.value,
                      })
                    }
                    placeholder="이름 입력"
                  />
                </div>
              </div>
              <div style={DashboardStyles.inputGroup}>
                <label style={DashboardStyles.label}>상태</label>
                <select
                  style={DashboardStyles.input}
                  value={currentProcess.status}
                  onChange={(e) =>
                    setCurrentProcess({
                      ...currentProcess,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Active">Active (사용)</option>
                  <option value="Inactive">Inactive (중지)</option>
                </select>
              </div>
            </div>

            {/* 모달 Footer */}
            <div style={DashboardStyles.modalFooter}>
              {modalMode === "EDIT" && (
                <Button
                  color={Colors.danger}
                  onClick={handleDeleteProcess}
                  style={{ marginRight: "auto" }}
                >
                  <FaTrash style={{ marginRight: "5px" }} /> 삭제
                </Button>
              )}
              <Button
                color="#eee"
                style={{ color: "#333" }}
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </Button>
              <Button color={Colors.primary} onClick={handleSaveProcess}>
                저장
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessMgmt;
