"use client";
import { useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] flex flex-col">
      {/* Header */}
      <div className="bg-[#131921] py-3 px-6 flex items-center justify-center border-b-2 border-[#FF9900]">
        <Link href="/" className="flex flex-col items-center">
          <span className="text-white font-bold text-2xl tracking-tight">Hirevexa</span>
          <span className="text-[#FF9900] text-[10px] font-semibold tracking-widest uppercase">Consultancy</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">

          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#565959] hover:text-[#0F1111] mb-5 transition">
            <ArrowLeft size={15} /> Back to Login
          </Link>

          {sent ? (
            <div className="bg-white border border-[#DDD] rounded p-8 shadow-sm text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>
              <h1 className="text-xl font-bold text-[#0F1111] mb-2">Check your inbox</h1>
              <p className="text-[#565959] text-sm leading-relaxed mb-6">
                We sent a password reset link to <strong>{email}</strong>. Check your inbox and follow the instructions.
              </p>
              <p className="text-xs text-[#565959] mb-4">Didn't receive it? Check your spam folder or</p>
              <button onClick={() => setSent(false)}
                className="text-[#007185] text-sm font-semibold hover:underline">
                Try again with a different email
              </button>
            </div>
          ) : (
            <div className="bg-white border border-[#DDD] rounded p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                  <Mail size={20} className="text-[#FF9900]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#0F1111]">Forgot Password?</h1>
                  <p className="text-xs text-[#565959]">We'll send you a reset link</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-[#FFF0F0] border border-[#CC0C39] rounded p-3 mb-4 text-sm text-[#CC0C39]">
                  <AlertCircle size={15} className="flex-shrink-0" /> {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                    placeholder="you@example.com"
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185]"
                  />
                </div>

                <button onClick={handleSubmit} disabled={loading}
                  className="w-full bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-2.5 rounded text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Sending...</> : "Send Reset Link"}
                </button>
              </div>

              <p className="text-xs text-[#565959] mt-4 text-center">
                Remember your password?{" "}
                <Link href="/login" className="text-[#007185] hover:underline font-semibold">Sign in</Link>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-[#DDD] py-4 text-center text-xs text-[#565959]">
        © 2025 HireVexa Consultancy
      </div>
    </div>
  );
}