import jwtAxios from "../utils/jwtUtil";
import client from "./client";

const host = "http://localhost:8111/api";

// --- [공정 마스터 관리] ---

// 공정 목록 조회
export const getProcesses = async () => {
  const response = await client.get("/production/processes");
  return response.data;
};

// 공정 등록
export const createProcess = async (data) => {
  const response = await client.post("/production/processes", data);
  return response.data;
};

// 공정 수정
export const updateProcess = async (id, data) => {
  const response = await client.put(`/production/processes/${id}`, data);
  return response.data;
};

// 공정 삭제
export const deleteProcess = async (id) => {
  const response = await client.delete(`/production/processes/${id}`);
  return response.data;
};

// --- [생산 지시 관리] ---

// 목록 조회
export const getOrders = async () => {
  const response = await client.get("/product-orders");
  return response.data;
};

// 지시 생성
export const createOrder = async (orderData) => {
  const response = await client.post("/product-orders", orderData);
  return response.data;
};

// 지시 수정
export const updateOrder = async (id, orderData) => {
  const response = await client.put(`/product-orders${id}`, orderData);
  return response.data;
};

// 지시 삭제
export const deleteOrder = async (id) => {
  const response = await client.delete(`/product-orders${id}`);
  return response.data;
};

// --- [라인 모니터링] ---
// 실제 API 호출로 변경
export const getLineStatus = async () => {
  const response = await client.get("/production/lines/status");
  return response.data;
};

export const getEquipmentList = async () => {
  const res = await jwtAxios.get(`${host}/production/equipment/list`);
  return res.data;
};
