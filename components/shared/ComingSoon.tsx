import { Rocket } from 'lucide-react'

interface ComingSoonProps {
  feature: string
  description: string
  className?: string
}

export function ComingSoon({ feature, description, className = '' }: ComingSoonProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="w-16 h-16 bg-indigo-500/15 border border-indigo-500/30 rounded-2xl flex items-center justify-center mb-5">
        <Rocket className="w-7 h-7 text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">
        {feature} — Coming Soon
      </h3>
      <p className="text-gray-400 max-w-md text-sm leading-relaxed">
        {description} We&apos;re setting up the final integrations. This will be live shortly!
      </p>
    </div>
  )
}
