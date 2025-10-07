import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  listTopics,
  upsertTopic,
  replaceDocument,
} from "@/lib/topics";
import {
  topicSchema,
  topicsDocumentSchema,
} from "@/lib/validation";

export async function GET() {
  await requireAdmin();
  const topics = await listTopics();
  return NextResponse.json({ topics });
}

export async function POST(request: Request) {
  await requireAdmin();
  try {
    const payload = await request.json();
    const parsed = topicSchema.parse(payload);
    await upsertTopic(parsed);
    return NextResponse.json({ topic: parsed }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "格式錯誤", error: error instanceof Error ? error.message : error },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  await requireAdmin();
  try {
    const payload = await request.json();
    const parsed = topicsDocumentSchema.parse(payload);
    await replaceDocument(parsed);
    return NextResponse.json({ document: parsed });
  } catch (error) {
    return NextResponse.json(
      { message: "格式錯誤", error: error instanceof Error ? error.message : error },
      { status: 400 },
    );
  }
}