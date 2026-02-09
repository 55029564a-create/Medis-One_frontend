import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMaterialHistory } from "../../api/materialApi";
import { FaTruck, FaIndustry, FaCalendarAlt, FaHistory } from "react-icons/fa";

// 디자인 컬러셋
const COLORS = {
  primary: "#8C85FF",
  success: "#4CAF50",
  danger: "#FF5252",
  gray: "#999",
  bg: "#F5F6FA",
};

const MobileTracking = () => {
  const { id } = useParams(); // URL에서 LOT 번호 가져오기
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productInfo, setProductInfo] = useState(null);

  // 데이터 조회 로직 (서버 통신)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. 서버에서 이력 가져오기
        const data = await getMaterialHistory(id);

        if (data && data.length > 0) {
          // 2. 정확히 일치하는 LOT만 필터링 (유사 검색 방지)
          const exactData = data.filter((item) => item.lotNum === id);

          if (exactData.length === 0) {
            setProductInfo(null);
            setHistory([]);
            return;
          }

          // 3. 최신순 정렬 (날짜 내림차순)
          const sortedData = exactData.sort(
            (a, b) =>
              new Date(b.date || b.regDate) - new Date(a.date || a.regDate),
          );

          setHistory(sortedData);

          // 4. 상단 제품 정보 설정 (가장 최신 데이터 기준)
          const latest = sortedData[0];
          setProductInfo({
            name: latest.matName || "알 수 없음",
            currentQty: latest.currentQty || 0,
            lot: id,
          });
        } else {
          setHistory([]);
          setProductInfo(null);
        }
      } catch (err) {
        console.error("모바일 조회 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // 로딩 중 화면
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: COLORS.bg,
          color: "#666",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "10px", fontSize: "24px" }}>⏳</div>
          <div>데이터 조회 중...</div>
        </div>
      </div>
    );

  // 데이터 없음 화면
  if (!productInfo || history.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#666",
          marginTop: "100px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>정보가 없습니다.</h3>
        <p style={{ fontSize: "14px", color: "#999" }}>LOT 번호: {id}</p>
        <p style={{ fontSize: "12px", marginTop: "20px", color: "#ccc" }}>
          관리자에게 문의해주세요.
        </p>
      </div>
    );
  }

  // 메인 화면 렌더링
  return (
    <div
      style={{
        backgroundColor: "#F5F6FA",
        minHeight: "100vh",
        paddingBottom: "50px",
      }}
    >
      {/* 1. 헤더 (고정) */}
      <div
        style={{
          backgroundColor: "#8C85FF",
          padding: "25px 20px 40px",
          color: "white",
          borderBottomLeftRadius: "25px",
          borderBottomRightRadius: "25px",
          boxShadow: "0 4px 15px rgba(140, 133, 255, 0.3)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "bold" }}>
          MEDIS-ONE
        </h2>
        <div style={{ fontSize: "13px", opacity: 0.9, marginTop: "5px" }}>
          Mobile Tracking System
        </div>
      </div>

      {/* 2. 제품 요약 카드 (헤더 위로 겹치게 배치) */}
      <div
        style={{
          margin: "-30px 20px 25px",
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "5px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#888", fontWeight: "600" }}>
            LOT NUMBER
          </div>
          <div
            style={{
              fontSize: "12px",
              color: COLORS.primary,
              fontWeight: "bold",
              backgroundColor: "#F0F0FF",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            추적 중
          </div>
        </div>

        <div
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "20px",
            fontFamily: "monospace",
            letterSpacing: "1px",
          }}
        >
          {productInfo.lot}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid #f0f0f0",
            paddingTop: "20px",
          }}
        >
          <div>
            <div
              style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}
            >
              자재명
            </div>
            <div
              style={{ fontSize: "16px", fontWeight: "bold", color: "#444" }}
            >
              {productInfo.name}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{ fontSize: "12px", color: "#999", marginBottom: "2px" }}
            >
              현재 재고
            </div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: COLORS.primary,
              }}
            >
              {productInfo.currentQty.toLocaleString()}{" "}
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "normal",
                  color: "#888",
                }}
              >
                EA
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 이력 타임라인 */}
      <div style={{ padding: "0 25px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "bold",
            color: "#444",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <FaHistory color={COLORS.primary} /> 이동 경로 (History)
        </h3>

        <div
          style={{
            borderLeft: "2px solid #e0e0e0",
            marginLeft: "9px",
            paddingLeft: "25px",
            paddingBottom: "10px",
          }}
        >
          {history.map((item, idx) => {
            // 타입에 따른 라벨 및 색상 결정
            let typeLabel = "기타";
            let isIN = false;
            let isOUT = false;

            if (["INBOUND", "입고", "IN"].includes(item.type)) {
              typeLabel = "입고 (IN)";
              isIN = true;
            } else if (
              ["PRODUCTION_IN", "출고", "생산투입", "OUT"].includes(item.type)
            ) {
              typeLabel = "출고 (OUT)";
              isOUT = true;
            }

            return (
              <div
                key={idx}
                style={{ position: "relative", marginBottom: "30px" }}
              >
                {/* 타임라인 점 */}
                <div
                  style={{
                    position: "absolute",
                    left: "-32px",
                    top: "0",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: isIN
                      ? COLORS.success
                      : isOUT
                        ? COLORS.danger
                        : "#bbb",
                    border: "3px solid #F5F6FA",
                    boxShadow: "0 0 0 1px #ddd",
                  }}
                />

                {/* 내용 카드 */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "18px",
                    borderRadius: "15px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "bold",
                        padding: "4px 10px",
                        borderRadius: "20px",
                        backgroundColor: isIN
                          ? `${COLORS.success}15`
                          : isOUT
                            ? `${COLORS.danger}15`
                            : "#f0f0f0",
                        color: isIN
                          ? COLORS.success
                          : isOUT
                            ? COLORS.danger
                            : "#777",
                      }}
                    >
                      {typeLabel}
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#aaa",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <FaCalendarAlt size={12} />
                      {item.date
                        ? item.date.substring(0, 16).replace("T", " ")
                        : "-"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        backgroundColor: isIN
                          ? `${COLORS.success}10`
                          : `${COLORS.danger}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {isIN ? (
                        <FaTruck size={18} color={COLORS.success} />
                      ) : (
                        <FaIndustry size={18} color={COLORS.danger} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        {isIN ? "공급 업체" : "사용 라인"}
                      </div>
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "15px",
                          color: "#333",
                        }}
                      >
                        {item.company ||
                          item.lineName ||
                          item.vendorName ||
                          "-"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f5f5f5",
                      paddingTop: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "13px",
                    }}
                  >
                    <span style={{ color: "#888" }}>
                      담당자:{" "}
                      <span style={{ color: "#555", fontWeight: "500" }}>
                        {item.empName || "시스템"}
                      </span>
                    </span>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "15px",
                        color: isIN
                          ? COLORS.success
                          : isOUT
                            ? COLORS.danger
                            : "#666",
                      }}
                    >
                      {isIN ? "+" : isOUT ? "-" : ""}{" "}
                      {item.changeQty ? item.changeQty.toLocaleString() : 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 바닥 여백 (스크롤 시 잘림 방지) */}
      <div style={{ height: "30px" }}></div>
    </div>
  );
};

export default MobileTracking;
