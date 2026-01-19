import React, { useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaFileExcel,
  FaCalendarAlt,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

// 🎨 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851", // 입고
  danger: "#FF4444", // 출고
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

const MaterialInout = () => {
  // --- 1. 상태 관리 ---

  // 입력 폼 상태 (입고 전용)
  const [inputs, setInputs] = useState({
    item: "",
    vendor: "",
    qty: "",
  });

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, IN, OUT
  const [period, setPeriod] = useState("today"); // today, week, month

  // 데이터 (Mock Data - 입고 및 출고 내역 혼합)
  const [history, setHistory] = useState([
    {
      id: 1,
      time: "2026-01-16 10:30",
      type: "IN",
      item: "27인치 LCD 패널",
      lot: "LOT-260116-01",
      qty: 500,
      worker: "김자재",
      vendor: "LG Display",
    },
    {
      id: 2,
      time: "2026-01-16 11:15",
      type: "OUT",
      item: "나사 (M4)",
      lot: "LOT-260110-03",
      qty: 2000,
      worker: "박생산",
      vendor: "-",
    },
    {
      id: 3,
      time: "2026-01-15 14:20",
      type: "IN",
      item: "전원 케이블",
      lot: "LOT-260115-02",
      qty: 300,
      worker: "이물류",
      vendor: "성진전선",
    },
    {
      id: 4,
      time: "2026-01-14 09:00",
      type: "OUT",
      item: "메인보드 A타입",
      lot: "LOT-260112-05",
      qty: 50,
      worker: "최조립",
      vendor: "-",
    },
  ]);

  // --- 2. 핸들러 ---

  // 입력값 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
  };

  // 입고 등록
  const handleRegister = () => {
    if (!inputs.item || !inputs.qty)
      return alert("품목명과 수량을 입력해주세요.");

    const newItem = {
      id: history.length + 1,
      time: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "IN",
      item: inputs.item,
      lot: `LOT-${new Date()
        .toISOString()
        .slice(2, 10)
        .replace(/-/g, "")}-${Math.floor(Math.random() * 99)}`,
      qty: Number(inputs.qty),
      worker: "관리자",
      vendor: inputs.vendor || "미지정",
    };

    setHistory([newItem, ...history]);
    setInputs({ item: "", vendor: "", qty: "" }); // 초기화
    alert("자재 입고가 등록되었습니다.");
  };

  // 데이터 필터링
  const filteredData = history.filter((item) => {
    // 1. 검색어 필터
    const matchesSearch =
      item.item.includes(searchTerm) ||
      item.lot.includes(searchTerm) ||
      item.worker.includes(searchTerm);

    // 2. 유형 필터 (입고/출고)
    const matchesType = filterType === "ALL" ? true : item.type === filterType;

    // 3. 기간 필터 (Mock 구현 - 실제로는 Date 객체 비교 필요)
    // 여기서는 간단히 today일 때만 날짜 문자열 체크 시늉만 함
    let matchesPeriod = true;
    if (period === "today") {
      // 실제 구현시 new Date() 비교. 여기서는 예시로 모든 데이터 보여줌 (또는 오늘 날짜 필터링)
    }

    return matchesSearch && matchesType && matchesPeriod;
  });

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>
            📦 자재 입/출고 관리
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              fontSize: "14px",
              color: COLORS.subText,
            }}
          >
            자재 입고 등록 및 전체 입출고 내역 조회
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* ================= SECTION 1: 자재 입고 등록 (상단) ================= */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 24,
                  backgroundColor: COLORS.primary,
                  borderRadius: 4,
                }}
              ></div>
              자재 입고 등록 (Inbound)
            </h3>
            <span style={{ fontSize: "13px", color: COLORS.subText }}>
              * 출고는 생산 관리 및 불출 요청에 의해 자동으로 처리됩니다.
            </span>
          </div>

          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>품목명 / 코드</label>
              <div style={styles.searchWrapper}>
                <FaSearch style={styles.inputIcon} />
                <input
                  name="item"
                  value={inputs.item}
                  onChange={handleInputChange}
                  placeholder="품목 검색..."
                  style={styles.inputWithIcon}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>공급 업체</label>
              <input
                name="vendor"
                value={inputs.vendor}
                onChange={handleInputChange}
                placeholder="업체명 입력"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>입고 수량</label>
              <input
                name="qty"
                type="number"
                value={inputs.qty}
                onChange={handleInputChange}
                placeholder="0"
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>LOT ID (자동생성)</label>
              <input
                disabled
                placeholder="등록 시 자동 생성됨"
                style={{
                  ...styles.input,
                  backgroundColor: "#F5F6FA",
                  color: "#999",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button style={styles.registerButton} onClick={handleRegister}>
                <FaPlus style={{ marginRight: "6px" }} /> 입고 등록
              </button>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: 입출고 내역 (하단) ================= */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h3
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 24,
                  backgroundColor: COLORS.success,
                  borderRadius: 4,
                }}
              ></div>
              입/출고 내역 조회
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button style={styles.excelButton}>
                <FaFileExcel /> 엑셀 다운로드
              </button>
            </div>
          </div>

          {/* 툴바 (검색 & 필터) */}
          <div style={styles.toolbar}>
            <div style={styles.filterGroup}>
              {/* 기간 버튼 */}
              <div style={styles.periodToggle}>
                {["today", "week", "month"].map((p) => (
                  <button
                    key={p}
                    style={
                      period === p ? styles.periodBtnActive : styles.periodBtn
                    }
                    onClick={() => setPeriod(p)}
                  >
                    {p === "today" ? "금일" : p === "week" ? "주간" : "월간"}
                  </button>
                ))}
              </div>

              {/* 날짜 선택기 */}
              <div style={styles.datePicker}>
                <FaCalendarAlt color={COLORS.subText} />
                <input type="date" style={styles.dateInput} />
                <span>~</span>
                <input type="date" style={styles.dateInput} />
              </div>

              {/* 유형 선택 */}
              <select
                style={styles.select}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">전체 유형</option>
                <option value="IN">입고 (In)</option>
                <option value="OUT">출고 (Out)</option>
              </select>
            </div>

            {/* 검색창 */}
            <div style={styles.searchBox}>
              <FaSearch color={COLORS.subText} />
              <input
                placeholder="품목명, LOT ID, 담당자 검색"
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 리스트 (헤더) */}
          <div style={styles.listHeader}>
            <div style={{ width: "15%" }}>일시</div>
            <div style={{ width: "10%", textAlign: "center" }}>구분</div>
            <div style={{ width: "20%" }}>품목명</div>
            <div style={{ width: "20%" }}>LOT ID</div>
            <div style={{ width: "15%" }}>수량</div>
            <div style={{ width: "10%" }}>공급/위치</div>
            <div style={{ width: "10%", textAlign: "right" }}>담당자</div>
          </div>

          {/* 리스트 (데이터 행) */}
          <div style={styles.listBody}>
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <div key={row.id} style={styles.cardRow}>
                  <div
                    style={{ width: "15%", fontSize: "13px", color: "#666" }}
                  >
                    {row.time}
                  </div>

                  <div style={{ width: "10%", textAlign: "center" }}>
                    <span
                      style={
                        row.type === "IN" ? styles.badgeIn : styles.badgeOut
                      }
                    >
                      {row.type === "IN" ? (
                        <FaArrowDown size={10} />
                      ) : (
                        <FaArrowUp size={10} />
                      )}
                      {row.type === "IN" ? " 입고" : " 출고"}
                    </span>
                  </div>

                  <div
                    style={{
                      width: "20%",
                      fontWeight: "bold",
                      color: COLORS.text,
                    }}
                  >
                    {row.item}
                  </div>

                  <div
                    style={{
                      width: "20%",
                      fontSize: "13px",
                      color: "#888",
                      fontFamily: "monospace",
                    }}
                  >
                    {row.lot}
                  </div>

                  <div
                    style={{
                      width: "15%",
                      fontWeight: "bold",
                      color: row.type === "IN" ? COLORS.success : COLORS.danger,
                    }}
                  >
                    {row.type === "IN" ? "+" : "-"}
                    {row.qty.toLocaleString()}
                  </div>

                  <div
                    style={{ width: "10%", fontSize: "13px", color: "#666" }}
                  >
                    {row.vendor !== "-" ? row.vendor : "라인투입"}
                  </div>

                  <div
                    style={{
                      width: "10%",
                      textAlign: "right",
                      fontSize: "13px",
                      color: "#555",
                    }}
                  >
                    {row.worker}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.emptyState}>검색된 내역이 없습니다.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 스타일 정의 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
  },
  header: { marginBottom: "25px" },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: "15px",
  },

  // 상단 등록 폼 스타일
  formRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr 1fr auto",
    gap: "15px",
    alignItems: "end",
  },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  searchWrapper: { position: "relative", width: "100%" },
  inputWithIcon: {
    padding: "10px 12px 10px 35px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#999",
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    height: "40px", // 인풋 높이와 맞춤
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
  },

  // 하단 툴바 스타일
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "10px",
  },
  filterGroup: { display: "flex", alignItems: "center", gap: "15px" },
  periodToggle: {
    display: "flex",
    backgroundColor: "#F0F0F5",
    borderRadius: "8px",
    padding: "4px",
  },
  periodBtn: {
    border: "none",
    backgroundColor: "transparent",
    padding: "6px 12px",
    fontSize: "13px",
    color: "#666",
    cursor: "pointer",
    borderRadius: "6px",
  },
  periodBtnActive: {
    border: "none",
    backgroundColor: COLORS.white,
    padding: "6px 12px",
    fontSize: "13px",
    fontWeight: "bold",
    color: COLORS.primary,
    cursor: "pointer",
    borderRadius: "6px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    padding: "6px 12px",
    borderRadius: "8px",
  },
  dateInput: {
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#555",
  },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
    outline: "none",
    fontSize: "13px",
    cursor: "pointer",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "20px", // 둥근 검색창
    padding: "8px 15px",
    width: "250px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    width: "100%",
  },
  excelButton: {
    backgroundColor: "#217346",
    color: "#fff",
    border: "none",
    padding: "8px 15px",
    borderRadius: "6px",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },

  // 리스트(테이블) 스타일
  listHeader: {
    display: "flex",
    padding: "15px 20px",
    backgroundColor: "#F9FAFC",
    borderRadius: "12px 12px 0 0",
    borderBottom: `1px solid ${COLORS.border}`,
    fontSize: "13px",
    fontWeight: "bold",
    color: "#666",
  },
  listBody: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "15px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    border: "1px solid transparent",
    transition: "0.2s",
    cursor: "pointer",
    ":hover": {
      transform: "translateY(-2px)",
      borderColor: COLORS.primary,
    },
  },
  badgeIn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: `${COLORS.success}15`,
    color: COLORS.success,
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeOut: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: `${COLORS.danger}15`,
    color: COLORS.danger,
    padding: "4px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
    fontSize: "14px",
  },
};

export default MaterialInout;
