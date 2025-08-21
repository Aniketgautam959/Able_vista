import axios, { AxiosError } from "axios"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL as string | undefined
const api = axios.create({
  baseURL: BASE_URL || "",
  withCredentials: true,
})

// Define types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  // add other fields if your API requires them
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

/**
 * Login user
 */
export async function loginUser(
  credentials: LoginCredentials
): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>(
      `/api/auth/login`,
      credentials
    )
    return response.data
  } catch (err: unknown) {
    console.error("Login failed:", err)
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Login request failed"
      )
    }
    throw new Error("Unexpected error occurred during login")
  }
}

/**
 * Register user
 */
export async function registerUser(
  userData: RegisterData
): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>(
      `/api/auth/register`,
      userData
    )
    return response.data
  } catch (err: unknown) {
    console.error("Registration failed:", err)
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Registration request failed"
      )
    }
    throw new Error("Unexpected error occurred during registration")
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<ApiResponse> {
  try {
    const response = await api.post<ApiResponse>(
      `/api/auth/logout`,
      {}
    )
    return response.data
  } catch (err: unknown) {
    console.error("Logout failed:", err)
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.message || "Logout request failed"
      )
    }
    throw new Error("Unexpected error occurred during logout")
  }
}
