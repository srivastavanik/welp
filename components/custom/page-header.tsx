import type React from "react"
import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: React.ReactNode
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-7 w-7 text-brand-red" />}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">{title}</h1>
          {description && <p className="text-text-secondary mt-0.5">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex gap-2 self-start sm:self-center">{actions}</div>}
    </div>
  )
}
