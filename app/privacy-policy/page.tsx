import Link from "next/link";
import Footer from "../components/Footer";

export const metadata = { title: "Privacy Policy | HireVexa Consultancy" };

const sections = [
  {
    title: "1. Information We Collect",
    content: `When you register on HireVexa, we collect personal information including your name, email address, mobile number, educational background, and job preferences. We also collect resume documents, skills, and placement-related data you provide during onboarding. When you use our platform, we may automatically collect device information, browser type, and usage data to improve our services.`
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to match you with relevant job opportunities, facilitate communication between you and hiring companies, provide career counselling and resume building services, send you job alerts and placement updates, improve our platform and services, and comply with legal obligations. We do not sell your personal information to third parties.`
  },
  {
    title: "3. Sharing Your Information",
    content: `We share your profile information with our hiring partners and companies only when you apply for a job or when we believe a match is relevant to your profile. We ensure all hiring partners have agreed to maintain confidentiality. We do not share your data with advertisers or marketing companies. We may share data with service providers (such as cloud hosting) who assist in operating our platform, under strict confidentiality agreements.`
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your personal data, including encrypted data storage, secure HTTPS connections, and access controls. However, no method of transmission over the internet is 100% secure. We encourage you to use a strong password and keep your login credentials confidential.`
  },
  {
    title: "5. Your Rights",
    content: `You have the right to access, update, or delete your personal information at any time by logging into your dashboard or contacting us. You may request a copy of your data or ask us to stop using it for marketing purposes. If you wish to delete your account, please contact our support team.`
  },
  {
    title: "6. Payments and GST",
    content: `HireVexa Consultancy collects fees for placement assistance services. All fees are inclusive of Goods and Services Tax (GST) as applicable under Indian law. A GST invoice will be provided upon request. By making a payment, you acknowledge that GST collected cannot be reversed and will be deducted from any refund processed in accordance with our Refund Policy. For details on refunds, please refer to our Refund Policy page.`
  },
  {
    title: "7. Cookies",
    content: `We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyse platform usage. You can control cookie settings through your browser. Disabling cookies may affect some features of the platform.`
  },
  {
    title: "8. Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.`
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on our platform. Continued use of HireVexa after changes are posted constitutes your acceptance of the updated policy.`
  },
  {
    title: "10. Contact Us",
    content: `If you have any questions about this Privacy Policy or how we handle your data, please contact us at hirevexaconsultancy@gmail.com or write to us at HireVexa Consultancy, Pan India.`
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-[#1a2332] to-[#232F3E] text-white py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-[#fff8e8] border border-[#FFD814]/50 rounded-2xl p-5 mb-10">
          <p className="text-sm text-gray-700 leading-relaxed">
            At HireVexa, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our platform. By registering or using HireVexa, you agree to the terms outlined in this policy.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title}>
              <h2 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-sm text-[#FF9900] hover:underline font-semibold">← Back to Home</Link>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms & Conditions</Link>
            <Link href="/refund-policy" className="text-sm text-gray-500 hover:text-gray-900">Refund Policy</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}