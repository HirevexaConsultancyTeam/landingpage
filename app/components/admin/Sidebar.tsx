"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: "🏠",
  },
  {
    name: "Jobs",
    href: "/admin/jobs",
    icon: "💼",
  },
  {
    name: "Applications",
    href: "/admin/applications",
    icon: "📄",
  },
  {
    name: "Candidates",
    href: "/admin/candidates",
    icon: "👥",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: "📊",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: "⚙️",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r min-h-screen flex flex-col">

      <div className="border-b px-6 py-6">

        <h1 className="text-2xl font-bold text-[#FF9900]">
          HireVexa
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Admin Portal
        </p>

      </div>

      <nav className="flex-1 p-4">

        <div className="space-y-2">

          {links.map((link) => {
            const active =
              pathname === link.href ||
              pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-[#FF9900] text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span>{link.icon}</span>

                <span className="font-medium">
                  {link.name}
                </span>
              </Link>
            );
          })}

        </div>

      </nav>

    </aside>
  );
}