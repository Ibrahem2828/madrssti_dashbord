"use client";

import React, { useState } from "react";
import type { UserRoleType } from "@/contracts/user";
import { validateArabicText, validateEmail, validatePhone, validatePassword } from "@/lib/validation";
import { apiCreateUser } from "@/services/api";
import { useToast } from "@/components/shared/toast";

const WIZARD_GRADES = ["٧/أ", "٧/ب", "٧/ج", "٨/أ", "٨/ب", "٩/أ", "٩/ب", "٩/ج"];
const WIZARD_CLASSES = ["الفصل الأول", "الفصل الثاني", "الفصل الثالث"];
const WIZARD_SUBJECTS = ["القرآن", "التفسير", "الحديث", "الفقه", "التوحيد", "النحو", "الرياضيات", "العلوم", "اللغة العربية"];

interface StepProps {
  formData: FormData;
  updateField: (field: keyof FormData, value: string) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

interface FormData {
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleType: UserRoleType | "";
  grade: string;
  classId: string;
  subject: string;
}

const initialFormData: FormData = {
  fullNameAr: "",
  fullNameEn: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  roleType: "",
  grade: "",
  classId: "",
  subject: "",
};

const roles: { value: UserRoleType; label: string; icon: string; description: string }[] = [
  { value: "PRINCIPAL", label: "مدير مدرسة", icon: "👤", description: "صلاحية كاملة على جميع الأنظمة" },
  { value: "DEPUTY_PRINCIPAL", label: "نائب مدير", icon: "👥", description: "صلاحية إدارية وتعليمية" },
  { value: "ACADEMIC_SUPERVISOR", label: "مشرف أكاديمي", icon: "📋", description: "إشراف على العملية التعليمية" },
  { value: "TEACHER", label: "معلم", icon: "📚", description: "إدارة الصفوف والمواد" },
  { value: "ATTENDANCE_OFFICER", label: "موظف حضور", icon: "⏱", description: "إدارة سجلات الحضور" },
  { value: "STUDENT", label: "طالب", icon: "🎓", description: "متابعة الجدول والدرجات" },
];

function Step1BaseDetails({ formData, updateField, errors, setErrors }: StepProps) {
  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameErr = validateArabicText(formData.fullNameAr, "الاسم الكامل");
    if (nameErr) newErrors.fullNameAr = nameErr;
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;
    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;
    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">البيانات الأساسية</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-text-primary">الاسم الكامل (عربي) *</label>
          <input
            type="text"
            value={formData.fullNameAr}
            onChange={(e) => { updateField("fullNameAr", e.target.value); setErrors((prev) => ({ ...prev, fullNameAr: "" })); }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${
              errors.fullNameAr ? "border-status-error focus:ring-status-error/30" : "border-surface-border focus:border-brand-gold focus:ring-brand-gold/30"
            }`}
            placeholder="مثال: أحمد خالد العيسى"
          />
          {errors.fullNameAr && <p className="mt-1 text-xs text-status-error">{errors.fullNameAr}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-primary">الاسم بالإنجليزية</label>
          <input
            type="text"
            value={formData.fullNameEn}
            onChange={(e) => updateField("fullNameEn", e.target.value)}
            className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
            placeholder="Ahmed Khalid Al-Issa"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-primary">البريد الإلكتروني *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => { updateField("email", e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${
              errors.email ? "border-status-error focus:ring-status-error/30" : "border-surface-border focus:border-brand-gold focus:ring-brand-gold/30"
            }`}
            placeholder="user@school.edu.sa"
          />
          {errors.email && <p className="mt-1 text-xs text-status-error">{errors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-primary">رقم الجوال *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => { updateField("phone", e.target.value); setErrors((prev) => ({ ...prev, phone: "" })); }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${
              errors.phone ? "border-status-error focus:ring-status-error/30" : "border-surface-border focus:border-brand-gold focus:ring-brand-gold/30"
            }`}
            placeholder="05xxxxxxxx"
          />
          {errors.phone && <p className="mt-1 text-xs text-status-error">{errors.phone}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-primary">كلمة المرور *</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => { updateField("password", e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${
              errors.password ? "border-status-error focus:ring-status-error/30" : "border-surface-border focus:border-brand-gold focus:ring-brand-gold/30"
            }`}
            placeholder="••••••••"
          />
          {errors.password && <p className="mt-1 text-xs text-status-error">{errors.password}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-text-primary">تأكيد كلمة المرور *</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => { updateField("confirmPassword", e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: "" })); }}
            className={`w-full rounded-lg border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${
              errors.confirmPassword ? "border-status-error focus:ring-status-error/30" : "border-surface-border focus:border-brand-gold focus:ring-brand-gold/30"
            }`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="mt-1 text-xs text-status-error">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );
}

function Step2RoleAllocation({ formData, updateField, errors, setErrors }: StepProps) {
  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">تحديد الدور</p>
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => (
          <button
            key={role.value}
            type="button"
            onClick={() => { updateField("roleType", role.value); setErrors((prev) => ({ ...prev, roleType: "" })); }}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-right transition-all ${
              formData.roleType === role.value
                ? "border-brand-gold bg-brand-gold/5"
                : "border-surface-border hover:border-brand-navy/20"
            }`}
          >
            <span className="text-xl">{role.icon}</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">{role.label}</p>
              <p className="text-xs text-text-muted">{role.description}</p>
            </div>
            {formData.roleType === role.value && (
              <span className="mr-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] text-white">✓</span>
            )}
          </button>
        ))}
      </div>
      {errors.roleType && <p className="text-xs text-status-error">{errors.roleType}</p>}
    </div>
  );
}

function Step3Assignment({ formData, updateField }: StepProps) {
  const showGrade = formData.roleType === "STUDENT" || formData.roleType === "TEACHER";
  const showSubject = formData.roleType === "TEACHER" || formData.roleType === "ACADEMIC_SUPERVISOR";
  const showClass = formData.roleType === "TEACHER";

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wider text-text-muted">التكليف والتصنيف</p>
      <div className="grid grid-cols-2 gap-4">
        {showGrade && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-primary">الصف الدراسي</label>
            <select
              value={formData.grade}
              onChange={(e) => updateField("grade", e.target.value)}
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-text-primary focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
            >
              <option value="">-- اختر الصف --</option>
              {WIZARD_GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}
        {showClass && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-primary">الفصل</label>
            <select
              value={formData.classId}
              onChange={(e) => updateField("classId", e.target.value)}
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-text-primary focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
            >
              <option value="">-- اختر الفصل --</option>
              {WIZARD_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
        {showSubject && (
          <div>
            <label className="mb-1 block text-xs font-medium text-text-primary">المادة</label>
            <select
              value={formData.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-text-primary focus:border-brand-gold focus:outline-none focus:ring-1 focus:ring-brand-gold/30"
            >
              <option value="">-- اختر المادة --</option>
              {WIZARD_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
        {!showGrade && !showSubject && !showClass && (
          <div className="col-span-2 rounded-lg bg-surface-muted p-6 text-center text-sm text-text-muted dark:bg-dark-muted">
            لا توجد تكليفات إضافية للدور المحدد
          </div>
        )}
      </div>
    </div>
  );
}

interface CreateUserWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserWizard({ isOpen, onClose }: CreateUserWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      const nameErr = validateArabicText(formData.fullNameAr, "الاسم الكامل");
      if (nameErr) newErrors.fullNameAr = nameErr;
      const emailErr = validateEmail(formData.email);
      if (emailErr) newErrors.email = emailErr;
      const phoneErr = validatePhone(formData.phone);
      if (phoneErr) newErrors.phone = phoneErr;
      const passErr = validatePassword(formData.password);
      if (passErr) newErrors.password = passErr;
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "كلمة المرور غير متطابقة";
    } else if (step === 2) {
      if (!formData.roleType) newErrors.roleType = "يرجى اختيار دور للمستخدم";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 3));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);

    const result = await apiCreateUser({
      email: formData.email,
      password: formData.password,
      full_name: formData.fullNameAr,
      phone: formData.phone || undefined,
      profile_type: formData.roleType as string,
      role_ids: [],
    });

    setIsSubmitting(false);

    if (result.success) {
      showToast("success", "تم إنشاء المستخدم بنجاح", `تم إنشاء حساب ${formData.fullNameAr} بنجاح`);
      setFormData(initialFormData);
      setStep(1);
      onClose();
    } else {
      showToast("error", "فشل إنشاء المستخدم", result.message ?? "حدث خطأ غير متوقع");
    }
  };

  const stepTitles = ["البيانات الأساسية", "تحديد الدور", "التكليفات"];
  const stepDescriptions = ["المعلومات الشخصية والحساب", "صلاحيات المستخدم", "التصنيف الدراسي"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        dir="rtl"
        className="w-full max-w-2xl mx-4 rounded-xl border border-surface-border bg-white shadow-brand-lg dark:bg-surface-dark"
      >
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <h2 className="text-lg font-semibold text-text-primary">إنشاء مستخدم جديد</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-text-primary" aria-label="إغلاق">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b border-surface-border bg-surface-muted/50 dark:bg-dark-muted/50">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 px-4 py-3 text-center text-xs font-medium transition-colors ${
                s === step
                  ? "border-b-2 border-brand-gold text-brand-gold"
                  : s < step
                  ? "text-status-success"
                  : "text-text-muted"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    s === step
                      ? "bg-brand-gold text-white"
                      : s < step
                      ? "bg-status-success/10 text-status-success"
                      : "bg-surface-border text-text-muted"
                  }`}
                >
                  {s < step ? "✓" : s}
                </span>
                <span className="hidden sm:inline">{stepTitles[s - 1]}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-text-muted">{stepDescriptions[s - 1]}</p>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <Step1BaseDetails formData={formData} updateField={updateField} errors={errors} setErrors={setErrors} />
          )}
          {step === 2 && (
            <Step2RoleAllocation formData={formData} updateField={updateField} errors={errors} setErrors={setErrors} />
          )}
          {step === 3 && (
            <Step3Assignment formData={formData} updateField={updateField} errors={errors} setErrors={setErrors} />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-surface-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface-muted"
          >
            إلغاء
          </button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted"
              >
                السابق
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="rounded-lg bg-brand-navy px-5 py-2 text-sm font-medium text-white transition-all hover:bg-brand-navy-600"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="rounded-lg bg-brand-gold px-5 py-2 text-sm font-medium text-brand-navy transition-all hover:bg-brand-gold-300 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جارٍ الإنشاء...
                  </span>
                ) : (
                  "إنشاء المستخدم"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}