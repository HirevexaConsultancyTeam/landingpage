"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type Props = {
  session: any;
};

export default function UserMenu({ session }: Props) {
  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm hover:text-[#FF9900] transition"
        >
          Login
        </Link>

        <Link
          href="/onboarding"
          className="bg-[#FF9900] text-[#131921] px-4 py-2 rounded font-semibold hover:bg-[#e68a00] transition"
        >
          Register
        </Link>
      </div>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  const displayName = isAdmin
    ? "Admin"
    : session.user.name ||
      session.user.email?.split("@")[0] ||
      "Candidate";

  return (
    <div className="flex items-center gap-6">
      <div className="text-right leading-tight">
        <p className="text-xs text-gray-300">
          {isAdmin ? "Hello," : "Welcome,"}
        </p>

        <p className="font-semibold text-white">
          {displayName}
        </p>
      </div>

      <Link
        href={isAdmin ? "/admin" : "/dashboard"}
        className="font-semibold hover:text-[#FF9900] transition"
      >
        Dashboard
      </Link>

      <button
        onClick={() =>
          signOut({
            callbackUrl: "/",
          })
        }
        className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded text-white font-medium"
      >
        Logout
      </button>
    </div>
  );
}