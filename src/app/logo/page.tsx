import { Trophy } from 'lucide-react'

export default function LogoPage() {
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-8">
      <div className="flex items-center gap-6 select-none">
        <Trophy className="h-40 w-40 text-primary" />
        <span className="text-8xl font-extrabold tracking-tight text-gray-900">Courtify</span>
      </div>
    </div>
  )
}
