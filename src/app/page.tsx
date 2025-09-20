// src/app/page.tsx
import "./globals.css";
import { TOPICS } from "@/data/topics";

export const metadata = {
  title: "English Flip Cards",
  description: "主題式英文單字卡翻頁練習",
};

export default function HomePage() {
  return (
    <main className="container">
      <h1>英文卡片翻頁</h1>
      <div className="mut">選擇一個主題開始練習</div>
    </main>
  );
}
