import "./globals.css"
import { DM_Sans as FontSans } from "next/font/google"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"

// Variable font: all weights from one self-hosted file. latin-ext carries
// the Lithuanian letters (ą č ę ė į š ų ū ž).
const fontSans = FontSans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata = {
  title: "FK Banga bilietų valdymas",
  description: "Futbolo komandos renginių ir bilietų valdymas",
  icons: { icon: "/banga-logo.svg" },
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
