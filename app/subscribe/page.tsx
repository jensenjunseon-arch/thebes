import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SubscribePanel } from "@/components/billing/SubscribePanel";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function SubscribePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="grid min-h-dvh place-items-center bg-paper px-6 text-center text-ink">
        <p className="max-w-sm break-keep text-sm leading-relaxed text-ink/60">
          결제는 백엔드(Supabase + Toss) 설정 후 이용할 수 있어요.
        </p>
      </main>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/subscribe");

  // Already subscribed → manage page.
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (sub?.status === "active") redirect("/billing");

  return (
    <main className="min-h-dvh bg-paper text-ink">
      <SiteHeader label="Subscribe" />
      <SubscribePanel userId={user.id} email={user.email ?? ""} />
    </main>
  );
}
