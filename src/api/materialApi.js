import jwtAxios from "../utils/jwtUtil";

const host = "http://localhost:8111/api/material";

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

// 내역 조회
export const getRecentHistory = async (keyword = "") => {
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

// 바코드 정보 조회 (단순 존재 여부 확인용 List<String>)
export const getMaterialInfo = async (lotNumber) => {
  const res = await jwtAxios.get(`${host}/info/${lotNumber}`);
  return res.data;
};

// ==========================================
// 2. [에러 해결용] 구버전 함수 이름 호환성 연결
// (MaterialHistory.js, MaterialInout.js가 찾는 이름들)
// ==========================================

// 'getMaterialHistory'를 찾으면 -> 'getRecentHistory'를 실행해라
export const getMaterialHistory = getRecentHistory;

// 'registerMaterialInOut'을 찾으면 -> 타입 보고 입고/출고 나눠서 실행해라
export const registerMaterialInOut = async (data) => {
  // data.type이 "IN" 이거나 "INBOUND"면 입고, 아니면 출고
  if (data.type === "IN" || data.type === "INBOUND") {
    return inboundMaterial({ ...data, type: "INBOUND" });
  } else {
    return outboundMaterial({ ...data, type: "PRODUCTION_IN" });
  }
};
