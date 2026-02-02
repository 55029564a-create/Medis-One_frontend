import React, { useState, useEffect } from "react";
// import client from "../../api/client";
import { getMaterialHistory } from "../../api/materialApi";

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
} from "react-icons/fa";

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

const MaterialHistory = () => {
  const [history, setHistory] = useState([]);

  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 🔄 데이터 로드
  const fetchData = async () => {
    try {
      const data = await getMaterialHistory(searchTerm);

      if (data && data.length > 0) {
        const mappedData = data.map((dto, index) => {
          let typeCode = "ETC";
          const rawType = dto.type || "";

          if (rawType === "입고" || rawType === "INBOUND") typeCode = "IN";
          else if (
            rawType === "출고" ||
            rawType === "생산투입" ||
            rawType === "PRODUCTION_IN"
          )
            typeCode = "OUT";

          return {
            id: `HIST-${index}`,
            rawDate: dto.date || dto.regDate,
            date: dto.date ? dto.date.replace("T", " ").substring(0, 16) : "-",
            type: typeCode,
            item: dto.matName || "이름 없음",
            lot: dto.lotNum || "-",
            qty: dto.changeQty || 0,
            location: dto.company || "-",
            worker: dto.empName || "시스템",
            note: `이전: ${dto.prevQty} → 현재: ${dto.currentQty}`,
          };
        });
        setHistory(mappedData);
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

  const openModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <>
      <style>{`
        /* 레이아웃 */
        .history-container { padding: 20px; background-color: ${COLORS.bg}; min-height: 100vh; display: flex; flex-direction: column; gap: 15px; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 15px; }
        
        .dashboard-toolbar { 
          display: flex; 
          flex-direction: column; 
          gap: 15px; 
          background-color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .controls-row { 
          display: flex; 
          align-items: center; 
          gap: 10px; 
          flex-wrap: wrap; 
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        /* ---------------------------------------------------- */
        /* [최종 완성] 검색 박스 스타일 (Flex 구조 + 둥근 모서리) */
        /* ---------------------------------------------------- */
        
        /* 1. 검색 박스 컨테이너 (여기가 테두리와 둥근 모서리 담당) */
        .search-container-box {
          display: flex; 
          align-items: center;
          height: 36px;
          border: 1px solid #E0E0E0;
          background-color: white; 
          border-radius: 8px; /* [요청] 둥근 모서리 복구 */
          flex: 1;
          min-width: 250px;
          padding: 0 10px;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        
        /* 포커스 효과 */
        .search-container-box:focus-within {
          border-color: ${COLORS.primary};
          box-shadow: 0 0 0 2px rgba(140, 133, 255, 0.1);
        }

        /* 2. 돋보기 아이콘 (박스 안 고정) */
        .search-icon-fixed {
          color: #999;
          font-size: 14px;
          margin-right: 8px; 
          flex-shrink: 0; 
        }

        /* 3. 입력창 (투명) */
        .search-input-transparent {
          border: none;
          outline: none;
          background: transparent;
          width: 100%;
          font-size: 13px;
          color: #333;
          height: 100%;
          font-family: inherit;
        }

        /* ---------------------------------------------------- */

        /* 날짜 및 셀렉트도 둥근 모서리(8px)로 통일 */
        .common-input-box {
          height: 36px; 
          border: 1px solid #E0E0E0;
          background-color: #fff; 
          padding: 0 10px;
          font-size: 13px;
          color: #333;
          outline: none;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 6px;
          border-radius: 8px; /* 둥근 모서리 */
        }
        .common-input-box:focus-within { border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(140, 133, 255, 0.1); }
        
        .date-input-clean { border: none; outline: none; background: transparent; color: #555; width: 105px; cursor: pointer; font-family: inherit; }
        
        .select-wrapper { position: relative; min-width: 110px; flex-shrink: 0; }
        .select-real { 
          width: 100%; height: 36px; 
          border: 1px solid #E0E0E0; background-color: white; 
          padding: 0 25px 0 10px; 
          appearance: none; -webkit-appearance: none; 
          font-size: 13px; color: #333; outline: none; cursor: pointer;
          border-radius: 8px; /* 둥근 모서리 */
          font-family: inherit;
        }
        .select-real:focus { border-color: ${COLORS.primary}; box-shadow: 0 0 0 2px rgba(140, 133, 255, 0.1); }
        .select-arrow-icon { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: #888; font-size: 11px; pointer-events: none; }

        /* 버튼 */
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

        @media (max-width: 768px) {
          .controls-row { flex-direction: column; align-items: stretch; }
          .common-input-box { width: 100%; justify-content: space-between; }
          .btn-action { width: 100%; }
        }
      `}</style>

      <div className="history-container">
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
          <button
            className="btn-action"
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

        <div className="dashboard-toolbar">
          <div className="controls-row">
            {/* 날짜 선택 (둥근 모서리) */}
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

            {/* 유형 선택 (둥근 모서리) */}
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

            {/* ▼▼▼ [완성] 검색 박스 (둥근 모서리 8px + 돋보기 고정) ▼▼▼ */}
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
                    <td className="td-cell">{item.location}</td>
                    <td className="td-cell">{item.worker}</td>
                    <td className="td-cell" style={{ textAlign: "center" }}>
                      <button
                        onClick={() => openModal(item)}
                        style={{
                          border: `1px solid ${COLORS.border}`,
                          backgroundColor: "white",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: "#555",
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
              borderRadius: "12px",
              width: "90%",
              maxWidth: "400px",
              padding: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                borderBottom: "1px solid #eee",
                paddingBottom: "10px",
              }}
            >
              <h3 style={{ fontSize: "18px", margin: 0 }}>상세 이력 정보</h3>
              <button
                onClick={closeModal}
                style={{
                  border: "none",
                  background: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div>
              <ModalRow label="일시" value={selectedItem.date} />
              <ModalRow
                label="구분"
                value={<TypeBadge type={selectedItem.type} />}
              />
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#eee",
                  margin: "10px 0",
                }}
              />
              <ModalRow label="품목명" value={selectedItem.item} bold />
              <ModalRow label="LOT ID" value={selectedItem.lot} />
              <ModalRow
                label="수량"
                value={`${selectedItem.qty.toLocaleString()} 개`}
                color={getQtyColor(selectedItem.type)}
                bold
              />
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#eee",
                  margin: "10px 0",
                }}
              />
              <ModalRow label="업체/위치" value={selectedItem.location} />
              <ModalRow label="담당자" value={selectedItem.worker} />
              <div
                style={{
                  backgroundColor: "#F9FAFB",
                  padding: "10px",
                  borderRadius: "8px",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#888",
                    marginBottom: "4px",
                    fontWeight: "bold",
                  }}
                >
                  재고 변동 내역
                </div>
                <div style={{ fontSize: "13px", color: "#333" }}>
                  {selectedItem.note}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={closeModal}
                style={{
                  width: "100%",
                  backgroundColor: COLORS.primary,
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                확인
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

const ModalRow = ({ label, value, bold, color }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "12px",
      fontSize: "13px",
    }}
  >
    <span style={{ color: "#888", minWidth: "80px" }}>{label}</span>
    <span
      style={{
        fontWeight: bold ? "bold" : "normal",
        color: color || "#333",
        textAlign: "right",
      }}
    >
      {value}
    </span>
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
