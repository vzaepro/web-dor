import { UserData, ApiResponse } from "@/types/api"

class ApiService {
  private baseUrl = "https://api.example.com" // Replace with actual API endpoint
  private apiKey = ""

  setApiKey(key: string) {
    this.apiKey = key
  }

  async loadToken(apiKey: string): Promise<UserData | null> {
    try {
      // Check if it's a UUID format (simple validation)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      
      if (uuidRegex.test(apiKey)) {
        // Simulate successful response for UUID
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate network delay
        
        return {
          is_logged_in: false,
          phone_number: null,
          balance: null,
          balance_expired_at: null,
          tokens: null
        }
      }

      // For non-UUID keys, try actual API call
      const response = await fetch(`${this.baseUrl}/load-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to load token')
      }

      const data = await response.json()
      return data as UserData
    } catch (error) {
      console.error('Error loading token:', error)
      return null
    }
  }

  async login(phoneNumber: string): Promise<boolean> {
    try {
      // Check if using UUID (demo mode)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      
      if (uuidRegex.test(this.apiKey)) {
        // Simulate successful login for demo
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate network delay
        return true
      }

      // For non-UUID keys, try actual API call
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ phone_number: phoneNumber })
      })

      return response.ok
    } catch (error) {
      console.error('Error during login:', error)
      return false
    }
  }

  async getMyPackages(tokens: any): Promise<any[]> {
    try {
      // Simulate API call - replace with actual implementation
      const response = await fetch(`${this.baseUrl}/my-packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch packages')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching packages:', error)
      return []
    }
  }

  async getXutPackages(tokens: any): Promise<any[]> {
    try {
      // Simulate API call - replace with actual implementation
      const response = await fetch(`${this.baseUrl}/xut-packages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch XUT packages')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching XUT packages:', error)
      return []
    }
  }
}

export const apiService = new ApiService()