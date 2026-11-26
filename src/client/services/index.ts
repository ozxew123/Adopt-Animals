import { ApiClient, ApiError } from "./ApiClient";
import { AuthApiService } from "./AuthApiService";
import { KatalogApiService } from "./KatalogApiService";
import { PengajuanApiService } from "./PengajuanApiService";
import { AdminApiService } from "./AdminApiService";

export { ApiClient, ApiError };
export const apiClient = new ApiClient();
export const authApi = new AuthApiService(apiClient);
export const katalogApi = new KatalogApiService(apiClient);
export const pengajuanApi = new PengajuanApiService(apiClient);
export const adminApi = new AdminApiService(apiClient);
