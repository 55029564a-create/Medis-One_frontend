import client from "./client";

// ==========================================
// 1. 기본 API 함수들 (기존 유지)
// ==========================================

// 입고 등록
export const inboundMaterial = async (data) => {
  const res = await client.post("/material/inbound", data);
  return res.data;
};

// 출고 등록
export const outboundMaterial = async (data) => {
  const res = await client.post("/material/outbound", data);
  return res.data;
};

// 내역 조회 (기본)
export const getRecentHistory = async (keyword = "") => {
  const res = await client.get("/material/find-history", {
    params: { keyword: keyword },
  });
  return res.data;
};

// 통계 조회
export const getTodayStats = async () => {
  const res = await client.get("/material/today-stats");
  return res.data;
};

// 사원 목록
export const getEmployeeList = async () => {
  const res = await client.get("/material/employees");
  return res.data;
};

// 바코드 정보 조회
export const getMaterialInfo = async (lotNumber) => {
  const res = await client.get(`/material/info/${lotNumber}`);
  return res.data;
};

// 업체 목록 조회
export const getVendorList = async () => {
  try {
    const response = await client.get("/material/companies");
    return response.data;
  } catch (error) {
    console.error("업체 목록 조회 실패:", error);
    return [];
  }
};

// ==========================================
// 2. [모바일 호환성 해결] 주소 자동 감지 함수
// ==========================================

// 🚀 핵심 수정 부분: 모바일 조회용 함수 재정의
export const getMaterialHistory = async (keyword) => {
  // 1. 현재 브라우저의 주소(IP)를 알아냅니다. (예: 192.168.0.85 또는 localhost)
  const hostname = window.location.hostname;
  const backendPort = "8111"; // 백엔드 포트 번호

  // 2. client에 설정된 localhost를 무시하고, 현재 접속한 IP로 주소를 새로 만듭니다.
  const dynamicBaseURL = `http://${hostname}:${backendPort}/api`;

  // 3. baseURL 옵션을 덮어씌워서 요청을 보냅니다.
  const res = await client.get("/material/find-history", {
    baseURL: dynamicBaseURL, // 이 옵션이 기존 client 설정을 이깁니다.
    params: { keyword: keyword },
  });

  return res.data;
};

export const registerMaterialInOut = async (data) => {
  // 위에서 만든 inboundMaterial / outboundMaterial 함수를 재사용합니다.
  if (data.type === "IN" || data.type === "INBOUND") {
    return inboundMaterial({ ...data, type: "INBOUND" });
  } else {
    return outboundMaterial({ ...data, type: "PRODUCTION_IN" });
  }
};
