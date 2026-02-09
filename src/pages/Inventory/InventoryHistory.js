import React, { useState, useEffect } from "react";
// 🔥 [핵심] fetch 대신 우리가 만든 client 가져오기
import client from "../../api/client";

import {
  FaSearch,
  FaCalendarAlt,
  FaFileExcel,
  FaArrowDown,
  FaArrowUp,
  FaFilter,
} from "react-icons/fa";

// 🎨 디자인 테마
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

const InventoryHistory = () => {
  // --- 상태 관리 ---
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, IN, OUT

  // 날짜 기본값: 오늘 날짜
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState(today);

  // --- 백엔드 데이터 호출 (수정됨) ---
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 🔥 [수정] fetch -> client.get 으로 변경
        // 1. 주소 앞에 http://... 제거 (client가 알아서 붙임)
        // 2. 토큰 자동 첨부됨 (401 에러 해결)
        const response = await client.get("/inventory/history", {
          params: {
            startDate: startDate,
            endDate: endDate,
            type: filterType,
          },
        });

        // axios는 .json() 필요 없음. .data에 바로 들어있음
        setHistoryData(response.data);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };
    fetchHistory();
  }, []); // 빈 배열(처음 한 번만 실행) -> 필요하다면 [startDate, endDate, filterType] 넣어서 자동 재조회 가능

  // --- 필터링 로직 ---
  useEffect(() => {
    // historyData가 진짜 배열인지 확인
    let result = Array.isArray(historyData) ? historyData : [];

    if (result.length === 0) {
      setFilteredData([]);
      return;
    }

    // 1. 날짜 필터
    if (startDate && endDate) {
      result = result.filter((item) => {
        const itemDate = item.date ? item.date.split("T")[0] : "";
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    // 2. 유형 필터
    if (filterType !== "ALL") {
      result = result.filter((item) => {
        // 입고인지 확인 (백엔드 데이터에 따라 조건 수정 필요할 수 있음)
        const isIN =
          item.type === "입고" || item.type === "INBOUND" || item.type === "IN";
        return filterType === "IN" ? isIN : !isIN;
      });
    }

    // 3. 검색어 필터
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          (item.matName && item.matName.toLowerCase().includes(lowerTerm)) ||
          (item.lotNum && item.lotNum.toLowerCase().includes(lowerTerm)) ||
          (item.empName && item.empName.toLowerCase().includes(lowerTerm)),
      );
    }

    setFilteredData(result);
  }, [startDate, endDate, filterType, searchTerm, historyData]);

  // 엑셀 다운로드 핸들러
  const handleDownloadExcel = () => {
    const headers = ["이력ID,일자,시간,구분,품목명,품목코드,수량,작업자,위치"];

    const rows = filteredData.map((item) => {
      const isIN =
        item.type === "입고" || item.type === "INBOUND" || item.type === "IN";
      const typeText = isIN ? "입고" : "출고";

      // 날짜/시간 분리 안전하게 처리
      const dateParts = item.date ? item.date.split("T") : ["", ""];
      const dateVal = dateParts[0];
      const timeVal = dateParts[1] ? dateParts[1].substring(0, 5) : "";

      return `${item.id || ""},${dateVal},${timeVal},${typeText},${item.matName || ""},${item.itemCode || ""},${item.changeQty || 0},${item.empName || ""},${item.lineName || ""}`;
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `입출고이력_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>
            📊 입출고 이력 (History)
          </h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            기간별 자재 및 제품의 입/출고 내역을 상세하게 조회합니다.
          </p>
        </div>
      </div>

      {/* 필터 바 */}
      <div style={styles.toolbar}>
        <div style={styles.leftControls}>
          {/* 날짜 선택 */}
          <div style={styles.datePicker}>
            <FaCalendarAlt color={COLORS.subText} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.dateInput}
            />
            <span style={{ color: "#aaa" }}>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          {/* 유형 선택 */}
          <div style={styles.typeToggle}>
            <button
              style={
                filterType === "ALL" ? styles.toggleActive : styles.toggleBtn
              }
              onClick={() => setFilterType("ALL")}
            >
              전체
            </button>
            <button
              style={
                filterType === "IN" ? styles.toggleActive : styles.toggleBtn
              }
              onClick={() => setFilterType("IN")}
            >
              입고
            </button>
            <button
              style={
                filterType === "OUT" ? styles.toggleActive : styles.toggleBtn
              }
              onClick={() => setFilterType("OUT")}
            >
              출고
            </button>
          </div>

          {/* 검색창 */}
          <div style={styles.searchBox}>
            <FaSearch color={COLORS.subText} />
            <input
              placeholder="품목명, 코드, 담당자 검색"
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button style={styles.excelButton} onClick={handleDownloadExcel}>
            <FaFileExcel style={{ marginRight: "6px" }} /> 엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 리스트 */}
      <div style={styles.listContainer}>
        {/* 리스트 헤더 */}
        <div style={styles.listHeader}>
          <div style={{ width: "15%" }}>일자/시간</div>
          <div style={{ width: "10%", textAlign: "center" }}>구분</div>
          <div style={{ width: "25%" }}>품목 정보 (명/코드)</div>
          <div
            style={{ width: "15%", textAlign: "right", paddingRight: "20px" }}
          >
            수량
          </div>
          <div style={{ width: "15%" }}>위치/라인</div>
          <div style={{ width: "10%" }}>담당자</div>
          <div style={{ width: "10%", textAlign: "right" }}>LOT 번호</div>
        </div>

        {/* 데이터 행 */}
        {filteredData.length > 0 ? (
          filteredData.map((row, index) => {
            const isIncoming =
              row.type === "입고" ||
              row.type === "INBOUND" ||
              row.type === "IN";

            const dateParts = row.date ? row.date.split("T") : ["-", "-"];
            const dateVal = dateParts[0];
            const timeVal = dateParts[1] ? dateParts[1].substring(0, 5) : "";

            return (
              <div key={index} style={styles.cardRow}>
                {/* 일자/시간 */}
                <div
                  style={{
                    width: "15%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <span style={{ fontWeight: "bold", color: "#555" }}>
                    {dateVal}
                  </span>
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    {timeVal}
                  </span>
                </div>

                {/* 구분 (뱃지) */}
                <div style={{ width: "10%", textAlign: "center" }}>
                  <span style={isIncoming ? styles.badgeIn : styles.badgeOut}>
                    {isIncoming ? (
                      <FaArrowDown size={10} />
                    ) : (
                      <FaArrowUp size={10} />
                    )}
                    {isIncoming ? " 입고" : " 출고"}
                  </span>
                </div>

                {/* 품목 정보 */}
                <div style={{ width: "25%" }}>
                  <div style={{ fontWeight: "600", color: COLORS.text }}>
                    {row.matName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#999" }}>
                    {row.itemCode || "-"}
                  </div>
                </div>

                {/* 수량 */}
                <div
                  style={{
                    width: "15%",
                    textAlign: "right",
                    paddingRight: "20px",
                    fontWeight: "bold",
                    color: isIncoming ? COLORS.success : COLORS.danger,
                  }}
                >
                  {isIncoming ? "+" : "-"}
                  {(row.changeQty || 0).toLocaleString()}
                </div>

                {/* 위치 */}
                <div style={{ width: "15%", fontSize: "14px", color: "#666" }}>
                  {row.lineName || row.location || "-"}
                </div>

                {/* 담당자 */}
                <div style={{ width: "10%", fontSize: "14px", color: "#555" }}>
                  {row.empName || "-"}
                </div>

                {/* LOT 번호 */}
                <div
                  style={{
                    width: "10%",
                    textAlign: "right",
                    fontSize: "12px",
                    color: COLORS.primary,
                  }}
                >
                  {row.lotNum}
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <FaFilter size={40} color="#ddd" style={{ marginBottom: 10 }} />
            <p>조건에 맞는 이력이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 스타일 (기존과 동일) ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Pretendard', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  excelButton: {
    backgroundColor: "#217346",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
  },
  leftControls: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: COLORS.white,
    padding: "8px 15px",
    borderRadius: "12px",
    border: `1px solid ${COLORS.border}`,
  },
  dateInput: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    color: "#555",
    fontFamily: "inherit",
  },
  typeToggle: {
    display: "flex",
    backgroundColor: COLORS.white,
    padding: "4px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.border}`,
  },
  toggleBtn: {
    padding: "6px 15px",
    border: "none",
    backgroundColor: "transparent",
    color: "#888",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
  },
  toggleActive: {
    padding: "6px 15px",
    border: "none",
    backgroundColor: COLORS.primary,
    color: "#fff",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "12px",
    padding: "10px 20px",
    border: `1px solid ${COLORS.border}`,
    width: "250px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
    fontSize: "14px",
  },
  listContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  listHeader: {
    display: "flex",
    padding: "0 25px",
    marginBottom: "5px",
    fontSize: "13px",
    color: "#888",
    fontWeight: "bold",
  },
  cardRow: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "16px",
    padding: "20px 25px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.03)",
    transition: "transform 0.2s",
    border: "1px solid transparent",
  },
  badgeIn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: `${COLORS.success}15`,
    color: COLORS.success,
    padding: "6px 12px",
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
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px",
    color: "#aaa",
    fontSize: "15px",
  },
};

export default InventoryHistory;
