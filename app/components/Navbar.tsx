"use client";

import { useSession } from "next-auth/react";

import DesktopNav from "./navbar/DesktopNav";
import MobileNav from "./navbar/MobileNav";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <>
      <DesktopNav
        session={session}
        loading={status === "loading"}
      />

      <MobileNav
        session={session}
        loading={status === "loading"}
      />
    </>
  );
}