"use client";
import { useEffect, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ChevronRight, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const { data: session, status } = useSession();

  const [showPass, setShowPass] = useState(false);
  const [tab, setTab] = useState<"candidate" | "admin">("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (status !== "authenticated") return;
    const role = (session?.user as any)?.role;
    if (role === "ADMIN") {
      window.location.href = "/admin";
    } else {
      window.location.href = "/dashboard";
    }
  }, [session, status]);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    // Login succeeded — useEffect watching session will fire and redirect
    // Keep loading spinner on while session loads
  };

  if (status === "loading" || (status === "authenticated")) {
    return (
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#FF9900]" size={32} />
          <p className="text-sm text-[#565959]">
            {status === "authenticated" ? "Redirecting..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

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

          {registered && (
            <div className="flex items-center gap-2 bg-[#E4F5F0] border border-[#067D62] rounded p-3 mb-4 text-sm text-[#067D62]">
              <CheckCircle size={16} />
              Account created! Please sign in to continue.
            </div>
          )}

          <div className="flex mb-4 border border-[#DDD] rounded overflow-hidden">
            <button onClick={() => setTab("candidate")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === "candidate" ? "bg-[#232F3E] text-white" : "bg-white text-[#565959] hover:bg-[#F0F2F2]"}`}>
              Candidate Login
            </button>
            <button onClick={() => setTab("admin")}
              className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === "admin" ? "bg-[#232F3E] text-white" : "bg-white text-[#565959] hover:bg-[#F0F2F2]"}`}>
              Admin / Staff
            </button>
          </div>

          <div className="bg-white border border-[#DDD] rounded p-6 shadow-sm">
            <h1 className="text-2xl font-medium text-[#0F1111] mb-1">
              {tab === "candidate" ? "Sign in" : "Admin Portal"}
            </h1>
            <p className="text-[#565959] text-sm mb-5">
              {tab === "candidate" ? "Access your career dashboard" : "Staff and administrator access"}
            </p>

            {error && (
              <div className="flex items-center gap-2 bg-[#FFF0F0] border border-[#CC0C39] rounded p-3 mb-4 text-sm text-[#CC0C39]">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F1111] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full border border-[#888] rounded px-3 py-2 text-sm outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185]"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F1111] mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full border border-[#888] rounded px-3 py-2 text-sm outline-none focus:border-[#007185] focus:ring-1 focus:ring-[#007185] pr-10"
                    placeholder="Enter password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#565959]">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button onClick={handleLogin} disabled={loading}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold py-2 rounded text-sm border border-[#FCD200] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                  : "Sign In"}
              </button>
            </div>

            <p className="text-[10px] text-[#565959] mt-4">
              By signing in, you agree to Hirevexa&apos;s{" "}
              <Link href="#" className="text-[#007185] hover:underline">Conditions of Use</Link> and{" "}
              <Link href="#" className="text-[#007185] hover:underline">Privacy Notice</Link>.
            </p>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DDD]" />
            </div>
            <div className="relative flex justify-center text-xs text-[#767676] bg-[#EAEDED] px-3">
              New to Hirevexa?
            </div>
          </div>

          <Link href="/onboarding"
            className="flex items-center justify-center gap-1 w-full text-center bg-white border border-[#D5D9D9] hover:bg-[#F0F2F2] text-[#0F1111] font-semibold py-2 rounded text-sm shadow-sm">
            Create your Hirevexa account <ChevronRight size={14} />
          </Link>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-[#007185] text-sm hover:underline hover:text-[#C7511F]">
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#DDD] py-4 text-center text-xs text-[#565959]">
        © 2025 Hirevexa Consultancy ·{" "}
        <Link href="#" className="hover:underline text-[#007185]">Privacy</Link> ·{" "}
        <Link href="#" className="hover:underline text-[#007185]">Terms</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF9900]" size={28} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}