import React from "react";

const actions = [
  { label: "تسجيل طالب جديد", icon: "👤", color: "bg-brand-navy text-white" },
  { label: "إضافة مراسلة", icon: "📨", color: "bg-brand-gold text-brand-navy" },
  { label: "تسجيل غياب", icon: "📋", color: "bg-emerald-600 text-white" },
  { label: "تقرير سلوك", icon: "⭐", color: "bg-amber-600 text-white" },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2" dir="rtl">
      {actions.map((action) => (
        <button
          key={action.label}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-90 ${action.color}`}
        >
          <span>{action.icon}</span>
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  );
}