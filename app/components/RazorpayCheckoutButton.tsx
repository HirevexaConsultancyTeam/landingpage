"use client";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadScript(src: string) {
  return new Promise<boolean>((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface Props {
  type: "COURSE" | "REGISTRATION";
  courseId?: string;
  label: string;
  className?: string;
  userEmail?: string;
  userName?: string;
  onSuccess: () => void;
}

export default function RazorpayCheckoutButton({
  type, courseId, label, className, userEmail, userName, onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    try {
      setLoading(true);
      const scriptLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your connection.");
        return;
      }

      const { data } = await axios.post("/api/payments/create-order", { type, courseId });

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Hirevexa",
        description: type === "REGISTRATION" ? "Registration Fee" : "Course Purchase",
        order_id: data.razorpayOrderId,
        prefill: { email: userEmail, name: userName },
        handler: async (response: any) => {
          try {
            await axios.post("/api/payments/verify", response);
            toast.success("Payment successful!");
            onSuccess();
          } catch {
            toast.error("Payment verification failed. Contact support if amount was deducted.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#FF9900" },
      });

      rzp.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
        setLoading(false);
      });

      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not start payment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handlePay} disabled={loading} className={className}>
      {loading ? <><Loader2 size={14} className="animate-spin inline mr-1" /> Processing...</> : label}
    </button>
  );
}