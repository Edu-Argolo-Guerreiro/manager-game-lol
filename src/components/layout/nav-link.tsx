"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    href: string;
    label: string;
};

export function NavLink({ href, label }: NavLinkProps) {
    const pathname = usePathname();

    const isActive =
        pathname === href || (href !== "/" && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={[
                "rounded-xl border px-4 py-2 text-sm font-medium transition",
                isActive
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                    : "border-zinc-800 bg-zinc-900/70 text-zinc-300 hover:border-cyan-900 hover:bg-zinc-800 hover:text-white",
            ].join(" ")}
        >
            {label}
        </Link>
    );
}