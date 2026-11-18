"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="bg-background text-white">
      
      {/* Main Content */}
      <div className="w-full">
        <div className="text-center py-8 border-b border-surface">
          <h1 className="h1-public">Kontaktai</h1>
        </div>
        
        <div className="max-w-4xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary">Parašykite mums</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Vardas</label>
                  <Input 
                    type="text" 
                    placeholder="Jūsų vardas"
                    className="bg-surface border-surface text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">El. paštas</label>
                  <Input 
                    type="email" 
                    placeholder="jūsų@email.lt"
                    className="bg-surface border-surface text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Žinutė</label>
                  <Textarea 
                    placeholder="Jūsų žinutė..."
                    rows={5}
                    className="bg-surface border-surface text-white placeholder:text-gray-400"
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  Siųsti žinutę
                </Button>
              </form>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-primary">Susisiekite</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">El. paštas</p>
                    <p className="text-gray-300">pavel@fkbanga.lt</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Telefonas</p>
                    <p className="text-gray-300">(8-46) 452782</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Adresas</p>
                    <p className="text-gray-300">Gargždų g. 1, Gargždai</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
