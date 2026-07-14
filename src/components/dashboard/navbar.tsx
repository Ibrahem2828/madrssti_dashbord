import React from "react";

export function Navbar() {
  return (
    <header
      dir="rtl"
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-border bg-white/80 px-6 backdrop-blur-md dark:bg-surface-dark/80"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-1.5 text-sm dark:bg-dark-muted">
          <span className="text-brand-gold">●</span>
          <span className="text-text-muted">المدرسة النموذجية للبنين</span>
          <span className="text-text-muted">|</span>
          <span className="font-medium text-text-primary">١٤٤٨ هـ</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <svg
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="بحث..."
            className="w-56 rounded-lg border border-surface-border bg-surface-muted py-1.5 pr-10 pl-3 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30 dark:bg-dark-muted"
            readOnly
          />
        </div>

        <button className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary dark:hover:bg-dark-muted">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-status-error" />
        </button>

        <button className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary dark:hover:bg-dark-muted">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>

        <div className="mr-2 flex items-center gap-3 border-r border-surface-border pr-4">
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary">أ. أحمد المحمد</p>
            <p className="text-xs text-text-muted">مدير المدرسة</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-white">
            أ.أ
          </div>
        </div>
      </div>
    </header>
  );
}