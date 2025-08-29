import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, ArrowRight, Shield, ArrowLeft } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

interface LoginFormProps {
  onLogin: (phoneNumber: string, otp?: string) => void
  isLoading?: boolean
}

export function LoginForm({ onLogin, isLoading = false }: LoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<'phone' | 'otp'>('phone')

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.trim()) {
      // Convert to 628 format if starts with 08
      let formattedPhone = phoneNumber.trim()
      if (formattedPhone.startsWith('08')) {
        formattedPhone = '628' + formattedPhone.substring(2)
      }
      setPhoneNumber(formattedPhone)
      onLogin(formattedPhone) // This will request OTP
      setStep('otp')
    }
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.trim()) {
      onLogin(phoneNumber, otp.trim()) // This will submit OTP
    }
  }

  const handleBack = () => {
    setStep('phone')
    setOtp('')
  }

  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 animate-float">
              <Shield className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">
              Masukkan Kode OTP
            </h1>
            <p className="text-muted-foreground mt-2">
              Kode OTP telah dikirim ke {phoneNumber}
            </p>
          </div>

          <GlassCard glow>
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Kode OTP
                </label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground text-center">
                  Masukkan 6 digit kode OTP
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 glow-effect group"
                  disabled={otp.length !== 6 || isLoading}
                >
                  {isLoading ? (
                    "Memverifikasi..."
                  ) : (
                    <>
                      Verifikasi OTP
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <Button 
                  type="button"
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full"
                  disabled={isLoading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </div>
            </form>
          </GlassCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 animate-float">
            <Phone className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">
            Login ke Akun XL
          </h1>
          <p className="text-muted-foreground mt-2">
            Masukkan nomor HP XL Anda
          </p>
        </div>

        <GlassCard glow>
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Nomor HP
              </label>
              <Input
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: 08xxxxxxxxxx (tanpa +62)
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 glow-effect group"
              disabled={!phoneNumber.trim() || isLoading}
            >
              {isLoading ? (
                "Mengirim OTP..."
              ) : (
                <>
                  Kirim OTP
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}