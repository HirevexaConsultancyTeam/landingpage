// ============================================================================
//  DESTINATION:  app/jobs/[id]/page.tsx   (replaces the earlier version)
//  Only change from 4-jobs-id-page.tsx: renders applyUrl in the apply card.
// ============================================================================
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

import ApplyButton from "./ApplyButton";
import { canViewFullJob } from "@/lib/jobAccess";
import {
  MapPin, Briefcase, IndianRupee, Users, Lock, ExternalLink,
  ArrowLeft, BookOpen, Calendar, ChevronRight
} from "lucide-react";

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", INTERNSHIP: "Internship",
  PART_TIME: "Part Time", CONTRACT: "Contract", FREELANCE: "Freelance",
};
const EXP_LABELS: Record<string, string> = {
  FRESHER: "Fresher", ONE_TO_THREE: "1–3 Years",
  THREE_TO_FIVE: "3–5 Years", FIVE_PLUS: "5+ Years",
};

function LockedPanel({ title, note, loggedIn }: { title: string; note: string; loggedIn: boolean }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
        <Lock size={16} className="text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">{note}</p>
      <Link
        href={loggedIn ? "/payment/registration" : "/login"}
        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#FF9900] px-5 py-2.5 text-sm font-bold text-gray-900 transition hover:bg-[#e88d00]"
      >
        {loggedIn ? "Complete Registration" : "Login to Continue"}
      </Link>
    </div>
  );
}

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  const loggedIn = Boolean(session?.user?.id);
  const canViewFull = await canViewFullJob(session?.user?.id);

  let hasApplied = false;
  let registrationPaid = false;

  if (session?.user?.id) {
    const [candidate, user] = await Promise.all([
      prisma.candidate.findUnique({ where: { userId: session.user.id } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { registrationPaid: true },
      }),
    ]);

    registrationPaid = user?.registrationPaid ?? false;

    if (candidate) {
      const application = await prisma.application.findUnique({
        where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
      });
      hasApplied = !!application;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
          <Link href="/jobs" className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white">
            <ArrowLeft size={15} /> Back to Jobs
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#FF9900] text-xl font-bold text-gray-900 shadow-lg sm:h-16 sm:w-16 sm:text-2xl">
                {job.company[0]}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold leading-tight sm:text-3xl">{job.role}</h1>
                <p className="mt-1 text-base font-medium text-gray-300">{job.company}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {job.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300">
                      <MapPin size={11} /> {job.location}
                    </span>
                  )}
                  {job.jobType && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300">
                      <Briefcase size={11} /> {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
                    </span>
                  )}
                  {job.experience && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300">
                      <BookOpen size={11} /> {EXP_LABELS[job.experience] ?? job.experience}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${job.isActive ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border border-red-500/30 bg-red-500/20 text-red-300"}`}>
                <span className={`h-2 w-2 rounded-full ${job.isActive ? "animate-pulse bg-emerald-400" : "bg-red-400"}`} />
                {job.isActive ? "Actively Hiring" : "Closed"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-3">

          <div className="space-y-5 lg:col-span-2">

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Job Description</h2>
              {canViewFull ? (
                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {job.description || "No description provided."}
                </div>
              ) : (
                <LockedPanel
                  loggedIn={loggedIn}
                  title="Full description available after registration"
                  note="Registered candidates see the complete role description, responsibilities and what the company is looking for."
                />
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Required Skills</h2>
              {canViewFull ? (
                job.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="rounded-xl border border-orange-100 bg-orange-50 px-3.5 py-1.5 text-sm font-medium text-orange-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No specific skills listed.</p>
                )
              ) : (
                <div className="relative">
                  <div className="flex select-none flex-wrap gap-2 blur-sm" aria-hidden>
                    {["JavaScript", "React", "Node.js", "SQL", "Git"].map((s) => (
                      <span key={s} className="rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-1.5 text-sm text-gray-400">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
                      <Lock size={11} /> Register to view
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="space-y-5">

            <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400">Job Details</h3>

              {[
                { icon: Users, label: "Openings", value: `${job.openings} position${job.openings > 1 ? "s" : ""}`, gated: false },
                { icon: MapPin, label: "Location", value: job.location || "Not specified", gated: false },
                { icon: Briefcase, label: "Job Type", value: job.jobType ? (JOB_TYPE_LABELS[job.jobType] ?? job.jobType) : "Not specified", gated: false },
                { icon: BookOpen, label: "Experience", value: job.experience ? (EXP_LABELS[job.experience] ?? job.experience) : "Not specified", gated: false },
                { icon: IndianRupee, label: "Salary", value: job.salary || "Not disclosed", gated: true },
                { icon: Calendar, label: "Deadline", value: job.deadline ? new Date(job.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Open", gated: false },
              ].map(({ icon: Icon, label, value, gated }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon size={14} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    {gated && !canViewFull ? (
                      <p className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold text-gray-400">
                        <Lock size={11} /> Hidden
                      </p>
                    ) : (
                      <p className="mt-0.5 text-sm font-semibold text-gray-800">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-1 font-bold text-gray-900">Ready to Apply?</h3>
              <p className="mb-4 text-xs text-gray-500">
                Submit your application and our team will review it shortly.
              </p>

              {job.isActive ? (
                <ApplyButton
                  jobId={job.id}
                  hasApplied={hasApplied}
                  loggedIn={loggedIn}
                  registrationPaid={registrationPaid}
                />
              ) : (
                <button disabled className="w-full cursor-not-allowed rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-400">
                  Applications Closed
                </button>
              )}

              {/* External posting link. rel="noreferrer noopener" matters on a
                  third-party link — without it the target page gets a handle on
                  this window through window.opener and can redirect it. */}
              {canViewFull && job.applyUrl && (
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  <ExternalLink size={13} /> View on company site
                </a>
              )}
            </div>

            <Link href="/jobs" className="group flex items-center justify-between rounded-2xl bg-gray-900 p-5 text-white transition hover:bg-[#232F3E]">
              <div>
                <p className="text-sm font-bold">Browse More Jobs</p>
                <p className="mt-0.5 text-xs text-gray-400">See all open positions</p>
              </div>
              <ChevronRight size={18} className="text-[#FF9900] transition-transform group-hover:translate-x-0.5" />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}