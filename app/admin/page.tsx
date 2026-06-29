"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Users, Briefcase, BookOpen, ShoppingBag, TrendingUp,
  CheckCircle, Clock, AlertCircle, ArrowRight, Loader2, Tag
} from "lucide-react";

interface Stats {
  candidates: number; jobs: number; applications: number;
  courses: number; categories: number; enrollments: number;
  placed: number; offers: number; interviews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/admin/stats")
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Total Candidates", value: stats?.candidates ?? 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/candidates" },
    { label: "Active Jobs", value: stats?.jobs ?? 0, icon: Briefcase, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/jobs" },
    { label: "Applications", value: stats?.applications ?? 0, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/applications" },
    { label: "Placed", value: stats?.placed ?? 0, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/applications" },
    { label: "Courses", value: stats?.courses ?? 0, icon: BookOpen, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/courses" },
    { label: "Categories", value: stats?.categories ?? 0, icon: Tag, color: "text-yellow-600", bg: "bg-yellow-50", href: "/admin/categories" },
    { label: "Enrollments", value: stats?.enrollments ?? 0, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50", href: "/admin/courses" },
    { label: "Interviews", value: stats?.interviews ?? 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/applications" },
  ];

  const quickLinks = [
    { label: "Add New Job", href: "/admin/jobs/create", icon: Briefcase, desc: "Post a new job opening" },
    { label: "Create Course", href: "/admin/courses/create", icon: BookOpen, desc: "Add a new course" },
    { label: "Add Category", href: "/admin/categories", icon: Tag, desc: "Manage course categories" },
    { label: "View Applications", href: "/admin/applications", icon: ShoppingBag, desc: "Review pending applications" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s what&apos;s happening on HireVexa.</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => (
            <Link key={card.label} href={card.href}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{card.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(l => (
            <Link key={l.label} href={l.href}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition group flex flex-col gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-[#FF9900] transition">
                <l.icon size={17} className="text-gray-500 group-hover:text-gray-900 transition" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{l.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l.desc}</p>
              </div>
              <ArrowRight size={14} className="text-[#FF9900] mt-auto" />
            </Link>
          ))}
        </div>
      </div>

      {/* Placement Pipeline */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Placement Pipeline</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "In Interview", value: stats.interviews, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Offers Received", value: stats.offers, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Successfully Placed", value: stats.placed, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
                <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-600 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}