"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Briefcase, Users, BookOpen, Tag,
  ShoppingBag, BarChart2, Settings, LogOut, Menu, X,
  ChevronRight, GraduationCap, Loader2
} from "lucide-react";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Applications", href: "/admin/applications", icon: ShoppingBag },
  { label: "Candidates", href: "/admin/candidates", icon: Users },
  { divider: true, label: "LMS" },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { divider: true, label: "Reports" },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart2 },
  
];

function SidebarLink({ item, onClick }: { item: any; onClick?: () => void }) {
  const pathname = usePathname();
  const isActive = item.href === "/admin"
    ? pathname === "/admin"
    : pathname.startsWith(item.href);
  return (
    <Link href={item.href} onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive ? "bg-[#FF9900] text-gray-900 shadow-sm" : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}>
      <item.icon size={17} className={isActive ? "text-gray-900" : "text-gray-500 group-hover:text-white"} />
      {item.label}
      {isActive && <ChevronRight size={14} className="ml-auto" />}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      window.location.href = "/login";
      return;
    }
    if (status === "authenticated") {
      const role = (session?.user as any)?.role;
      if (role !== "ADMIN") {
        window.location.href = "/dashboard";
      }
    }
  }, [status, session, router]);

  // Show spinner while checking
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
      </div>
    );
  }

  // Non-admin — show spinner while redirecting
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
      </div>
    );
  }

  const adminName = (session?.user as any)?.name ?? "Admin";
  const adminInitial = adminName[0]?.toUpperCase() ?? "A";

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-xl bg-[#FF9900] flex items-center justify-center">
            <GraduationCap size={16} className="text-gray-900" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">HireVexa</p>
            <p className="text-gray-500 text-xs mt-0.5">Admin Panel</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item, i) =>
          item.divider ? (
            <div key={i} className="pt-4 pb-2 px-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">{item.label}</p>
            </div>
          ) : (
            <SidebarLink key={item.href} item={item} onClick={onClose} />
          )
        )}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#FF9900] flex items-center justify-center text-gray-900 font-bold text-xs flex-shrink-0">
            {adminInitial}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{adminName}</p>
            <p className="text-gray-500 text-[10px] truncate">{session?.user?.email}</p>
          </div>
        </div>
        <Link href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition mb-1">
          <ChevronRight size={15} className="rotate-180" /> Back to Site
        </Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-60 bg-[#1a2332] flex-shrink-0 fixed h-full z-20">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#1a2332] flex flex-col h-full">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FF9900] flex items-center justify-center lg:hidden">
              <GraduationCap size={14} className="text-gray-900" />
            </div>
            <span className="font-bold text-gray-900 text-sm lg:hidden">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-800 transition hidden sm:inline">← View Site</Link>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 hidden sm:inline">{adminName}</span>
              <div className="w-8 h-8 rounded-full bg-[#232F3E] text-white flex items-center justify-center text-xs font-bold">
                {adminInitial}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}