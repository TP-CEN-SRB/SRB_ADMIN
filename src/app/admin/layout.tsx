import AdminDashboard from '@/components/(Admin)/admin-dashboard'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-48px)] overflow-hidden">
      <AdminDashboard />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
    </div>
  )
}