import Link from "next/link";
import Footer from "../components/Footer";

export const metadata = { title: "Terms & Conditions | HireVexa Consultancy" };

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing and using HireVexa's platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our platform.`
  },
  {
    title: "2. Eligibility",
    content: `HireVexa's services are intended for individuals who are 18 years of age or older and are seeking employment or career guidance in India. By using our platform, you confirm that you meet these eligibility requirements and that all information you provide is accurate and truthful.`
  },
  {
    title: "3. User Accounts",
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately if you suspect any unauthorised use of your account. HireVexa reserves the right to suspend or terminate accounts that violate these terms.`
  },
  {
    title: "4. Our Services",
    content: `HireVexa provides career placement assistance, resume building, interview preparation, and job matching services. Our placement program includes applying to a minimum of 3 (three) hiring partner companies on your behalf. While we strive to secure placement for every candidate, we do not guarantee employment or placement. Final hiring decisions are made solely by the respective companies and are beyond our control.`
  },
  {
    title: "5. User Conduct",
    content: `You agree not to use HireVexa for any unlawful purpose, to provide false or misleading information, to impersonate any person or entity, to interfere with the proper functioning of the platform, or to attempt to gain unauthorised access to any part of our systems. You also agree to cooperate fully with your assigned counsellor and attend all scheduled sessions. Failure to cooperate may result in termination of services without refund.`
  },
  {
    title: "6. Fees, Payments and GST",
    content: `HireVexa charges a program fee for placement assistance services. All fees are inclusive of Goods and Services Tax (GST) as applicable under Indian law. A GST invoice will be issued upon request. By making a payment, you acknowledge:

• All fees paid are subject to our Refund Policy
• GST collected is remitted to the Government of India and cannot be reversed
• In the event of an approved refund, GST will be deducted from the refund amount
• No interest is payable on any refund amount

Certain skill courses offered through the platform may be subject to separate fees, clearly communicated before purchase.`
  },
  {
    title: "7. Refund Policy",
    content: `All fees paid to HireVexa Consultancy are strictly non-refundable under normal circumstances. Refunds are only considered in exceptional cases where HireVexa has failed to deliver the agreed minimum services (applying to at least 3 companies on your behalf). Non-placement, rejection by companies, or dissatisfaction with offers received does not constitute grounds for a refund. All refund requests are subject to a formal investigation process. Please refer to our full Refund Policy at hirevexaconsultancy.com/refund-policy for complete details.`
  },
  {
    title: "8. Intellectual Property",
    content: `All content on HireVexa, including text, graphics, logos, and course materials, is the property of HireVexa Consultancy and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.`
  },
  {
    title: "9. Limitation of Liability",
    content: `HireVexa shall not be liable for any indirect, incidental, or consequential damages arising from your use of our platform. We do not guarantee the accuracy of job listings or employer information. Our total liability to you for any claims shall not exceed the base amount paid (excluding GST) in the three months preceding the claim.`
  },
  {
    title: "10. Third-Party Links",
    content: `Our platform may contain links to third-party websites. We are not responsible for the content or privacy practices of these external sites. Accessing them is at your own risk.`
  },
  {
    title: "11. Termination",
    content: `We reserve the right to terminate or suspend your access to HireVexa at any time, with or without cause, if we believe you have violated these Terms. You may also terminate your account at any time by contacting our support team. Termination does not entitle you to a refund of any fees paid.`
  },
  {
    title: "12. Governing Law",
    content: `These Terms and Conditions are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Delhi, India.`
  },
  {
    title: "13. Changes to Terms",
    content: `HireVexa reserves the right to modify these Terms at any time. We will notify users of material changes via email or platform notification. Continued use of our services after such modifications constitutes your acceptance of the updated terms.`
  },
  {
    title: "14. Contact",
    content: `If you have any questions about these Terms and Conditions, please contact us at hirevexaconsultancy@gmail.com.`
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-[#1a2332] to-[#232F3E] text-white py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#FF9900] text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Refund and Placement policy</h1>
          <p className="text-gray-400 text-sm">Last updated: June 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-[#fff8e8] border border-[#FFD814]/50 rounded-2xl p-5 mb-10">
          <p className="text-sm text-gray-700 leading-relaxed">
            Please read these Terms and Conditions carefully before using HireVexa's platform. These terms govern your use of our website, services, and content. By using HireVexa, you agree to these terms in full.
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
            <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
            <Link href="/refund-policy" className="text-sm text-gray-500 hover:text-gray-900">Refund Policy</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}