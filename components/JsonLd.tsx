// Reusable JSON-LD structured data component
export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HireVexa Consultancy",
    alternateName: "HireVexa",
    url: "https://hirevexaconsultancy.in",
    logo: "https://hirevexaconsultancy.in/logo.png",
    description: "India's trusted job placement consultancy for freshers. Offering resume building, interview preparation, and direct job referrals.",
    foundingDate: "2025",
    areaServed: "India",
    email: "hirevexaconsultancy01@gmail.com",
    sameAs: [
      "https://linkedin.com/company/hirevexa",
      "https://instagram.com/hirevexa",
      "https://youtube.com/@hirevexa",
      "https://www.whatsapp.com/channel/0029VbAriUBAYlUBEhYmSX3X",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "hirevexaconsultancy01@gmail.com",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HireVexa Consultancy",
    url: "https://hirevexaconsultancy.in",
    description: "Job placement consultancy for freshers in India",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://hirevexaconsultancy.in/jobs?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ServiceJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Job Placement Consultancy",
    provider: {
      "@type": "Organization",
      name: "HireVexa Consultancy",
      url: "https://hirevexaconsultancy.in",
    },
    areaServed: "India",
    description: "End-to-end placement support for freshers including resume building, interview preparation, and direct job referrals to top companies.",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      areaServed: "India",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is HireVexa free to register?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, registration on HireVexa is completely free. You can create your profile, upload your resume, and browse job openings at no cost.",
        },
      },
      {
        "@type": "Question",
        name: "Does HireVexa charge a placement fee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "HireVexa does not deduct any amount from your salary after placement. We charge a program fee upfront for our placement assistance services.",
        },
      },
      {
        "@type": "Question",
        name: "Which companies does HireVexa work with?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "HireVexa works with 45+ hiring partners including TCS, Infosys, Wipro, Cognizant, HCL, Capgemini, IBM, Accenture, and many more.",
        },
      },
      {
        "@type": "Question",
        name: "How long does it take to get placed through HireVexa?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Most candidates receive interview calls within 2-3 weeks of completing their profile. The average placement time is 4-6 weeks.",
        },
      },
      {
        "@type": "Question",
        name: "What is the Placement Guarantee Program?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Placement Guarantee Program is a 6-month structured program that includes Web Development, Microsoft Azure training, resume building, interview preparation, and direct job referrals to our hiring partners.",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}