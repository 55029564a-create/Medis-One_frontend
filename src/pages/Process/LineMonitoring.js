import React, { useState, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaHeartbeat,
  FaSearch,
  FaClipboardList,
  FaMapMarkerAlt,
  FaTools,
  FaPauseCircle,
  FaMedkit,
  FaStethoscope,
  FaRecycle,
  FaHardHat, // FaUserHardHat 대신 FaHardHat 사용
  FaUserTie,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";

// --- 1. 상수 및 설정 (Constants) ---
const THEME_COLOR = "#8C85FF";
const PROCESS_STEPS = ["광학 본딩", "조립", "에이징", "캘리브레이션", "신뢰성"];

// 안돈 심각도 정의 (Severity)
const SEVERITY = {
  S1: {
    label: "S1 (Critical - Line Stop)",
    color: "#D32F2F",
    desc: "라인 정지, 공장장 호출",
  },
  S2: {
    label: "S2 (Major - Quality)",
    color: "#F57C00",
    desc: "설비 가동 중, 품질 이슈",
  },
  S3: {
    label: "S3 (Minor - Material)",
    color: "#FBC02D",
    desc: "자재 부족, 단순 호출",
  },
};

// 초기 더미 데이터 (DB 대체)
const INITIAL_DATA = [
  {
    id: 101,
    model: "Zoll X Series",
    serial: "WO-240208-01",
    lineName: 'AREX #1 (18")',
    step: 3,
    status: "RUNNING",
    operator: "김철수",
    issue: null,
  },
  {
    id: 102,
    model: "Propaq M",
    serial: "WO-240208-02",
    lineName: 'AREX #2 (24")',
    step: 2,
    status: "RUNNING",
    operator: "이영희",
    issue: null,
  },
  {
    id: 103,
    model: "Corpuls3",
    serial: "WO-240208-03",
    lineName: "Lab",
    step: 4,
    status: "RUNNING",
    operator: "박민수",
    issue: null,
  },
  {
    id: 104,
    model: "Zoll X Series",
    serial: "WO-240208-04",
    lineName: 'AREX #1 (18")',
    step: 1,
    status: "RUNNING",
    operator: "정수진",
    issue: null,
  },
  {
    id: 105,
    model: "Propaq M",
    serial: "WO-240208-05",
    lineName: 'AREX #2 (24")',
    step: 5,
    status: "RUNNING",
    operator: "최동훈",
    issue: null,
  },
  {
    id: 106,
    model: "Corpuls3",
    serial: "WO-240208-06",
    lineName: "Lab",
    step: 2,
    status: "RUNNING",
    operator: "강지민",
    issue: null,
  },
];

const LineMonitoring = () => {
  // --- 2. State 관리 ---
  const [products, setProducts] = useState(INITIAL_DATA);
  const [userMode, setUserMode] = useState("WORKER"); // 'WORKER' | 'TECH' (역할 놀이용)
  const [currentTime, setCurrentTime] = useState(new Date()); // 타이머용

  // 필터 및 모달 State
  const [filterLine, setFilterLine] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 이슈 입력 Form State
  const [issueSeverity, setIssueSeverity] = useState("S2");
  const [issueReason, setIssueReason] = useState("");
  const [actionComment, setActionComment] = useState("");

  // --- 3. 타이머 및 초기화 ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- [수정됨] 모달 닫기 헬퍼 함수 추가 ---
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // --- 4. 로직 함수 (Workflow) ---

  // (1) 이슈 요청 (Request) - Worker
  const handleRequestIssue = () => {
    if (!selectedProduct || !issueReason) return alert("사유를 입력해주세요.");

    const newIssue = {
      active: true,
      severity: issueSeverity,
      step: "OPEN", // 요청 단계
      requestedAt: new Date(), // 발생 시간
      ackedAt: null,
      resolvedAt: null,
      reason: issueReason,
      history: [],
    };

    updateProductStatus(selectedProduct.id, "ISSUE", newIssue);
    closeModal();
  };

  // (2) 접수 (Acknowledge) - Technician
  const handleAckIssue = () => {
    if (!selectedProduct?.issue) return;

    const updatedIssue = {
      ...selectedProduct.issue,
      step: "IN_PROGRESS", // 조치 중 단계
      ackedAt: new Date(), // 접수 시간 (Response Time 계산 끝)
    };

    updateProductStatus(selectedProduct.id, "ISSUE", updatedIssue);
    closeModal();
  };

  // (3) 조치 완료 (Resolve/Close) - Technician
  const handleResolveIssue = () => {
    if (!selectedProduct?.issue) return;
    if (!actionComment) return alert("조치 내용을 입력해주세요.");

    // 이슈 종료 처리
    const resolvedIssue = {
      ...selectedProduct.issue,
      active: false,
      step: "RESOLVED",
      resolvedAt: new Date(),
      actionReport: actionComment,
    };

    // 로그로 저장하고 상태는 RUNNING으로 복귀
    updateProductStatus(selectedProduct.id, "RUNNING", null, resolvedIssue);
    closeModal();
    alert("조치가 완료되었습니다. 라인이 정상 가동됩니다.");
  };

  // 공통 데이터 업데이트 함수 (수정됨)
  const updateProductStatus = (
    id,
    status,
    issueData = null,
    archivedIssue = null,
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        // [핵심 수정 포인트]
        // 상태가 "RUNNING"(정상)으로 바뀌면 강제로 issue를 null로 없애버립니다.
        // 그 외의 경우엔, 새 데이터가 있으면 넣고 없으면 기존 데이터를 유지합니다.
        const nextIssue =
          status === "RUNNING" ? null : issueData ? issueData : p.issue;

        return {
          ...p,
          status: status,
          issue: nextIssue,
          lastIssue: archivedIssue ? archivedIssue : p.lastIssue,
        };
      }),
    );
  };

  // 경과 시간 포맷터 (MM:SS)
  const formatDuration = (startDate) => {
    if (!startDate) return "00:00";
    const diff = Math.floor((currentTime - new Date(startDate)) / 1000);
    const mins = Math.floor(diff / 60)
      .toString()
      .padStart(2, "0");
    const secs = (diff % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // --- 5. 렌더링 헬퍼 ---

  // 제품 아이콘 선택
  const getProductIcon = (model) => {
    if (model.includes("Zoll")) return <FaHeartbeat />;
    if (model.includes("Propaq")) return <FaMedkit />;
    return <FaStethoscope />;
  };

  // 상태 배지 렌더링 (Andon Status)
  const renderStatusBadge = (product) => {
    // 1. 이슈가 있는 경우
    if (product.issue && product.issue.active) {
      const { severity, step } = product.issue;
      const color = SEVERITY[severity].color;

      let statusText = step === "OPEN" ? "호출중 (Waiting)" : "조치중 (Fixing)";
      if (severity === "S1") statusText = "🚨 LINE STOP";

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <span
            style={{
              backgroundColor: color,
              color: "#fff",
              padding: "4px 8px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "bold",
              marginBottom: "4px",
            }}
          >
            {severity} - {statusText}
          </span>
          <span
            style={{
              fontSize: "11px",
              color: color,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <FaClock /> {formatDuration(product.issue.requestedAt)}
          </span>
        </div>
      );
    }
    // 2. 정상 가동
    return (
      <span
        style={{
          backgroundColor: "#E8F5E9",
          color: "#2E7D32",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "11px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <FaCheckCircle /> 정상 가동 (RUNNING)
      </span>
    );
  };

  // 필터링
  const filteredProducts = products.filter((p) => {
    const matchLine = filterLine === "All" || p.lineName === filterLine;
    const matchSearch =
      p.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.serial.toLowerCase().includes(searchTerm.toLowerCase());
    return matchLine && matchSearch;
  });

  // --- 6. UI 렌더링 ---
  return (
    <div style={styles.container}>
      {/* 상단 헤더 & 컨트롤 */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <FaClipboardList size={24} color={THEME_COLOR} />
          <div>
            <h2 style={styles.title}>Smart Andon System</h2>
            <span style={{ fontSize: "12px", color: "#666" }}>
              Real-time Manufacturing Execution System
            </span>
          </div>
        </div>

        {/* 역할 전환 토글 (시연용 핵심 기능) */}
        <div style={styles.roleSwitcher}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              marginRight: "10px",
              color: "#555",
            }}
          >
            Current User Mode:
          </span>
          <button
            onClick={() => setUserMode("WORKER")}
            style={{
              ...styles.roleBtn,
              backgroundColor: userMode === "WORKER" ? "#333" : "#eee",
              color: userMode === "WORKER" ? "#fff" : "#999",
            }}
          >
            {/* [수정됨] FaUserHardHat -> FaHardHat */}
            <FaHardHat style={{ marginRight: 5 }} /> 현장 작업자
          </button>
          <button
            onClick={() => setUserMode("TECH")}
            style={{
              ...styles.roleBtn,
              backgroundColor: userMode === "TECH" ? "#2196F3" : "#eee",
              color: userMode === "TECH" ? "#fff" : "#999",
            }}
          >
            <FaUserTie style={{ marginRight: 5 }} /> 기술/품질팀
          </button>
        </div>
      </div>

      {/* 안돈 현황판 (요약) */}
      <div style={styles.dashboardSummary}>
        <div style={styles.summaryItem}>
          <span style={{ color: SEVERITY.S1.color }}>S1 (Critical)</span>
          <strong>
            {products.filter((p) => p.issue?.severity === "S1").length} 건
          </strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={{ color: SEVERITY.S2.color }}>S2 (Major)</span>
          <strong>
            {products.filter((p) => p.issue?.severity === "S2").length} 건
          </strong>
        </div>
        <div style={styles.summaryItem}>
          <span style={{ color: SEVERITY.S3.color }}>S3 (Minor)</span>
          <strong>
            {products.filter((p) => p.issue?.severity === "S3").length} 건
          </strong>
        </div>
      </div>

      <div style={styles.controls}>
        {/* 검색 및 필터 UI 유지 */}
        <div style={styles.searchBox}>
          <FaSearch color="#aaa" />
          <input
            type="text"
            placeholder="Search Serial / Model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          style={styles.dropdown}
          value={filterLine}
          onChange={(e) => setFilterLine(e.target.value)}
        >
          <option value="All">All Lines</option>
          <option value='AREX #1 (18")'>AREX #1 (18")</option>
          <option value='AREX #2 (24")'>AREX #2 (24")</option>
          <option value="Lab">Lab</option>
        </select>
      </div>

      {/* 메인 그리드 */}
      <div style={styles.grid}>
        {filteredProducts.map((product) => {
          const isIssue = product.issue?.active;
          const severityColor = isIssue
            ? SEVERITY[product.issue.severity].color
            : "transparent";
          const isS1 = product.issue?.severity === "S1";

          return (
            <div
              key={product.id}
              style={{
                ...styles.card,
                border: isIssue
                  ? `2px solid ${severityColor}`
                  : "1px solid #eee",
                animation: isS1 ? "pulseRed 1.5s infinite" : "none",
                opacity: isS1 && product.issue.step === "OPEN" ? 0.9 : 1,
              }}
            >
              <div style={styles.cardTopRow}>
                <div style={{ ...styles.categoryBadge, color: THEME_COLOR }}>
                  {getProductIcon(product.model)} {product.category || "Device"}
                </div>
                <div
                  style={{
                    ...styles.lineBadge,
                    backgroundColor: isIssue ? severityColor : "#999",
                  }}
                >
                  <FaMapMarkerAlt size={10} /> {product.lineName}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 15,
                }}
              >
                <div>
                  <h3 style={styles.modelName}>{product.model}</h3>
                  <div style={styles.subInfo}>
                    S/N: <b>{product.serial}</b>
                  </div>
                  <div style={styles.subInfo}>OP: {product.operator}</div>
                </div>
                {renderStatusBadge(product)}
              </div>

              {/* Progress Bar (S1일때 멈춤 표현) */}
              <div style={styles.progressWrapper}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${(product.step / 5) * 100}%`,
                    backgroundColor: isS1 ? "#ccc" : THEME_COLOR,
                  }}
                ></div>
                <div style={styles.progressBg}></div>
              </div>
              <div style={styles.stepText}>
                현재 공정: {PROCESS_STEPS[product.step - 1]}
              </div>

              {/* Action Button (상태에 따라 다름) */}
              <button
                onClick={() => {
                  setSelectedProduct(product);
                  setIssueSeverity("S2");
                  setIssueReason("");
                  setActionComment("");
                  setIsModalOpen(true);
                }}
                style={{
                  ...styles.actionBtn,
                  backgroundColor: isIssue ? severityColor : "#fff",
                  color: isIssue ? "#fff" : "#555",
                  border: isIssue ? "none" : "1px solid #ddd",
                }}
              >
                {isIssue ? <FaTools /> : <FaExclamationTriangle />}
                {isIssue
                  ? " 현황 및 조치 (View Issue)"
                  : " 안돈 호출 (Andon Call)"}
              </button>
            </div>
          );
        })}
      </div>

      {/* --- 모달 (핵심 로직 처리) --- */}
      {isModalOpen && selectedProduct && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>
                {selectedProduct.issue?.active
                  ? `🔥 Issue Tracking (${selectedProduct.issue.severity})`
                  : "⚡ Create New Issue"}
              </h3>
              <button onClick={closeModal} style={styles.closeBtn}>
                <FaTimes />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* 1. 이슈 발생 전 (RUNNING 상태) - 작업자만 가능 */}
              {!selectedProduct.issue?.active && (
                <>
                  {userMode === "TECH" ? (
                    <div style={styles.warningBox}>
                      🚫 기술팀은 이슈를 생성할 수 없습니다. 현장 작업자 모드로
                      전환하세요.
                    </div>
                  ) : (
                    <>
                      <label style={styles.label}>Severity (심각도 등급)</label>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginBottom: "15px",
                        }}
                      >
                        {Object.keys(SEVERITY).map((key) => (
                          <button
                            key={key}
                            onClick={() => setIssueSeverity(key)}
                            style={{
                              ...styles.severityBtn,
                              borderColor: SEVERITY[key].color,
                              backgroundColor:
                                issueSeverity === key
                                  ? SEVERITY[key].color
                                  : "#fff",
                              color: issueSeverity === key ? "#fff" : "#333",
                            }}
                          >
                            <b>{key}</b>
                          </button>
                        ))}
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "-10px",
                          marginBottom: "15px",
                        }}
                      >
                        * {SEVERITY[issueSeverity].label}:{" "}
                        {SEVERITY[issueSeverity].desc}
                      </p>

                      <label style={styles.label}>Reason (발생 사유)</label>
                      <select
                        style={styles.input}
                        value={issueReason}
                        onChange={(e) => setIssueReason(e.target.value)}
                      >
                        <option value="">선택하세요</option>
                        <option value="치수 불량">
                          치수 불량 (Dimension NG)
                        </option>
                        <option value="설비 멈춤">
                          설비 멈춤 (Machine Stop)
                        </option>
                        <option value="자재 부족">
                          자재 부족 (Material Shortage)
                        </option>
                        <option value="안전 사고">
                          안전 사고 (Safety Issue)
                        </option>
                      </select>

                      <button
                        onClick={handleRequestIssue}
                        style={styles.submitBtn}
                      >
                        🚨 안돈 호출 (Request)
                      </button>
                    </>
                  )}
                </>
              )}

              {/* 2. 이슈 진행 중 (OPEN / IN_PROGRESS) */}
              {selectedProduct.issue?.active && (
                <>
                  <div style={styles.statusFlow}>
                    <div style={{ ...styles.flowItem, opacity: 1 }}>
                      1. 요청 (Open)
                    </div>
                    <FaArrowRight size={12} color="#999" />
                    <div
                      style={{
                        ...styles.flowItem,
                        opacity:
                          selectedProduct.issue.step !== "OPEN" ? 1 : 0.4,
                        fontWeight:
                          selectedProduct.issue.step !== "OPEN"
                            ? "bold"
                            : "normal",
                      }}
                    >
                      2. 접수 (Ack)
                    </div>
                    <FaArrowRight size={12} color="#999" />
                    <div style={{ ...styles.flowItem, opacity: 0.4 }}>
                      3. 완료 (Close)
                    </div>
                  </div>

                  <div style={styles.issueInfoBox}>
                    <p>
                      <strong>발생 시각:</strong>{" "}
                      {selectedProduct.issue.requestedAt.toLocaleTimeString()}
                    </p>
                    <p>
                      <strong>경과 시간:</strong>{" "}
                      <span style={{ color: "#d32f2f", fontWeight: "bold" }}>
                        {formatDuration(selectedProduct.issue.requestedAt)}
                      </span>
                    </p>
                    <p>
                      <strong>사유:</strong> {selectedProduct.issue.reason}
                    </p>
                    <p>
                      <strong>등급:</strong> {selectedProduct.issue.severity}
                    </p>
                  </div>

                  {/* STEP 1: OPEN 상태 -> 기술팀 접수 대기 */}
                  {selectedProduct.issue.step === "OPEN" && (
                    <div style={{ marginTop: "20px" }}>
                      {userMode === "TECH" ? (
                        <button
                          onClick={handleAckIssue}
                          style={{
                            ...styles.submitBtn,
                            backgroundColor: "#2196F3",
                          }}
                        >
                          👨‍🔧 기술팀 접수 확인 (Acknowledge)
                        </button>
                      ) : (
                        <div style={styles.waitingBox}>
                          ⏳ 기술팀이 확인 중입니다. 잠시만 기다려주세요.
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2: IN_PROGRESS 상태 -> 조치 및 완료 */}
                  {selectedProduct.issue.step === "IN_PROGRESS" && (
                    <div style={{ marginTop: "20px" }}>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#2196F3",
                          fontWeight: "bold",
                        }}
                      >
                        ✅ {selectedProduct.issue.ackedAt?.toLocaleTimeString()}{" "}
                        에 기술팀이 접수했습니다.
                      </p>

                      <label style={styles.label}>
                        조치 내용 (Action Report)
                      </label>
                      <textarea
                        rows="3"
                        style={styles.textarea}
                        placeholder="부품 교체 내역, 수정 파라미터 등 입력..."
                        value={actionComment}
                        onChange={(e) => setActionComment(e.target.value)}
                        disabled={userMode !== "TECH"}
                      />

                      {userMode === "TECH" ? (
                        <button
                          onClick={handleResolveIssue}
                          style={{
                            ...styles.submitBtn,
                            backgroundColor: "#4CAF50",
                            marginTop: "10px",
                          }}
                        >
                          ✅ 조치 완료 및 라인 재가동 (Close)
                        </button>
                      ) : (
                        <div style={styles.waitingBox}>
                          🛠 기술팀이 조치 중입니다.
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseRed { 0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); } 100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); } }
      `}</style>
    </div>
  );
};

// --- 7. 스타일 객체 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#F4F6F9",
    minHeight: "100vh",
    fontFamily: "'Noto Sans KR', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  title: { margin: 0, color: "#333", fontSize: "22px", fontWeight: "800" },
  roleSwitcher: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "8px 15px",
    borderRadius: "30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  roleBtn: {
    border: "none",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    marginLeft: "5px",
    display: "flex",
    alignItems: "center",
  },
  dashboardSummary: { display: "flex", gap: "15px", marginBottom: "25px" },
  summaryItem: {
    backgroundColor: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "100px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.03)",
  },
  controls: { display: "flex", gap: "10px", marginBottom: "20px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "0 15px",
    borderRadius: "8px",
    height: "40px",
    flex: 1,
    maxWidth: "300px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
  },
  dropdown: {
    padding: "0 10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    height: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    transition: "all 0.3s",
    position: "relative",
  },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
  },
  categoryBadge: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  lineBadge: {
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "3px",
  },
  modelName: { margin: "0 0 5px 0", fontSize: "16px", color: "#333" },
  subInfo: { fontSize: "12px", color: "#888", marginBottom: "2px" },
  progressWrapper: {
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "5px",
    position: "relative",
  },
  progressBar: { height: "100%", transition: "width 0.5s" },
  stepText: {
    fontSize: "11px",
    color: "#666",
    textAlign: "right",
    marginBottom: "15px",
  },
  actionBtn: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    width: "450px",
    borderRadius: "12px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  closeBtn: {
    border: "none",
    background: "none",
    fontSize: "18px",
    cursor: "pointer",
  },
  modalBody: { display: "flex", flexDirection: "column" },
  label: {
    fontSize: "13px",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#333",
  },
  severityBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: "8px",
    border: "2px solid",
    cursor: "pointer",
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    marginBottom: "15px",
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box",
  },
  submitBtn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#D32F2F",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
  statusFlow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
  },
  flowItem: { fontSize: "12px", color: "#333" },
  issueInfoBox: {
    backgroundColor: "#FFF3E0",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "15px",
  },
  warningBox: {
    backgroundColor: "#FFEBEE",
    color: "#D32F2F",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "bold",
    textAlign: "center",
  },
  waitingBox: {
    backgroundColor: "#F5F5F5",
    color: "#777",
    padding: "15px",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "center",
    marginTop: "10px",
  },
};

export default LineMonitoring;
