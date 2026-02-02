import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMaterialInfo,
  registerMaterialInOut,
  getRecentHistory,
} from "../../api/materialApi";
import {
  FaBox,
  FaBarcode,
  FaTruckLoading,
  FaDolly,
  FaCheckCircle,
  FaSyncAlt,
  FaHistory,
  FaUserTie,
  FaCaretDown,
  FaLayerGroup,
  FaSearch, // 추가
  FaIndustry, // 추가
  FaCogs, // 추가
} from "react-icons/fa";

// 🎨 디자인 시스템 (기존 유지)
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851",
  danger: "#FF4444",
  info: "#33B5E5",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  cardShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

// 🧑‍💼 담당자 더미 데이터
const DUMMY_MANAGERS = [
  { name: "김철수", id: "10001" },
  { name: "이영희", id: "10002" },
  { name: "박민수", id: "10003" },
];

// 🏢 공급업체 데이터 (입고용 - 검색 대상)
const DUMMY_VENDORS = [
  { name: "삼성전기", id: "V-101" },
  { name: "LG화학", id: "V-102" },
  { name: "SK하이닉스", id: "V-103" },
  { name: "포스코퓨처엠", id: "V-104" },
  { name: "3M Korea", id: "V-105" },
];

// 🏭 공정라인 데이터 (출고용 - 계층 구조)
const PROCESS_LINES = [
  {
    lineName: "생산 1라인",
    lineId: "L-01",
    processes: [
      { name: "표면 처리", id: "P-01" },
      { name: "광학 본딩", id: "P-02" },
      { name: "BLU 조립", id: "P-03" },
    ],
  },
  {
    lineName: "생산 2라인",
    lineId: "L-02",
    processes: [
      { name: "하우징 조립", id: "P-04" },
      { name: "배선/납땜", id: "P-05" },
    ],
  },
  {
    lineName: "QC/테스트",
    lineId: "L-QC",
    processes: [
      { name: "에이징", id: "P-06" },
      { name: "진동/낙하", id: "P-07" },
      { name: "최종 검사", id: "P-08" },
    ],
  },
];

const MaterialInout = () => {
  const navigate = useNavigate();
  const lotInputRef = useRef(null);

  // --- 상태 관리 ---
  const [inputs, setInputs] = useState({
    type: "IN",
    item: "",
    lot: "",
    vendor: "", // 입고: 업체명, 출고: "라인 > 공정" 조합 문자열
    qty: "",
    currentQty: 0,
    manager: "",
  });

  const [dbStatus, setDbStatus] = useState("IDLE");
  const [recentList, setRecentList] = useState([]);

  // 담당자 드롭다운 상태
  const [showManagerList, setShowManagerList] = useState(false);
  const [filteredManagers, setFilteredManagers] = useState(DUMMY_MANAGERS);

  // [추가] 업체 검색 및 라인 선택 상태
  const [showVendorList, setShowVendorList] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState(DUMMY_VENDORS);

  const [selectedLine, setSelectedLine] = useState(""); // 라인 선택값
  const [selectedProcess, setSelectedProcess] = useState(""); // 공정 선택값
  const [availableProcesses, setAvailableProcesses] = useState([]); // 선택된 라인의 하위 공정들

  // 초기 로드
  useEffect(() => {
    fetchRecentHistory();
    lotInputRef.current?.focus();
  }, []);

  // --- 로직: 최근 내역 불러오기 ---
  const fetchRecentHistory = async () => {
    const data = await getRecentHistory();
    if (data === null) {
      setDbStatus("ERROR");
      setRecentList([]);
    } else {
      setDbStatus("SUCCESS");
      setRecentList(data.slice(0, 5));
    }
  };

  // --- 로직: 바코드 스캔 ---
  const handleScan = async (e) => {
    if (e.key === "Enter" && inputs.lot) {
      try {
        const data = await getMaterialInfo(inputs.lot);
        setInputs((prev) => ({
          ...prev,
          item: data.materialName,
          // 스캔 시 기존 벤더 정보가 없으면 기본값 (단, 사용자 입력 중이면 유지)
          vendor: prev.vendor || data.company || "",
          currentQty: data.currentQty || 0,
          qty: "",
        }));
        document.getElementById("qtyInput").focus();
      } catch (error) {
        alert("등록되지 않은 바코드입니다.");
        setInputs((prev) => ({ ...prev, item: "❌ 정보 없음" }));
      }
    }
  };

  // --- 로직: 담당자 ---
  const handleManagerChange = (e) => {
    const text = e.target.value;
    setInputs({ ...inputs, manager: text });
    const filtered = DUMMY_MANAGERS.filter(
      (m) => m.name.includes(text) || m.id.includes(text),
    );
    setFilteredManagers(filtered);
    setShowManagerList(true);
  };

  const selectManager = (manager) => {
    setInputs({ ...inputs, manager: `${manager.name} (${manager.id})` });
    setShowManagerList(false);
  };

  // --- [추가] 로직: 공급업체(IN) 검색 ---
  const handleVendorChange = (e) => {
    const text = e.target.value;
    setInputs({ ...inputs, vendor: text });
    const filtered = DUMMY_VENDORS.filter(
      (v) =>
        v.name.includes(text) ||
        v.id.toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredVendors(filtered);
    setShowVendorList(true);
  };

  const selectVendor = (vendor) => {
    setInputs({ ...inputs, vendor: vendor.name });
    setShowVendorList(false);
  };

  // --- [추가] 로직: 라인 선택(OUT) ---
  const handleLineSelect = (e) => {
    const lineId = e.target.value;
    const lineObj = PROCESS_LINES.find((l) => l.lineId === lineId);

    setSelectedLine(lineId);
    if (lineObj) {
      setAvailableProcesses(lineObj.processes);
      setSelectedProcess(""); // 라인 변경 시 공정 초기화
      setInputs((prev) => ({ ...prev, vendor: "" }));
    } else {
      setAvailableProcesses([]);
      setSelectedProcess("");
    }
  };

  // --- [추가] 로직: 공정 선택(OUT) ---
  const handleProcessSelect = (e) => {
    const processId = e.target.value;
    setSelectedProcess(processId);

    // 라인명과 공정명을 합쳐서 기존 vendor 필드에 저장 (DB 구조 유지)
    const lineObj = PROCESS_LINES.find((l) => l.lineId === selectedLine);
    const processObj = lineObj?.processes.find((p) => p.id === processId);

    if (lineObj && processObj) {
      setInputs((prev) => ({
        ...prev,
        vendor: `${lineObj.lineName} > ${processObj.name}`,
      }));
    }
  };

  // --- 로직: 등록 ---
  const handleRegister = async () => {
    if (!inputs.item || !inputs.qty || !inputs.lot || !inputs.manager) {
      return alert("필수 정보를 모두 입력해주세요.");
    }

    // OUT 모드인데 라인/공정 미선택 시 방어
    if (inputs.type === "OUT" && (!selectedLine || !selectedProcess)) {
      return alert("출고 라인과 공정을 모두 선택해주세요.");
    }
    // ==========================================
    // [추가된 부분] "이름 (10001)" 에서 숫자만 추출하기
    // ==========================================
    let cleanManagerId = "";

    // 괄호 안에 있는 숫자만 쏙 빼내는 정규식
    const managerIdMatch = inputs.manager.match(/\((.*?)\)/);

    if (managerIdMatch && managerIdMatch[1]) {
      cleanManagerId = managerIdMatch[1]; // "10001" 추출
    } else {
      // 만약 괄호가 없으면 입력된 값 그대로 사용 (숫자만 적었을 수도 있으니)
      cleanManagerId = inputs.manager;
    }
    try {
      // API 호출 (서버로 데이터 전송)
      await registerMaterialInOut({
        type: inputs.type,
        lotId: inputs.lot, // 주의: DB가 바코드 문자열을 허용하는지 확인 필요
        quantity: Number(inputs.qty),
        company: inputs.vendor,

        // ▼▼▼ [수정됨] 이름은 버리고 '숫자 ID'만 보냅니다 ▼▼▼
        worker: Number(cleanManagerId),
      });

      alert("처리가 완료되었습니다.");

      // --- (아래는 성공 후 초기화 로직, 기존과 동일) ---
      setInputs((prev) => ({
        ...prev,
        item: "",
        lot: "",
        vendor: "",
        qty: "",
        currentQty: 0,
      }));
      setSelectedLine("");
      setSelectedProcess("");

      fetchRecentHistory();
      lotInputRef.current.focus();
    } catch (error) {
      console.error(error); // 에러 로그 확인용
      alert("오류 발생: 데이터 형식을 확인해주세요.");
    }
  };

  // 통계용
  const todayIn = recentList.filter(
    (h) => h.type === "IN" || h.type === "입고",
  ).length;
  const todayOut = recentList.filter(
    (h) => h.type === "OUT" || h.type === "출고",
  ).length;
  const totalStock = 12500;

  // 리스트 가공 (니가 말한 그 로직 절대 수정 안함)
  let displayList = [...recentList];

  if (dbStatus === "ERROR") {
    displayList = [
      {
        type: "OUT",
        date: new Date().toISOString(),
        matName: "❌ DB 연결 실패 (서버 점검)",
        lotNum: "ERR-500",
        changeQty: 0,
        worker: "시스템 (00000)",
      },
    ];
  } else if (dbStatus === "SUCCESS" && recentList.length === 0) {
    displayList = [
      {
        type: "IN",
        date: new Date().toISOString(),
        matName: "✅ DB 연결됨 (데이터 없음)", // 팀원 확인용 메시지 유지
        lotNum: "INFO-200",
        changeQty: 0,
        worker: "관리자 (99999)",
      },
    ];
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <FaBox size={22} color={COLORS.primary} />
          <h2 style={{ margin: 0, color: COLORS.text, fontSize: "22px" }}>
            자재 입/출고 관리
          </h2>
        </div>
        <button
          onClick={() => navigate("/material/history")}
          style={styles.historyBtn}
        >
          <FaHistory /> 전체 내역 보기
        </button>
      </div>

      {/* 통계 카드 */}
      <div style={styles.statsGrid}>
        <StatCard
          title="금일 입고 건수"
          value={todayIn}
          unit="건"
          icon={<FaTruckLoading />}
          color={COLORS.success}
        />
        <StatCard
          title="금일 출고 건수"
          value={todayOut}
          unit="건"
          icon={<FaDolly />}
          color={COLORS.danger}
        />
        <StatCard
          title="현재 총 재고량"
          value={totalStock.toLocaleString()}
          unit="EA"
          icon={<FaLayerGroup />}
          color={COLORS.info}
        />
      </div>

      {/* 등록 폼 */}
      <div style={styles.inputSection}>
        <div style={styles.sectionHeader}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: COLORS.text }}>
              📋 스캔 등록 작업
            </h3>
            <span style={{ fontSize: "12px", color: COLORS.subText }}>
              *{" "}
              {inputs.type === "IN"
                ? "입고처를 입력하거나 선택하세요."
                : "투입될 라인과 공정을 선택하세요."}
            </span>
          </div>
          {/* 토글 버튼 */}
          <div style={styles.toggleGroup}>
            <button
              style={{
                ...styles.toggleBtn,
                backgroundColor:
                  inputs.type === "IN" ? COLORS.success : "#f0f0f0",
                color: inputs.type === "IN" ? "#fff" : "#999",
              }}
              onClick={() => {
                setInputs({ ...inputs, type: "IN", vendor: "" });
                setSelectedLine("");
                setSelectedProcess("");
              }}
            >
              입고 (IN)
            </button>
            <button
              style={{
                ...styles.toggleBtn,
                backgroundColor:
                  inputs.type === "OUT" ? COLORS.danger : "#f0f0f0",
                color: inputs.type === "OUT" ? "#fff" : "#999",
              }}
              onClick={() => {
                setInputs({ ...inputs, type: "OUT", vendor: "" });
                setSelectedLine("");
                setSelectedProcess("");
              }}
            >
              출고 (OUT)
            </button>
          </div>
        </div>

        <div style={styles.formGrid}>
          {/* 담당자 검색 */}
          <div style={styles.gridCell}>
            <label style={styles.label}>담당자 (이름/사번)</label>
            <div style={{ position: "relative", width: "100%" }}>
              <div style={styles.inputWrapper}>
                <FaUserTie style={styles.inputIcon} />
                <input
                  style={styles.fixedInputWithIcon}
                  placeholder="담당자 검색"
                  value={inputs.manager}
                  onChange={handleManagerChange}
                  onFocus={() => setShowManagerList(true)}
                  onBlur={() =>
                    setTimeout(() => setShowManagerList(false), 200)
                  }
                />
                <FaCaretDown
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#aaa",
                  }}
                />
              </div>
              {showManagerList && (
                <div style={styles.dropdownList}>
                  {filteredManagers.map((mgr) => (
                    <div
                      key={mgr.id}
                      style={styles.dropdownItem}
                      onClick={() => selectManager(mgr)}
                    >
                      <span style={{ fontWeight: "bold" }}>{mgr.name}</span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#888",
                          marginLeft: "5px",
                        }}
                      >
                        ({mgr.id})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 일련번호 스캔 */}
          <div style={styles.gridCell}>
            <label style={styles.label}>일련번호 (Lot ID)</label>
            <div style={styles.inputWrapper}>
              <FaBarcode style={styles.inputIcon} />
              <input
                ref={lotInputRef}
                style={{
                  ...styles.fixedInputWithIcon,
                  borderColor: COLORS.primary,
                }}
                placeholder="바코드 스캔"
                value={inputs.lot}
                onChange={(e) => setInputs({ ...inputs, lot: e.target.value })}
                onKeyDown={handleScan}
              />
            </div>
          </div>

          {/* 품목명 (자동) */}
          <div style={styles.gridCell}>
            <label style={styles.label}>품목명 (자동)</label>
            <input
              style={{
                ...styles.fixedInput,
                backgroundColor: "#eee",
                fontWeight: "bold",
                color: "#333",
              }}
              placeholder="스캔 시 입력됨"
              value={inputs.item}
              readOnly
            />
          </div>

          {/* 수량 */}
          <div style={styles.gridCell}>
            <label style={styles.label}>
              {inputs.type === "IN" ? "입고 수량" : "출고 수량"}
            </label>
            <input
              id="qtyInput"
              type="number"
              style={styles.fixedInput}
              placeholder={
                inputs.currentQty ? `현재: ${inputs.currentQty}` : "0"
              }
              value={inputs.qty}
              onChange={(e) => setInputs({ ...inputs, qty: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
            />
          </div>

          {/* [변경 포인트] 거래처/공정 입력란 */}
          {/* 여기가 기존 그리드의 중간 셀입니다. layout 안 깨지게 이 칸 내부에서만 분기합니다. */}
          <div style={styles.gridCell}>
            <label style={styles.label}>
              {inputs.type === "IN" ? "공급 업체 (Vendor)" : "투입 공정 / 라인"}
            </label>

            {inputs.type === "IN" ? (
              // [IN] 기존처럼 입력창 + 드롭다운
              <div style={{ position: "relative", width: "100%" }}>
                <div style={styles.inputWrapper}>
                  {/* 아이콘 변경 */}
                  <FaSearch style={styles.inputIcon} />
                  <input
                    style={styles.fixedInputWithIcon}
                    placeholder="업체 검색/입력"
                    value={inputs.vendor}
                    onChange={handleVendorChange}
                    onFocus={() => setShowVendorList(true)}
                    onBlur={() =>
                      setTimeout(() => setShowVendorList(false), 200)
                    }
                  />
                  <FaCaretDown
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#aaa",
                    }}
                  />
                </div>
                {showVendorList && (
                  <div style={styles.dropdownList}>
                    {filteredVendors.length > 0 ? (
                      filteredVendors.map((v) => (
                        <div
                          key={v.id}
                          style={styles.dropdownItem}
                          onClick={() => selectVendor(v)}
                        >
                          <span style={{ fontWeight: "bold" }}>{v.name}</span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              marginLeft: "5px",
                            }}
                          >
                            ({v.id})
                          </span>
                        </div>
                      ))
                    ) : (
                      <div style={{ ...styles.dropdownItem, color: "#999" }}>
                        결과 없음
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // [OUT] 말씀하신 대로 두 칸으로 나눕니다.
              <div style={{ display: "flex", gap: "10px", width: "100%" }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <FaIndustry style={styles.inputIcon} />
                  <select
                    style={styles.fixedSelectWithIcon}
                    value={selectedLine}
                    onChange={handleLineSelect}
                  >
                    <option value="">라인 선택</option>
                    {PROCESS_LINES.map((line) => (
                      <option key={line.lineId} value={line.lineId}>
                        {line.lineName}
                      </option>
                    ))}
                  </select>
                  <FaCaretDown
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#aaa",
                      pointerEvents: "none",
                    }}
                  />
                </div>
                <div style={{ position: "relative", flex: 1 }}>
                  <FaCogs style={styles.inputIcon} />
                  <select
                    style={styles.fixedSelectWithIcon}
                    value={selectedProcess}
                    onChange={handleProcessSelect}
                    disabled={!selectedLine}
                  >
                    <option value="">공정 선택</option>
                    {availableProcesses.map((proc) => (
                      <option key={proc.id} value={proc.id}>
                        {proc.name}
                      </option>
                    ))}
                  </select>
                  <FaCaretDown
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#aaa",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 등록 버튼 */}
          <div style={{ ...styles.gridCell, justifyContent: "flex-end" }}>
            <label style={styles.label}>&nbsp;</label>
            <button
              style={{
                ...styles.fixedBtnSolid,
                backgroundColor:
                  inputs.type === "IN" ? COLORS.success : COLORS.danger,
              }}
              onClick={handleRegister}
            >
              <FaCheckCircle />{" "}
              {inputs.type === "IN" ? "입고 확정" : "출고 확정"}
            </button>
          </div>
        </div>
      </div>

      {/* 3. 리스트 영역 */}
      <div style={styles.listSection}>
        <div style={styles.toolbar}>
          <h4
            style={{
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaSyncAlt /> 최근 처리 내역 (5건)
          </h4>
        </div>

        <div style={styles.tableHeader}>
          <div style={{ flex: 0.6 }}>구분</div>
          <div style={{ flex: 1.2 }}>일시</div>
          <div style={{ flex: 2 }}>자재명 (Lot No)</div>
          {/* ✅ 수량 변동만 심플하게 표시 */}
          <div style={{ flex: 1.5, textAlign: "center" }}>처리 수량</div>
          <div style={{ flex: 0.8, textAlign: "center" }}>담당자</div>
        </div>

        <div style={styles.listBody}>
          {displayList.map((item, idx) => {
            const type =
              item.type === "IN" ||
              item.type === "INBOUND" ||
              item.type === "입고"
                ? "IN"
                : "OUT";
            const date = item.date
              ? item.date.replace("T", " ").substring(5, 16)
              : "-";
            const workerName = (item.empName || item.worker || "시스템")
              .split("(")[0]
              .trim();
            const qty = Number(
              item.changeQty || item.quantity || 0,
            ).toLocaleString();

            return (
              <div key={idx} style={styles.row}>
                <div style={{ flex: 0.6 }}>
                  <span
                    style={{
                      ...styles.typeBadge,
                      color: type === "IN" ? COLORS.success : COLORS.danger,
                      backgroundColor: type === "IN" ? "#E8F5E9" : "#FFEBEE",
                    }}
                  >
                    {type === "IN" ? "입고" : "출고"}
                  </span>
                </div>
                <div
                  style={{ flex: 1.2, fontSize: "12px", color: COLORS.subText }}
                >
                  {date}
                </div>
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: "bold", color: COLORS.text }}>
                    {item.matName || item.materialName}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#888",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.lotNum || item.lotId}
                  </div>
                </div>

                {/* ✅ 심플해진 수량 부분 */}
                <div style={{ flex: 1.5, textAlign: "center" }}>
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "15px",
                      color: type === "IN" ? COLORS.success : COLORS.danger,
                    }}
                  >
                    {type === "IN" ? "+" : "-"} {qty}
                  </span>
                </div>

                <div style={{ flex: 0.8, textAlign: "center" }}>
                  <span style={styles.workerBadge}>{workerName}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 & 스타일 ---
const StatCard = ({ title, value, unit, icon, color }) => (
  <div style={styles.statCard}>
    <div
      style={{
        ...styles.iconCircle,
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "12px", color: COLORS.subText }}>{title}</div>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: COLORS.text }}>
        {value}{" "}
        <span style={{ fontSize: "12px", fontWeight: "normal" }}>{unit}</span>
      </div>
    </div>
  </div>
);

const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: {
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyBtn: {
    padding: "8px 15px",
    backgroundColor: "#fff",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontWeight: "bold",
    color: "#555",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "15px",
    marginBottom: "20px",
  },
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: COLORS.cardShadow,
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  iconCircle: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  inputSection: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "25px",
    boxShadow: COLORS.cardShadow,
    marginBottom: "20px",
  },
  sectionHeader: {
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  toggleGroup: {
    display: "flex",
    width: "200px",
    height: "36px",
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid #ddd",
  },
  toggleBtn: {
    flex: 1,
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px",
    transition: "0.2s",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1.5fr",
    rowGap: "15px",
    columnGap: "20px",
  },
  gridCell: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  },
  label: { fontSize: "12px", fontWeight: "bold", color: "#666" },

  fixedInput: {
    width: "100%",
    height: "42px",
    padding: "0 12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#F9FAFB",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  fixedInputWithIcon: {
    width: "100%",
    height: "42px",
    padding: "0 12px 0 35px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#F9FAFB",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  // [NEW] Select 박스용 스타일 (아이콘 포함)
  fixedSelectWithIcon: {
    width: "100%",
    height: "42px",
    padding: "0 12px 0 35px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#F9FAFB",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
    appearance: "none", // 기본 화살표 제거 (커스텀 아이콘 사용을 위해)
  },
  fixedBtnSolid: {
    width: "100%",
    height: "42px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  },

  inputWrapper: { position: "relative", width: "100%" },
  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#aaa",
  },

  dropdownList: {
    position: "absolute",
    top: "45px",
    left: 0,
    width: "100%",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    zIndex: 10,
    maxHeight: "150px",
    overflowY: "auto",
  },
  dropdownItem: {
    padding: "10px",
    fontSize: "13px",
    borderBottom: "1px solid #f5f5f5",
    cursor: "pointer",
    transition: "0.1s",
    ":hover": { backgroundColor: "#f5f5f5" },
  },

  listSection: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: COLORS.cardShadow,
  },
  toolbar: {
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableHeader: {
    display: "flex",
    padding: "12px 15px",
    backgroundColor: "#F9FAFC",
    borderRadius: "8px",
    fontSize: "12px",
    color: "#666",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  listBody: { display: "flex", flexDirection: "column", gap: "8px" },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "12px 15px",
    borderBottom: "1px solid #f0f0f0",
    transition: "background-color 0.2s",
  },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    width: "40px",
  },
  workerBadge: {
    backgroundColor: "#eee",
    color: "#555",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
  },
};

export default MaterialInout;
