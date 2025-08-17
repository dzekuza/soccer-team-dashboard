export default function EventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0A165B]">
      {children}
    </div>
  )
}
