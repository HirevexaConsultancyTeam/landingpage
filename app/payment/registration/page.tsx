"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RazorpayCheckoutButton from "@/app/components/RazorpayCheckoutButton";
import { ShieldCheck } from "lucide-react";

export default function RegistrationPaymentPage() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center px-4">
      <div className="bg-white border border-[#DDD] rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="text-[#FF9900]" size={26} />
        </div>
        <h1 className="text-xl font-bold text-[#0F1111] mb-2">One Last Step</h1>
        <p className="text-sm text-[#565959] mb-6">
          Complete your ₹500 registration fee to activate your account and access your dashboard.
        </p>
        <RazorpayCheckoutButton
          type="REGISTRATION"
          label="Pay ₹500 & Activate Account"
          className="w-full bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold py-3 rounded-xl text-sm transition"
          userEmail={session?.user?.email ?? undefined}
          userName={session?.user?.name ?? undefined}
          onSuccess={() => router.push("/skill-courses")}
        />
      </div>
    </div>
  );
}