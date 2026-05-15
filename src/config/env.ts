type AppConfig = {
  apiUrl: string
  isDev: boolean
  isProd: boolean
}

export const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://airbnb-kirenga-final.onrender.com/api/v1',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}