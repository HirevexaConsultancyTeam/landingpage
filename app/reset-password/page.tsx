"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="bg-white border border-[#DDD] rounded p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#0F1111] mb-2">Invalid Link</h1>
        <p className="text-[#565959] text-sm mb-5">This reset link is invalid or has expired.</p>
        <Link href="/forgot-password"
          className="inline-block bg-[#FF9900] text-gray-900 font-bold px-6 py-2.5 rounded text-sm hover:bg-[#e88d00] transition">
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError("");
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white border border-[#DDD] rounded p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h1 className="text-xl font-bold text-[#0F1111] mb-2">Password Reset!</h1>
        <p className="text-[#565959] text-sm mb-2">Your password has been updated successfully.</p>
        <p className="text-xs text-[#565959]">Redirecting to login in 3 seconds...</p>
        <Link href="/login"
          className="inline-block mt-5 bg-[#FF9900] text-gray-900 font-bold px-6 py-2.5 rounded text-sm hover:bg-[#e88d00] transition">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#DDD] rounded p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Lock size={20} className="text-[#FF9900]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0F1111]">Set New Password</h1>
          <p className="text-xs text-[#565959]">Choose a strong password</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-[#FFF0F0] border border-[#CC0C39] rounded p-3 mb-4 text-sm text-[#CC0C39]">
          <AlertCircle size={15} className="flex-shrink-0" /> {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-[#0F1111] mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full border border-[#888] rounded px-3 py-2 text-sm outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185] pr-10"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565959]">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0F1111] mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Repeat password"
              className="w-full border border-[#888] rounded px-3 py-2 text-sm outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185] pr-10"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565959]">
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {confirm && password !== confirm && (
            <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
          )}
          {confirm && password === confirm && confirm.length >= 8 && (
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <CheckCircle size={11} /> Passwords match
            </p>
          )}
        </div>

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-2.5 rounded text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Updating...</> : "Update Password"}
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col">
      <div className="bg-[#131921] py-3 px-6 flex items-center justify-center border-b-2 border-[#FF9900]">
        <Link href="/" className="flex flex-col items-center">
          <span className="text-white font-bold text-2xl tracking-tight">Hirevexa</span>
          <span className="text-[#FF9900] text-[10px] font-semibold tracking-widest uppercase">Consultancy</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-[#FF9900]" size={28} /></div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
      <div className="border-t border-[#DDD] py-4 text-center text-xs text-[#565959]">
        © 2025 HireVexa Consultancy
      </div>
    </div>
  );
}