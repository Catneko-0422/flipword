import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import {
  createSessionToken,
  setSessionCookie,
  verifyAdminCredentials,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    const ok = await verifyAdminCredentials(username, password);
    if (!ok) {
      return NextResponse.json(
        { message: "帳號或密碼錯誤" },
        { status: 401 },
      );
    }

    const token = await createSessionToken();
    await setSessionCookie(token);

    return NextResponse.json({ message: "登入成功" });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        { message: "請輸入完整的帳號密碼" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "登入失敗" },
      { status: 500 },
    );
  }
}