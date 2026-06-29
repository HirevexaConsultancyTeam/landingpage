import Link from "next/link";

type Props = {
  role?: string;
};

const linkClass =
  "hover:text-[#FF9900] transition-colors whitespace-nowrap";

export default function NavLinks({ role }: Props) {
  if (role === "ADMIN") {
    return (
      <>
        <Link
          href="/admin"
          className={linkClass}
        >
          Dashboard
        </Link>

        <Link
          href="/admin/jobs"
          className={linkClass}
        >
          Jobs
        </Link>

        <Link
          href="/admin/candidates"
          className={linkClass}
        >
          Candidates
        </Link>

        <Link
          href="/admin/applications"
          className={linkClass}
        >
          Applications
        </Link>

        <Link
          href="/admin/analytics"
          className={linkClass}
        >
          Analytics
        </Link>
      </>
    );
  }

  if (role === "CANDIDATE") {
    return (
      <>
        <Link
          href="/jobs"
          className={linkClass}
        >
          Jobs
        </Link>

        <Link
          href="/dashboard"
          className={linkClass}
        >
          Dashboard
        </Link>

        

        <Link
          href="/dashboard/resume"
          className={linkClass}
        >
          Resume
        </Link>

        <Link
          href="/dashboard/profile"
          className={linkClass}
        >
          Profile
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/jobs"
        className={linkClass}
      >
        Jobs
      </Link>

      <Link
        href="/about"
        className={linkClass}
      >
        About
      </Link>

      <Link
        href="/resume-building"
        className={linkClass}
      >
        Resume Building
      </Link>

      <Link
        href="/interview-prep"
        className={linkClass}
      >
        Interview Prep
      </Link>

      <Link
        href="/skill-courses"
        className={linkClass}
      >
        Skill Courses
      </Link>

      <Link href="/services" className={linkClass}>Other Services</Link>

     
    </>
  );
}