import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaBoxOpen,
  FaIndustry,
  FaClipboardCheck,
  FaTruck,
  FaTimes,
} from "react-icons/fa";

// 모바일용 심플 스타일
const styles = {
  container: {
    backgroundColor: "#F5F6FA",
    minHeight: "100vh",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    paddingBottom: "80px", // 하단 버튼 공간 확보
  },
  header: {
    backgroundColor: "#8C85FF",
    color: "white",
    padding: "20px",
    borderBottomLeftRadius: "20px",
    borderBottomRightRadius: "20px",
    boxShadow: "0 4px 10px rgba(140, 133, 255, 0.3)",
  },
  title: { margin: 0, fontSize: "20px", fontWeight: "bold" },
  subTitle: { fontSize: "12px", opacity: 0.8, marginTop: "5px" },

  card: {
    backgroundColor: "white",
    margin: "15px",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  label: { fontSize: "12px", color: "#888", marginBottom: "4px" },
  value: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "12px",
  },

  // 타임라인 스타일
  timelineContainer: {
    marginTop: "10px",
    borderLeft: "2px solid #ddd",
    marginLeft: "10px",
    paddingLeft: "20px",
  },
  timelineItem: {
    position: "relative",
    marginBottom: "25px",
  },
  dot: {
    position: "absolute",
    left: "-29px",
    top: "0",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: "2px solid white",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  // 하단 고정 버튼
  bottomBtnArea: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "white",
    padding: "15px",
    boxSizing: "border-box",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: "10px",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#8C85FF",
    color: "white",
    border: "none",
    padding: "15px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

const MobileTracking = () => {
  const { id } = useParams(); // URL에서 Lot No 가져오기
  const [isConfirmed, setIsConfirmed] = useState(false);

  // [더미 데이터] 실제로는 API로 id(LotNo)를 조회해서 받아와야 함
  const productInfo = {
    lotNo: id,
    partNo: "PNL-24FHD-MED",
    name: "24인치 의료용 패널 (AG)",
    currentStatus: "Process", // Process, Complete, Defect
    line: "Line-A03 (클린룸)",
    manager: "김반장",
  };

  // 공정 이력 데이터 (아래에서 위로 쌓이는 순서 or 위에서 아래로)
  const history = [
    {
      step: "입고 검사",
      time: "2026-01-20 09:00",
      status: "OK",
      worker: "이검수",
      icon: <FaBoxOpen />,
    },
    {
      step: "패널 세정",
      time: "2026-01-20 09:30",
      status: "OK",
      worker: "박세정",
      icon: <FaIndustry />,
    },
    {
      step: "모듈 조립",
      time: "2026-01-20 10:15",
      status: "OK",
      worker: "최조립",
      icon: <FaIndustry />,
    },
    {
      step: "화질 검사",
      time: "2026-01-20 11:00",
      status: "NG",
      worker: "정품질",
      icon: <FaExclamationCircle />,
      defect: "Dead Pixel (2ea)",
    },
    {
      step: "재작업(Rework)",
      time: "Current",
      status: "ING",
      worker: "김수리",
      icon: <FaTimes />,
    },
  ];

  const handleConfirm = () => {
    // 1. 확인 로그를 서버에 전송하는 로직이 들어갈 곳
    // 2. 화면 닫기 시도
    setIsConfirmed(true);
    setTimeout(() => {
      // 모바일 브라우저 정책상 스크립트로 열지 않은 창은 window.close()가 안 먹힐 수 있음.
      // 그럴 경우를 대비해 "확인되었습니다" 화면으로 전환
      window.close();
    }, 1000);
  };

  if (isConfirmed) {
    return (
      <div
        style={{
          ...styles.container,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <FaCheckCircle size={60} color="#8C85FF" />
        <h2 style={{ color: "#333" }}>확인 완료</h2>
        <p style={{ color: "#666" }}>창을 닫으셔도 됩니다.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* 1. 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.title}>제품 이력 조회</h1>
        <div style={styles.subTitle}>LOT: {productInfo.lotNo}</div>
      </div>

      {/* 2. 제품 기본 정보 카드 */}
      <div style={styles.card}>
        <div style={styles.label}>제품명</div>
        <div style={styles.value}>{productInfo.name}</div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={styles.label}>현재 위치(라인)</div>
            <div style={styles.value}>
              <span style={{ color: COLORS.primary }}>{productInfo.line}</span>
            </div>
          </div>
          <div>
            <div style={styles.label}>관리자</div>
            <div style={styles.value}>{productInfo.manager}</div>
          </div>
        </div>
      </div>

      {/* 3. 공정 타임라인 */}
      <div style={{ padding: "0 20px" }}>
        <h3 style={{ fontSize: "16px", color: "#333", marginBottom: "10px" }}>
          Process History
        </h3>
        <div style={styles.timelineContainer}>
          {history.map((item, index) => {
            const isDefect = item.status === "NG";
            const isCurrent = item.time === "Current";

            return (
              <div key={index} style={styles.timelineItem}>
                {/* 점 아이콘 */}
                <div
                  style={{
                    ...styles.dot,
                    backgroundColor: isDefect
                      ? "#FF5252"
                      : isCurrent
                        ? "#8C85FF"
                        : "#4CAF50",
                  }}
                >
                  {/* 작은 아이콘 중앙 정렬 생략 (색상으로 구분) */}
                </div>

                {/* 내용 */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "15px",
                    borderRadius: "10px",
                    border: isCurrent ? "1px solid #8C85FF" : "1px solid #eee",
                    boxShadow: isCurrent
                      ? "0 4px 10px rgba(140,133,255,0.1)"
                      : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: "bold",
                        color: isDefect ? "#FF5252" : "#333",
                      }}
                    >
                      {item.step}
                    </span>
                    <span style={{ fontSize: "12px", color: "#999" }}>
                      {item.time}
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "#666" }}>
                    작업자: {item.worker}
                    {/* 상태 뱃지 */}
                    <span
                      style={{
                        float: "right",
                        fontWeight: "bold",
                        color: isDefect ? "#FF5252" : "#4CAF50",
                      }}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* 불량 사유가 있으면 표시 */}
                  {item.defect && (
                    <div
                      style={{
                        marginTop: "8px",
                        backgroundColor: "#FFEBEE",
                        color: "#D32F2F",
                        fontSize: "12px",
                        padding: "5px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      ⚠️ {item.defect}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 하단 고정 확인 버튼 */}
      <div style={styles.bottomBtnArea}>
        <button onClick={handleConfirm} style={styles.confirmBtn}>
          정보 확인 완료
        </button>
      </div>
    </div>
  );
};

// 색상 상수 (필요시 import)
const COLORS = { primary: "#8C85FF" };

export default MobileTracking;
