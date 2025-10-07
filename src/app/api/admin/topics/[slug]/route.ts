import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteTopic, getTopicBySlug } from "@/lib/topics";

type Params = { slug: string };

async function resolveParams(context: { params: Params | Promise<Params> }) {
  const params = await context.params;
  return params;
}

export async function GET(
  _request: NextRequest,
  context: { params: Params | Promise<Params> },
) {
  await requireAdmin();
  const { slug } = await resolveParams(context);
  const topic = await getTopicBySlug(slug);
  if (!topic) {
    return NextResponse.json(
      { message: "找不到主題" },
      { status: 404 },
    );
  }
  return NextResponse.json({ topic });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Params | Promise<Params> },
) {
  await requireAdmin();
  const { slug } = await resolveParams(context);
  await deleteTopic(slug);
  return NextResponse.json({ message: "已刪除" });
}