"use client"

import { MessageSquare, Video } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import { useIsMobile } from "../../hooks/use-mobile"

const MobileNav = () => {
  const isMobile = useIsMobile()
  const pathname = usePathname()
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isMobile && navRef.current) {
      const navElement = navRef.current
      const navHeight = navElement.offsetHeight

      const adjustElements = () => {
        const chatInput = document.querySelector<HTMLElement>('.chat-input-container')
        const messageContainer = document.querySelector<HTMLElement>('.message-container')

        if (chatInput) {
          chatInput.style.paddingBottom = `${navHeight}px`
        }

        if (messageContainer) {
          messageContainer.style.marginBottom = `${navHeight}px`
        }
      }

      adjustElements()

      const resizeObserver = new ResizeObserver(() => {
        adjustElements()
      })

      resizeObserver.observe(navElement)

      return () => {
        resizeObserver.unobserve(navElement)

        const chatInput = document.querySelector<HTMLElement>('.chat-input-container')
        const messageContainer = document.querySelector<HTMLElement>('.message-container')

        if (chatInput) {
          chatInput.style.paddingBottom = ''
        }

        if (messageContainer) {
          messageContainer.style.marginBottom = ''
        }
      }
    }
  }, [isMobile])

  if (!isMobile) return null

  return (
    <nav ref={navRef} className="fixed inset-x-0 bottom-0 bg-black/80 backdrop-blur-md border-t border-white/10 p-3 pb-[env(safe-area-inset-bottom)] flex justify-around items-center z-50 shadow-lg">
      <NavItem 
        href="/" 
        icon={<MessageSquare className="size-5 text-white" />} 
        label="Chat" 
        isActive={pathname === "/"}
      />
      <NavItem 
        href="/videos" 
        icon={<Video className="size-6 text-white" />} 
        label="Videos" 
        isActive={pathname === "/videos"}
      />
    </nav>
  )
}

const NavItem = ({ 
  href, 
  icon, 
  label, 
  isActive 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string;
  isActive: boolean;
}) => (
  <a 
    href={href} 
    onClick={(e) => {
      e.preventDefault()
      window.location.href = href
    }}
    className={`flex flex-col items-center gap-1 text-white transition pb-3 ${
      isActive ? "opacity-100" : "opacity-70 hover:opacity-90"
    }`}
  >
    {icon}
    <span className={`text-xs ${isActive ? "font-medium" : ""}`}>{label}</span>
  </a>
)

export default MobileNav