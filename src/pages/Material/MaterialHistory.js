import React, { useState, useEffect } from "react";
// import client from "../../api/client";
import { getMaterialHistory } from "../../api/materialApi";
import { QRCodeSVG } from "qrcode.react"; // [필수] npm install qrcode.react

import {
  FaFileExcel,
  FaSearch,
  FaFilter,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaExclamationCircle,
  FaCalendarAlt,
  FaUndo,
  FaChevronDown,
  FaCopy,
  FaSyncAlt,
  FaTruck,
  FaIndustry,
  FaHistory,
  FaQrcode,
  FaMobileAlt,
} from "react-icons/fa";
const FIXED_IP = "192.168.0.85";

// 🎨 테마 컬러
const COLORS = {
  primary: "#8C85FF",
  primaryLight: "#F3F1FF",
  bg: "#F5F6FA",
  white: "#FFFFFF",
  text: "#333",
  gray: "#666",
  border: "#E0E0E0",
  success: "#4CAF50",
  danger: "#FF5252",
  info: "#2196F3",
  dark: "#424242",
};

// 📱 QR 스캔용 내 PC IP (회사 내부망 IP로 변경하세요)
const MY_IP_ADDRESS = "192.168.0.85";

const MaterialHistory = () => {
  const [history, setHistory] = useState([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [lotTimeline, setLotTimeline] = useState([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 🛠 [핵심 수정] 데이터 매핑 함수
  // 보여주신 로직(v.company)을 참고하여 dto.company를 최우선으로 매핑합니다.
  const mapServerData = (data) => {
    return data.map((dto, index) => {
      let typeCode = "ETC";
      const rawType = dto.type || "";

      // 1. 입출고 구분 처리
      if (rawType === "입고" || rawType === "INBOUND" || rawType === "기타") {
        typeCode = "IN";
      } else if (
        rawType === "출고" ||
        rawType === "생산투입" ||
        rawType === "PRODUCTION_IN"
      ) {
        typeCode = "OUT";
      }

      // 2. [위치/업체 정보 매핑]
      // 보여주신 코드에서 'company' 필드를 쓰므로, 여기서도 dto.company를 1순위로 확인합니다.
      let foundLocation = "-";

      if (dto.company) {
        foundLocation = dto.company; // ★ 1순위: DB 컬럼명 company
      } else if (dto.vendorName) {
        foundLocation = dto.vendorName; // 2순위: 혹시 모를 변수명
      } else if (dto.warehouse) {
        foundLocation = dto.warehouse; // 3순위: 창고명
      } else if (dto.lineName) {
        foundLocation = dto.lineName; // 4순위: 라인명
      }

      return {
        id: dto.id || `HIST-${index}`,
        rawDate: dto.date || dto.regDate,
        date: dto.date ? dto.date.replace("T", " ").substring(0, 16) : "-",
        type: typeCode,
        rawType: rawType,

        // 자재명
        item: dto.matName || dto.materialName || "이름 없음",
        // LOT 번호
        lot: dto.lotNum || dto.lotNumber || "-",
        // 수량
        qty: dto.changeQty || dto.qty || 0,
        currentQty: dto.currentQty || 0,

        // ★ 찾은 위치 정보 적용
        location: foundLocation,

        worker: dto.empName || dto.worker || "시스템",
        note: dto.note || dto.description || `변동수량: ${dto.changeQty || 0}`,
      };
    });
  };

  // 🔄 메인 목록 데이터 로드
  const fetchData = async () => {
    try {
      const data = await getMaterialHistory(searchTerm);
      if (data && data.length > 0) {
        setHistory(mapServerData(data));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setHistory([
        { id: "ERROR", type: "ERROR", item: "서버 연결 실패", qty: 0 },
      ]);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchTerm, startDate, endDate]);

  const handleSearch = () => {
    fetchData();
  };

  const handleManualRefresh = () => {
    fetchData();
    alert("최신 데이터로 갱신되었습니다.");
  };

  const handleReset = () => {
    setFilterType("ALL");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    fetchData();
  };

  const handleCopyLot = (text) => {
    if (!text || text === "-") return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`LOT 번호가 복사되었습니다: ${text}`);
      })
      .catch((err) => console.error("복사 실패", err));
  };

  const filteredHistory = history.filter((item) => {
    if (item.id === "ERROR") return true;
    if (!item) return false;
    const typeMatch = filterType === "ALL" ? true : item.type === filterType;
    let dateMatch = true;
    if (startDate && item.rawDate)
      dateMatch = dateMatch && item.rawDate >= startDate;
    if (endDate && item.rawDate)
      dateMatch = dateMatch && item.rawDate.substring(0, 10) <= endDate;
    return typeMatch && dateMatch;
  });

  const handleDownloadExcel = () => {
    const headers = ["일시,구분,자재명,LOT번호,수량,업체/위치,담당자,비고"];
    const rows = filteredHistory.map((item) => {
      const typeLabel =
        item.type === "IN" ? "입고" : item.type === "OUT" ? "출고" : "기타";
      return `${item.date},${typeLabel},${item.item},${item.lot},${item.qty},${item.location},${item.worker},${item.note}`;
    });
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `자재입출고이력_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const validHistory = history.filter((i) => i.id !== "ERROR");
  const summary = {
    in: validHistory
      .filter((i) => i.type === "IN")
      .reduce((acc, cur) => acc + cur.qty, 0),
    out: validHistory
      .filter((i) => i.type === "OUT")
      .reduce((acc, cur) => acc + cur.qty, 0),
    total: validHistory.length,
  };

  // --- 모달 열기 로직 (상세조회 포함) ---
  const openModal = async (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    setIsLoadingDetail(true);
    setLotTimeline([]);

    try {
      if (!item.lot || item.lot === "-") {
        setLotTimeline([item]);
      } else {
        const data = await getMaterialHistory(item.lot);
        if (data && data.length > 0) {
          const mapped = mapServerData(data);
          const sorted = mapped.sort(
            (a, b) => new Date(b.rawDate) - new Date(a.rawDate),
          );
          setLotTimeline(sorted);
        } else {
          setLotTimeline([item]);
        }
      }
    } catch (e) {
      console.error("상세 이력 조회 실패", e);
      setLotTimeline([item]);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setLotTimeline([]);
  };

  return (
    <>
      <style>{`
        .history-container { padding: 20px; background-color: ${COLORS.bg}; min-height: 100vh; display: flex; flex-direction: column; gap: 15px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px; }
        .dashboard-toolbar { display: flex; flex-direction: column; gap: 15px; background-color: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .controls-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .search-container-box { display: flex; align-items: center; height: 36px; border: 1px solid #E0E0E0; background-color: white; border-radius: 8px; flex: 1; min-width: 250px; padding: 0 10px; box-sizing: border-box; transition: border-color 0.2s; }
        .search-container-box:focus-within { border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(140, 133, 255, 0.1); }
        .search-icon-fixed { color: #999; font-size: 14px; margin-right: 8px; flex-shrink: 0; }
        .search-input-transparent { border: none; outline: none; background: transparent; width: 100%; font-size: 13px; color: #333; height: 100%; font-family: inherit; }
        .common-input-box { height: 36px; border: 1px solid #E0E0E0; background-color: #fff; padding: 0 10px; font-size: 13px; color: #333; outline: none; box-sizing: border-box; display: flex; align-items: center; gap: 6px; border-radius: 8px; }
        .common-input-box:focus-within { border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(140, 133, 255, 0.1); }
        .date-input-clean { border: none; outline: none; background: transparent; color: #555; width: 105px; cursor: pointer; font-family: inherit; }
        .select-wrapper { position: relative; min-width: 110px; flex-shrink: 0; }
        .select-real { width: 100%; height: 36px; border: 1px solid #E0E0E0; background-color: white; padding: 0 25px 0 10px; appearance: none; -webkit-appearance: none; font-size: 13px; color: #333; outline: none; cursor: pointer; border-radius: 8px; font-family: inherit; }
        .select-real:focus { border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(140, 133, 255, 0.1); }
        .select-arrow-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #888; font-size: 11px; pointer-events: none; }
        .btn-action { height: 36px; background-color: ${COLORS.primary}; color: white; border: none; padding: 0 18px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer; }
        .btn-reset-icon { height: 36px; width: 36px; display: flex; align-items: center; justify-content: center; background-color: #F5F6FA; color: #666; border: 1px solid #E0E0E0; border-radius: 8px; cursor: pointer; }
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; }
        .table-container { background-color: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow-x: auto; }
        .desktop-table { width: 100%; border-collapse: collapse; min-width: 800px; }
        .th-row { border-bottom: 1px solid #eee; background-color: #FAFAFA; }
        .th-cell { padding: 10px 8px; text-align: left; font-size: 12px; color: #666; font-weight: bold; white-space: nowrap; }
        .tr-row { border-bottom: 1px solid #f5f5f5; }
        .td-cell { padding: 10px 8px; fontSize: 13px; color: #333; vertical-align: middle; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lot-copyable { background-color: ${COLORS.primaryLight}; color: ${COLORS.primary}; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-family: monospace; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #8C85FF; }

        .timeline-container { position: relative; padding-left: 20px; border-left: 2px solid #eee; margin-left: 10px; margin-top: 10px; }
        .timeline-item { position: relative; margin-bottom: 25px; }
        .timeline-dot { position: absolute; left: -26px; top: 0; width: 10px; height: 10px; border-radius: 50%; background-color: white; border: 2px solid ${COLORS.primary}; box-shadow: 0 0 0 3px #fff; }
        .timeline-content { background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-size: 13px; border: 1px solid #eee; }
        .timeline-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .timeline-date { font-size: 12px; color: #888; display: flex; align-items: center; gap: 4px; }

        @media (max-width: 768px) {
          .controls-row { flex-direction: column; align-items: stretch; }
          .common-input-box { width: 100%; justify-content: space-between; }
          .btn-action { width: 100%; }
        }
      `}</style>

      <div className="history-container">
        {/* 헤더 */}
        <div className="page-header">
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: COLORS.text,
                marginBottom: "4px",
              }}
            >
              📋 자재 입출고 이력
            </h2>
            <p style={{ fontSize: "12px", color: COLORS.gray }}>
              자재의 이동 경로와 수량 변화를 추적합니다.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="btn-action"
              onClick={handleManualRefresh}
              style={{
                backgroundColor: "white",
                color: "#555",
                border: "1px solid #E0E0E0",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaSyncAlt /> 새로고침
            </button>
            <button
              className="btn-action"
              onClick={handleDownloadExcel}
              style={{
                backgroundColor: "#217346",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <FaFileExcel /> 엑셀 다운로드
            </button>
          </div>
        </div>

        {/* 툴바 */}
        <div className="dashboard-toolbar">
          <div className="controls-row">
            <div className="common-input-box">
              <FaCalendarAlt color={COLORS.primary} size={12} />
              <input
                type="date"
                className="date-input-clean"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span style={{ color: "#ccc", fontSize: "11px" }}>~</span>
              <input
                type="date"
                className="date-input-clean"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="select-wrapper">
              <select
                className="select-real"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="ALL">전체 유형</option>
                <option value="IN">입고 (IN)</option>
                <option value="OUT">출고 (OUT)</option>
              </select>
              <FaChevronDown className="select-arrow-icon" />
            </div>

            <div className="search-container-box">
              <FaSearch className="search-icon-fixed" />
              <input
                type="text"
                className="search-input-transparent"
                placeholder="품목명, LOT 번호, 담당자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <button className="btn-action" onClick={handleSearch}>
              조회
            </button>
            <button
              className="btn-reset-icon"
              onClick={handleReset}
              title="초기화"
            >
              <FaUndo size={12} />
            </button>
          </div>

          <div className="stats-row">
            <MiniCard
              label="전체 이력"
              value={`${summary.total}건`}
              icon={<FaExchangeAlt />}
              color={COLORS.info}
            />
            <MiniCard
              label="총 입고량"
              value={`${summary.in.toLocaleString()}`}
              icon={<FaArrowUp />}
              color={COLORS.success}
            />
            <MiniCard
              label="총 출고량"
              value={`${summary.out.toLocaleString()}`}
              icon={<FaArrowDown />}
              color={COLORS.danger}
            />
            <MiniCard
              label="시스템 상태"
              value="정상"
              icon={<FaCheckCircle />}
              color={COLORS.dark}
            />
          </div>
        </div>

        {/* 테이블 */}
        <div className="table-container">
          <table className="desktop-table">
            <thead>
              <tr className="th-row">
                <th className="th-cell" style={{ width: "15%" }}>
                  일시
                </th>
                <th
                  className="th-cell"
                  style={{ width: "10%", textAlign: "center" }}
                >
                  구분
                </th>
                <th className="th-cell" style={{ width: "20%" }}>
                  자재명
                </th>
                <th className="th-cell" style={{ width: "15%" }}>
                  LOT ID (클릭 복사)
                </th>
                <th
                  className="th-cell"
                  style={{ width: "10%", textAlign: "right" }}
                >
                  수량
                </th>
                <th className="th-cell" style={{ width: "15%" }}>
                  업체/위치
                </th>
                <th className="th-cell" style={{ width: "10%" }}>
                  담당자
                </th>
                <th
                  className="th-cell"
                  style={{ width: "5%", textAlign: "center" }}
                >
                  {" "}
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.id} className="tr-row">
                    <td className="td-cell">{item.date}</td>
                    <td className="td-cell" style={{ textAlign: "center" }}>
                      <TypeBadge type={item.type} />
                    </td>
                    <td className="td-cell">
                      <div
                        style={
                          item.id === "ERROR"
                            ? { fontWeight: "bold", color: COLORS.danger }
                            : { fontWeight: "600" }
                        }
                      >
                        {item.id === "ERROR" && (
                          <FaExclamationCircle style={{ marginRight: 6 }} />
                        )}
                        {item.item}
                      </div>
                    </td>
                    <td className="td-cell">
                      <span
                        className="lot-copyable"
                        onClick={() => handleCopyLot(item.lot)}
                        title="클릭해서 복사하기"
                      >
                        {item.lot} <FaCopy size={10} style={{ opacity: 0.5 }} />
                      </span>
                    </td>
                    <td
                      className="td-cell"
                      style={{
                        textAlign: "right",
                        fontWeight: "bold",
                        color: getQtyColor(item.type),
                      }}
                    >
                      {item.type === "IN"
                        ? "+"
                        : item.type === "OUT"
                          ? "-"
                          : ""}
                      {item.qty.toLocaleString()}
                    </td>
                    {/* [수정됨] 위치 정보 렌더링 */}
                    <td className="td-cell">{item.location}</td>

                    <td className="td-cell">{item.worker}</td>
                    <td className="td-cell" style={{ textAlign: "center" }}>
                      <button
                        onClick={() => openModal(item)}
                        title="QR 및 상세 이력"
                        style={{
                          border: `1px solid ${COLORS.border}`,
                          backgroundColor: "white",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: COLORS.primary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#999",
                      fontSize: "13px",
                    }}
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  border: "1px solid #eee",
                  backgroundColor: "white",
                  color: "#555",
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    style={{
                      border:
                        currentPage === number ? "none" : "1px solid #eee",
                      backgroundColor:
                        currentPage === number ? COLORS.primary : "white",
                      color: currentPage === number ? "white" : "#555",
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "12px",
                    }}
                  >
                    {number}
                  </button>
                ),
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  border: "1px solid #eee",
                  backgroundColor: "white",
                  color: "#555",
                  width: "30px",
                  height: "30px",
                  borderRadius: "6px",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                }}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🚀 [모달] QR코드 + 상세 이력 타임라인 */}
      {isModalOpen && selectedItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "550px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div
              style={{
                padding: "20px 25px",
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    margin: 0,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  LOT 추적 상세
                </h3>
                <span
                  style={{
                    fontSize: "12px",
                    color: COLORS.gray,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    marginTop: "4px",
                  }}
                >
                  <FaQrcode /> Mobile Scan Available
                </span>
              </div>
              <button
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* 모달 바디 (스크롤 가능) */}
            <div style={{ padding: "25px", overflowY: "auto" }}>
              {/* 1. QR 코드 섹션 (중앙 배치) */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#F3F1FF",
                  padding: "20px",
                  borderRadius: "12px",
                  marginBottom: "25px",
                  border: "1px dashed #8C85FF",
                }}
              >
                <QRCodeSVG
                  value={`http://${FIXED_IP}:3000/mobile/tracking/${selectedItem.lot}`}
                  size={140}
                  bgColor={"#F3F1FF"}
                  fgColor={"#333"}
                  level={"M"}
                />
                <div
                  style={{
                    marginTop: "15px",
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: COLORS.primary,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FaMobileAlt /> 모바일로 스캔하여 조회
                </div>
                <div
                  style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}
                >
                  LOT: {selectedItem.lot}
                </div>
              </div>

              {/* 2. 상세 타임라인 */}
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                📜 전체 이력 내역
              </h4>

              {isLoadingDetail ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                    color: COLORS.primary,
                  }}
                >
                  <FaSyncAlt
                    className="fa-spin"
                    style={{ animation: "spin 1s linear infinite" }}
                  />{" "}
                  조회 중...
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <div className="timeline-container">
                  {lotTimeline.map((log, idx) => (
                    <div key={idx} className="timeline-item">
                      {/* 타임라인 점 */}
                      <div
                        className="timeline-dot"
                        style={{
                          borderColor:
                            log.type === "IN"
                              ? COLORS.success
                              : log.type === "OUT"
                                ? COLORS.danger
                                : COLORS.gray,
                        }}
                      />

                      {/* 내용 박스 */}
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <TypeBadge type={log.type} />
                          <span className="timeline-date">
                            <FaCalendarAlt /> {log.date}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "bold",
                              color: "#333",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            {/* 입고면 트럭, 아니면 공장 아이콘 + 위치정보(업체명/라인명) */}
                            {log.type === "IN" ? (
                              <FaTruck color={COLORS.success} />
                            ) : (
                              <FaIndustry color={COLORS.danger} />
                            )}
                            {log.location}
                          </span>
                          <span
                            style={{
                              fontWeight: "bold",
                              color: getQtyColor(log.type),
                              fontSize: "14px",
                            }}
                          >
                            {log.type === "IN"
                              ? "+"
                              : log.type === "OUT"
                                ? "-"
                                : ""}{" "}
                            {log.qty.toLocaleString()}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#666",
                            marginBottom: "4px",
                          }}
                        >
                          담당자: {log.worker}
                        </div>
                        {log.note && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#999",
                              borderTop: "1px dashed #ddd",
                              paddingTop: "4px",
                              marginTop: "4px",
                            }}
                          >
                            {log.note}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div
              style={{
                padding: "20px",
                borderTop: "1px solid #eee",
                textAlign: "right",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: COLORS.primary,
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- 서브 컴포넌트 ---
const MiniCard = ({ label, value, color, icon }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "15px",
      padding: "15px",
      borderRadius: "10px",
      backgroundColor: "white",
      border: "1px solid #eee",
      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
    }}
  >
    <div
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        backgroundColor: `${color}15`,
        color: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "16px",
      }}
    >
      {icon}
    </div>
    <div>
      <div style={{ fontSize: "11px", color: "#888", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "16px", fontWeight: "900", color: "#333" }}>
        {value}
      </div>
    </div>
  </div>
);

const TypeBadge = ({ type }) => {
  let label = type,
    color = COLORS.gray;
  if (type === "IN") {
    label = "입고";
    color = COLORS.success;
  } else if (type === "OUT") {
    label = "출고";
    color = COLORS.danger;
  } else if (type === "ERROR") {
    label = "오류";
    color = COLORS.danger;
  }
  return (
    <span
      style={{
        backgroundColor: `${color}15`,
        color: color,
        padding: "4px 8px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: "bold",
        border: `1px solid ${color}30`,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
};

const getQtyColor = (type) =>
  type === "IN" ? COLORS.success : type === "OUT" ? COLORS.danger : COLORS.gray;

export default MaterialHistory;
