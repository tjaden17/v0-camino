"use client"

import { Target, Bookmark, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20 pb-safe">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around py-4">
          <Link href="/mission">
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex flex-col items-center gap-1 h-auto py-2", pathname === "/mission" && "text-primary")}
            >
              <Bookmark className="h-5 w-5" />
              <span className="text-xs">Mission</span>
            </Button>
          </Link>
          <Link href="/guidance">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2",
                (pathname === "/" || pathname === "/guidance") && "text-primary",
              )}
            >
              <Target className="h-5 w-5" />
              <span className="text-xs">Guidance</span>
            </Button>
          </Link>
          <Link href="/profile">
            <Button
              variant="ghost"
              size="sm"
              className={cn("flex flex-col items-center gap-1 h-auto py-2", pathname === "/profile" && "text-primary")}
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
