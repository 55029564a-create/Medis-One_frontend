import client from "./client";

// ==========================================================
// 🏭 자재 관리 통합 API
// ==========================================================

/**
 * 1. [스캔] 자재 정보 조회 (QR/바코드 스캔 시)
 * - 사용처: MaterialInout.js
 */
export const getMaterialInfo = async (lotId) => {
  try {
    const response = await client.get(`/material/${lotId}`);
    return response.data;
  } catch (error) {
    console.error("자재 정보 조회 실패:", error);
    throw error;
  }
};

/**
 * 2. [등록] 입고 및 출고 등록 (수량 입력 후 저장)
 * - 사용처: MaterialInout.js
 */
export const registerMaterialInOut = async (data) => {
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

/**
 * 3. [전체 이력] 자재 입출고 이력 조회 (검색 기능 포함)
 * - 사용처: MaterialHistory.js (여기가 에러난 부분!)
 */
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

/**
 * 4. [최근 내역] 입출고 페이지 하단용 간단 내역
 * - 사용처: MaterialInout.js (하단 리스트)
 * - 그냥 getMaterialHistory를 재사용하되 키워드 없이 호출
 */
export const getRecentHistory = async () => {
  return await getMaterialHistory(null);
};
