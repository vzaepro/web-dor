import { useState, useEffect } from "react"
import { ApiKeyForm } from "@/components/ApiKeyForm"
import { LoginForm } from "@/components/LoginForm"
import { Dashboard } from "@/components/Dashboard"
import { UserData } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import { requestOtp, submitOtp, getBalance, getProfile, tokenStore } from "@/lib/api"
import Packages from "./Packages"

type AppState = 'api-key' | 'login' | 'dashboard' | 'packages'

const Index = () => {
  const [appState, setAppState] = useState<AppState>('api-key')
  const [userData, setUserData] = useState<UserData>({
    is_logged_in: false,
    phone_number: null,
    balance: null,
    balance_expired_at: null,
    tokens: null
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleApiKeySubmit = async (apiKey: string) => {
    setIsLoading(true)
    
    // Store API key in localStorage for persistence
    localStorage.setItem('myxl_api_key', apiKey)
    
    try {
      // Check if user has existing tokens
      const existingTokens = tokenStore.get()
      if (existingTokens) {
        try {
          // Try to get user data with existing tokens
          const balance = await getBalance()
          const profile = await getProfile()
          
          setUserData({
            is_logged_in: true,
            phone_number: profile.phone_number || null,
            balance: balance.balance || null,
            balance_expired_at: balance.expired_at || null,
            tokens: existingTokens
          })
          setAppState('dashboard')
          toast({
            title: "Berhasil!",
            description: "Login berhasil dengan API key yang tersimpan"
          })
        } catch {
          // Tokens might be expired, go to login
          setAppState('login')
        }
      } else {
        setAppState('login')
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Gagal memvalidasi API key",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (phoneNumber: string, otp?: string) => {
    setIsLoading(true)
    try {
      if (!otp) {
        // Step 1: Request OTP
        await requestOtp(phoneNumber)
        
        toast({
          title: "OTP Terkirim",
          description: "Silakan cek HP Anda untuk kode OTP"
        })
      } else {
        // Step 2: Submit OTP and login
        const tokenData = await submitOtp(phoneNumber, otp)
        
        // Get user data
        const balance = await getBalance()
        const profile = await getProfile()
        
        setUserData({
          is_logged_in: true,
          phone_number: phoneNumber,
          balance: balance.balance || null,
          balance_expired_at: balance.expired_at || null,
          tokens: tokenData
        })
        
        setAppState('dashboard')
        
        toast({
          title: "Berhasil!",
          description: `Login berhasil dengan nomor ${phoneNumber}`
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Terjadi kesalahan saat login",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('myxl_api_key')
    tokenStore.clear()
    setUserData({
      is_logged_in: false,
      phone_number: null,
      balance: null,
      balance_expired_at: null,
      tokens: null
    })
    setAppState('api-key')
    toast({
      title: "Logout",
      description: "Anda telah logout"
    })
  }

  const handleViewPackages = () => {
    setAppState('packages')
  }

  const handleChangeAccount = () => {
    setAppState('login')
  }

  // Check for stored API key on app start
  useEffect(() => {
    const storedApiKey = localStorage.getItem('myxl_api_key')
    if (storedApiKey) {
      handleApiKeySubmit(storedApiKey)
    }
  }, [])

  if (appState === 'api-key') {
    return <ApiKeyForm onApiKeySubmit={handleApiKeySubmit} />
  }

  if (appState === 'login') {
    return <LoginForm onLogin={handleLogin} isLoading={isLoading} />
  }

  if (appState === 'packages') {
    return <Packages onBack={() => setAppState('dashboard')} />
  }

  return (
    <Dashboard 
      userData={userData}
      onLogout={handleLogout}
      onViewPackages={handleViewPackages}
      onViewXutPackages={handleViewPackages}
      onChangeAccount={handleChangeAccount}
    />
  )
};

export default Index;
