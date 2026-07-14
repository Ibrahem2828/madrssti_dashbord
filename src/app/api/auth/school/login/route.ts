import {login} from "@/features/auth/services/login-server"; export async function POST(request: Request){return login(request,"school");}
