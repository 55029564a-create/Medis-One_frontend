import React, { useState, useEffect, useRef } from "react";
import client from "../../api/client";
import { QRCodeSVG } from "qrcode.react"; // ✅ [필수] QR 라이브러리

import {
  FaSearch,
  FaCalendarAlt,
  FaFileExcel,
  FaArrowDown,
  FaArrowUp,
  FaFilter,
  FaBarcode,
  FaIndustry,
  FaBoxOpen,
  FaSyncAlt,
  FaCopy,
  FaEye,
  FaTimes,
  FaHistory,
  FaCheckCircle,
} from "react-icons/fa";

// 🎨 디자인 테마
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  success: "#00C851", // 자재입고
  warning: "#FFBB33", // 라인투입
  info: "#33b5e5", // 출하대기 (완제품)
  danger: "#FF4444", // 자재출하
  text: "#333",
  subText: "#888",
  border: "#E0E0E0",
  bg: "#F5F6FA",
  white: "#FFFFFF",
};

// ⚡️ [필수] QR 연결용 IP 고정
const FIXED_IP = "192.168.0.85";

const InventoryHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [lotHistory, setLotHistory] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const searchInputRef = useRef(null);

  // 🛠 [핵심] 서버 데이터 상태 분류 함수 (완제품 자동 판별)
  const mapServerData = (data) => {
    return data.map((dto) => {
      let typeCode = "ETC";
      const rawType = dto.type || "";
      const category = dto.category || ""; // 카테고리 정보 (PRODUCT, KIT 등)

      // 1. 🔥 [완제품 판별 로직]
      // 카테고리가 PRODUCT이거나, 타입이 생산완료면 -> "출하대기"
      if (
        category === "PRODUCT" ||
        category === "완제품" ||
        ["생산완료", "PRODUCED", "완제품입고", "출하대기"].includes(rawType)
      ) {
        // 단, 출고(OUT)인 경우는 제외 (이미 출하된 경우 등)
        if (!["출고", "OUT", "OUTBOUND"].includes(rawType)) {
          typeCode = "PRODUCED"; // -> "출하대기"로 표시
        } else {
          typeCode = "OUT"; // -> "출하완료/출고"
        }
      }
      // 2. [자재 - 공정 투입]
      else if (
        [
          "생산투입",
          "공정투입",
          "라인투입",
          "PRODUCTION_IN",
          "PROCESS",
        ].includes(rawType)
      ) {
        typeCode = "PROCESS";
      }
      // 3. [자재 - 입고]
      else if (["입고", "INBOUND", "IN", "구매입고"].includes(rawType)) {
        typeCode = "IN";
      }
      // 4. [자재 - 출하/반출]
      else if (["출고", "OUTBOUND", "OUT", "자재출하"].includes(rawType)) {
        typeCode = "OUT";
      }

      return {
        ...dto,
        mappedType: typeCode, // 분류된 타입 저장
      };
    });
  };

  // --- 메인 목록 조회 ---
  const fetchHistory = async () => {
    try {
      const response = await client.get("/inventory/history", {
        params: {
          startDate,
          endDate,
          type: filterType === "ALL" ? undefined : filterType,
        },
      });
      const mapped = mapServerData(response.data);

      // 최신순 정렬
      mapped.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistoryData(mapped);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  // --- 상세 이력(타임라인) 조회 ---
  const fetchLotTimeline = async (lotNum) => {
    if (!lotNum || lotNum === "-") {
      setLotHistory([]);
      return;
    }
    setLoadingDetail(true);
    try {
      const response = await client.get("/inventory/history", {
        params: {
          startDate: "2020-01-01",
          endDate: "2099-12-31",
          keyword: lotNum,
        },
      });

      const mapped = mapServerData(response.data);
      // LOT 번호 포함 여부로 필터링
      const timeline = mapped
        .filter((item) => item.lotNum && item.lotNum.includes(lotNum))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setLotHistory(timeline);
    } catch (error) {
      console.error("상세 이력 조회 실패:", error);
      setLotHistory([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    let result = Array.isArray(historyData) ? historyData : [];

    if (startDate && endDate) {
      result = result.filter((item) => {
        const itemDate = item.date ? item.date.split("T")[0] : "";
        return itemDate >= startDate && itemDate <= endDate;
      });
    }

    if (filterType !== "ALL") {
      result = result.filter((item) => item.mappedType === filterType);
    }

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

  const handleBarcodeMode = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
    alert("바코드 스캐너로 스캔하세요.");
  };

  const handleKeyDown = (e) => {};

  const handleCopyLot = (lotNum) => {
    if (!lotNum || lotNum === "-") return;
    navigator.clipboard
      .writeText(lotNum)
      .then(() => alert(`복사되었습니다: ${lotNum}`));
  };

  const handleOpenDetail = (item) => {
    setSelectedLot(item);
    setModalOpen(true);
    fetchLotTimeline(item.lotNum);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLot(null);
    setLotHistory([]);
  };

  const handleDownloadExcel = () => {
    const headers = ["일자,시간,구분,품목명,LOT번호,수량,작업자,위치(업체)"];
    const rows = filteredData.map((item) => {
      const dateParts = item.date ? item.date.split("T") : ["", ""];
      let typeText = item.type;

      // 엑셀에도 "출하대기"로 표시
      if (item.mappedType === "PRODUCED") typeText = "출하대기";
      else if (item.mappedType === "PROCESS") typeText = "라인투입";
      else if (item.mappedType === "IN") typeText = "자재입고";
      else if (item.mappedType === "OUT") typeText = "자재출하";

      const location = item.company || "-";
      return `${dateParts[0]},${dateParts[1].substring(0, 5)},${typeText},${item.matName},${item.lotNum},${item.changeQty},${item.empName},${location}`;
    });

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `통합이력_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ✅ [배지 렌더링]
  const renderTypeBadge = (mappedType, rawType) => {
    if (mappedType === "IN")
      return (
        <Badge
          color={COLORS.success}
          icon={<FaArrowDown size={10} />}
          text="자재입고"
        />
      );
    if (mappedType === "OUT")
      return (
        <Badge
          color={COLORS.danger}
          icon={<FaArrowUp size={10} />}
          text="자재출하"
        />
      );
    if (mappedType === "PROCESS")
      return (
        <Badge
          color={COLORS.warning}
          icon={<FaIndustry size={10} />}
          text="라인투입"
        />
      );
    if (mappedType === "PRODUCED")
      return (
        <Badge
          color={COLORS.info}
          icon={<FaBoxOpen size={10} />}
          text="출하대기"
        />
      ); // 🔥 완제품
    return <Badge color="#999" text={rawType} />;
  };

  const Badge = ({ color, icon, text }) => (
    <span
      style={{
        ...styles.badge,
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {icon} {text}
    </span>
  );

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.text }}>📊 통합 이력 조회</h2>
          <p
            style={{
              margin: "5px 0 0",
              color: COLORS.subText,
              fontSize: "14px",
            }}
          >
            자재 입고부터 생산, 완제품 출하대기까지의 전체 흐름을 추적합니다.
          </p>
        </div>
        <button onClick={fetchHistory} style={styles.refreshBtn}>
          <FaSyncAlt /> 새로고침
        </button>
      </div>

      {/* 툴바 */}
      <div style={styles.toolbar}>
        <div style={styles.leftControls}>
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

          <div
            style={styles.selectWrapper}
            style={{
              position: "relative",
              minWidth: "120px",
              marginLeft: "10px",
            }}
          >
            <select
              style={styles.selectReal}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">전체 유형</option>
              <option value="IN">자재입고 (IN)</option>
              <option value="OUT">자재출하 (OUT)</option>
              <option value="PROCESS">라인투입 (Process)</option>
              <option value="PRODUCED">출하대기 (Finished)</option>{" "}
              {/* ✅ 필터 옵션 */}
            </select>
          </div>

          <div style={styles.searchBox}>
            <FaBarcode
              color={COLORS.subText}
              size={18}
              style={{ marginRight: 8 }}
            />
            <input
              ref={searchInputRef}
              type="text"
              style={styles.searchInput}
              placeholder="바코드 / 품목명 / LOT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            onClick={handleBarcodeMode}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: COLORS.primary,
              marginLeft: "-35px",
            }}
          >
            <FaSearch />
          </button>
        </div>
        <button style={styles.excelButton} onClick={handleDownloadExcel}>
          <FaFileExcel style={{ marginRight: "6px" }} /> 엑셀
        </button>
      </div>

      {/* 리스트 헤더 */}
      <div style={styles.listHeader}>
        <div style={{ flex: 1.2 }}>일자/시간</div>
        <div style={{ flex: 1, textAlign: "center" }}>상태</div>
        <div style={{ flex: 2.5 }}>품목 정보 (LOT)</div>
        <div style={{ flex: 0.8, textAlign: "right" }}>수량</div>
        <div style={{ flex: 1.2, paddingLeft: "15px" }}>위치/공정</div>
        <div style={{ flex: 0.8, textAlign: "center" }}>담당자</div>
        <div style={{ flex: 0.7, textAlign: "center" }}>상세</div>
      </div>

      {/* 리스트 */}
      <div style={styles.listContainer}>
        {filteredData.length > 0 ? (
          filteredData.map((row, index) => {
            const dateParts = row.date ? row.date.split("T") : ["-", "-"];
            const locationText = row.company || "-";

            return (
              <div key={index} style={styles.cardRow}>
                <div
                  style={{
                    flex: 1.2,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#555",
                      fontSize: "13px",
                    }}
                  >
                    {dateParts[0]}
                  </span>
                  <span style={{ fontSize: "11px", color: "#999" }}>
                    {dateParts[1].substring(0, 5)}
                  </span>
                </div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  {renderTypeBadge(row.mappedType, row.type)}
                </div>
                <div
                  style={{
                    flex: 2.5,
                    overflow: "hidden",
                    paddingRight: "10px",
                  }}
                >
                  <div
                    style={{
                      ...styles.truncatedText,
                      fontWeight: "600",
                      color: COLORS.text,
                    }}
                  >
                    {row.matName}
                  </div>
                  <div
                    style={{ ...styles.lotCopyBadge }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLot(row.lotNum);
                    }}
                    title="클릭하여 복사"
                  >
                    <span
                      style={{ fontFamily: "monospace", marginRight: "4px" }}
                    >
                      {row.lotNum || "LOT 없음"}
                    </span>
                    <FaCopy size={10} />
                  </div>
                </div>
                <div
                  style={{
                    flex: 0.8,
                    textAlign: "right",
                    fontWeight: "bold",
                    color: "#333",
                    fontSize: "13px",
                  }}
                >
                  {(row.changeQty || 0).toLocaleString()}
                </div>
                <div
                  style={{
                    flex: 1.2,
                    paddingLeft: "15px",
                    ...styles.truncatedText,
                    fontSize: "13px",
                    color: "#666",
                  }}
                >
                  {locationText}
                </div>
                <div
                  style={{
                    flex: 0.8,
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#555",
                    ...styles.truncatedText,
                  }}
                >
                  {row.empName || "-"}
                </div>
                <div style={{ flex: 0.7, textAlign: "center" }}>
                  <button
                    onClick={() => handleOpenDetail(row)}
                    style={styles.detailBtn}
                    title="상세보기"
                  >
                    <FaEye size={14} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={styles.emptyState}>
            <FaFilter size={40} color="#ddd" style={{ marginBottom: 10 }} />
            <p>조회된 이력이 없습니다.</p>
          </div>
        )}
      </div>

      {/* ✅ 상세 모달 */}
      {modalOpen && selectedLot && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <FaHistory color={COLORS.primary} /> 상세 이력 정보
              </div>
              <FaTimes
                style={{ cursor: "pointer", color: "#999", fontSize: "18px" }}
                onClick={handleCloseModal}
              />
            </div>

            <div style={styles.modalBody}>
              <div style={styles.qrSection}>
                <QRCodeSVG
                  value={`http://${FIXED_IP}:3000/mobile/tracking/${selectedLot.lotNum}`}
                  size={100}
                  bgColor={"#ffffff"}
                  fgColor={"#333333"}
                  level={"M"}
                />
                <div
                  style={{
                    marginLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    LOT NUMBER
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: "bold",
                      fontFamily: "monospace",
                      color: COLORS.primary,
                    }}
                  >
                    {selectedLot.lotNum}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#333",
                      marginTop: "4px",
                      fontWeight: "600",
                    }}
                  >
                    {selectedLot.matName}
                  </span>
                </div>
              </div>

              <div style={styles.timelineTitle}>
                📜 공정 및 이동 경로 (Timeline)
              </div>
              <div style={styles.timelineContainer}>
                {loadingDetail ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    로딩 중...
                  </div>
                ) : lotHistory.length > 0 ? (
                  lotHistory.map((hist, idx) => (
                    <div key={idx} style={styles.timelineItem}>
                      <div style={styles.timelineLeft}>
                        <div style={styles.timelineDot(idx === 0)}></div>
                        {idx !== lotHistory.length - 1 && (
                          <div style={styles.timelineLine}></div>
                        )}
                      </div>
                      <div style={styles.timelineContent}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "4px",
                          }}
                        >
                          {renderTypeBadge(hist.mappedType, hist.type)}
                          <span style={{ fontSize: "11px", color: "#999" }}>
                            {hist.date
                              ? hist.date.replace("T", " ").substring(0, 16)
                              : "-"}
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#333" }}>
                          {hist.company || hist.lineName || "위치 정보 없음"}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginTop: "2px",
                          }}
                        >
                          담당: {hist.empName || "-"} | 수량:{" "}
                          {hist.changeQty ? hist.changeQty.toLocaleString() : 0}
                        </div>
                        {/* 완료 상태인 경우 강조 메시지 */}
                        {hist.mappedType === "PRODUCED" && (
                          <div
                            style={{
                              marginTop: "8px",
                              padding: "4px 8px",
                              backgroundColor: "#e3f2fd",
                              borderRadius: "4px",
                              color: "#1976d2",
                              fontSize: "11px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <FaCheckCircle /> 완제품 생산 완료 (출하 대기중)
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#999",
                    }}
                  >
                    이력 정보가 없습니다.
                  </div>
                )}
              </div>
            </div>
            <button style={styles.closeBtn} onClick={handleCloseModal}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 스타일 ---
const styles = {
  container: {
    padding: "30px",
    backgroundColor: COLORS.bg,
    minHeight: "100vh",
    fontFamily: "'Pretendard', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  refreshBtn: {
    padding: "8px 12px",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    color: "#666",
    fontSize: "13px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px",
    flexWrap: "wrap",
    gap: "10px",
  },
  leftControls: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  datePicker: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: COLORS.white,
    padding: "8px 12px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.border}`,
  },
  dateInput: {
    border: "none",
    outline: "none",
    fontSize: "13px",
    color: "#555",
    fontFamily: "inherit",
    width: "110px",
  },
  selectReal: {
    width: "100%",
    height: "36px",
    border: "1px solid #E0E0E0",
    backgroundColor: "white",
    padding: "0 10px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "8px",
    padding: "8px 12px",
    border: `1px solid ${COLORS.border}`,
    width: "280px",
    justifyContent: "space-between",
  },
  searchInput: {
    border: "none",
    outline: "none",
    marginLeft: "10px",
    width: "100%",
    fontSize: "13px",
  },
  excelButton: {
    backgroundColor: "#217346",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontWeight: "bold",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  listHeader: {
    display: "flex",
    padding: "0 20px",
    marginBottom: "8px",
    fontSize: "12px",
    color: "#888",
    fontWeight: "bold",
    borderBottom: "1px solid #eee",
    paddingBottom: "8px",
  },
  listContainer: { display: "flex", flexDirection: "column", gap: "8px" },
  cardRow: {
    display: "flex",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: "10px",
    padding: "12px 20px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    border: "1px solid transparent",
    transition: "0.2s",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    minWidth: "70px",
  },
  truncatedText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px",
    color: "#aaa",
    fontSize: "14px",
    backgroundColor: "#fff",
    borderRadius: "12px",
  },
  lotCopyBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    color: "#555",
    marginTop: "4px",
    cursor: "pointer",
    border: "1px solid #eee",
    transition: "all 0.2s",
  },
  detailBtn: {
    border: "1px solid #ddd",
    backgroundColor: "white",
    borderRadius: "6px",
    padding: "6px",
    cursor: "pointer",
    color: COLORS.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
  },

  modalOverlay: {
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
  modalContent: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "16px",
    width: "400px",
    maxHeight: "85vh",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  modalBody: { overflowY: "auto", paddingRight: "5px" },
  qrSection: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f9f9ff",
    padding: "15px",
    borderRadius: "12px",
    border: `1px dashed ${COLORS.primary}`,
    marginBottom: "20px",
  },
  timelineTitle: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#555",
    marginBottom: "10px",
  },
  timelineContainer: { display: "flex", flexDirection: "column" },
  timelineItem: { display: "flex", marginBottom: "0px" },
  timelineLeft: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginRight: "15px",
    width: "20px",
  },
  timelineDot: (isFirst) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: isFirst ? COLORS.primary : "#ddd",
    border: "2px solid white",
    boxShadow: "0 0 0 1px #ddd",
    zIndex: 1,
  }),
  timelineLine: {
    width: "2px",
    flex: 1,
    backgroundColor: "#eee",
    marginTop: "-2px",
    marginBottom: "-2px",
  },
  timelineContent: { flex: 1, paddingBottom: "20px" },
  closeBtn: {
    marginTop: "15px",
    padding: "12px",
    backgroundColor: COLORS.primary,
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
  },
};

export default InventoryHistory;
