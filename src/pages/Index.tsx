import { useState, useEffect } from "react"
import { ApiKeyForm } from "@/components/ApiKeyForm"
import { LoginForm } from "@/components/LoginForm"
import { Dashboard } from "@/components/Dashboard"
import { apiService } from "@/services/api"
import { UserData } from "@/types/api"
import { useToast } from "@/hooks/use-toast"

type AppState = 'api-key' | 'login' | 'dashboard'

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
    apiService.setApiKey(apiKey)
    
    // Store API key in localStorage for persistence
    localStorage.setItem('myxl_api_key', apiKey)
    
    try {
      const userData = await apiService.loadToken(apiKey)
      if (userData) {
        setUserData(userData)
        if (userData.is_logged_in) {
          setAppState('dashboard')
          toast({
            title: "Berhasil!",
            description: "Login berhasil dengan API key"
          })
        } else {
          setAppState('login')
        }
      } else {
        toast({
          title: "Error",
          description: "API key tidak valid atau terjadi kesalahan",
          variant: "destructive"
        })
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

  const handleLogin = async (phoneNumber: string) => {
    setIsLoading(true)
    try {
      const success = await apiService.login(phoneNumber)
      if (success) {
        setUserData(prev => ({ 
          ...prev, 
          is_logged_in: true, 
          phone_number: phoneNumber 
        }))
        setAppState('dashboard')
        toast({
          title: "Berhasil!",
          description: `Login berhasil dengan nomor ${phoneNumber}`
        })
      } else {
        toast({
          title: "Error",
          description: "Gagal login. Periksa nomor HP Anda",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('myxl_api_key')
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
    toast({
      title: "Coming Soon",
      description: "Fitur lihat paket akan segera hadir"
    })
  }

  const handleViewXutPackages = () => {
    toast({
      title: "Coming Soon", 
      description: "Fitur XUT packages akan segera hadir"
    })
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

  return (
    <Dashboard 
      userData={userData}
      onLogout={handleLogout}
      onViewPackages={handleViewPackages}
      onViewXutPackages={handleViewXutPackages}
      onChangeAccount={handleChangeAccount}
    />
  )
};

export default Index;
