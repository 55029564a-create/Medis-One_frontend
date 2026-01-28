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
} from "react-icons/fa";

// 🎨 디자인 시스템
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
  const [showManagerList, setShowManagerList] = useState(false);
  const [filteredManagers, setFilteredManagers] = useState(DUMMY_MANAGERS);

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
          vendor:
            data.company || (prev.type === "IN" ? "기본입고처" : "생산 1라인"),
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

  // --- 로직: 등록 ---
  const handleRegister = async () => {
    if (!inputs.item || !inputs.qty || !inputs.lot || !inputs.manager) {
      return alert("필수 정보를 모두 입력해주세요.");
    }
    try {
      await registerMaterialInOut({
        type: inputs.type,
        lotId: inputs.lot,
        quantity: Number(inputs.qty),
        company: inputs.vendor,
        worker: inputs.manager,
      });

      alert("처리가 완료되었습니다.");
      setInputs((prev) => ({
        ...prev,
        item: "",
        lot: "",
        vendor: "",
        qty: "",
        currentQty: 0,
      }));
      fetchRecentHistory();
      lotInputRef.current.focus();
    } catch (error) {
      alert("오류 발생");
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

  // 리스트 가공 (상태 메시지 처리)
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
        matName: "✅ DB 연결됨 (데이터 없음)",
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
              * 바코드 스캔 후 정보를 확인하세요.
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
              onClick={() => setInputs({ ...inputs, type: "IN" })}
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
              onClick={() => setInputs({ ...inputs, type: "OUT" })}
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
                  placeholder="담당자 검색..."
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
                placeholder="바코드 스캔..."
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

          {/* 거래처/공정 */}
          <div style={styles.gridCell}>
            <label style={styles.label}>
              {inputs.type === "IN" ? "공급 업체 (Vendor)" : "투입 공정 / 라인"}
            </label>
            <input
              style={styles.fixedInput}
              placeholder={
                inputs.type === "IN" ? "예: 삼성전기" : "예: 조립 1라인"
              }
              value={inputs.vendor}
              onChange={(e) => setInputs({ ...inputs, vendor: e.target.value })}
            />
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
