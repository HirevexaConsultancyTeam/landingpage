import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

import ApplyButton from "./ApplyButton";
import {
  MapPin, Briefcase, DollarSign, Users, Clock,
  ArrowLeft, BookOpen, Calendar, ChevronRight
} from "lucide-react";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", INTERNSHIP: "Internship",
  PART_TIME: "Part Time", CONTRACT: "Contract", FREELANCE: "Freelance",
};
const JOB_TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-blue-50 text-blue-700 border-blue-100",
  INTERNSHIP: "bg-purple-50 text-purple-700 border-purple-100",
  PART_TIME: "bg-yellow-50 text-yellow-700 border-yellow-100",
  CONTRACT: "bg-orange-50 text-orange-700 border-orange-100",
  FREELANCE: "bg-green-50 text-green-700 border-green-100",
};
const EXP_LABELS: Record<string, string> = {
  FRESHER: "Fresher", ONE_TO_THREE: "1–3 Years",
  THREE_TO_FIVE: "3–5 Years", FIVE_PLUS: "5+ Years",
};

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  let hasApplied = false;
  if (session?.user?.id) {
    const candidate = await prisma.candidate.findUnique({ where: { userId: session.user.id } });
    if (candidate) {
      const application = await prisma.application.findUnique({
        where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
      });
      hasApplied = !!application;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Link href="/jobs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition">
            <ArrowLeft size={15} /> Back to Jobs
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex items-start gap-4">
              {/* Company avatar */}
              <div className="w-16 h-16 rounded-2xl bg-[#FF9900] text-gray-900 flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow-lg">
                {job.company[0]}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{job.role}</h1>
                <p className="text-gray-300 text-base mt-1 font-medium">{job.company}</p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {job.location && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-full">
                      <MapPin size={11} /> {job.location}
                    </span>
                  )}
                  {job.jobType && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-full">
                      <Briefcase size={11} /> {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                    </span>
                  )}
                  {job.experience && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-full">
                      <BookOpen size={11} /> {EXP_LABELS[job.experience] ?? job.experience}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${job.isActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                <span className={`w-2 h-2 rounded-full ${job.isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                {job.isActive ? "Actively Hiring" : "Closed"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Description */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="text-sm text-gray-600 leading-7 whitespace-pre-wrap">
                {job.description || "No description provided."}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h2>
              {job.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(skill => (
                    <span key={skill} className="bg-orange-50 text-orange-700 border border-orange-100 px-3.5 py-1.5 rounded-xl text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No specific skills listed.</p>
              )}
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Quick info */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-gray-400">Job Details</h3>

              {[
                { icon: Users, label: "Openings", value: `${job.openings} position${job.openings > 1 ? "s" : ""}` },
                { icon: MapPin, label: "Location", value: job.location || "Not specified" },
                { icon: Briefcase, label: "Job Type", value: job.jobType ? (JOB_TYPE_LABELS[job.jobType] ?? job.jobType) : "Not specified" },
                { icon: DollarSign, label: "Salary", value: job.salary || "Not disclosed" },
                { icon: BookOpen, label: "Experience", value: job.experience ? (EXP_LABELS[job.experience] ?? job.experience) : "Not specified" },
                { icon: Calendar, label: "Deadline", value: job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Open" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Apply card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 mb-1">Ready to Apply?</h3>
              <p className="text-xs text-gray-500 mb-4">Submit your application and our team will review it shortly.</p>

              {job.isActive ? (
                <ApplyButton jobId={job.id} hasApplied={hasApplied} />
              ) : (
                <button disabled className="w-full bg-gray-100 text-gray-400 font-semibold py-3 rounded-xl text-sm cursor-not-allowed">
                  Applications Closed
                </button>
              )}

              {!session && (
                <p className="text-xs text-gray-400 text-center mt-3">
                  <Link href="/login" className="text-[#FF9900] font-semibold hover:underline">Login</Link> to apply for this job
                </p>
              )}
            </div>

            {/* Browse more */}
            <Link href="/jobs" className="flex items-center justify-between bg-gray-900 text-white rounded-2xl p-5 hover:bg-[#232F3E] transition group">
              <div>
                <p className="font-bold text-sm">Browse More Jobs</p>
                <p className="text-xs text-gray-400 mt-0.5">See all open positions</p>
              </div>
              <ChevronRight size={18} className="text-[#FF9900] group-hover:translate-x-0.5 transition-transform" />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}