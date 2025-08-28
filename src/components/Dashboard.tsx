import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/ui/glass-card"
import { 
  User, 
  Wallet, 
  Package, 
  Clock, 
  Settings, 
  LogOut,
  Smartphone,
  Globe,
  Gift
} from "lucide-react"

interface UserData {
  is_logged_in: boolean
  phone_number: string | null
  balance: number | null
  balance_expired_at: string | null
  tokens: any
}

interface DashboardProps {
  userData: UserData
  onLogout: () => void
  onViewPackages: () => void
  onViewXutPackages: () => void
  onChangeAccount: () => void
}

export function Dashboard({ 
  userData, 
  onLogout, 
  onViewPackages, 
  onViewXutPackages,
  onChangeAccount 
}: DashboardProps) {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-gradient">
              MyXL Dashboard
            </h1>
            <p className="text-muted-foreground">
              Selamat datang kembali!
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="glass-card border-border/50 hover:bg-destructive/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Keluar
          </Button>
        </div>

        {/* User Info Card */}
        <GlassCard className="mb-6" glow>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{userData.phone_number}</h2>
              <Badge variant="secondary" className="mt-1">
                <Smartphone className="w-3 h-3 mr-1" />
                XL Postpaid
              </Badge>
            </div>
          </div>

          {userData.balance !== null && (
            <div className="flex items-center gap-2 p-3 bg-gradient-secondary rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className="font-bold">
                  Rp {userData.balance?.toLocaleString('id-ID') || '0'}
                </p>
              </div>
              {userData.balance_expired_at && (
                <div className="ml-auto text-right">
                  <p className="text-sm text-muted-foreground">Berlaku hingga</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(userData.balance_expired_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Packages */}
          <GlassCard className="hover:scale-105 transition-transform cursor-pointer" onClick={onViewPackages}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Paket Saya</h3>
              <p className="text-sm text-muted-foreground">
                Lihat semua paket yang aktif
              </p>
            </div>
          </GlassCard>

          {/* XUT Packages */}
          <GlassCard className="hover:scale-105 transition-transform cursor-pointer" onClick={onViewXutPackages}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Paket XUT</h3>
              <p className="text-sm text-muted-foreground">
                Kelola paket unlimited harian
              </p>
            </div>
          </GlassCard>

          {/* Change Account */}
          <GlassCard className="hover:scale-105 transition-transform cursor-pointer" onClick={onChangeAccount}>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Ganti Akun</h3>
              <p className="text-sm text-muted-foreground">
                Login dengan nomor lain
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Info Card */}
        <GlassCard className="mt-8 bg-gradient-secondary">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-medium">MyXL Web Interface</h4>
              <p className="text-sm text-muted-foreground">
                Versi web dari MyXL CLI - Kelola paket XL dengan mudah dari browser
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}