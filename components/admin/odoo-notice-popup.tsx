"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, MonitorSmartphone } from "lucide-react"

/**
 * Admin notice popup informing about Odoo Return Portal integration.
 * 
 * Behavior:
 * - Clicking X (close): dismisses for this session, reappears on next login
 * - Clicking "Don't show again": permanently dismissed via localStorage
 */
export function OdooNoticePopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const permanentlyDismissed = localStorage.getItem("odoo-return-notice-dismissed")
    if (permanentlyDismissed === "true") return

    // Small delay so it feels like it appears after page load
    const timer = setTimeout(() => setIsVisible(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    // Just close — will reappear on next login/page reload
    setIsVisible(false)
  }

  const handleNeverShowAgain = () => {
    localStorage.setItem("odoo-return-notice-dismissed", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in-0 zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-200">
        <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200">
          {/* Accent top bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-5 rounded-full p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="px-6 pt-6 pb-5">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <MonitorSmartphone className="h-7 w-7 text-white" />
            </div>

            {/* Title */}
            <h3 className="text-center text-lg font-semibold text-neutral-900">
              Returns now available in Odoo
            </h3>

            {/* Body */}
            <p className="mt-3 text-center text-sm leading-relaxed text-neutral-600">
              You can now manage returns directly from your Odoo dashboard for a centralized experience.
              All return data syncs automatically between this portal and Odoo.
            </p>

            {/* Odoo link hint */}
            <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-neutral-50 border border-neutral-100 px-4 py-3">
              <ExternalLink className="h-4 w-4 text-indigo-500 shrink-0" />
              <span className="text-xs text-neutral-500">
                Access via{" "}
                <span className="font-medium text-neutral-700">
                  office.gato-international.com
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center border-t border-neutral-100 bg-neutral-50/50">
            <button
              onClick={handleNeverShowAgain}
              className="flex-1 px-4 py-3.5 text-xs font-medium text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Don&apos;t show again
            </button>
            <div className="w-px h-8 bg-neutral-200" />
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
