/** @deprecated Legacy API adapter. Browser traffic is routed through same-origin gateways. */
import type {ApiClientInstance} from "./apiClient"; import {createApiClient} from "./apiClient";
export interface SchoolContext{schoolId:string|null;schoolName:string|null} export interface AuthContext{token:null;isAuthenticated:boolean}
let school:SchoolContext={schoolId:null,schoolName:null}; export function setSchoolContext(value:SchoolContext){school=value;} export function setAuthContext(_value:AuthContext){} export function getSchoolContext(){return school;} export function getAuthContext():AuthContext{return {token:null,isAuthenticated:false};}
export function createAuthenticatedApiClient(baseUrl="/api/gateway/school"):ApiClientInstance{return createApiClient({baseUrl,retryCount:0});} export const authenticatedApiClient=createAuthenticatedApiClient();
