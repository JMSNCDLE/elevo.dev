import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="w-12 h-12 bg-dashCard rounded-xl flex items-center justify-center mb-4">
          <Icon size={22} className="text-dashMuted" />
        </div>
      )}
      <h3 className="text-base font-semibold text-dashText mb-1">{title}</h3>
      {description && <p className="text-sm text-dashMuted max-w-sm mb-5">{description}</p>}
      {action}
    </div>
  )
}
