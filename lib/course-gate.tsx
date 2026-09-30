import Link from "next/link";
import { auth } from "@/lib/auth";
import { ACCESS_LOCK_MESSAGE, isBlocked } from "@/lib/access-lock";

export default async function CourseGate({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!isBlocked(session)) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-2xl">
          🔒
        </div>
        <h1 className="mb-2 text-lg font-bold text-gray-900">Access Temporarily Unavailable</h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-500">{ACCESS_LOCK_MESSAGE}</p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-[#FF9900] px-6 py-2.5 text-sm font-bold text-gray-900 hover:bg-[#e88d00]"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}