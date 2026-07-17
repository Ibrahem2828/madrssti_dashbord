"use client";

import {sameOriginApi} from "@/lib/api/browser-client";
import type {ApiResult} from "@/lib/api/contracts";

import type {AccountProfile, AccountProfileInput, ChangePasswordInput} from "../types";

export async function getAccountProfile(): Promise<ApiResult<{profile: AccountProfile}>> {
  return sameOriginApi<{profile: AccountProfile}>("/api/account/profile", {cache: "no-store"});
}

export async function updateAccountProfile(input: AccountProfileInput): Promise<ApiResult<{profile: AccountProfile}>> {
  return sameOriginApi<{profile: AccountProfile}>("/api/account/profile", {
    method: "PATCH",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(input),
  });
}

export async function changeOwnPassword(input: ChangePasswordInput): Promise<ApiResult<{reauthenticationRequired: boolean}>> {
  return sameOriginApi<{reauthenticationRequired: boolean}>("/api/account/change-password", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(input),
  });
}
