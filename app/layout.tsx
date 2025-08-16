import "./globals.css"
import { Inter as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "FK Banga bilietų valdymas",
  description: "Futbolo komandos renginių ir bilietų valdymas",
  generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="lt" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased dark",
          fontSans.variable
        )}
      >
        <Providers>
          <CartProvider>
            {children}
            <Toaster />
          </CartProvider>
        </Providers>
      </body>
    </html>
  )
}
