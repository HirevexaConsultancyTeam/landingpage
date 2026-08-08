import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Same allowlist as the course bypass in lib/progress.ts.
// Fails closed: empty or missing env var means nobody is exempt.
const BYPASS_EMAILS = (process.env.COURSE_BYPASS_EMAILS ?? "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { registrationPaid: true, role: true, email: true },
  });

  // Both conditions required, matching hasBypass(). Losing ADMIN revokes the
  // exemption even if the email stays on the list.
  const isExempt =
    user?.role === "ADMIN" &&
    BYPASS_EMAILS.includes(user.email.toLowerCase());

  if (!isExempt && !user?.registrationPaid) redirect("/payment/registration");

  return <>{children}</>;
}