export type SchoolProfileTypeOption = {
  value: string;
  translationKey: string;
  requiresTeacherCode?: boolean;
  assumption?: "contract_verified" | "legacy_verified";
};

/**
 * The contract explicitly verifies `teacher`.
 * The remaining values are isolated here as retained legacy contract values
 * and must be runtime-verified against the backend before broad rollout.
 */
export const schoolProfileTypeOptions: readonly SchoolProfileTypeOption[] = [
  {value: "teacher", translationKey: "teacher", requiresTeacherCode: true, assumption: "contract_verified"},
  {value: "administrator", translationKey: "administrator", assumption: "legacy_verified"},
  {value: "principal", translationKey: "principal", assumption: "legacy_verified"},
  {value: "deputy_principal", translationKey: "deputyPrincipal", assumption: "legacy_verified"},
  {value: "academic_supervisor", translationKey: "academicSupervisor", assumption: "legacy_verified"},
  {value: "student", translationKey: "student", assumption: "legacy_verified"},
  {value: "attendance_officer", translationKey: "attendanceOfficer", assumption: "legacy_verified"},
] as const;

export function profileTypeRequiresTeacherCode(profileType: string) {
  return schoolProfileTypeOptions.some((option) => option.value === profileType && option.requiresTeacherCode);
}
