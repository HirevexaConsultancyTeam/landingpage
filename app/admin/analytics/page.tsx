"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, LineElement, PointElement);

type Analytics = {
  totalCandidates: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  placedApplications: number;
  applicationStatus: { status: string; _count: { status: number } }[];
  candidateStatus: { status: string; _count: { status: number } }[];
  topCompanies: {
    id: string;
    company: string;
    role: string;
    _count: { applications: number };
  }[];
  registrationTrend: { date: string; count: number }[];
};

const APP_COLORS = ["#378ADD", "#1D9E75", "#BA7517", "#E24B4A", "#7F77DD", "#D4537E"];

function toLabel(s: string) {
  return s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        // Guard against a failed/partial response instead of trusting the shape blindly.
        if (!d || d.error || !Array.isArray(d.registrationTrend)) {
          console.error("Analytics response missing expected fields:", d);
          setError(true);
          return;
        }
        setData(d);
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm text-center px-4">
        Couldn't load analytics right now. Check the server logs for /api/admin/analytics,
        or try refreshing.
      </div>
    );
  }

  const maxApps = data.topCompanies.length
    ? Math.max(...data.topCompanies.map((j) => j._count.applications))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Recruitment insights</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Candidates", value: data.totalCandidates, sub: "total registered" },
          { label: "Jobs", value: data.totalJobs, sub: "all listings" },
          { label: "Active Jobs", value: data.activeJobs, sub: "open roles" },
          { label: "Applications", value: data.totalApplications, sub: "submitted" },
          { label: "Placements", value: data.placedApplications, sub: "placed" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className="text-3xl font-semibold text-gray-900 mt-1">
              {m.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Doughnut — Application Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Application status</h2>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {data.applicationStatus.map((item, i) => (
              <span key={item.status} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="w-2 h-2 rounded-sm inline-block"
                  style={{ background: APP_COLORS[i] }}
                />
                {toLabel(item.status)} {item._count.status}
              </span>
            ))}
          </div>

          <div className="h-52">
            <Doughnut
              data={{
                labels: data.applicationStatus.map((i) => toLabel(i.status)),
                datasets: [
                  {
                    data: data.applicationStatus.map((i) => i._count.status),
                    backgroundColor: APP_COLORS,
                    borderWidth: 2,
                    borderColor: "#fff",
                    hoverOffset: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: "62%",
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Line — Registration trend (last 14 days) */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">
            New registrations (last 14 days)
          </h2>

          <div className="h-52">
            <Line
              data={{
                labels: data.registrationTrend.map((d) =>
                  new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                ),
                datasets: [
                  {
                    data: data.registrationTrend.map((d) => d.count),
                    borderColor: "#378ADD",
                    backgroundColor: "rgba(55,138,221,0.1)",
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { font: { size: 10 }, color: "#9ca3af" } },
                  y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 }, color: "#9ca3af" } },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-5">Top hiring companies</h2>
        <div className="space-y-4">
          {data.topCompanies.map((job, i) => {
            const pct = Math.round((job._count.applications / maxApps) * 100);
            return (
              <div key={job.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                <div className="w-36 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{job.company}</p>
                  <p className="text-xs text-gray-400 truncate">{job.role}</p>
                </div>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-6 text-right">
                  {job._count.applications}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}