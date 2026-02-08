import client from "./client";

export const getProductList = async () => {
  const response = await client.get("/bom/products");
  return response.data;
};

export const getKitDetail = async (productId) => {
  const response = await client.get(`/bom/kits/${productId}`);
  return response.data;
};

export const saveBom = async (data) => {
  const response = await client.post("/bom/kits", data);
  return response.data;
};

export const getReverseBom = async (materialId) => {
  const response = await client.get(`/bom/reverse/${materialId}`);
  return response.data;
};

export const getBomHistory = async (productId) => {
  const response = await client.get(`/bom/history/${productId}`);
  return response.data;
};

// [신규] BOM 삭제
export const deleteBom = async (productId) => {
  const response = await client.delete(`/bom/kits/${productId}`);
  return response.data;
};

// [신규] 자재 목록 조회
export const getAllMaterials = async () => {
  const response = await client.get("/bom/materials");
  return response.data;
};
