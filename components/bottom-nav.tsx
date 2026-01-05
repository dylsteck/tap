'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// Custom icons
const HomeIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
)

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

const UserIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const navItems = [
  {
    href: '/',
    label: 'Home',
    Icon: HomeIcon,
  },
  {
    href: '/create',
    label: 'Create',
    Icon: PlusIcon,
    isCenter: true,
  },
  {
    href: '/profile',
    label: 'Profile',
    Icon: UserIcon,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  // Hide on studio or create pages
  if (pathname?.startsWith('/studio') || pathname === '/create') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/50 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[430px] items-center justify-around px-6 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const { Icon } = item

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg transition-all active:scale-95 hover:bg-zinc-100">
                  <Icon />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1.5 transition-all active:scale-95',
                isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-400'
              )}
            >
              <Icon filled={isActive} />
              <span className="text-[10px] font-semibold uppercase tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
