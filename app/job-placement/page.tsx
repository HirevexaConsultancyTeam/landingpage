import Link from "next/link";
import {
  Briefcase,
  Users,
  Building2,
  CheckCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function JobPlacementPage() {
  const benefits = [
    "Personalized career counselling",
    "Dedicated placement assistance",
    "Resume optimization support",
    "Interview preparation sessions",
    "Direct employer connections",
    "Offer letter and joining support",
  ];

  const process = [
    {
      step: "01",
      title: "Register With Hirevexa",
      description:
        "Complete your profile and upload your latest resume.",
    },
    {
      step: "02",
      title: "Career Assessment",
      description:
        "Our experts evaluate your skills, goals, and career interests.",
    },
    {
      step: "03",
      title: "Resume & Profile Optimization",
      description:
        "We improve your professional profile to maximize recruiter attention.",
    },
    {
      step: "04",
      title: "Job Matching",
      description:
        "Get matched with relevant openings from our hiring partners.",
    },
    {
      step: "05",
      title: "Interview Process",
      description:
        "Attend interviews with confidence after expert preparation.",
    },
    {
      step: "06",
      title: "Get Placed",
      description:
        "Receive offers and begin your professional journey.",
    },
  ];

  return (
    <main className="bg-[#eef0f1] min-h-screen">

      {/* HERO */}
      <section className="bg-gradient-to-r from-[#16253A] via-[#24344d] to-[#42526a] text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">

          <span className="bg-[#ff9f00] text-black px-5 py-2 rounded-md font-bold text-sm">
            JOB PLACEMENT SERVICES
          </span>

          <div className="grid lg:grid-cols-2 gap-12 items-center mt-8">

            <div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Your Career Starts Here.
              </h1>

              <h2 className="text-[#ff9f00] text-4xl md:text-5xl font-bold mt-4">
                We Get You Placed.
              </h2>

              <p className="text-gray-300 text-lg mt-8 leading-relaxed">
                Our placement assistance program is designed specifically
                for freshers and graduates looking to secure meaningful
                employment opportunities. From profile building to offer
                letter support, we guide you throughout your career journey.
              </p>

              <div className="flex flex-wrap gap-4 mt-10">
                <Link
                  href="/contact"
                  className="bg-[#ff9f00] text-black px-8 py-4 rounded-lg font-semibold"
                >
                  Apply Now
                </Link>

                <Link
                  href="/about"
                  className="border border-white px-8 py-4 rounded-lg"
                >
                  Learn More
                </Link>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-72 h-72 rounded-full bg-white flex items-center justify-center shadow-2xl">
                <Briefcase size={120} className="text-[#16253A]" />
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-6 mt-10 pb-24">
        <div className="bg-white rounded-2xl p-10 shadow-sm border">

          <h2 className="text-4xl font-bold text-[#16253A]">
            About Our Job Placement Program
          </h2>

          <div className="space-y-6 mt-8 text-gray-700 text-lg leading-relaxed">

            <p>
              Finding the right job can be challenging, especially for
              fresh graduates entering the workforce for the first time.
              Despite having strong academic backgrounds, many candidates
              struggle with limited industry exposure, ineffective job
              search strategies, and lack of interview experience.
            </p>

            <p>
              Hirevexa Consultancy bridges this gap by providing
              comprehensive placement assistance tailored to the needs of
              freshers and young professionals. We connect candidates with
              employers actively seeking skilled and motivated talent.
            </p>

            <p>
              Through expert career counselling, resume enhancement,
              interview preparation, and employer networking, we maximize
              your chances of securing opportunities aligned with your
              skills and career goals.
            </p>

          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white py-24 border-y">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center">
            <span className="bg-[#ff9f00] px-4 py-2 rounded-md font-semibold">
              WHY CHOOSE HIREVEXA
            </span>

            <h2 className="text-5xl font-bold mt-6 text-[#16253A]">
              What You Get
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {benefits.map((item, index) => (
              <div
                key={index}
                className="bg-[#f8f9fa] p-6 rounded-xl border"
              >
                <CheckCircle className="text-[#ff9f00]" />

                <h3 className="font-semibold text-lg mt-4">
                  {item}
                </h3>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center">
          <span className="bg-[#ff9f00] px-4 py-2 rounded-md font-semibold">
            OUR PROCESS
          </span>

          <h2 className="text-5xl font-bold mt-6 text-[#16253A]">
            How It Works
          </h2>
        </div>

        <div className="space-y-6 mt-16">
          {process.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 border shadow-sm flex gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-[#16253A] text-white flex items-center justify-center text-xl font-bold shrink-0">
                {item.step}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#16253A]">
                  {item.title}
                </h3>

                <p className="text-gray-600 mt-3">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* CTA */}
      <section className="bg-[#16253A] text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">

          <h2 className="text-5xl font-bold">
            Ready To Launch Your Career?
          </h2>

          <p className="text-xl text-gray-300 mt-6 max-w-3xl mx-auto">
            Join thousands of successful candidates who trusted Hirevexa
            Consultancy to guide them toward meaningful employment
            opportunities.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 bg-[#ff9f00] text-black px-8 py-4 rounded-lg font-bold mt-10"
          >
            Get Started Today
            <ArrowRight size={20} />
          </Link>

        </div>
      </section>

    </main>
  );
}