"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import type { ComponentProps, MouseEventHandler } from "react";

type GuestAccessLinkProps = Omit<ComponentProps<typeof Link>, "onClick"> & {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export function GuestAccessLink({ onClick, ...props }: GuestAccessLinkProps) {
  const { user, guestMode, continueAsGuest } = useAuth();
  return <Link {...props} onClick={(event) => { if (!user && !guestMode) continueAsGuest(); onClick?.(event); }} />;
}
