import assert from "node:assert/strict";
import {existsSync, readFileSync} from "node:fs";
import {resolve} from "node:path";
import test from "node:test";

const root = process.cwd();

function read(relativePath) {
  return readFileSync(resolve(root, relativePath), "utf8");
}

test("school permissions registry includes required RBAC and correspondence codes", () => {
  const source = read("src/config/permissions.ts");
  [
    "ADMIN_USERS_READ",
    "ADMIN_USERS_CREATE",
    "ADMIN_USERS_UPDATE",
    "ADMIN_USERS_RESET_PASSWORD",
    "ROLE_ASSIGN",
    "ADMIN_RBAC_GRANT_PERMISSION",
    "ADMIN_RBAC_REVOKE_PERMISSION",
    "DOCUMENTS_ARCHIVE",
    "DOCUMENTS_MANAGE_CATEGORIES",
    "DOCUMENTS_MANAGE_PARTIES",
    "OUTGOING_MARK_SENT",
    "INCOMING_MARK_RECEIVED",
    "CIRCULARS_REPLY",
    "FINANCIAL_DOCUMENTS_MANAGE",
    "ADMIN_DOCUMENTS_MANAGE",
    "GUIDANCE_DOCUMENTS_MANAGE",
  ].forEach((permissionCode) => {
    assert.match(source, new RegExp(`"${permissionCode}"`));
  });
});

test("school endpoints expose specialized document collections and user mutation routes", () => {
  const source = read("src/config/endpoints.school.ts");
  [
    'admin/documents/outgoing',
    'admin/documents/incoming',
    'admin/documents/circulars',
    'admin/documents/needs-reply',
    'admin/users',
    '/reset-password',
    '/permissions/grant',
    '/permissions/revoke',
    '/effective-permissions',
    '/disable',
    '/enable',
  ].forEach((fragment) => {
    assert.match(source, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});

test("role edits use the school-scoped replacement contract instead of an additive admin route", () => {
  const endpoints = read("src/config/endpoints.school.ts");
  const permissions = read("src/config/permissions.ts");

  assert.match(endpoints, /assignRoles: \(id: string\) => `users\/\$\{entity\(id\)\}\/roles`/);
  assert.doesNotMatch(endpoints, /assignRoles: \(id: string\) => `admin\/users/);
  assert.match(permissions, /assignRole: "ROLE_ASSIGN"/);
});

test("school user lifecycle exposes server-authorized activation controls and protects the signed-in account", () => {
  const service = read("src/features/school/services/school-api.ts");
  const screen = read("src/features/school/components/users-screen.tsx");

  assert.match(service, /changeSchoolUserActivation\(id: string, action: "enable" \| "disable"\)/);
  assert.match(service, /disableSchoolUser/);
  assert.match(service, /enableSchoolUser/);
  assert.match(screen, /SCHOOL_PERMISSIONS\.usersDisableEnable/);
  assert.match(screen, /user\.id === access\.session\.user\?\.id/);
  assert.match(screen, /selfActivationProtected/);
});

test("school API upload uses FormData without manual multipart content type", () => {
  const source = read("src/features/school/services/school-api.ts");
  assert.match(source, /const formData = new FormData\(\)/);
  assert.doesNotMatch(source, /attachments\(id\),\s*\{[\s\S]*Content-Type[\s\S]*multipart\/form-data/);
});

test("audit-sensitive document mutations require a reason payload in the service layer", () => {
  const source = read("src/features/school/services/school-api.ts");
  assert.match(source, /deleteDocument\(id: string, reason = ""\)/);
  assert.match(source, /JSON\.stringify\(\{reason\}\)/);
  assert.match(source, /markDocumentSent\(id: string, sentAt = new Date\(\)\.toISOString\(\), reason = ""\)/);
  assert.match(source, /markDocumentReceived\(id: string, receivedAt = new Date\(\)\.toISOString\(\), reason = ""\)/);
  assert.match(source, /JSON\.stringify\(\{sent_at: sentAt, reason\}\)/);
  assert.match(source, /JSON\.stringify\(\{received_at: receivedAt, reason\}\)/);
});

test("document detail UI enforces audit reason and self-link prevention", () => {
  const source = read("src/features/school/components/documents-screen.tsx");
  assert.match(source, /action === "sent" \|\| action === "received" \|\| action === "delete" \|\| action === "archive"/);
  assert.match(source, /actionReason\.trim\(\)/);
  assert.match(source, /linkForm\.relatedDocument === documentId/);
});

test("school document collection routes render explicit collection screens instead of redirects", () => {
  const files = [
    "src/app/[locale]/(school)/school/correspondence/outgoing/page.tsx",
    "src/app/[locale]/(school)/school/correspondence/incoming/page.tsx",
    "src/app/[locale]/(school)/school/correspondence/internal/page.tsx",
    "src/app/[locale]/(school)/school/correspondence/circulars/page.tsx",
    "src/app/[locale]/(school)/school/correspondence/needs-reply/page.tsx",
  ];

  for (const file of files) {
    assert.equal(existsSync(resolve(root, file)), true, `Missing route file: ${file}`);
    const source = read(file);
    assert.match(source, /SchoolDocumentCollectionScreen/);
    assert.doesNotMatch(source, /redirect\(/);
  }
});

test("school BFF gateway derives school context server-side and blocks central leakage", () => {
  const source = read("src/lib/api/gateway.ts");
  assert.match(source, /if \(portal === "school" && auth\.activeSchool\)/);
  assert.match(source, /headers\.set\("X-School-ID", auth\.activeSchool\)/);
  assert.match(source, /first !== "central"/);
  assert.doesNotMatch(source, /request\.headers\.get\("X-School-ID"\)/);
});

test("school client code keeps browser calls same-origin through browserApi and gatewayHref", () => {
  const serviceSource = read("src/features/school/services/school-api.ts");
  const screenSource = read("src/features/school/components/documents-screen.tsx");
  assert.match(serviceSource, /browserApi<.*?>\("school", schoolEndpoints\./s);
  assert.doesNotMatch(serviceSource, /https?:\/\//);
  assert.match(serviceSource, /gatewayHref\("school", schoolEndpoints\.documents\.preview/);
  assert.match(screenSource, /DocumentPreviewDialog/);
  assert.match(screenSource, /gatewayHref\("school", schoolEndpoints\.documents\.download/);
});

test("school navigation exposes serializable document modules with explicit permissions", () => {
  const source = read("src/config/navigation.school.ts");
  [
    'id: "correspondenceOverview"',
    'id: "newDocument"',
    'id: "outgoing"',
    'id: "incoming"',
    'id: "circulars"',
    'id: "needsReply"',
    'id: "categories"',
    'id: "parties"',
  ].forEach((fragment) => {
    assert.match(source, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
  assert.match(source, /icon: "outgoing"/);
  assert.match(source, /icon: "incoming"/);
  assert.match(source, /icon: "reply"/);
  assert.match(source, /icon: "collections"/);
});

test("navigation is grouped, capability-aware, and does not render an empty group", () => {
  const types = read("src/config/navigation.types.ts");
  const shell = read("src/components/layout/portal-shell.tsx");
  const navigation = read("src/lib/navigation/portal-navigation.ts");
  const schoolNavigation = read("src/config/navigation.school.ts");

  assert.match(types, /export type NavigationGroup/);
  assert.match(types, /permissionsAny\?: readonly string\[\]/);
  assert.match(types, /permissionsAll\?: readonly string\[\]/);
  assert.match(schoolNavigation, /id: "correspondence"/);
  assert.match(schoolNavigation, /collapsible: true/);
  assert.match(shell, /filterNavigationForSession\(navigation, session\.permissions\)/);
  assert.match(shell, /isNavigationItemActive\(pathname, item\)/);
  assert.match(navigation, /group\.items\.filter\(\(item\) => isNavigationItemVisible\(item, permissions\)\)/);
  assert.match(navigation, /\.filter\(\(group\) => group\.items\.length > 0\)/);
  assert.match(navigation, /hasCapability\(item\.capability\)/);
});

test("attachment upload, preview, and download stay within the same-origin BFF", () => {
  const uploader = read("src/components/correspondence/document-file-uploader.tsx");
  const preview = read("src/components/correspondence/document-preview-dialog.tsx");
  const service = read("src/features/school/services/school-api.ts");
  const mapper = read("src/features/school/mappers/school.ts");
  const gateway = read("src/lib/api/gateway.ts");

  assert.match(uploader, /uploadDocumentAttachment\(targetDocumentId, item\.file, item\.isPrimary, controller\.signal\)/);
  assert.doesNotMatch(uploader, /@\/services\/api/);
  assert.match(service, /browserApi<unknown>\("school", schoolEndpoints\.documents\.attachments\(id\)/);
  assert.match(service, /gatewayHref\("school", schoolEndpoints\.documents\.preview/);
  assert.match(preview, /URL\.createObjectURL/);
  assert.match(preview, /URL\.revokeObjectURL/);
  assert.doesNotMatch(preview, /https?:\/\//);
  assert.match(mapper, /downloadUrl: ""/);
  assert.match(mapper, /previewUrl: ""/);
  assert.match(gateway, /"content-length"/);
  assert.match(gateway, /"Cache-Control", "private, no-store"/);
});

test("document creation and reply attachment queues upload only after a server document ID exists", () => {
  const source = read("src/features/school/components/documents-screen.tsx");

  assert.match(source, /uploaderRef\.current\.uploadPending\(result\.data\.id\)/);
  assert.match(source, /replyUploaderRef\.current\.uploadPending\(replyDocumentId\)/);
  assert.match(source, /createdWithAttachmentFailures/);
  assert.match(source, /replyCreatedWithAttachmentFailures/);
});
