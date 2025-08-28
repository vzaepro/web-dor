import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Key, Sparkles } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"

interface ApiKeyFormProps {
  onApiKeySubmit: (apiKey: string) => void
}

export function ApiKeyForm({ onApiKeySubmit }: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      onApiKeySubmit(apiKey.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-gradient">
            MyXL Web
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola paket XL dengan mudah dari browser
          </p>
        </div>

        <GlassCard glow>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Key
              </label>
              <Input
                type="text"
                placeholder="Masukkan API key Anda"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                required
              />
              <p className="text-xs text-muted-foreground">
                Dapatkan API key dari{" "}
                <a 
                  href="https://t.me/fykxt_bot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-glow transition-colors"
                >
                  @fykxt_bot
                </a>{" "}
                dengan pesan <code className="bg-muted px-1 rounded">/viewkey</code>
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-all duration-300 glow-effect"
              disabled={!apiKey.trim()}
            >
              Mulai
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}