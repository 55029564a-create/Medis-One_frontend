import React, { useRef, useMemo } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { FaPrint, FaTag } from "react-icons/fa";

// 🎨 스타일 정의 (라벨지 사이즈 최적화)
const styles = {
  container: {
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxWidth: "380px", // 일반적인 라벨지 폭
    margin: "0 auto",
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

  // LOT 번호 박스 (가장 중요)
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
    fontFamily: "monospace", // 숫자 가독성 UP
  },

  // 코드 섹션 (바코드 + QR)
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

  // 인쇄 버튼
  printBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "12px",
    backgroundColor: "#8C85FF", // 테마 컬러
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
    transition: "background 0.2s",
  },
};

const ProductLabel = ({ data }) => {
  const printRef = useRef();

  // 1. [핵심] 스마트 ID 자동 생성기 (데이터 없을 시)
  // 규칙: YYMMDD(6) + Line(1) + Product(3) + Seq(4) = 14자리
  const generateSmartId = () => {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const dateStr = `${yy}${mm}${dd}`;
    const lineCode = "A"; // A라인
    const prodCode = "M24"; // Medical 24inch
    const seq = "0042"; // 42번째 생산품

    return `${dateStr}${lineCode}${prodCode}${seq}`;
  };

  // 2. 데이터 병합
  const labelData = useMemo(() => {
    const smartId = generateSmartId();
    return (
      data || {
        partNo: "PNL-24FHD-MED",
        name: "24' Medical Display (AG)",
        line: "Line-A (Clean Room)",
        manager: "Manager.Kim",
        lotNo: smartId, // 예: 260120AM240042
      }
    );
  }, [data]);

  // 3. 모바일 접속 URL (QR코드용)
  // 관리자 스마트폰 -> 사내망 IP 접속 -> 추적 페이지 이동
  const trackingUrl = `http://192.168.0.85:3000/mobile/tracking/${labelData.lotNo}`;

  // 4. 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      {/* 🟦 화면 상단 타이틀 (인쇄 안됨) */}
      <div
        style={{
          marginBottom: "15px",
          fontWeight: "bold",
          color: "#8C85FF",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <FaTag /> 제품 라벨 발행 (Label Preview)
      </div>

      {/* 🖨️ 실제 인쇄될 라벨 영역 (ID: printable-label) */}
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

        {/* LOT 번호 (사람 눈으로 식별용) */}
        <div style={styles.lotBox}>
          <div style={styles.label}>LOT NO (Serial)</div>
          <div style={styles.lotValue}>{labelData.lotNo}</div>
        </div>

        {/* 코드 섹션 (기계 인식용) */}
        <div style={styles.codeSection}>
          {/* 1. 바코드 (1D) -> 스캐너용 */}
          <div style={{ textAlign: "center", flex: 1 }}>
            <Barcode
              value={labelData.lotNo}
              format="CODE128"
              width={1.4} // 폭 조절 (라벨지 넘어가지 않게)
              height={35} // 높이
              fontSize={10}
              margin={0}
              displayValue={false} // 숫자는 위 박스에 크게 적었으니 생략
            />
            <div style={styles.scanText}>SCANNER ONLY</div>
          </div>

          {/* 구분선 */}
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "#ccc",
              margin: "0 10px",
            }}
          ></div>

          {/* 2. QR코드 (2D) -> 모바일용 */}
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
      {/* --- 라벨 영역 끝 --- */}

      {/* 인쇄 버튼 */}
      <button onClick={handlePrint} style={styles.printBtn}>
        <FaPrint /> 라벨 출력하기
      </button>

      {/* 인쇄 전용 CSS (브라우저 인쇄 시 적용) */}
      <style>{`
        @media print {
          body * { visibility: hidden; } /* 전체 숨김 */
          #printable-label, #printable-label * { visibility: visible; } /* 라벨만 보임 */
          
          #printable-label {
            position: absolute;
            left: 0; top: 0;
            width: 100%; margin: 0;
            border: 1px solid #000; /* 인쇄 시 테두리 유지 */
          }
          /* 배경색 및 그래픽 강제 출력 */
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          
          @page { size: auto; margin: 5mm; } /* 여백 최소화 */
        }
      `}</style>
    </div>
  );
};

export default ProductLabel;
