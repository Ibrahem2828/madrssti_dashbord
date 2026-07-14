export function buildLoginCredentials(portal, identifier, password) {
  return portal === "central"
    ? {identifier, password}
    : {email: identifier, password};
}
