import CourseGate from "@/lib/course-gate";

export default function CourseSlugLayout({ children }: { children: React.ReactNode }) {
  return <CourseGate>{children}</CourseGate>;
}