import React, { useState, useEffect } from "react";
import {
  FaLayerGroup,
  FaScrewdriver,
  FaTint,
  FaBarcode,
  FaCheckCircle,
  FaArrowRight,
  FaUndo,
  FaClipboardCheck
} from "react-icons/fa";

// 🎨 MedisOne 테마
const COLORS = {
  primary: "#8C85FF",
  secondary: "#F3F1FF",
  bg: "#F5F6FA",
  text: "#333",
  white: "#FFFFFF",
  success: "#00C851",
  warning: "#FFBB33",
  border: "#E0E0E0",
  stepInactive: "#E0E0E0",
  stepActive: "#8C85FF",
  stepDone: "#00C851"
};

const ProcessAssembly = () => {
  // --- 상태 관리 ---
  const [currentStep, setCurrentStep] = useState(0); 
  const [workTime, setWorkTime] = useState(0); 
  const [isWorking, setIsWorking] = useState(false);
  const [completedCount, setCompletedCount] = useState(142); 

  const [inputs, setInputs] = useState({
    bluSerial: "",
    screwTorque: "",
    sealCheck: false
  });

  const STEPS = [
    { id: "STEP_01", title: "BLU Assembly", desc: "백라이트 유닛 장착 및 FPCB 연결", icon: <FaLayerGroup /> },
    { id: "STEP_02", title: "Housing & Screw", desc: "베젤 조립 및 스크류 체결 (4 point)", icon: <FaScrewdriver /> },
    { id: "STEP_03", title: "Sealing & Finish", desc: "방수 실링 도포 및 외관 검사", icon: <FaTint /> }
  ];

  useEffect(() => {
    let timer;
    if (isWorking) {
      timer = setInterval(() => setWorkTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isWorking]);

  const handleStartWork = () => {
    setIsWorking(true);
    setWorkTime(0);
    setInputs({ bluSerial: "", screwTorque: "", sealCheck: false });
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinishCycle();
    }
  };

  const handleFinishCycle = () => {
    setIsWorking(false);
    setCompletedCount(prev => prev + 1);
    alert(`[생산완료] 제품 조립이 정상적으로 완료되었습니다.\n소요시간: ${workTime}초`);
    setCurrentStep(0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div style={styles.container}>
      
      {/* 1. 상단 정보 바 */}
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.pageTitle}>🛠️ 조립 공정 (Assembly Process)</h2>
          <p style={styles.subTitle}>WO-260121-01 | 24인치 의료용 모니터 (Standard)</p>
        </div>
        <div style={styles.statsBox}>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Target</span>
            <span style={styles.statValue}>500</span>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Actual</span>
            <span style={{...styles.statValue, color: COLORS.success}}>{completedCount}</span>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.statItem}>
            <span style={styles.statLabel}>Cycle Time</span>
            <span style={{...styles.statValue, color: COLORS.primary}}>{formatTime(workTime)}</span>
          </div>
        </div>
      </div>

      {/* 2. 메인 작업 영역 */}
      <div style={styles.workspace}>
        
        {/* [좌측] 공정 스텝 표시기 */}
        <div style={styles.stepperCol}>
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isDone = index < currentStep;
            
            return (
              <div key={step.id} style={styles.stepItem}>
                <div style={styles.stepLine}>
                  {index !== STEPS.length - 1 && <div style={{
                    ...styles.lineBar,
                    backgroundColor: isDone ? COLORS.stepDone : COLORS.stepInactive
                  }}></div>}
                </div>
                <div style={{
                  ...styles.stepCircle,
                  backgroundColor: isActive ? COLORS.primary : (isDone ? COLORS.stepDone : COLORS.white),
                  color: isActive || isDone ? 'white' : '#999',
                  border: isActive || isDone ? 'none' : `2px solid ${COLORS.stepInactive}`
                }}>
                  {isDone ? <FaCheckCircle /> : index + 1}
                </div>
                <div style={{opacity: isActive ? 1 : 0.5}}>
                  <div style={styles.stepTitle}>{step.title}</div>
                  <div style={styles.stepDesc}>{step.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* [중앙] 작업 인터페이스 */}
        <div style={styles.actionCol}>
          <div style={styles.actionCard}>
            
            {!isWorking ? (
              <div style={styles.idleState}>
                <div style={styles.iconBig}><FaClipboardCheck /></div>
                <h3>Ready for Assembly</h3>
                <p>작업 준비가 완료되었습니다. 시작 버튼을 눌러주세요.</p>
                <button style={styles.startBtn} onClick={handleStartWork}>
                  작업 시작 (Start Cycle)
                </button>
              </div>
            ) : (
              <div style={styles.workingState}>
                <div style={styles.stepHeader}>
                  <div style={styles.stepIconBox}>{STEPS[currentStep].icon}</div>
                  <div>
                    <h3 style={styles.currentStepTitle}>{STEPS[currentStep].title}</h3>
                    <p style={styles.currentStepDesc}>{STEPS[currentStep].desc}</p>
                  </div>
                </div>

                {/* 입력 폼 영역 */}
                {currentStep === 0 && (
                  <div style={styles.inputArea}>
                    <label style={styles.label}>BLU Serial No. (Scan)</label>
                    <div style={styles.inputWrapper}>
                      <FaBarcode color="#666" />
                      <input 
                        style={styles.input} 
                        placeholder="바코드를 스캔하세요..." 
                        autoFocus
                        value={inputs.bluSerial}
                        onChange={(e) => setInputs({...inputs, bluSerial: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div style={styles.inputArea}>
                    <label style={styles.label}>Electric Driver Torque (cNm)</label>
                    <div style={styles.inputWrapper}>
                      <FaScrewdriver color="#666" />
                      <input 
                        type="number"
                        style={styles.input} 
                        placeholder="토크값 입력 (표준: 4.5)" 
                        value={inputs.screwTorque}
                        onChange={(e) => setInputs({...inputs, screwTorque: e.target.value})}
                      />
                    </div>
                    <div style={styles.helperText}>* 4개 포인트 체결 확인 필수</div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div style={styles.inputArea}>
                    <label style={styles.label}>Visual Inspection</label>
                    <div 
                      style={{...styles.checkboxBox, borderColor: inputs.sealCheck ? COLORS.success : '#ddd'}}
                      onClick={() => setInputs({...inputs, sealCheck: !inputs.sealCheck})}
                    >
                      <div style={{
                        ...styles.checkBoxCircle,
                        backgroundColor: inputs.sealCheck ? COLORS.success : '#eee'
                      }}>
                        {inputs.sealCheck && <FaCheckCircle color="white"/>}
                      </div>
                      <span>실링 도포 상태 양호 및 이물 없음 확인</span>
                    </div>
                  </div>
                )}

                <div style={styles.controlRow}>
                  <button style={styles.resetBtn} onClick={() => setIsWorking(false)}>
                    <FaUndo /> 초기화
                  </button>
                  <button style={styles.nextBtn} onClick={handleNext}>
                    {currentStep === 2 ? "작업 완료 (Finish)" : "다음 단계 (Next)"} <FaArrowRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* [우측] 작업 가이드 */}
        <div style={styles.guideCol}>
           <div style={styles.guideCard}>
             <h4 style={styles.guideTitle}>📋 Work Instruction</h4>
             <div style={styles.guideImageArea}>
               {currentStep === 0 && <div style={styles.placeholderImg}>[Image: BLU Assembly Guide]<br/>FPCB 커넥터 파손 주의</div>}
               {currentStep === 1 && <div style={styles.placeholderImg}>[Image: Screw Point Guide]<br/>순서: 좌상 -> 우하 -> 우상 -> 좌하</div>}
               {currentStep === 2 && <div style={styles.placeholderImg}>[Image: Sealing Path]<br/>끊김 없이 도포 확인</div>}
               {!isWorking && <div style={styles.placeholderImg}>대기중...</div>}
             </div>
             <div style={styles.safetyBox}>
               <strong>⚠️ 안전 수칙</strong><br/>
               정전기 방지 밴드 착용 필수
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

// --- 스타일 정의 (수정됨: boxSizing 추가) ---
const styles = {
  container: { 
    padding: "30px", 
    backgroundColor: COLORS.bg, 
    minHeight: "100%",
    boxSizing: "border-box", // [중요] 전체 패딩 포함 계산
  },
  
  // 상단 바
  topBar: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "white", padding: "20px 30px", borderRadius: "12px",
    marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
  },
  pageTitle: { fontSize: "22px", fontWeight: "bold", margin: 0, color: COLORS.text },
  subTitle: { fontSize: "14px", color: "#666", marginTop: "5px" },
  statsBox: { display: "flex", alignItems: "center", gap: "20px" },
  statItem: { textAlign: "center" },
  statLabel: { fontSize: "12px", color: "#888", display: "block", marginBottom: "2px" },
  statValue: { fontSize: "24px", fontWeight: "bold", color: "#333" },
  divider: { width: "1px", height: "30px", backgroundColor: "#eee" },

  // 메인 워크스페이스
  workspace: { display: "flex", gap: "20px", height: "600px" },
  
  // 좌측 스텝퍼
  stepperCol: { width: "250px", display: "flex", flexDirection: "column", gap: "0" },
  stepItem: { display: "flex", gap: "15px", position: "relative", paddingBottom: "40px" },
  stepLine: { position: "absolute", left: "20px", top: "40px", bottom: "0", width: "2px", display: "flex", justifyContent: "center" },
  lineBar: { width: "2px", height: "100%" },
  stepCircle: {
    width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "bold", fontSize: "16px", zIndex: 1
  },
  stepTitle: { fontWeight: "bold", fontSize: "15px", color: "#333", marginTop: "5px" },
  stepDesc: { fontSize: "12px", color: "#888", lineHeight: "1.4" },

  // 중앙 작업 영역
  actionCol: { flex: 1, minWidth: "400px" },
  actionCard: {
    backgroundColor: "white", borderRadius: "16px", padding: "40px", height: "100%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "center",
    boxSizing: "border-box" // [중요] 패딩 포함 계산
  },
  
  idleState: { textAlign: "center" },
  iconBig: { fontSize: "60px", color: COLORS.primary, marginBottom: "20px" },
  startBtn: {
    backgroundColor: COLORS.primary, color: "white", fontSize: "18px", fontWeight: "bold",
    padding: "15px 40px", borderRadius: "30px", border: "none", cursor: "pointer",
    marginTop: "20px", boxShadow: "0 4px 15px rgba(140, 133, 255, 0.4)"
  },

  workingState: { display: "flex", flexDirection: "column", height: "100%" },
  stepHeader: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "40px", borderBottom: "1px solid #eee", paddingBottom: "20px" },
  stepIconBox: {
    width: "60px", height: "60px", backgroundColor: "#F3F1FF", borderRadius: "12px",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", color: COLORS.primary
  },
  currentStepTitle: { fontSize: "24px", fontWeight: "bold", margin: 0, color: "#333" },
  currentStepDesc: { fontSize: "14px", color: "#666", marginTop: "5px" },

  inputArea: { flex: 1 },
  label: { fontSize: "14px", fontWeight: "bold", color: "#555", marginBottom: "8px", display: "block" },
  inputWrapper: {
    display: "flex", alignItems: "center", backgroundColor: "#F5F6FA",
    border: "2px solid #E0E0E0", borderRadius: "12px", padding: "15px 20px",
    fontSize: "20px"
  },
  input: { border: "none", background: "transparent", outline: "none", marginLeft: "15px", width: "100%", fontSize: "20px", fontWeight: "bold" },
  helperText: { fontSize: "13px", color: COLORS.warning, marginTop: "8px", fontWeight: "bold" },

  checkboxBox: {
    display: "flex", alignItems: "center", gap: "15px", padding: "20px",
    border: "2px solid #ddd", borderRadius: "12px", cursor: "pointer", backgroundColor: "#FAFAFA"
  },
  checkBoxCircle: {
    width: "24px", height: "24px", borderRadius: "50%", border: "1px solid #ddd",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px"
  },

  controlRow: { display: "flex", gap: "15px", marginTop: "auto" },
  resetBtn: {
    padding: "15px 25px", border: "1px solid #ddd", backgroundColor: "white",
    borderRadius: "12px", cursor: "pointer", fontSize: "16px", color: "#666", display: "flex", alignItems: "center", gap: "8px"
  },
  nextBtn: {
    flex: 1, padding: "15px", backgroundColor: COLORS.primary, color: "white",
    border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "18px", fontWeight: "bold",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
    boxShadow: "0 4px 12px rgba(140, 133, 255, 0.3)"
  },

  // 우측 가이드
  guideCol: { width: "300px" },
  guideCard: {
    backgroundColor: "white", borderRadius: "16px", padding: "20px", height: "100%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column",
    boxSizing: "border-box" // [중요] 패딩 포함 계산
  },
  guideTitle: { fontSize: "16px", fontWeight: "bold", marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" },
  guideImageArea: {
    flex: 1, backgroundColor: "#F0F0F0", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: "20px", textAlign: "center", color: "#888", fontSize: "13px", padding: "20px"
  },
  placeholderImg: { lineHeight: "1.6" },
  safetyBox: {
    backgroundColor: "#FFF8E1", padding: "15px", borderRadius: "8px",
    fontSize: "13px", color: "#5D4037", border: "1px solid #FFECB3"
  }
};

export default ProcessAssembly;