import { z } from "zod";

export const wordSchema = z.object({
  id: z.string().uuid("word.id 必須是 uuid"),
  en: z.string().min(1, "英文單字不可為空"),
  zh: z.string().min(1, "中文單字不可為空"),
  pos: z.string().min(1, "詞性不可為空"),
  enSent: z.string().min(1, "英文例句不可為空"),
  zhSent: z.string().min(1, "中文例句不可為空"),
});

export const wordInputSchema = wordSchema.omit({ id: true });

export const topicSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不可為空")
    .regex(/^[a-z0-9-]+$/, "slug 僅允許小寫字母、數字與連字號"),
  title: z.string().min(1, "標題不可為空"),
  words: z.array(wordSchema),
});

export const topicsDocumentSchema = z.object({
  topics: z.array(topicSchema),
});

export const loginSchema = z.object({
  username: z.string().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});