import { Lock, Shield, CreditCard, Star, Users, Activity } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: Lock, text: 'SSL Encrypted' },
  { icon: Shield, text: 'GDPR Compliant' },
  { icon: CreditCard, text: 'Payments by Stripe' },
  { icon: Star, text: '4.9/5 rating' },
  { icon: Users, text: '400+ businesses' },
  { icon: Activity, text: '99.9% uptime' },
]

export default function TrustBar() {
  return (
    <div className="py-4 px-6 bg-gray-50 border-y border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
          {TRUST_ITEMS.map(item => (
            <div key={item.text} className="flex items-center gap-2 text-gray-400">
              <item.icon size={14} className="text-gray-400 shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
