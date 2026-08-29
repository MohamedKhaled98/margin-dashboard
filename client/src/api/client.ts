import axios, { AxiosError } from 'axios'

type ServerErrorBody = {
  success: false
  message: string
  data: null
}

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ServerErrorBody>) => {
    const message =
      error.response?.data?.message ??
      (error.code === 'ERR_NETWORK'
        ? 'Cannot reach the server. Is it running on http://localhost:2000?'
        : error.message)

    return Promise.reject(new ApiError(message, error.response?.status))
  }
)
