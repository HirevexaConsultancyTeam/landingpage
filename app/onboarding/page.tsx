"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, ChevronRight, Loader2, AlertCircle } from "lucide-react";

const steps = [
  "Personal Info",
  "Education",
  "Preferences",
  "Review",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
const [resumeUploading, setResumeUploading] = useState(false);
const [resumeUploaded, setResumeUploaded] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", mobile: "", city: "",
    password: "", confirmPassword: "",
    degree: "", branch: "", college: "", gradYear: "", cgpa: "",
    jobType: "", locations: [] as string[], salary: "", skills: "",
    experience: "fresher",
  });

  const update = (k: string, v: string | string[]) => setForm(f => ({ ...f, [k]: v }));

  const locationOptions = ["Delhi NCR", "Mumbai", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Any Location"];

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!form.firstName || !form.lastName) return setError("First and last name are required."), false;
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) return setError("Enter a valid email address."), false;
      if (!form.mobile || form.mobile.length < 10) return setError("Enter a valid 10-digit mobile number."), false;
      if (!form.password || form.password.length < 8) return setError("Password must be at least 8 characters."), false;
      if (form.password !== form.confirmPassword) return setError("Passwords do not match."), false;
    }
    if (step === 1) {
      if (!form.degree || !form.college) return setError("Degree and college are required."), false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  async function uploadResume() {
  if (!resume) return;

  try {
    setResumeUploading(true);

    const formData = new FormData();
    formData.append("file", resume);

    const res = await fetch("/api/resume/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Resume upload failed");
      return;
    }

    setResumeUploaded(true);
  } catch {
    setError("Failed to upload resume.");
  } finally {
    setResumeUploading(false);
  }
}

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }
      // Success — redirect to login
      router.push("/login?registered=true");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <div className="bg-[#131921] py-3 px-6 flex items-center justify-between border-b-2 border-[#FF9900]">
        <Link href="/" className="flex flex-col">
          <span className="text-white font-bold text-xl">Hirevexa</span>
          <span className="text-[#FF9900] text-[10px] font-semibold tracking-widest uppercase">Consultancy</span>
        </Link>
        <div className="text-[#CCCCCC] text-xs">Step {step + 1} of {steps.length}</div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-[#DDD]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-0 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    i < step ? "bg-[#067D62] border-[#067D62] text-white" :
                    i === step ? "bg-[#232F3E] border-[#232F3E] text-white" :
                    "bg-white border-[#DDD] text-[#565959]"
                  }`}>
                    {i < step ? <CheckCircle size={14} /> : i + 1}
                  </div>
                  <span className={`text-[10px] mt-1 whitespace-nowrap ${i === step ? "text-[#232F3E] font-semibold" : "text-[#565959]"}`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-0.5 w-10 md:w-16 mx-1 mb-4 ${i < step ? "bg-[#067D62]" : "bg-[#DDD]"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-[#DDD] rounded p-6 shadow-sm">

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 bg-[#FFF0F0] border border-[#CC0C39] rounded p-3 mb-5 text-sm text-[#CC0C39]">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-[#0F1111] mb-1">Personal Information</h2>
              <p className="text-[#565959] text-sm mb-5">Create your account to get started.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">First Name *</label>
                  <input value={form.firstName} onChange={e => update("firstName", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="Rahul" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Last Name *</label>
                  <input value={form.lastName} onChange={e => update("lastName", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="Sharma" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Email Address *</label>
                  <input value={form.email} onChange={e => update("email", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="rahul@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Mobile Number *</label>
                  <input value={form.mobile} onChange={e => update("mobile", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="9999999999" maxLength={10} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Current City</label>
                  <input value={form.city} onChange={e => update("city", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="Delhi" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Password *</label>
                  <input type="password" value={form.password} onChange={e => update("password", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="Min. 8 characters" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="Repeat password" />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Education */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[#0F1111] mb-1">Educational Background</h2>
              <p className="text-[#565959] text-sm mb-5">Your academic details help us match you with the right roles.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F1111] mb-1">Degree *</label>
                    <select value={form.degree} onChange={e => update("degree", e.target.value)}
                      className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none bg-white">
                      <option value="">Select degree</option>
                      <option>B.Tech / B.E.</option><option>BCA</option><option>B.Sc</option>
                      <option>B.Com</option><option>BBA</option><option>MBA</option>
                      <option>MCA</option><option>M.Tech</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0F1111] mb-1">Branch / Specialization</label>
                    <input value={form.branch} onChange={e => update("branch", e.target.value)}
                      className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="Computer Science" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">College / University *</label>
                  <input value={form.college} onChange={e => update("college", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="Delhi Technological University" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#0F1111] mb-1">Graduation Year</label>
                    <select value={form.gradYear} onChange={e => update("gradYear", e.target.value)}
                      className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none bg-white">
                      <option value="">Select year</option>
                      {[2025, 2024, 2023, 2022, 2021].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0F1111] mb-1">CGPA / Percentage</label>
                    <input value={form.cgpa} onChange={e => update("cgpa", e.target.value)}
                      className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none" placeholder="7.5 CGPA or 75%" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-2">Work Experience</label>
                  <div className="flex gap-4">
                    {["fresher", "0-1 years", "1-2 years"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="experience" value={opt} checked={form.experience === opt} onChange={() => update("experience", opt)} className="accent-[#FF9900]" />
                        <span className="text-sm text-[#0F1111] capitalize">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preferences */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[#0F1111] mb-1">Job Preferences</h2>
              <p className="text-[#565959] text-sm mb-5">Tell us what you are looking for — we will match accordingly.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Job Type</label>
                  <select value={form.jobType} onChange={e => update("jobType", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none bg-white">
                    <option value="">Select job type</option>
                    <option>Full-time Employment</option><option>Internship + PPO</option>
                    <option>Remote / WFH</option><option>Government / PSU</option><option>Startup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-2">Preferred Locations (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {locationOptions.map(loc => (
                      <button key={loc} type="button"
                        onClick={() => {
                          const curr = form.locations;
                          update("locations", curr.includes(loc) ? curr.filter(l => l !== loc) : [...curr, loc]);
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
                          form.locations.includes(loc) ? "bg-[#232F3E] text-white border-[#232F3E]" : "bg-white text-[#0F1111] border-[#DDD] hover:border-[#888]"
                        }`}>
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Expected CTC (per annum)</label>
                  <select value={form.salary} onChange={e => update("salary", e.target.value)}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none bg-white">
                    <option value="">Select range</option>
                    <option>2–4 LPA</option><option>4–6 LPA</option><option>6–10 LPA</option><option>10+ LPA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">Key Skills (comma separated)</label>
                  <textarea value={form.skills} onChange={e => update("skills", e.target.value)} rows={3}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm focus:border-[#007185] focus:outline-none resize-none"
                    placeholder="Java, Python, SQL, Excel, Communication..." />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
{step === 3 && (
  <div>

    <h2 className="text-xl font-bold text-[#0F1111] mb-1">
      Review Your Profile
    </h2>

    <p className="text-[#565959] text-sm mb-5">
      Please verify your information before creating your account.
    </p>

    <div className="space-y-0 border border-[#DDD] rounded overflow-hidden">

      {[
        {
          label: "Name",
          value: `${form.firstName} ${form.lastName}`,
        },

        {
          label: "Email",
          value: form.email,
        },

        {
          label: "Mobile",
          value: form.mobile,
        },

        {
          label: "City",
          value: form.city || "—",
        },

        {
          label: "Degree",
          value: form.degree || "—",
        },

        {
          label: "Branch",
          value: form.branch || "—",
        },

        {
          label: "College",
          value: form.college || "—",
        },

        {
          label: "Graduation Year",
          value: form.gradYear || "—",
        },

        {
          label: "CGPA",
          value: form.cgpa || "—",
        },

        {
          label: "Experience",
          value: form.experience,
        },

        {
          label: "Job Type",
          value: form.jobType || "—",
        },

        {
          label: "Expected Salary",
          value: form.salary || "—",
        },

        {
          label: "Preferred Locations",
          value:
            form.locations.length
              ? form.locations.join(", ")
              : "—",
        },

        {
          label: "Skills",
          value: form.skills || "—",
        },

      ].map((row, index) => (

        <div
          key={row.label}
          className={`flex items-start gap-3 px-4 py-3 ${
            index % 2 === 0
              ? "bg-white"
              : "bg-[#FAFAFA]"
          }`}
        >

          <span className="text-xs text-[#565959] w-36 flex-shrink-0">
            {row.label}
          </span>

          <span className="text-xs font-semibold text-[#0F1111]">
            {row.value}
          </span>

        </div>

      ))}

    </div>

    <div className="mt-5 bg-[#F0F9FF] border border-[#B0E0F5] rounded-lg p-4">

      <h3 className="font-semibold text-[#007185] mb-2">
        Resume Upload
      </h3>

      <p className="text-sm text-[#565959]">

        You can upload your resume immediately after logging into your dashboard.

      </p>

      <p className="text-sm text-[#565959] mt-2">

        Don't have one?

        Our team can help you build an ATS-friendly resume after registration.

      </p>

    </div>

    <div className="mt-5 bg-[#FFFBE6] border border-[#FFD814] rounded-lg p-4">

      <p className="text-sm text-[#565959]">

        🎉 After registration you'll be able to:

      </p>

      <ul className="mt-3 list-disc ml-5 text-sm text-[#565959] space-y-1">

        <li>Upload your resume</li>

        <li>Apply to jobs</li>

        <li>Track application status</li>

        <li>Book counselling sessions</li>

      </ul>

    </div>

  </div>
)}

         

          {/* Step 4: Review */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-[#0F1111] mb-1">Review Your Profile</h2>
              <p className="text-[#565959] text-sm mb-5">Please confirm your details before submitting.</p>
              <div className="space-y-0 border border-[#DDD] rounded overflow-hidden">
                {[
                  { label: "Name", value: `${form.firstName} ${form.lastName}` },
                  { label: "Email", value: form.email },
                  { label: "Mobile", value: form.mobile },
                  { label: "City", value: form.city || "—" },
                  { label: "Degree", value: form.degree || "—" },
                  { label: "Branch", value: form.branch || "—" },
                  { label: "College", value: form.college || "—" },
                  { label: "Grad Year", value: form.gradYear || "—" },
                  { label: "CGPA", value: form.cgpa || "—" },
                  { label: "Job Type", value: form.jobType || "—" },
                  { label: "Expected CTC", value: form.salary || "—" },
                  { label: "Locations", value: form.locations.join(", ") || "—" },
                ].map((row, i) => (
                  <div key={row.label} className={`flex items-start gap-3 px-4 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}`}>
                    <span className="text-xs text-[#565959] w-28 flex-shrink-0 pt-0.5">{row.label}</span>
                    <span className="text-xs font-semibold text-[#0F1111]">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-[#FFFBE6] border border-[#FFD814] rounded p-3">
                <p className="text-xs text-[#565959]">
                  <strong>🎉 What happens next?</strong> Our counsellor will review your profile and call you within 24 hours to schedule your first session.
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-[#EAEDED]">
            <button onClick={() => { setError(""); setStep(s => Math.max(0, s - 1)); }}
              disabled={step === 0}
              className="px-6 py-2 border border-[#DDD] rounded text-sm font-semibold text-[#0F1111] hover:bg-[#F0F2F2] disabled:opacity-40 disabled:cursor-not-allowed">
              Back
            </button>

            {step < steps.length - 1 ? (
              <button onClick={handleNext}
                className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold px-8 py-2 rounded text-sm border border-[#FCD200] flex items-center gap-1">
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="bg-[#FF9900] hover:bg-[#FA8900] text-[#131921] font-bold px-8 py-2 rounded text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><CheckCircle size={16} /> Submit Profile</>}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-[#565959] mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-[#007185] hover:underline">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
