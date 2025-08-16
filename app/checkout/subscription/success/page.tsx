"use client";

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SubscriptionSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-[#0A165B] mb-2">
          Prenumeratos pirkimas sėkmingas!
        </h1>
        <p className="text-gray-600 mb-6">
          Ačiū už prenumeratos pirkimą. Jūsų prenumerata buvo aktyvuota ir galioja nuo šiandien.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-[#0A165B]">Ką toliau?</CardTitle>
          <CardDescription>
            Jūsų prenumeratos informacija buvo išsiųsta į jūsų el. paštą
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Patikrinkite savo el. paštą prenumeratos patvirtinimui</li>
            <li>• Išsaugokite prenumeratos QR kodą, kuris bus reikalingas įėjimui</li>
            <li>• Jei turite klausimų, kreipkitės į palaikymą</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/subscriptions">
          <Button variant="outline" className="w-full sm:w-auto">
            Peržiūrėti prenumeratas
          </Button>
        </Link>
        <Link href="/">
          <Button className="w-full sm:w-auto bg-[#F15601] hover:bg-[#E04501]">
            Grįžti į pagrindinį
          </Button>
        </Link>
      </div>
    </div>
  )
} 