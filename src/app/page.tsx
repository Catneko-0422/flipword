import "./globals.css";
import AdminLoginButton from "@/components/AdminLoginButton";
import AdminPanel from "@/components/AdminPanel";
import HomeClient from "@/components/HomeClient";
import { getCurrentSession } from "@/lib/auth";
import { listTopics } from "@/lib/topics";

export const dynamic = "force-dynamic";

export const metadata = {
 title: "English Flip Cards",
 description: "主題式英文單字卡翻頁練習",
};

export default async function HomePage() {
  const [topics, session] = await Promise.all([
    listTopics(),
    getCurrentSession(),
  ]);
  const isAdmin = Boolean(session);

  return (
    <>
      <main className="container">
        <h1>英文卡片翻頁</h1>
        <div className="mut">選擇一個主題開始練習</div>
        <HomeClient initial={topics} />
      </main>
      <AdminLoginButton authenticated={isAdmin} />
      {isAdmin ? <AdminPanel initialTopics={topics} /> : null}
    </>
  );
}
