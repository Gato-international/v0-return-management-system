"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Box,
  Settings,
  Code2,
  FileText,
  Layers,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Returns",
    href: "/admin/returns",
    icon: Undo2,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Box,
  },
  {
    label: "Variations",
    href: "/admin/variations",
    icon: Layers,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Release Notes",
    href: "/admin/release-notes",
    icon: FileText,
  },
  {
    label: "Developer",
    href: "/admin/developer",
    icon: Code2,
  },
]

interface AdminSidebarProps {
  user: {
    name?: string
    email: string
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = (user.name || user.email)
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-black text-white p-2 rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-black text-white flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / brand */}
        <div className={cn(
          "flex items-center h-16 border-b border-white/10 px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-black font-bold text-sm">
                G
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">GATO Returns</p>
                <p className="text-[11px] text-white/50 truncate">Admin Portal</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-black font-bold text-sm">
              G
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/50 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-black"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive ? "text-black" : "text-white/70")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:block px-3 py-2 border-t border-white/10">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full gap-2 rounded-lg px-3 py-2 text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User + logout */}
        <div className={cn(
          "border-t border-white/10 p-3",
          collapsed ? "flex flex-col items-center gap-2" : ""
        )}>
          {!collapsed ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{user.name || "Admin"}</p>
                <p className="text-[11px] text-white/50 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white text-xs font-semibold mb-2">
              {initials}
            </div>
          )}
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              className={cn(
                "text-white/50 hover:text-white hover:bg-white/10",
                collapsed ? "w-9 h-9 p-0" : "w-full justify-start gap-2"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
