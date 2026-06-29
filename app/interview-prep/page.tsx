
import Footer from "../components/Footer";
import Link from "next/link";
import {
  CheckCircle, MessageSquare, Code, Brain,
  Users, Clock, ArrowRight, Star, Target, Zap
} from "lucide-react";

const services = [
  {
    icon: MessageSquare,
    title: "HR Interview Prep",
    desc: "Master common HR questions, salary negotiation, and how to present yourself confidently in behavioural rounds.",
    points: ["Tell me about yourself", "Strengths & weaknesses", "Why this company?", "Salary negotiation tips"],
  },
  {
    icon: Code,
    title: "Technical Interview Prep",
    desc: "Brush up on DSA, coding patterns, and CS fundamentals that are tested in technical rounds at top companies.",
    points: ["Data Structures & Algorithms", "OS, DBMS, CN basics", "Coding problem walkthroughs", "System design intro"],
  },
  {
    icon: Brain,
    title: "Aptitude & Reasoning",
    desc: "Clear the first elimination round with speed-focused techniques for quantitative aptitude and logical reasoning.",
    points: ["Quantitative aptitude shortcuts", "Logical reasoning patterns", "Verbal ability tips", "Mock test practice"],
  },
  {
    icon: Users,
    title: "Mock Interviews",
    desc: "One-on-one mock sessions with our counsellors simulating real interview conditions with detailed feedback.",
    points: ["Simulated HR rounds", "Technical mock sessions", "Recorded feedback", "Improvement roadmap"],
  },
];

const process = [
  { num: "01", title: "Profile Assessment", desc: "We review your background and identify the specific interview areas you need to work on." },
  { num: "02", title: "Prep Plan", desc: "A personalised 1–2 week preparation plan tailored to your target companies and roles." },
  { num: "03", title: "Practice Sessions", desc: "Daily practice with resources, question banks, and guided walkthroughs by our mentors." },
  { num: "04", title: "Mock Interview", desc: "Final mock session with real interview simulation and detailed performance feedback." },
];

const faqs = [
  { q: "How long does interview prep take?", a: "Most candidates complete our prep program in 1–2 weeks depending on their starting level and target companies." },
  { q: "Is it one-on-one or group sessions?", a: "We offer both. Initial prep is self-paced with resources, and mock interviews are always one-on-one with a counsellor." },
  { q: "Which companies do you prepare for?", a: "We primarily prepare for product companies, service companies (TCS, Infosys, Wipro, etc.), and startups across tech and non-tech roles." },
  { q: "Is interview prep included in registration?", a: "Basic prep resources are included for all registered candidates. Advanced mock sessions may be part of specific packages." },
];

export default function InterviewPrepPage() {
  return (
    <div className="min-h-screen bg-white">
      

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF9900]/15 border border-[#FF9900]/25 text-[#FF9900] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
            Interview Preparation
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
            Walk In Prepared.<br />
            <span className="text-[#FF9900]">Walk Out with an Offer.</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Most rejections happen not because candidates lack skills — but because they
            lack preparation. Our structured interview prep program changes that.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
              Get Started with ease <ArrowRight size={16} />
            </Link>
            <Link href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all">
              Already Registered? Login
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-gray-400">
            {["HR + Technical prep", "One-on-one mock interviews", "Real company patterns", "Seamless for registered candidates"].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle size={12} className="text-[#FF9900]" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">What We Cover</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Complete Interview Preparation</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {services.map(s => (
            <div key={s.title} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4">
                <s.icon size={22} className="text-[#FF9900]" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.desc}</p>
              <ul className="space-y-1.5">
                {s.points.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">How It Works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Prep Process</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((s, i) => (
              <div key={s.num} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#232F3E] text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {s.num}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF9900] text-gray-900 text-xs font-bold flex items-center justify-center border-2 border-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { value: "87%", label: "Interview Success Rate", icon: Target },
            { value: "2 wks", label: "Average Prep Time", icon: Clock },
            { value: "840+", label: "Candidates Prepared", icon: Users },
            { value: "4.8★", label: "Average Rating", icon: Star },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mx-auto mb-3">
                <s.icon size={18} className="text-[#FF9900]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">FAQ</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Common Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.q} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="font-bold text-gray-900 mb-2 text-sm">{f.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-br from-[#232F3E] to-[#1a2332] text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <Zap size={32} className="text-[#FF9900] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Ace Your Interview?</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm">
              Register now and our counsellors will schedule your personalised prep session within 24 hours.
            </p>
            <Link href="/onboarding"
              className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-10 py-4 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
              Start Preparing Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}