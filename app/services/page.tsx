import Link from "next/link";
import Footer from "../components/Footer";
import {
  Globe, Search, TrendingUp, Mail, Share2, BarChart2,
  CheckCircle, ArrowRight, Star, Users, Zap, Shield
} from "lucide-react";

export const metadata = { title: "Our Services | HireVexa Consultancy" };

const services = [
  {
    icon: Globe,
    title: "Website Development",
    tagline: "Professional websites that convert visitors into customers",
    color: "bg-blue-50 text-blue-600",
    hoverBorder: "hover:border-blue-200",
    desc: "We design and develop fast, responsive, and modern websites tailored to your business needs. Whether it's a landing page, a corporate website, or a full-stack web application — we build it right.",
    features: [
      "Custom design aligned with your brand",
      "Mobile-first responsive layout",
      "Fast loading — optimised for performance",
      "SEO-ready structure from day one",
      "CMS integration (easy content updates)",
      "Secure hosting and deployment support",
    ],
    cta: "Get a Website Built",
  },
  {
    icon: Search,
    title: "Search Engine Optimisation (SEO)",
    tagline: "Rank higher on Google and get found by the right people",
    color: "bg-orange-50 text-orange-600",
    hoverBorder: "hover:border-orange-200",
    desc: "Our SEO experts help your website climb Google rankings organically. We handle everything from keyword research and on-page optimisation to technical SEO and backlink building.",
    features: [
      "Keyword research and competitor analysis",
      "On-page SEO — meta tags, headings, content",
      "Technical SEO — site speed, crawlability",
      "Local SEO for India-based businesses",
      "Monthly ranking and traffic reports",
      "Google Search Console and Analytics setup",
    ],
    cta: "Improve My Rankings",
  },
  {
    icon: TrendingUp,
    title: "Digital Marketing",
    tagline: "Grow your brand online with targeted digital campaigns",
    color: "bg-purple-50 text-purple-600",
    hoverBorder: "hover:border-purple-200",
    desc: "From Google Ads to performance marketing, we run data-driven campaigns that bring real results. We focus on ROI — every rupee you spend is tracked and optimised for maximum impact.",
    features: [
      "Google Ads — Search, Display, Shopping",
      "Performance marketing and lead generation",
      "Landing page creation and A/B testing",
      "Conversion rate optimisation (CRO)",
      "Retargeting campaigns",
      "Monthly performance reports with insights",
    ],
    cta: "Start a Campaign",
  },
  {
    icon: Share2,
    title: "Social Media Marketing",
    tagline: "Build your brand presence across Instagram, LinkedIn and more",
    color: "bg-pink-50 text-pink-600",
    hoverBorder: "hover:border-pink-200",
    desc: "We manage your social media presence end-to-end — from content creation and scheduling to community management and paid promotions. Your brand stays active and engaging 24/7.",
    features: [
      "Content creation — posts, reels, stories",
      "Platform management — Instagram, LinkedIn, Facebook",
      "Paid social media ads with targeting",
      "Influencer collaboration support",
      "Brand voice and identity guidelines",
      "Monthly analytics and engagement reports",
    ],
    cta: "Grow My Social",
  },
  {
    icon: Mail,
    title: "Email Marketing",
    tagline: "Reach your audience directly with personalised email campaigns",
    color: "bg-green-50 text-green-600",
    hoverBorder: "hover:border-green-200",
    desc: "Email remains one of the highest ROI marketing channels. We design and send professional email campaigns that nurture leads, retain customers, and drive conversions.",
    features: [
      "Email campaign design and copywriting",
      "Drip sequences and automation flows",
      "List segmentation and personalisation",
      "A/B testing for subject lines and content",
      "Open rate and click rate optimisation",
      "Integration with CRM and lead tools",
    ],
    cta: "Launch Email Campaign",
  },
  {
    icon: BarChart2,
    title: "Analytics & Reporting",
    tagline: "Data-driven insights to help you make smarter business decisions",
    color: "bg-indigo-50 text-indigo-600",
    hoverBorder: "hover:border-indigo-200",
    desc: "We set up comprehensive analytics for your website and marketing channels, giving you clear visibility into what's working and what needs improvement. No more guesswork.",
    features: [
      "Google Analytics 4 setup and configuration",
      "Custom dashboard creation",
      "Conversion tracking and goal setup",
      "Monthly performance reports",
      "Campaign attribution analysis",
      "Actionable recommendations every month",
    ],
    cta: "Set Up Analytics",
  },
];

const stats = [
  { value: "50+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "3x", label: "Average ROI" },
  { value: "24hr", label: "Response Time" },
];

const whyUs = [
  { icon: Star, title: "Quality First", desc: "Every project is delivered with attention to detail and built to last." },
  { icon: Zap, title: "Fast Turnaround", desc: "We move quickly without compromising on quality or results." },
  { icon: Shield, title: "Transparent Pricing", desc: "No hidden costs. You know exactly what you're paying for and why." },
  { icon: Users, title: "Dedicated Team", desc: "You get a real team — not freelancers — working on your project." },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a2332] via-[#232F3E] to-[#2d3f52] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-[#FF9900]/15 border border-[#FF9900]/25 text-[#FF9900] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9900] animate-pulse" />
            Our Services
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
            Everything Your Business<br />
            <span className="text-[#FF9900]">Needs to Grow Online.</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            From building your website to ranking it on Google and growing your brand on social media —
            HireVexa offers end-to-end digital services under one roof.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:hirevexaconsultancy@gmail.com"
              className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
              Get Consultation <ArrowRight size={16} />
            </a>
            <a href="https://www.whatsapp.com/channel/0029VbAriUBAYlUBEhYmSX3X" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-8 py-3.5 rounded-xl text-sm transition-all">
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#FF9900]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-800 font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">What We Offer</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Digital Services</h2>
          <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
            Whether you're a startup or an established business, we have the right service to take you to the next level.
          </p>
        </div>

        <div className="space-y-6">
          {services.map((service, i) => (
            <div key={service.title}
              className={`bg-white border border-gray-200 ${service.hoverBorder} rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden`}>
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  {/* Icon + number */}
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center flex-shrink-0`}>
                      <service.icon size={26} />
                    </div>
                    <span className="text-5xl font-black text-gray-100 sm:hidden">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
                        <p className="text-sm text-[#FF9900] font-semibold mt-0.5">{service.tagline}</p>
                      </div>
                      <span className="hidden sm:block text-6xl font-black text-gray-100 leading-none flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 leading-relaxed mt-3 mb-5">{service.desc}</p>

                    <div className="grid sm:grid-cols-2 gap-2 mb-5">
                      {service.features.map(f => (
                        <div key={f} className="flex items-start gap-2">
                          <CheckCircle size={14} className="text-[#FF9900] flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600">{f}</span>
                        </div>
                      ))}
                    </div>

                    <a href="mailto:hirevexaconsultancy@gmail.com"
                      className="inline-flex items-center gap-2 bg-gray-900 hover:bg-[#FF9900] hover:text-gray-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all">
                      {service.cta} <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why HireVexa */}
      <section className="bg-gray-50 border-y border-gray-100 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF9900] mb-2">Why Choose Us</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Why Businesses Trust HireVexa</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyUs.map(w => (
              <div key={w.title} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition group">
                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center mb-3 group-hover:bg-[#FF9900] transition">
                  <w.icon size={20} className="text-[#FF9900] group-hover:text-gray-900 transition" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{w.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{w.desc}</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Grow Your Business?</h2>
            <p className="text-gray-300 mb-8 max-w-lg mx-auto text-sm">
              Get consultation with our team. We'll understand your needs and recommend the right services for your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:hirevexaconsultancy@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-[#FF9900] hover:bg-[#e88d00] text-gray-900 font-bold px-10 py-4 rounded-xl text-sm transition-all shadow-lg hover:scale-[1.02]">
                Email Us Now <ArrowRight size={16} />
              </a>
              <a href="https://www.whatsapp.com/channel/0029VbAriUBAYlUBEhYmSX3X" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold px-10 py-4 rounded-xl text-sm transition-all">
                WhatsApp Us
              </a>
            </div>
            <p className="mt-5 text-gray-500 text-xs">Easy consultation · No commitment · Response within 24 hours</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}