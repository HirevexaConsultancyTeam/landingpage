import CourseGate from "@/lib/course-gate";

export default function DashboardCoursesLayout({ children }: { children: React.ReactNode }) {
  return <CourseGate>{children}</CourseGate>;
}