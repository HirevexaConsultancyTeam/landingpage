"use client";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const EXCLUDED = ["/admin", "/login", "/onboarding"];

export default function NavbarWrapper() {
  const pathname = usePathname();
  const hide = EXCLUDED.some(path => pathname.startsWith(path));
  if (hide) return null;
  return <Navbar />;
}