import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, ArrowRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

interface LoginFormProps {
  onLogin: (phoneNumber: string) => void
  isLoading?: boolean
}

export function LoginForm({ onLogin, isLoading = false }: LoginFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.trim()) {
      onLogin(phoneNumber.trim())
    }
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                "Memproses..."
              ) : (
                <>
                  Login
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