import client from "./client";

// ==========================================
// 1. [상위] 생산 계획 (ProductOrder) API
// URL: http://localhost:8111/api/product-orders
// ==========================================

// 생산 계획 목록 조회
export const getProductOrders = async () => {
  const response = await client.get("/product-orders");
  return response.data;
};

// 생산 계획 등록
export const createProductOrder = async (data) => {
  const response = await client.post("/product-orders", data);
  return response.data;
};

// 생산 계획 수정
export const updateProductOrder = async (id, data) => {
  const response = await client.put(`/product-orders/${id}`, data);
  return response.data;
};

// 생산 계획 삭제
export const deleteProductOrder = async (id) => {
  const response = await client.delete(`/product-orders/${id}`);
  return response.data;
};

// src/api/productionApi.js 에 추가
export const getProducts = async () => {
  const response = await client.get("/production"); // 혹은 /production/products 등 백엔드 주소에 맞게
  return response.data;
};

// ==========================================
// 2. [하위] 작업 지시 (WorkOrder) API
// URL: http://localhost:8111/api/production
// ==========================================

// 작업 지시 목록 조회
export const getWorkOrders = async () => {
  const response = await client.get("/production/orders");
  return response.data;
};

// 작업 지시 생성
export const createWorkOrder = async (data) => {
  // data에 lineId, productOrderId 등이 포함됨
  const response = await client.post("/production/orders", data);
  return response.data;
};

// 작업 지시 수정
export const updateWorkOrder = async (id, data) => {
  const response = await client.put(`/production/orders/${id}`, data);
  return response.data;
};

// 작업 지시 삭제
export const deleteWorkOrder = async (id) => {
  const response = await client.delete(`/production/orders/${id}`);
  return response.data;
};

// [신규 추가] 작업 실적 보고 전송
export const reportWorkResult = async (id, data) => {
  const response = await client.post(
    `/production/work-orders/${id}/report`,
    data,
  );
  return response.data;
};

// [중요] 라인 목록 조회 (공정 대신 사용)
export const getLines = async () => {
  const response = await client.get("/production/lines");
  return response.data;
};

// 라인 현황 조회 (모니터링용)
export const getLineStatus = async () => {
  const response = await client.get("/production/lines/status");
  return response.data;
};

// 설비 목록 조회
export const getEquipmentList = async () => {
  const response = await client.get("/production/equipment/list");
  return response.data;
};

// ==========================================
// [신규 추가] 생산 지시서 (ProductionSchedule) 조회
// URL: http://localhost:8111/api/production/plans
// ==========================================
export const getProductionPlans = async () => {
  const response = await client.get("/production/plans");
  return response.data;
};

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

// [신규 추가] 금일 작업 지시 조회
export const getTodayWorkOrders = async () => {
  const response = await client.get("/production/work-orders/today");
  return response.data;
};

// [신규 추가] 월간 작업 지시 조회
export const getMonthlyWorkOrders = async () => {
  const response = await client.get("/production/work-orders/monthly");
  return response.data;
};
