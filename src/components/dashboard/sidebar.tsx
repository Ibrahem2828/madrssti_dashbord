import React from "react";
import { Link } from "@/i18n/routing";

const navItems = [
  { icon: "📊", label: "لوحة المؤشرات", href: "/admin", active: true },
  { icon: "👥", label: "المستخدمون", href: "/admin/users" },
  { icon: "📋", label: "الحضور والغياب", href: "/admin/attendance" },
  { icon: "📨", label: "المراسلات", href: "/admin/correspondence" },
  { icon: "⭐", label: "نقاط السلوك", href: "/admin/points" },
  { icon: "📖", label: "الحلقات القرآنية", href: "/admin/halaqat" },
  { icon: "📅", label: "الجداول", href: "/admin/schedules" },
  { icon: "📈", label: "التقارير", href: "/admin/reports" },
  { icon: "⚙️", label: "الإعدادات", href: "/admin/settings" },
];

export function Sidebar() {
  return (
    <aside
      dir="rtl"
      className="fixed right-0 top-0 z-40 flex h-screen w-64 flex-col border-l border-brand-navy/10 bg-brand-navy text-white transition-all duration-300"
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-brand-gold bg-brand-navy-700">
          <span className="gold-gradient-text text-lg font-bold">م</span>
        </div>
        <div className="flex flex-col">
          <span className="gold-gradient-text text-lg font-bold leading-tight tracking-wide">
            مدرستي
          </span>
          <span className="text-xs text-white/50">منصة الإدارة المتكاملة</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              item.active
                ? "gold-glass text-brand-gold"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
            {item.active && (
              <span className="mr-auto h-1.5 w-1.5 rounded-full bg-brand-gold" />
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold/20 text-sm text-brand-gold">
            ع
          </div>
          <div className="flex flex-col text-xs">
            <span className="font-medium text-white">المدرسة النموذجية</span>
            <span className="text-white/50">العام الدراسي ١٤٤٨</span>
          </div>
        </div>
      </div>
    </aside>
  );
}