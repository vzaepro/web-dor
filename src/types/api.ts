export interface UserData {
  is_logged_in: boolean
  phone_number: string | null
  balance: number | null
  balance_expired_at: string | null
  tokens: any
}

export interface Package {
  id: string
  name: string
  price: number
  quota: string
  validity: string
  description?: string
  type: 'data' | 'voice' | 'sms' | 'combo'
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}