"use client";

import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const title =
    pathname.split("/").filter(Boolean).pop() || "Dashboard";

  return (
    <header className="bg-white border-b px-8 py-5 flex items-center justify-between">

      <div>

        <h2 className="text-2xl font-bold capitalize">
          {title.replace("-", " ")}
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          HireVexa Administration
        </p>

      </div>

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-full bg-[#FF9900] flex items-center justify-center text-white font-bold">
          A
        </div>

      </div>

    </header>
  );
}