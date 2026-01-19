import React, { useState } from "react";
import {
  FaSearch,
  FaFileExcel,
  FaArrowDown,
  FaArrowUp,
  FaBox,
  FaBarcode,
  FaTruckLoading,
  FaDolly,
  FaCheckCircle,
  FaSyncAlt,
  FaHistory,
} from "react-icons/fa";

// 🎨 MedisOne 디자인 시스템
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851", // 입고
  danger: "#FF4444", // 출고
  warning: "#FFBB33",
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  cardShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const MaterialInout = () => {
  // --- 1. 상태 관리 ---
  const [inputs, setInputs] = useState({
    type: "IN",
    item: "",
    lot: "",
    vendor: "",
    qty: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // 💾 풍부한 더미 데이터 (12개)
  const [history, setHistory] = useState([
    {
      id: 12,
      time: "15:20",
      date: "2026-01-19",
      type: "IN",
      item: "27인치 LCD 패널",
      lot: "LOT-260119-001",
      change: 500,
      prevStock: 1000,
      stock: 1500,
      worker: "김자재",
      vendor: "LG Display",
    },
    {
      id: 11,
      time: "14:45",
      date: "2026-01-19",
      type: "OUT",
      item: "나사 (M4)",
      lot: "LOT-260110-003",
      change: 2000,
      prevStock: 10000,
      stock: 8000,
      worker: "박생산",
      vendor: "라인투입",
    },
    {
      id: 10,
      time: "13:30",
      date: "2026-01-19",
      type: "IN",
      item: "전원 케이블",
      lot: "LOT-260119-002",
      change: 300,
      prevStock: 50,
      stock: 350,
      worker: "이물류",
      vendor: "성진전선",
    },
    {
      id: 9,
      time: "11:00",
      date: "2026-01-19",
      type: "OUT",
      item: "메인보드 PCB",
      lot: "LOT-260115-088",
      change: 50,
      prevStock: 200,
      stock: 150,
      worker: "최조립",
      vendor: "라인투입",
    },
    {
      id: 8,
      time: "09:15",
      date: "2026-01-19",
      type: "IN",
      item: "ABS 수지 (White)",
      lot: "LOT-260119-005",
      change: 1000,
      prevStock: 500,
      stock: 1500,
      worker: "김자재",
      vendor: "한화솔루션",
    },
    {
      id: 7,
      time: "17:40",
      date: "2026-01-18",
      type: "IN",
      item: "포장 박스 (Large)",
      lot: "LOT-260118-012",
      change: 500,
      prevStock: 100,
      stock: 600,
      worker: "이물류",
      vendor: "대영포장",
    },
    {
      id: 6,
      time: "16:20",
      date: "2026-01-18",
      type: "OUT",
      item: "27인치 LCD 패널",
      lot: "LOT-260115-001",
      change: 100,
      prevStock: 1100,
      stock: 1000,
      worker: "박생산",
      vendor: "라인투입",
    },
    {
      id: 5,
      time: "14:10",
      date: "2026-01-18",
      type: "IN",
      item: "LED 모듈",
      lot: "LOT-260118-003",
      change: 2000,
      prevStock: 0,
      stock: 2000,
      worker: "김자재",
      vendor: "서울반도체",
    },
    {
      id: 4,
      time: "10:00",
      date: "2026-01-18",
      type: "OUT",
      item: "나사 (M4)",
      lot: "LOT-260110-003",
      change: 500,
      prevStock: 10500,
      stock: 10000,
      worker: "정수진",
      vendor: "라인투입",
    },
    {
      id: 3,
      time: "09:30",
      date: "2026-01-17",
      type: "IN",
      item: "방열판 (Alu)",
      lot: "LOT-260117-001",
      change: 300,
      prevStock: 150,
      stock: 450,
      worker: "이물류",
      vendor: "알루코",
    },
    {
      id: 2,
      time: "15:00",
      date: "2026-01-17",
      type: "OUT",
      item: "전원 케이블",
      lot: "LOT-260112-009",
      change: 20,
      prevStock: 70,
      stock: 50,
      worker: "최조립",
      vendor: "AS센터",
    },
    {
      id: 1,
      time: "11:20",
      date: "2026-01-16",
      type: "IN",
      item: "실리콘 구리스",
      lot: "LOT-260116-004",
      change: 50,
      prevStock: 10,
      stock: 60,
      worker: "김자재",
      vendor: "다우코닝",
    },
  ]);

  // --- 2. 로직 ---
  const generateLotId = () => {
    const today = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, "0");
    setInputs({ ...inputs, lot: `LOT-${today}-${random}` });
  };

  const handleRegister = () => {
    if (!inputs.item || !inputs.qty || !inputs.lot)
      return alert("필수 정보를 입력하세요.");

    const qtyNum = Number(inputs.qty);
    const currentStock = Math.floor(Math.random() * 500) + 100; // 가상 재고
    const finalStock =
      inputs.type === "IN" ? currentStock + qtyNum : currentStock - qtyNum;

    const newItem = {
      id: history.length + 1,
      time: new Date().toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: new Date().toISOString().split("T")[0],
      type: inputs.type,
      item: inputs.item,
      lot: inputs.lot,
      change: qtyNum,
      prevStock: currentStock,
      stock: finalStock,
      worker: "관리자",
      vendor: inputs.vendor || (inputs.type === "IN" ? "미지정" : "라인투입"),
    };

    setHistory([newItem, ...history]);
    setInputs({ type: "IN", item: "", lot: "", vendor: "", qty: "" });
    alert("정상적으로 처리되었습니다.");
  };

  // 통계
  const todayIn = history
    .filter((h) => h.type === "IN")
    .reduce((acc, cur) => acc + cur.change, 0);
  const todayOut = history
    .filter((h) => h.type === "OUT")
    .reduce((acc, cur) => acc + cur.change, 0);

  // 필터링
  const filteredData = history.filter((item) => {
    const matchesSearch =
      item.item.includes(searchTerm) || item.lot.includes(searchTerm);
    const matchesType = filterType === "ALL" ? true : item.type === filterType;
    return matchesSearch && matchesType;
  });

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
        <p
          style={{ margin: "5px 0 0", fontSize: "13px", color: COLORS.subText }}
        >
          정확한 재고 관리를 위해 일련번호(Lot ID)를 필수로 입력해주세요.
        </p>
      </div>

      {/* 1. 상단 통계 카드 */}
      <div style={styles.statsGrid}>
        <StatCard
          title="금일 총 입고"
          value={todayIn}
          unit="EA"
          icon={<FaTruckLoading />}
          color={COLORS.success}
        />
        <StatCard
          title="금일 총 출고"
          value={todayOut}
          unit="EA"
          icon={<FaDolly />}
          color={COLORS.danger}
        />
        <StatCard
          title="재고 회전율"
          value="98.5"
          unit="%"
          icon={<FaSyncAlt />}
          color={COLORS.primary}
        />
      </div>

      {/* 2. 신규 등록 폼 (칼각 2줄 레이아웃) */}
      <div style={styles.inputSection}>
        <div style={styles.sectionHeader}>
          <h3 style={{ margin: 0, fontSize: "16px", color: COLORS.text }}>
            📋 신규 등록
          </h3>
          <span style={{ fontSize: "12px", color: COLORS.danger }}>
            * 모든 항목을 정확히 입력해주세요.
          </span>
        </div>

        {/* ★ 여기가 핵심: CSS Grid로 완벽한 2줄 맞춤 ★ */}
        <div style={styles.formGrid}>
          {/* [1행 1열] 구분 (작은 사이즈) */}
          <div style={styles.gridCell}>
            <label style={styles.label}>구분</label>
            <select
              style={styles.fixedInput}
              value={inputs.type}
              onChange={(e) => setInputs({ ...inputs, type: e.target.value })}
            >
              <option value="IN">입고 (In)</option>
              <option value="OUT">출고 (Out)</option>
            </select>
          </div>

          {/* [1행 2열] 품목명 (큰 사이즈) */}
          <div style={styles.gridCell}>
            <label style={styles.label}>품목명</label>
            <div style={styles.inputWrapper}>
              <FaBox style={styles.inputIcon} />
              <input
                style={styles.fixedInputWithIcon}
                placeholder="품목명 검색..."
                value={inputs.item}
                onChange={(e) => setInputs({ ...inputs, item: e.target.value })}
              />
            </div>
          </div>

          {/* [1행 3열] 일련번호 (중간 사이즈 + 버튼) */}
          <div style={styles.gridCell}>
            <label style={styles.label}>일련번호 (Lot ID)</label>
            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <FaBarcode style={styles.inputIcon} />
                <input
                  style={{ ...styles.fixedInputWithIcon, width: "100%" }}
                  placeholder="Lot No 입력"
                  value={inputs.lot}
                  onChange={(e) =>
                    setInputs({ ...inputs, lot: e.target.value })
                  }
                />
              </div>
              <button style={styles.fixedBtnOutline} onClick={generateLotId}>
                번호생성
              </button>
            </div>
          </div>

          {/* [2행 1열] 수량 (작은 사이즈) */}
          <div style={styles.gridCell}>
            <label style={styles.label}>수량</label>
            <input
              type="number"
              style={styles.fixedInput}
              placeholder="0"
              value={inputs.qty}
              onChange={(e) => setInputs({ ...inputs, qty: e.target.value })}
            />
          </div>

          {/* [2행 2열] 거래처 (큰 사이즈) */}
          <div style={styles.gridCell}>
            <label style={styles.label}>거래처 / 위치</label>
            <input
              style={styles.fixedInput}
              placeholder={
                inputs.type === "IN" ? "공급업체 입력" : "투입 라인 입력"
              }
              value={inputs.vendor}
              onChange={(e) => setInputs({ ...inputs, vendor: e.target.value })}
            />
          </div>

          {/* [2행 3열] 등록 버튼 (꽉 차게) */}
          <div style={{ ...styles.gridCell, justifyContent: "flex-end" }}>
            <label style={styles.label}>&nbsp;</label> {/* 줄맞춤용 빈 라벨 */}
            <button style={styles.fixedBtnSolid} onClick={handleRegister}>
              <FaCheckCircle /> 처리 완료
            </button>
          </div>
        </div>
      </div>

      {/* 3. 리스트 영역 */}
      <div style={styles.listSection}>
        <div style={styles.toolbar}>
          <div style={styles.tabs}>
            <TabButton
              label="전체 내역"
              active={filterType === "ALL"}
              onClick={() => setFilterType("ALL")}
            />
            <TabButton
              label="입고"
              active={filterType === "IN"}
              onClick={() => setFilterType("IN")}
              color={COLORS.success}
            />
            <TabButton
              label="출고"
              active={filterType === "OUT"}
              onClick={() => setFilterType("OUT")}
              color={COLORS.danger}
            />
          </div>
          <div style={styles.searchBox}>
            <FaSearch color={COLORS.subText} style={{ minWidth: "14px" }} />
            <input
              placeholder="품목명, Lot No, 담당자 검색"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.tableHeader}>
          <div style={{ flex: 0.6 }}>구분</div>
          <div style={{ flex: 1 }}>일시</div>
          <div style={{ flex: 1.5 }}>품목명 / Lot No</div>
          <div style={{ flex: 1.2, textAlign: "center" }}>거래처</div>
          <div style={{ flex: 2, textAlign: "center" }}>
            재고 변동 (Before → After)
          </div>
          <div style={{ flex: 0.8, textAlign: "center" }}>담당자</div>
        </div>

        <div style={styles.listBody}>
          {filteredData.map((item) => (
            <div key={item.id} style={styles.row}>
              <div style={{ flex: 0.6 }}>
                <span
                  style={{
                    ...styles.typeBadge,
                    color: item.type === "IN" ? COLORS.success : COLORS.danger,
                    backgroundColor: item.type === "IN" ? "#E8F5E9" : "#FFEBEE",
                  }}
                >
                  {item.type === "IN" ? "입고" : "출고"}
                </span>
              </div>
              <div style={{ flex: 1, fontSize: "12px", color: COLORS.subText }}>
                <div>{item.date}</div>
                <div style={{ fontWeight: "bold", color: "#555" }}>
                  {item.time}
                </div>
              </div>
              <div style={{ flex: 1.5 }}>
                <div style={{ fontWeight: "bold", color: COLORS.text }}>
                  {item.item}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    fontFamily: "monospace",
                  }}
                >
                  {item.lot}
                </div>
              </div>
              <div
                style={{
                  flex: 1.2,
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#555",
                }}
              >
                {item.vendor}
              </div>
              <div
                style={{
                  flex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <span style={{ color: "#999" }}>
                  {item.prevStock.toLocaleString()}
                </span>
                <span style={{ fontSize: "10px", color: "#ccc" }}>▶</span>
                <span
                  style={{
                    fontWeight: "bold",
                    color: item.type === "IN" ? COLORS.success : COLORS.danger,
                  }}
                >
                  {item.type === "IN" ? "+" : "-"}
                  {item.change.toLocaleString()}
                </span>
                <span style={{ fontSize: "10px", color: "#ccc" }}>▶</span>
                <span
                  style={{
                    fontWeight: "bold",
                    color: COLORS.text,
                    backgroundColor: "#f0f0f0",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {item.stock.toLocaleString()}
                </span>
              </div>
              <div style={{ flex: 0.8, textAlign: "center" }}>
                <span style={styles.workerBadge}>{item.worker}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 서브 컴포넌트 ---
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
        {value.toLocaleString()}{" "}
        <span style={{ fontSize: "12px", fontWeight: "normal" }}>{unit}</span>
      </div>
    </div>
  </div>
);

const TabButton = ({ label, active, onClick, color = COLORS.primary }) => (
  <button
    onClick={onClick}
    style={{
      padding: "6px 14px",
      borderRadius: "20px",
      border: active ? `1px solid ${color}` : "1px solid #ddd",
      backgroundColor: active ? color : "#fff",
      color: active ? "#fff" : "#666",
      fontSize: "12px",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "all 0.2s",
    }}
  >
    {label}
  </button>
);

// --- 스타일 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: { marginBottom: "20px" },

  // 통계
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
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

  // 입력 폼
  inputSection: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "25px",
    boxShadow: COLORS.cardShadow,
    marginBottom: "20px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #f0f0f0",
  },

  // ★ 2줄 맞춤 그리드 시스템
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 1.5fr", // 3열 배치 (비율 조정)
    rowGap: "15px", // 위아래 간격
    columnGap: "20px", // 좌우 간격
  },
  gridCell: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    width: "100%",
  },
  label: { fontSize: "12px", fontWeight: "bold", color: "#666" },

  // 고정 사이즈 인풋 (높이 42px로 통일)
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
  fixedBtnOutline: {
    height: "42px",
    padding: "0 15px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.primary}`,
    backgroundColor: "#fff",
    color: COLORS.primary,
    fontSize: "12px",
    fontWeight: "bold",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  fixedBtnSolid: {
    width: "100%",
    height: "42px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: COLORS.primary,
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

  // 리스트
  listSection: {
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    boxShadow: COLORS.cardShadow,
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
  },
  tabs: { display: "flex", gap: "8px" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#F5F6FA",
    borderRadius: "20px",
    padding: "6px 15px",
    width: "250px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    marginLeft: "8px",
    fontSize: "13px",
    width: "100%",
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
    ":hover": { backgroundColor: "#F9FAFB" },
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
