export function can(permissions: readonly string[], permission: string): boolean { return permissions.includes(permission); }
export function canAny(permissions: readonly string[], required: readonly string[]): boolean { return required.some((permission) => can(permissions, permission)); }
export function canAll(permissions: readonly string[], required: readonly string[]): boolean { return required.every((permission) => can(permissions, permission)); }
