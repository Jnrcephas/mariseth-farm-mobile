import { userStore } from "@/stores/userstore";
import { create } from "apisauce";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = create({
  baseURL: API_URL,
  timeout: 40000,
  headers: {},
});

apiClient.addAsyncRequestTransform(async (request: any) => {
  const { user } = userStore.getState();
  if (!user?.access_token) return;
  request.headers["Authorization"] = `Bearer ${user?.access_token}`;
});
export default apiClient;
