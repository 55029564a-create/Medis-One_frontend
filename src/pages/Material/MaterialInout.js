import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMaterialInfo,
  registerMaterialInOut,
  getRecentHistory,
  getEmployeeList,
  getProcessList,
  getTodayStats, // ✅ 추가
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
  FaSearch,
  FaIndustry,
  FaCogs,
  FaExclamationTriangle,
} from "react-icons/fa";

// 🎨 디자인 시스템 (사용자님 코드 그대로 유지)
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#4CAF50",
  danger: "#FF5252",
  info: "#2196F3",
  text: "#333",
  subText: "#666",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  cardShadow: "0 2px 8px rgba(0,0,0,0.04)",
  inputBg: "#FFFFFF",
};

// 🏢 공급업체
const VENDOR_LIST = [
  { name: "ZOLL Medical", id: "V-001" },
  { name: "Samsung SDI", id: "V-002" },
  { name: "LG Display", id: "V-003" },
  { name: "Texas Inst.", id: "V-004" },
  { name: "3M Korea", id: "V-005" },
];

const MaterialInout = () => {
  const navigate = useNavigate();
  const lotInputRef = useRef(null);

  // --- 상태 관리 ---
  const [inputs, setInputs] = useState({
    type: "IN",
    item: "",
    lot: "",
    vendor: "",
    qty: "",
    currentQty: 0,
    manager: "",
  });

  const [dbStatus, setDbStatus] = useState("IDLE");
  const [recentList, setRecentList] = useState([]);
  const [stats, setStats] = useState({ inbound: 0, outbound: 0 }); // ✅ 통계 상태 추가

  // 🔹 [DB 데이터] 담당자 목록
  const [managerList, setManagerList] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [showManagerList, setShowManagerList] = useState(false);

  // 🔹 [DB 데이터] 공정 및 라인 구조
  const [processStructure, setProcessStructure] = useState([]);
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [availableProcesses, setAvailableProcesses] = useState([]);

  // 업체 검색
  const [showVendorList, setShowVendorList] = useState(false);
  const [filteredVendors, setFilteredVendors] = useState(VENDOR_LIST);

  // 초기 로드
  useEffect(() => {
    fetchInitialData();
    lotInputRef.current?.focus();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. 최근 이력 (백엔드: /find-history)
      const historyData = await getRecentHistory();
      if (historyData) {
        setRecentList(historyData.slice(0, 5));
      }

      // 2. 통계 조회 (백엔드: /today-stats) ✅ 추가된 로직
      try {
        const statData = await getTodayStats();
        if (statData) {
          setStats({
            inbound: statData.todayInbound,
            outbound: statData.todayOutbound,
          });
        }
      } catch (err) {
        console.warn("통계 로드 실패", err);
      }

      // 3. 담당자 목록 (API 호출하되 에러 안나게 처리됨)
      const empData = await getEmployeeList();
      if (empData && empData.length > 0) {
        setManagerList(empData);
        setFilteredManagers(empData);
      }

      // 4. 공정 목록 (API 호출하되 에러 안나게 처리됨)
      const procData = await getProcessList();
      if (procData && procData.length > 0) {
        organizeProcessData(procData);
      }

      setDbStatus("SUCCESS");
    } catch (e) {
      console.error("데이터 로딩 에러", e);
      // setDbStatus("ERROR"); // 404가 나더라도 화면은 띄우기 위해 에러 상태 잠시 보류
    }
  };

  // 🏭 공정 데이터 정리 (사용자님 로직 유지)
  const organizeProcessData = (rawData) => {
    const lines = [
      { id: "1", name: "A-18 (AREX #1)", type: "ASSY", procs: [] },
      { id: "2", name: "A-24 (AREX #2)", type: "ASSY", procs: [] },
      { id: "3", name: "C-LAB (Testing)", type: "TEST", procs: [] },
    ];

    rawData.forEach((proc) => {
      if (
        proc.code &&
        (proc.code.startsWith("PA") || proc.code.includes("ASSY"))
      ) {
        lines[0].procs.push(proc);
        lines[1].procs.push(proc);
      } else if (
        proc.code &&
        (proc.code.startsWith("PC") || proc.code.includes("PACK"))
      ) {
        lines[2].procs.push(proc);
      }
    });
    setProcessStructure(lines);
  };

  // --- 이벤트 핸들러 (유지) ---

  const handleScan = async (e) => {
    if (e.key === "Enter" && inputs.lot) {
      try {
        const data = await getMaterialInfo(inputs.lot);
        setInputs((prev) => ({
          ...prev,
          item: data.materialName || "자재", // DTO에 맞게 mapping
          vendor: prev.vendor || data.company || "",
          currentQty: data.currentQty || 0,
          qty: "",
        }));
        document.getElementById("qtyInput")?.focus();
      } catch (error) {
        // 스캔 실패해도 입력은 계속 진행
      }
    }
  };

  const handleManagerChange = (e) => {
    const text = e.target.value;
    setInputs({ ...inputs, manager: text });
    const filtered = managerList.filter(
      (m) =>
        m.name.includes(text) ||
        String(m.employee_number || m.id).includes(text),
    );
    setFilteredManagers(filtered);
    setShowManagerList(true);
  };

  const selectManager = (manager) => {
    const label = `${manager.name} (${manager.employee_number || manager.id})`;
    setInputs({ ...inputs, manager: label });
    setShowManagerList(false);
  };

  const handleVendorChange = (e) => {
    const text = e.target.value;
    setInputs({ ...inputs, vendor: text });
    setFilteredVendors(
      VENDOR_LIST.filter((v) =>
        v.name.toLowerCase().includes(text.toLowerCase()),
      ),
    );
    setShowVendorList(true);
  };

  const selectVendor = (vendor) => {
    setInputs({ ...inputs, vendor: vendor.name });
    setShowVendorList(false);
  };

  const handleLineSelect = (e) => {
    const lineId = e.target.value;
    setSelectedLine(lineId);
    const lineData = processStructure.find((l) => l.id === lineId);
    if (lineData) {
      setAvailableProcesses(lineData.procs);
      setSelectedProcess("");
    } else {
      setAvailableProcesses([]);
      setSelectedProcess("");
    }
  };

  const handleProcessSelect = (e) => {
    setSelectedProcess(e.target.value);
  };

  // 🚀 [핵심 수정] 등록 핸들러: 백엔드 DTO(CreateLotHistoryReqDto)에 맞춤
  const handleRegister = async () => {
    if (!inputs.item || !inputs.qty || !inputs.lot) {
      return alert("필수 정보를 모두 입력해주세요.");
    }

    // 출고인데 공정 선택 안했으면 경고 (단, 공정목록이 비어있으면 패스)
    if (
      inputs.type === "OUT" &&
      !selectedProcess &&
      availableProcesses.length > 0
    ) {
      return alert("출고될 공정을 선택해주세요.");
    }

    try {
      // 선택된 공정 ID로 공정 이름 찾기 (백엔드가 이름을 원함)
      const selectedProcessObj = availableProcesses.find(
        (p) => String(p.id) === selectedProcess,
      );
      const processName = selectedProcessObj ? selectedProcessObj.name : null;

      const payload = {
        materialName: inputs.item, // DTO: materialName
        lotNumber: inputs.lot, // DTO: lotNumber
        qty: Number(inputs.qty), // DTO: qty
        company: inputs.type === "IN" ? inputs.vendor : null, // DTO: company
        type: inputs.type === "IN" ? "INBOUND" : "PRODUCTION_IN", // DTO: type
        process: inputs.type === "OUT" ? processName : null, // DTO: process (String)
      };

      // workerId는 백엔드에서 Token으로 처리하므로 제거함

      await registerMaterialInOut(payload);

      alert(`${inputs.type === "IN" ? "입고" : "투입"} 완료!`);

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

      // 목록 갱신
      const updatedHistory = await getRecentHistory();
      if (updatedHistory) setRecentList(updatedHistory.slice(0, 5));

      // 통계 갱신
      const statData = await getTodayStats();
      if (statData)
        setStats({
          inbound: statData.todayInbound,
          outbound: statData.todayOutbound,
        });

      lotInputRef.current.focus();
    } catch (error) {
      console.error(error);
      alert("처리 실패: " + (error.response?.data?.message || "서버 오류"));
    }
  };

  let displayList = [...recentList];

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
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr",
      gap: "15px",
      marginBottom: "20px",
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
      paddingBottom: "15px",
      borderBottom: "1px solid #f0f0f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    toggleGroup: { display: "flex", gap: "10px" },
    toggleBtn: {
      padding: "8px 20px",
      borderRadius: "20px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "13px",
      transition: "0.2s",
      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 2fr 1.5fr",
      rowGap: "20px",
      columnGap: "20px",
    },
    gridCell: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
    },
    label: {
      fontSize: "12px",
      fontWeight: "bold",
      color: "#666",
      marginLeft: "4px",
    },
    inputWrapper: { position: "relative", width: "100%" },
    inputIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
    },
    arrowIcon: {
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#999",
      fontSize: "12px",
      pointerEvents: "none",
    },
    commonInput: {
      width: "100%",
      height: "40px",
      padding: "0 12px 0 36px",
      borderRadius: "8px",
      border: `1px solid ${COLORS.border}`,
      backgroundColor: COLORS.inputBg,
      fontSize: "13px",
      color: COLORS.text,
      outline: "none",
      boxSizing: "border-box",
      transition: "all 0.2s",
      fontFamily: "inherit",
    },
    dropdownList: {
      position: "absolute",
      top: "45px",
      left: 0,
      width: "100%",
      backgroundColor: "#fff",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      zIndex: 100,
      maxHeight: "180px",
      overflowY: "auto",
    },
    dropdownItem: {
      padding: "12px",
      fontSize: "13px",
      borderBottom: "1px solid #f5f5f5",
      cursor: "pointer",
    },
    actionBtn: {
      width: "100%",
      height: "40px",
      borderRadius: "8px",
      border: "none",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "bold",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      marginTop: "23px",
    },
    listSection: {
      backgroundColor: COLORS.white,
      borderRadius: "12px",
      padding: "25px",
      boxShadow: COLORS.cardShadow,
    },
    tableHeader: {
      display: "flex",
      padding: "12px 10px",
      backgroundColor: "#FAFAFA",
      borderRadius: "8px",
      fontSize: "12px",
      color: "#666",
      fontWeight: "bold",
      marginBottom: "10px",
      borderBottom: "1px solid #eee",
    },
    row: {
      display: "flex",
      alignItems: "center",
      padding: "12px 10px",
      borderBottom: "1px solid #f5f5f5",
    },
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #8C85FF; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaBox size={22} color={COLORS.primary} />
            <h2
              style={{
                margin: 0,
                color: COLORS.text,
                fontSize: "22px",
                fontWeight: "bold",
              }}
            >
              자재 입/출고 관리
            </h2>
          </div>
          <button
            onClick={() => navigate("/material/history")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#fff",
              border: `1px solid ${COLORS.border}`,
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: "bold",
              color: "#555",
              fontSize: "13px",
            }}
          >
            <FaHistory /> 전체 내역
          </button>
        </div>

        <div style={styles.statsGrid}>
          {/* ✅ 백엔드에서 받은 통계 값으로 연결 */}
          <StatCard
            title="금일 입고"
            value={stats.inbound}
            unit="건"
            icon={<FaTruckLoading />}
            color={COLORS.success}
          />
          <StatCard
            title="금일 출고"
            value={stats.outbound}
            unit="건"
            icon={<FaDolly />}
            color={COLORS.danger}
          />
          <StatCard
            title="총 재고"
            value="12,500"
            unit="EA"
            icon={<FaLayerGroup />}
            color={COLORS.info}
          />
        </div>

        <div style={styles.inputSection}>
          {/* ... (입력 폼 UI 기존과 100% 동일, 생략 없이 유지) ... */}
          <div style={styles.sectionHeader}>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: COLORS.text,
                }}
              >
                📋 자재 스캔 등록
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: COLORS.subText,
                  marginTop: "4px",
                  display: "block",
                }}
              >
                {inputs.type === "IN"
                  ? "입고 처리를 위한 정보를 입력하세요."
                  : "생산 투입을 위한 정보를 입력하세요."}
              </span>
            </div>
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
            {/* 담당자 */}
            <div style={styles.gridCell}>
              <label style={styles.label}>담당자</label>
              <div style={styles.inputWrapper}>
                <FaUserTie style={styles.inputIcon} />
                <input
                  style={styles.commonInput}
                  placeholder="이름 검색"
                  value={inputs.manager}
                  onChange={handleManagerChange}
                  onFocus={() => setShowManagerList(true)}
                  onBlur={() =>
                    setTimeout(() => setShowManagerList(false), 200)
                  }
                />
                <FaCaretDown style={styles.arrowIcon} />
                {showManagerList && (
                  <div style={styles.dropdownList}>
                    {filteredManagers.map((mgr) => (
                      <div
                        key={mgr.id}
                        style={styles.dropdownItem}
                        onClick={() => selectManager(mgr)}
                      >
                        <strong>{mgr.name}</strong>{" "}
                        <span style={{ color: "#888", fontSize: "11px" }}>
                          ({mgr.employee_number || mgr.id})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* LOT ID */}
            <div style={styles.gridCell}>
              <label style={styles.label}>Lot ID (바코드)</label>
              <div style={styles.inputWrapper}>
                <FaBarcode style={styles.inputIcon} />
                <input
                  ref={lotInputRef}
                  style={{
                    ...styles.commonInput,
                    borderColor: COLORS.primary,
                    backgroundColor: "#F9F9FF",
                  }}
                  placeholder="바코드를 스캔하세요"
                  value={inputs.lot}
                  onChange={(e) =>
                    setInputs({ ...inputs, lot: e.target.value })
                  }
                  onKeyDown={handleScan}
                />
              </div>
            </div>

            {/* 품목명 */}
            <div style={styles.gridCell}>
              <label style={styles.label}>품목명</label>
              <div style={styles.inputWrapper}>
                <FaBox style={styles.inputIcon} />
                <input
                  style={{
                    ...styles.commonInput,
                    backgroundColor: "#f5f5f5",
                    color: "#555",
                  }}
                  placeholder="스캔 시 자동 입력"
                  value={inputs.item}
                  onChange={(e) =>
                    setInputs({ ...inputs, item: e.target.value })
                  }
                />
              </div>
            </div>

            {/* 수량 */}
            <div style={styles.gridCell}>
              <label style={styles.label}>
                {inputs.type === "IN" ? "입고 수량" : "투입 수량"}
              </label>
              <div style={styles.inputWrapper}>
                <FaLayerGroup style={styles.inputIcon} />
                <input
                  id="qtyInput"
                  type="number"
                  style={styles.commonInput}
                  placeholder={
                    inputs.currentQty ? `현재고: ${inputs.currentQty}` : "0"
                  }
                  value={inputs.qty}
                  onChange={(e) =>
                    setInputs({ ...inputs, qty: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                />
              </div>
            </div>

            {/* 업체/공정 */}
            <div style={styles.gridCell}>
              <label style={styles.label}>
                {inputs.type === "IN" ? "공급 업체" : "투입 공정"}
              </label>
              {inputs.type === "IN" ? (
                <div style={styles.inputWrapper}>
                  <FaSearch style={styles.inputIcon} />
                  <input
                    style={styles.commonInput}
                    placeholder="업체 검색"
                    value={inputs.vendor}
                    onChange={handleVendorChange}
                    onFocus={() => setShowVendorList(true)}
                    onBlur={() =>
                      setTimeout(() => setShowVendorList(false), 200)
                    }
                  />
                  {showVendorList && (
                    <div style={styles.dropdownList}>
                      {filteredVendors.map((v) => (
                        <div
                          key={v.id}
                          style={styles.dropdownItem}
                          onClick={() => selectVendor(v)}
                        >
                          <strong>{v.name}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={styles.inputWrapper}>
                    <FaIndustry style={styles.inputIcon} />
                    <select
                      style={{ ...styles.commonInput, appearance: "none" }}
                      value={selectedLine}
                      onChange={handleLineSelect}
                    >
                      <option value="">라인 선택</option>
                      {processStructure.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                    </select>
                    <FaCaretDown style={styles.arrowIcon} />
                  </div>
                  <div style={styles.inputWrapper}>
                    <FaCogs style={styles.inputIcon} />
                    <select
                      style={{ ...styles.commonInput, appearance: "none" }}
                      value={selectedProcess}
                      onChange={handleProcessSelect}
                      disabled={!selectedLine}
                    >
                      <option value="">공정 선택</option>
                      {availableProcesses.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <FaCaretDown style={styles.arrowIcon} />
                  </div>
                </div>
              )}
            </div>

            <div style={styles.gridCell}>
              <button
                style={{
                  ...styles.actionBtn,
                  backgroundColor:
                    inputs.type === "IN" ? COLORS.success : COLORS.danger,
                }}
                onClick={handleRegister}
              >
                <FaCheckCircle />{" "}
                {inputs.type === "IN" ? "입고 확정" : "투입 확정"}
              </button>
            </div>
          </div>
        </div>

        <div style={styles.listSection}>
          <div
            style={{
              marginBottom: "15px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              color: COLORS.text,
            }}
          >
            <FaSyncAlt /> 최근 처리 내역 (5건)
          </div>
          <div style={styles.tableHeader}>
            <div style={{ flex: 0.6 }}>구분</div>
            <div style={{ flex: 1.5 }}>일시</div>
            <div style={{ flex: 2 }}>자재명 (Lot ID)</div>
            <div style={{ flex: 1, textAlign: "right" }}>수량</div>
            <div style={{ flex: 1, textAlign: "center" }}>담당자</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {displayList.map((item, idx) => {
              // 🚀 [핵심 수정] 백엔드 MatLotHistoryResDto 매핑
              // 백엔드가 주는 type: "입고", "출고" (MatLotHistoryResDto.from 메서드 확인)
              const isIN = item.type === "입고";

              return (
                <div key={idx} style={styles.row}>
                  <div style={{ flex: 0.6 }}>
                    <span
                      style={{
                        backgroundColor: isIN ? "#E8F5E9" : "#FFEBEE",
                        color: isIN ? COLORS.success : COLORS.danger,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.type}
                    </span>
                  </div>
                  <div style={{ flex: 1.5, fontSize: "12px", color: "#888" }}>
                    {item.date ? new Date(item.date).toLocaleString() : "-"}
                  </div>
                  <div style={{ flex: 2 }}>
                    <div style={{ fontWeight: "bold", fontSize: "13px" }}>
                      {item.matName}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: COLORS.primary,
                        fontFamily: "monospace",
                      }}
                    >
                      {item.lotNum}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      textAlign: "right",
                      fontWeight: "bold",
                      color: isIN ? COLORS.success : COLORS.danger,
                    }}
                  >
                    {isIN ? "+" : "-"}{" "}
                    {Number(item.changeQty || 0).toLocaleString()}
                  </div>
                  <div
                    style={{ flex: 1, textAlign: "center", fontSize: "12px" }}
                  >
                    {item.empName}
                  </div>
                </div>
              );
            })}
            {displayList.length === 0 && (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "13px",
                }}
              >
                데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ title, value, unit, icon, color }) => (
  <div
    style={{
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "20px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      display: "flex",
      alignItems: "center",
      gap: "15px",
    }}
  >
    <div
      style={{
        width: "45px",
        height: "45px",
        borderRadius: "12px",
        backgroundColor: `${color}15`,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "20px",
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "12px", color: "#888" }}>{title}</div>
      <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
        {value}{" "}
        <span style={{ fontSize: "12px", fontWeight: "normal" }}>{unit}</span>
      </div>
    </div>
  </div>
);

export default MaterialInout;
