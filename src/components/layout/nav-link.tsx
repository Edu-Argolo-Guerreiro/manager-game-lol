"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
    href: string;
    label: string;
    icon?: string;
};

export function NavLink({ href, label, icon = "•" }: NavLinkProps) {
    const pathname = usePathname();

    const isActive =
        pathname === href || (href !== "/" && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={[
                "group relative flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-200",
                isActive
                    ? "border-[rgba(90,140,255,0.42)] bg-[rgba(90,140,255,0.12)] text-white shadow-[0_0_0_1px_rgba(90,140,255,0.18)]"
                    : "border-transparent bg-transparent text-[#9db2d8] hover:border-[rgba(61,91,147,0.38)] hover:bg-[rgba(22,39,70,0.55)] hover:text-white",
            ].join(" ")}
        >
            <span
                className={[
                    "inline-flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold",
                    isActive
                        ? "border-[rgba(90,140,255,0.5)] bg-[rgba(90,140,255,0.14)] text-[#7fb0ff]"
                        : "border-[rgba(61,91,147,0.24)] bg-[rgba(16,27,48,0.66)] text-[#89a4d1]",
                ].join(" ")}
            >
                {icon}
            </span>

            <span className="text-sm font-medium">{label}</span>

            {isActive ? (
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#5a8cff]" />
            ) : null}
        </Link>
    );
}