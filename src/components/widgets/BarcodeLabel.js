import React, { useState, useEffect, useRef } from "react";
import Barcode from "react-barcode";
import {
  FaBarcode,
  FaPlay,
  FaStop,
  FaTruck,
  FaHistory,
  FaTrashAlt,
} from "react-icons/fa";

// 🎨 스타일 정의
const styles = {
  container: {
    padding: "30px",
    backgroundColor: "#F5F6FA",
    minHeight: "100vh",
    display: "flex",
    gap: "20px",
    flexDirection: "row", // 좌우 배치
  },
  // 왼쪽: 명령어 바코드 출력용 패널 (벽에 붙이는 용도)
  leftPanel: {
    flex: 1,
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  // 오른쪽: 실제 스캔 및 로그 패널
  rightPanel: {
    flex: 1.5,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
    borderBottom: "2px solid #8C85FF",
    paddingBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  // 명령어 바코드 카드
  cmdCard: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "10px",
    marginBottom: "15px",
    textAlign: "center",
    width: "100%",
    backgroundColor: "#FAFAFA",
  },
  cmdLabel: {
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "5px",
    color: "#555",
  },
  // 스캐너 인풋
  scanInput: {
    width: "100%",
    padding: "15px",
    fontSize: "18px",
    borderRadius: "8px",
    border: "2px solid #8C85FF",
    outline: "none",
    fontWeight: "bold",
    color: "#333",
  },
  // 로그 리스트
  logItem: {
    padding: "12px",
    borderBottom: "1px solid #eee",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
  },
  statusBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "white",
  },
};

const BarcodeSystem = () => {
  // --- 상태 관리 ---
  const [scannedData, setScannedData] = useState(""); // 현재 입력중인 값
  const [currentLot, setCurrentLot] = useState(null); // 현재 선택된 LOT 번호
  const [scanLogs, setScanLogs] = useState([]); // 스캔 이력 로그
  const inputRef = useRef(null); // 입력창 포커스용

  // --- 1. 명령어 바코드 정의 (현장 부착용) ---
  // 이 코드들을 바코드로 변환해서 작업자가 찍습니다.
  const COMMANDS = [
    {
      code: "CMD-START",
      label: "생산 시작 (START)",
      color: "#4CAF50",
      icon: <FaPlay />,
    },
    {
      code: "CMD-END",
      label: "생산 종료 (FINISH)",
      color: "#FF5252",
      icon: <FaStop />,
    },
    {
      code: "CMD-SHIP",
      label: "제품 출고 (SHIP)",
      color: "#2196F3",
      icon: <FaTruck />,
    },
  ];

  // --- 2. 스캔 처리 로직 (핵심 기능) ---
  const handleScan = (code) => {
    const timestamp = new Date().toLocaleString();
    let newLog = {
      time: timestamp,
      type: "INFO",
      message: "",
      lot: currentLot,
    };

    // (1) LOT 번호 인식 (보통 LOT로 시작한다고 가정)
    if (code.startsWith("LOT-")) {
      setCurrentLot(code);
      newLog = {
        ...newLog,
        type: "SET_LOT",
        message: `제품 인식됨: ${code}`,
        lot: code,
      };
      speakText("제품이 인식되었습니다.");
    }
    // (2) 명령어: 생산 시작
    else if (code === "CMD-START") {
      if (!currentLot) {
        alert("먼저 제품(LOT) 바코드를 스캔해주세요!");
        return;
      }
      newLog = {
        ...newLog,
        type: "START",
        message: "생산 공정 시작 (Time Check)",
        color: "#4CAF50",
      };
      // TODO: 백엔드 API 전송 -> /api/production/start
      console.log(`[API 전송] LOT: ${currentLot}, Status: START`);
      speakText("생산을 시작합니다.");
    }
    // (3) 명령어: 생산 종료
    else if (code === "CMD-END") {
      if (!currentLot) {
        alert("작업 중인 제품이 없습니다.");
        return;
      }
      newLog = {
        ...newLog,
        type: "END",
        message: "생산 공정 완료 (Quality Check)",
        color: "#FF5252",
      };
      // TODO: 백엔드 API 전송 -> /api/production/end
      console.log(`[API 전송] LOT: ${currentLot}, Status: END`);
      speakText("생산이 종료되었습니다.");
      setCurrentLot(null); // 작업 끝났으니 초기화
    }
    // (4) 명령어: 출고
    else if (code === "CMD-SHIP") {
      if (!currentLot) {
        // 출고는 LOT 찍고 바로 출고 찍는 경우가 많음
        alert("출고할 제품(LOT)을 먼저 스캔해주세요.");
        return;
      }
      newLog = {
        ...newLog,
        type: "SHIP",
        message: "제품 출고 처리 완료 (Inventory -1)",
        color: "#2196F3",
      };
      // TODO: 백엔드 API 전송 -> /api/inventory/ship
      console.log(`[API 전송] LOT: ${currentLot}, Status: SHIP`);
      speakText("정상 출고되었습니다.");
      setCurrentLot(null);
    }
    // (5) 알 수 없는 코드
    else {
      newLog = {
        type: "ERROR",
        message: `알 수 없는 바코드: ${code}`,
        color: "#999",
      };
      speakText("등록되지 않은 바코드입니다.");
    }

    // 로그 추가 (최신순)
    setScanLogs((prev) => [newLog, ...prev]);
    setScannedData(""); // 입력창 초기화
  };

  // --- TTS (음성 안내) 기능 ---
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = "ko-KR";
      msg.rate = 1.2; // 약간 빠르게
      window.speechSynthesis.speak(msg);
    }
  };

  // --- 키보드 이벤트 핸들러 (스캐너는 엔터키를 입력함) ---
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (scannedData.trim() !== "") {
        handleScan(scannedData);
      }
    }
  };

  // 화면 켜지면 인풋에 자동 포커스 (스캐너 대기)
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div style={styles.container}>
      {/* [왼쪽] 명령어 바코드 생성 패널 (출력해서 벽에 붙이는 용도) */}
      <div style={styles.leftPanel}>
        <div style={styles.sectionTitle}>
          <FaBarcode /> 공정 명령어 바코드
        </div>
        <p
          style={{
            fontSize: "13px",
            color: "#666",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          이 바코드들을 출력하여 작업대에 부착하세요.
          <br />
          (스캐너로 찍으면 해당 기능이 실행됩니다)
        </p>

        {COMMANDS.map((cmd) => (
          <div key={cmd.code} style={styles.cmdCard}>
            <div
              style={{
                color: cmd.color,
                fontSize: "24px",
                marginBottom: "5px",
              }}
            >
              {cmd.icon}
            </div>
            {/* 바코드 생성 라이브러리 활용 */}
            <Barcode
              value={cmd.code}
              width={2}
              height={50}
              fontSize={14}
              displayValue={false}
            />
            <div style={{ ...styles.cmdLabel, color: cmd.color }}>
              {cmd.label}
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>{cmd.code}</div>
          </div>
        ))}
      </div>

      {/* [오른쪽] 스캔 콘솔 (실제 기능 작동) */}
      <div style={styles.rightPanel}>
        {/* 1. 스캐너 입력창 */}
        <div style={styles.card}>
          <div style={styles.sectionTitle}>
            <FaBarcode /> 실시간 스캔 콘솔
          </div>
          <div
            style={{
              marginBottom: "10px",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            현재 작업 LOT:{" "}
            {currentLot ? (
              <span style={{ color: "#8C85FF", fontSize: "18px" }}>
                {" "}
                {currentLot}
              </span>
            ) : (
              <span style={{ color: "#ccc" }}>
                {" "}
                대기중... (LOT를 스캔하세요)
              </span>
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={scannedData}
            onChange={(e) => setScannedData(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="스캐너로 바코드를 찍으세요..."
            style={styles.scanInput}
            autoFocus
          />
          <p style={{ fontSize: "12px", color: "#888", marginTop: "10px" }}>
            * USB 바코드 스캐너는 키보드와 동일하게 작동합니다. 이곳에 커서를
            두세요.
          </p>
        </div>

        {/* 2. 스캔 이력 (로그) */}
        <div style={{ ...styles.card, flex: 1, overflowY: "auto" }}>
          <div
            style={{ ...styles.sectionTitle, borderBottom: "1px solid #eee" }}
          >
            <FaHistory /> 작업 이력 로그
            <button
              onClick={() => setScanLogs([])}
              style={{
                marginLeft: "auto",
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#999",
              }}
            >
              <FaTrashAlt /> 초기화
            </button>
          </div>

          {scanLogs.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#ccc", marginTop: "50px" }}
            >
              이력이 없습니다.
            </div>
          ) : (
            scanLogs.map((log, index) => (
              <div key={index} style={styles.logItem}>
                <div>
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    {log.time}
                  </div>
                  <div style={{ fontWeight: "bold", color: "#333" }}>
                    {log.message}
                  </div>
                  {log.lot && (
                    <div style={{ fontSize: "12px", color: "#8C85FF" }}>
                      LOT: {log.lot}
                    </div>
                  )}
                </div>
                {log.color && (
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: log.color,
                    }}
                  >
                    {log.type}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BarcodeSystem;
