import client from "./client";

export const getDashboardData = async () => {
  const response = await client.get("/dashboard");
  return response.data;
};
