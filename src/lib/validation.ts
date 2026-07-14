import type { UUID } from "@/types/api";

export interface ValidationError {
  field: string;
  message: string;
}

export type ValidationResult =
  | { valid: true; errors: [] }
  | { valid: false; errors: ValidationError[] };

export function validateEmail(value: string): string | null {
  if (!value) return "البريد الإلكتروني مطلوب";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "صيغة البريد الإلكتروني غير صحيحة";
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) return `${fieldName} مطلوب`;
  return null;
}

export function validateArabicText(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) return `${fieldName} مطلوب`;
  if (!/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(value))
    return `${fieldName} يجب أن يحتوي على نص عربي`;
  return null;
}

export function validatePhone(value: string): string | null {
  if (!value) return "رقم الجوال مطلوب";
  const cleaned = value.replace(/[\s\-()]/g, "");
  if (!/^(?:\+966|00966|0)?5[0-9]{8}$/.test(cleaned))
    return "رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "كلمة المرور مطلوبة";
  if (value.length < 8) return "كلمة المرور يجب أن تكون ٨ أحرف على الأقل";
  return null;
}

export function validateMin(value: number, min: number, fieldName: string): string | null {
  if (value < min) return `${fieldName} يجب أن يكون ${min} على الأقل`;
  return null;
}

export function validateMax(value: number, max: number, fieldName: string): string | null {
  if (value > max) return `${fieldName} يجب أن لا يتجاوز ${max}`;
  return null;
}

export function validateFileSize(size: number, maxMB = 20): string | null {
  if (size > maxMB * 1024 * 1024)
    return `حجم الملف يتجاوز الحد الأقصى المسموح به (${maxMB} م.ب)`;
  return null;
}

export function validateFileExtension(filename: string, allowedExtensions: string[]): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext))
    return `امتداد الملف غير مدعوم. الامتدادات المسموحة: ${allowedExtensions.join(", ")}`;
  return null;
}

export interface CreateUserFormData {
  fullNameAr: string;
  fullNameEn?: string;
  email: string;
  phone: string;
  password: string;
  roleType: string;
  schoolId: UUID;
  grade?: string;
  classId?: string;
  subject?: string;
}

export function validateCreateUserForm(data: CreateUserFormData): ValidationResult {
  const errors: ValidationError[] = [];

  const nameErr = validateArabicText(data.fullNameAr, "الاسم الكامل");
  if (nameErr) errors.push({ field: "fullNameAr", message: nameErr });

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.push({ field: "email", message: emailErr });

  const phoneErr = validatePhone(data.phone);
  if (phoneErr) errors.push({ field: "phone", message: phoneErr });

  const passErr = validatePassword(data.password);
  if (passErr) errors.push({ field: "password", message: passErr });

  const roleErr = validateRequired(data.roleType, "الدور");
  if (roleErr) errors.push({ field: "roleType", message: roleErr });

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, errors: [] };
}