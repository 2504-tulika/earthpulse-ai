import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

export const getWeather = (city) => api.get(`/api/v1/weather/${city}`)
export const getAQI = (city) => api.get(`/api/v1/aqi/${city}`)
export const getCitySummary = (city) => api.get(`/api/v1/city/${city}`)