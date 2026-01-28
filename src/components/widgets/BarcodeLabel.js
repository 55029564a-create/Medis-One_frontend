import React, { useState, useRef, useEffect } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { FaPrint, FaTag, FaRedo } from "react-icons/fa";

// 🎨 스타일 정의 (작성자님이 만드신 예쁜 디자인 그대로 유지!)
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#F5F6FA", // 배경만 살짝 구분되게 변경
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxWidth: "380px", // 일반적인 라벨지 폭
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  // 인쇄될 라벨 영역 (A4나 라벨지에 찍힐 실제 모양)
  labelArea: {
    border: "2px solid #000",
    borderRadius: "6px",
    padding: "12px",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    position: "relative",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottom: "2px solid #000",
    paddingBottom: "5px",
    marginBottom: "5px",
  },
  title: { fontSize: "20px", fontWeight: "900", color: "#000", lineHeight: 1 },
  subTitle: {
    fontSize: "10px",
    fontWeight: "bold",
    color: "#555",
    marginTop: "2px",
  },
  // 정보 그리드 (2열)
  gridInfo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    fontSize: "11px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
  },
  label: { fontSize: "9px", color: "#666", fontWeight: "bold" },
  value: { fontSize: "12px", fontWeight: "700", color: "#000" },
  // LOT 번호 박스
  lotBox: {
    marginTop: "8px",
    border: "2px solid #000",
    padding: "6px",
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
  },
  lotValue: {
    fontSize: "15px",
    fontWeight: "900",
    color: "#000",
    letterSpacing: "1px",
    fontFamily: "monospace",
  },
  // 코드 섹션
  codeSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px dashed #999",
  },
  scanText: {
    fontSize: "8px",
    marginTop: "2px",
    color: "#444",
    fontWeight: "bold",
    textAlign: "center",
  },
  // 버튼 그룹 (새로 추가)
  btnGroup: {
    display: "flex",
    gap: "10px",
  },
  printBtn: {
    flex: 2,
    padding: "12px",
    backgroundColor: "#333", // 인쇄 버튼
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  generateBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#8C85FF", // 생성 버튼
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const BarcodeLabel = () => {
  // 상태 관리 (data prop 대신 내부 state 사용)
  const [labelData, setLabelData] = useState(null);
  const printRef = useRef();

  // 🏭 [로직 이식] 중복 없는 LOT 번호 생성기
  const generateNewLot = () => {
    const now = new Date();

    // 1. 날짜 (6자리)
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const dateCode = `${yy}${mm}${dd}`;

    // 2. 라인/제품 (3자리) - 고정값 또는 선택값
    const lineCode = "A";
    const prodCode = "01";
    const fixedCode = `${lineCode}${prodCode}`; // A01

    // 3. 난수 (4자리) - 중복 방지용
    const uniqueCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    // 최종 LOT 번호
    const fullLotNo = `${dateCode}${fixedCode}${uniqueCode}`;

    // 데이터 갱신
    setLabelData({
      lotNo: fullLotNo,
      dateCode: dateCode,
      partNo: "PNL-24FHD-MED",
      name: "24' Medical Display (AG)",
      line: "Line-A (Clean Room)",
      manager: "Manager.Kim",
    });
  };

  // 초기 로드 시 한 번 생성
  useEffect(() => {
    generateNewLot();
  }, []);

  // 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  if (!labelData) return <div>Loading...</div>;

  // 추적 URL
  const trackingUrl = `http://192.168.0.85:3000/mobile/tracking/${labelData.lotNo}`;

  return (
    <div style={styles.container}>
      {/* 상단 타이틀 */}
      <div
        style={{
          ...styles.title,
          fontSize: "16px",
          fontWeight: "bold",
          color: "#8C85FF",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <FaTag /> 제품 라벨 발행 시스템
      </div>

      {/* 🖨️ 인쇄 영역 (작성자님 디자인 적용) */}
      <div id="printable-label" style={styles.labelArea} ref={printRef}>
        {/* 헤더 */}
        <div style={styles.header}>
          <div>
            <div style={styles.title}>MedisOne</div>
            <div style={styles.subTitle}>Medical Solutions Inc.</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={styles.label}>Production Line</div>
            <div style={{ fontWeight: "bold", fontSize: "11px" }}>
              {labelData.line}
            </div>
          </div>
        </div>

        {/* 정보 그리드 */}
        <div style={styles.gridInfo}>
          <div style={styles.infoItem}>
            <span style={styles.label}>Part No (자재코드)</span>
            <span style={styles.value}>{labelData.partNo}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.label}>Manager (담당자)</span>
            <span style={styles.value}>{labelData.manager}</span>
          </div>
          <div style={{ ...styles.infoItem, gridColumn: "span 2" }}>
            <span style={styles.label}>Description (품명)</span>
            <span style={styles.value}>{labelData.name}</span>
          </div>
        </div>

        {/* LOT 번호 박스 */}
        <div style={styles.lotBox}>
          <div style={styles.label}>LOT NO (Serial)</div>
          <div style={styles.lotValue}>{labelData.lotNo}</div>
        </div>

        {/* 코드 섹션 */}
        <div style={styles.codeSection}>
          {/* 바코드 */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <Barcode
              value={labelData.lotNo}
              format="CODE128"
              width={1.4}
              height={35}
              fontSize={10}
              margin={0}
              displayValue={false}
            />
            <div style={styles.scanText}>SCANNER ONLY</div>
          </div>

          <div
            style={{
              width: "1px",
              height: "40px",
              background: "#ccc",
              margin: "0 10px",
            }}
          ></div>

          {/* QR코드 */}
          <div style={{ textAlign: "center" }}>
            <QRCodeSVG
              value={trackingUrl}
              size={60}
              level={"M"}
              includeMargin={false}
            />
            <div style={styles.scanText}>MOBILE INFO</div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 그룹 */}
      <div style={styles.btnGroup}>
        <button
          onClick={generateNewLot}
          style={styles.generateBtn}
          title="새로운 번호 생성"
        >
          <FaRedo /> 번호 갱신
        </button>
        <button onClick={handlePrint} style={styles.printBtn}>
          <FaPrint /> 라벨 출력
        </button>
      </div>

      {/* 인쇄 전용 CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-label, #printable-label * { visibility: visible; }
          
          #printable-label {
            position: absolute;
            left: 0; top: 0;
            width: 100%; margin: 0;
            border: 1px solid #000;
          }
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          @page { size: auto; margin: 5mm; }
        }
      `}</style>
    </div>
  );
};

export default BarcodeLabel;
