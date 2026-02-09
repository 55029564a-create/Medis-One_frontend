import jwtAxios from "../utils/jwtUtil";

// 🛑 [수정 완료] localhost -> 192.168.0.85 (내 PC IP)로 변경 필수!
const host = "http://192.168.0.85:8111/api/material";

// ==========================================
// 1. 신규 API 함수들 (컨트롤러와 1:1 매칭)
// ==========================================

// 입고 등록
export const inboundMaterial = async (data) => {
  const res = await jwtAxios.post(`${host}/inbound`, data);
  return res.data;
};

// 출고 등록
export const outboundMaterial = async (data) => {
  const res = await jwtAxios.post(`${host}/outbound`, data);
  return res.data;
};

// 내역 조회 (검색어 포함)
export const getRecentHistory = async (keyword = "") => {
  // host에 이미 IP가 박혀있으므로 핸드폰에서도 PC로 잘 찾아갑니다.
  const res = await jwtAxios.get(`${host}/find-history`, {
    params: { keyword: keyword },
  });
  return res.data;
};

// 통계 조회
export const getTodayStats = async () => {
  const res = await jwtAxios.get(`${host}/today-stats`);
  return res.data;
};

// 사원 목록
export const getEmployeeList = async () => {
  const res = await jwtAxios.get(`${host}/employees`);
  return res.data;
};

// 바코드 정보 조회
export const getMaterialInfo = async (lotNumber) => {
  const res = await jwtAxios.get(`${host}/info/${lotNumber}`);
  return res.data;
};

// ==========================================
// 2. [에러 해결용] 구버전 함수 이름 호환성 연결
// ==========================================

export const getMaterialHistory = getRecentHistory;

export const registerMaterialInOut = async (data) => {
  if (data.type === "IN" || data.type === "INBOUND") {
    return inboundMaterial({ ...data, type: "INBOUND" });
  } else {
    return outboundMaterial({ ...data, type: "PRODUCTION_IN" });
  }
};

export const getVendorList = async () => {
  try {
    const response = await jwtAxios.get(`${host}/companies`);
    return response.data;
  } catch (error) {
    console.error("업체 목록 조회 실패:", error);
    return [];
  }
};
