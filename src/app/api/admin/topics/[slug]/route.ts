import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteTopic, getTopicBySlug } from "@/lib/topics";

type Params = { slug: string };

export async function GET(
  _request: Request,
  { params }: { params: Params },
) {
  await requireAdmin();
  const topic = await getTopicBySlug(params.slug);
  if (!topic) {
    return NextResponse.json(
      { message: "找不到主題" },
      { status: 404 },
    );
  }
  return NextResponse.json({ topic });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Params },
) {
  await requireAdmin();
  await deleteTopic(params.slug);
  return NextResponse.json({ message: "已刪除" });
}