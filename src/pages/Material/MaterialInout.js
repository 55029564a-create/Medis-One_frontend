import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMaterialInfo,
  registerMaterialInOut,
  getRecentHistory,
  getEmployeeList,
  getTodayStats,
  getVendorList,
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
} from "react-icons/fa";

// 🎨 디자인 시스템
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

  const [selectedEmpNum, setSelectedEmpNum] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const [stats, setStats] = useState({ inbound: 0, outbound: 0 });

  // 담당자 목록
  const [managerList, setManagerList] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [showManagerList, setShowManagerList] = useState(false);

  // 공정 및 라인
  const [processStructure, setProcessStructure] = useState([]);
  const [selectedLine, setSelectedLine] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [availableProcesses, setAvailableProcesses] = useState([]);

  // 업체 검색
  const [vendorList, setVendorList] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [showVendorList, setShowVendorList] = useState(false);

  // 초기 로드
  useEffect(() => {
    fetchInitialData();
    lotInputRef.current?.focus();
  }, []);

  const fetchInitialData = async () => {
    try {
      // 1. 최근 이력 조회
      const historyData = await getRecentHistory();
      if (historyData) setRecentList(historyData.slice(0, 5));

      // 2. 통계 조회
      const statData = await getTodayStats();
      if (statData)
        setStats({
          inbound: statData.todayInbound,
          outbound: statData.todayOutbound,
        });

      // 3. 담당자 목록 조회
      const empData = await getEmployeeList();
      if (empData && Array.isArray(empData)) {
        setManagerList(empData);
        setFilteredManagers(empData);
      }

      // 4. 업체 목록 조회 (DB)
      const vendorsData = await getVendorList();
      if (vendorsData && Array.isArray(vendorsData)) {
        const mappedVendors = vendorsData.map((v, idx) => ({
          name: typeof v === "string" ? v : v.company,
          id: `V-${idx}`,
        }));

        setVendorList(mappedVendors);
        setFilteredVendors(mappedVendors);
      }

      // 5. 공정 데이터 구성
      organizeProcessData();
    } catch (e) {
      console.error("데이터 로딩 에러", e);
    }
  };

  const organizeProcessData = () => {
    const lines = [
      {
        id: "1",
        name: "A-18 (AREX #1)",
        procs: [
          { id: "PA-1", name: "Surface Prep" },
          { id: "PA-2", name: "Optical Bonding" },
          { id: "PA-3", name: "Core Assembly" },
          { id: "PA-4", name: "Housing Form" },
        ],
      },
      {
        id: "2",
        name: "A-24 (AREX #2)",
        procs: [
          { id: "PA-1", name: "Surface Prep" },
          { id: "PA-2", name: "Optical Bonding" },
          { id: "PA-3", name: "Core Assembly" },
          { id: "PA-4", name: "Housing Form" },
        ],
      },
      {
        id: "3",
        name: "C-LAB (Testing)",
        procs: [
          { id: "PC-1", name: "Calibration" },
          { id: "PC-2", name: "Aging Burn-in" },
          { id: "PC-3", name: "Reliability" },
          { id: "PC-4", name: "Final Gate" },
        ],
      },
    ];
    setProcessStructure(lines);
  };

  // --- 이벤트 핸들러 ---

  const handleManualRefresh = () => {
    fetchInitialData();
    alert("최신 데이터로 갱신되었습니다.");
  };

  const handleScan = async (e) => {
    if (e.key === "Enter" && inputs.lot) {
      try {
        const dataList = await getMaterialInfo(inputs.lot);

        if (dataList && dataList.length > 0) {
          const target = dataList[0];

          const foundItemName =
            target.matName ||
            target.materialName ||
            target.productName ||
            target.item ||
            "";

          const foundVendorName =
            target.company ||
            target.vendorName ||
            target.vendor ||
            target.client ||
            "";

          setInputs((prev) => ({
            ...prev,
            item: foundItemName,
            vendor: foundVendorName,
            qty: "",
            currentQty: target.currentQty || 0,
          }));

          document.getElementById("qtyInput")?.focus();
        } else {
          alert("❌ 해당 LOT 번호의 정보가 없습니다.");
          setInputs((prev) => ({
            ...prev,
            item: "",
            vendor: "",
            currentQty: 0,
          }));
        }
      } catch (error) {
        console.error("❌ 스캔 에러:", error);
        alert("LOT 정보 조회 중 오류가 발생했습니다.");
      }
    }
  };

  const handleManagerChange = (e) => {
    const text = e.target.value;
    setInputs({ ...inputs, manager: text });
    setSelectedEmpNum(null);

    const filtered = managerList.filter(
      (m) =>
        m.name.includes(text) || String(m.employeeNum || m.id).includes(text),
    );
    setFilteredManagers(filtered);
    setShowManagerList(true);
  };

  const selectManager = (manager) => {
    const code = manager.employeeNum || "Unknown";
    const label = `${manager.name} (${code})`;
    setInputs({ ...inputs, manager: label });
    setSelectedEmpNum(manager.employeeNum);
    setShowManagerList(false);
  };

  const handleVendorChange = (e) => {
    const text = e.target.value;
    setInputs({ ...inputs, vendor: text });

    setFilteredVendors(
      vendorList.filter((v) =>
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

  const handleRegister = async () => {
    if (!inputs.item || !inputs.qty || !inputs.lot) {
      return alert("자재명, LOT번호, 수량은 필수입니다.");
    }

    if (inputs.type === "OUT" && !selectedProcess) {
      return alert("투입할 공정을 선택해주세요.");
    }

    if (!selectedEmpNum) {
      return alert("담당자를 목록에서 선택해주세요.");
    }

    try {
      const payload = {
        materialName: inputs.item,
        lotNumber: inputs.lot,
        qty: Number(inputs.qty),
        company: inputs.type === "IN" ? inputs.vendor : null,
        type: inputs.type === "IN" ? "INBOUND" : "PRODUCTION_IN",
        process: inputs.type === "OUT" ? selectedProcess : null,
        lineId:
          inputs.type === "OUT" && selectedLine ? Number(selectedLine) : null,
        employeeNum: selectedEmpNum,
      };

      await registerMaterialInOut(payload);

      alert("처리 완료!");

      setInputs((prev) => ({
        ...prev,
        item: "",
        lot: "",
        qty: "",
        currentQty: 0,
      }));

      fetchInitialData();
      lotInputRef.current.focus();
    } catch (error) {
      console.error(error);
      alert("처리 실패: " + (error.response?.data?.message || "서버 오류"));
    }
  };

  // ✅ [수정] 전체 내역 버튼 클릭 시, 히스토리 페이지가 새로고침 되도록 설정
  const handleGoToHistory = () => {
    navigate("/material/history", { state: { refresh: true } });
  };

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
        {/* 헤더 */}
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
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleManualRefresh}
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
              <FaSyncAlt /> 새로고침
            </button>

            <button
              onClick={handleGoToHistory}
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
        </div>

        {/* 통계 카드 */}
        <div style={styles.statsGrid}>
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

        {/* 입력 섹션 */}
        <div style={styles.inputSection}>
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
                    {filteredManagers.map((mgr, idx) => (
                      <div
                        key={mgr.employeeNum || idx}
                        style={styles.dropdownItem}
                        onClick={() => selectManager(mgr)}
                      >
                        <strong>{mgr.name}</strong>
                        <span style={{ color: "#888", fontSize: "11px" }}>
                          {" "}
                          ({mgr.employeeNum})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Lot ID */}
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

            {/* 업체/공정 선택 */}
            <div style={styles.gridCell}>
              <label style={styles.label}>
                {inputs.type === "IN" ? "공급 업체" : "투입 공정"}
              </label>
              {inputs.type === "IN" ? (
                <div style={styles.inputWrapper}>
                  <FaSearch style={styles.inputIcon} />
                  <input
                    style={styles.commonInput}
                    placeholder="업체 검색 (DB 조회)"
                    value={inputs.vendor}
                    onChange={handleVendorChange}
                    onFocus={() => setShowVendorList(true)}
                    onBlur={() =>
                      setTimeout(() => setShowVendorList(false), 200)
                    }
                  />
                  {showVendorList && (
                    <div style={styles.dropdownList}>
                      {filteredVendors.length > 0 ? (
                        filteredVendors.map((v) => (
                          <div
                            key={v.id}
                            style={styles.dropdownItem}
                            onClick={() => selectVendor(v)}
                          >
                            <strong>{v.name}</strong>
                          </div>
                        ))
                      ) : (
                        <div style={{ ...styles.dropdownItem, color: "#999" }}>
                          검색 결과 없음
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={styles.inputWrapper}>
                    <FaIndustry style={styles.inputIcon} />
                    <select
                      style={{
                        ...styles.commonInput,
                        appearance: "none",
                      }}
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
                      style={{
                        ...styles.commonInput,
                        appearance: "none",
                      }}
                      value={selectedProcess}
                      onChange={handleProcessSelect}
                      disabled={!selectedLine}
                    >
                      <option value="">공정 코드 선택</option>
                      {availableProcesses.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.id} ({p.name})
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

        {/* 최근 내역 */}
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
            {recentList.map((item, idx) => {
              const isIN = item.type === "입고" || item.type === "INBOUND";
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
                  <div
                    style={{
                      flex: 1.5,
                      fontSize: "12px",
                      color: "#888",
                    }}
                  >
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
                    {Number(Math.abs(item.changeQty || 0)).toLocaleString()}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: "12px",
                    }}
                  >
                    {item.empName}
                  </div>
                </div>
              );
            })}
            {recentList.length === 0 && (
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
