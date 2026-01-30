import client from "./client";

// 1. 자재 정보 조회 (QR/바코드)
export const getMaterialInfo = async (lotId) => {
  try {
    const response = await client.get(`/material/${lotId}`);
    return response.data;
  } catch (error) {
    console.error("자재 정보 조회 실패:", error);
    throw error;
  }
};

// 2. 입출고 등록
export const registerMaterialInOut = async (data) => {
  // data.type에 따라 /material/inbound 또는 /material/outbound로 전송
  const endpoint =
    data.type === "IN" ? "/material/inbound" : "/material/outbound";
  try {
    const response = await client.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("입출고 등록 실패:", error);
    throw error;
  }
};

// 3. 전체 이력 조회
export const getMaterialHistory = async (keyword) => {
  try {
    const response = await client.get("/material/find-history", {
      params: { keyword: keyword },
    });
    return response.data;
  } catch (error) {
    console.error("이력 조회 실패:", error);
    return [];
  }
};

// 4. 최근 내역 조회 (입출고 페이지 하단용)
export const getRecentHistory = async () => {
  return await getMaterialHistory(null);
};

// 5. [추가] 사원 목록 조회 (담당자 선택용)
export const getEmployeeList = async () => {
  try {
    const response = await client.get("/employee"); // 백엔드 엔드포인트 확인 필요
    return response.data;
  } catch (error) {
    console.error("사원 목록 조회 실패:", error);
    return [];
  }
};
