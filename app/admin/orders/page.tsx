"use client";
import { useEffect, useState } from "react";
import { ShoppingBag, BookOpen, Loader2, TrendingUp, IndianRupee, Users } from "lucide-react";

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  user: { email: string };
  course: { title: string; slug: string };
}

const STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CREATED: "bg-yellow-50 text-yellow-700 border-yellow-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  FAILED: "bg-red-50 text-red-700 border-red-100",
  REFUNDED: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.filter(o => o.status === "PAID").reduce((a, o) => a + o.amount, 0);
  const paid = orders.filter(o => o.status === "PAID").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Course purchase history and revenue</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Orders", value: orders.length, icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Paid Orders", value: paid, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
              <TrendingUp size={14} className="text-gray-200" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-[#FF9900]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-gray-200" />
            </div>
            <p className="font-semibold text-gray-600">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Orders will appear here once candidates purchase courses.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-3">Candidate</th>
                    <th className="px-5 py-3">Course</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 text-sm text-gray-700">{order.user.email}</td>
                      <td className="px-5 py-4 font-medium text-gray-900">{order.course.title}</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">₹{order.amount.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {orders.map(order => (
                <div key={order.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{order.course.title}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{order.user.email}</p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}