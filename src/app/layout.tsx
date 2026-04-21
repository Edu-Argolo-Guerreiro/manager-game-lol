import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { NavLink } from "@/components/layout/nav-link";

export const metadata: Metadata = {
    title: "Rift Manager",
    description: "Manager de League of Legends offline",
};

const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/roster", label: "Elenco" },
    { href: "/market", label: "Mercado" },
    { href: "/staff", label: "Staff" },
    { href: "/scout", label: "Scout" },
    { href: "/calendar", label: "Calendário" },
    { href: "/standings", label: "Classificação" },
    { href: "/finances", label: "Finanças" },
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className="min-h-screen bg-zinc-950 text-zinc-100">
                <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.10),transparent_30%),linear-gradient(to_bottom,#09090b,#09090b)]">
                    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur">
                        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                            <div>
                                <Link
                                    href="/"
                                    className="text-xl font-black tracking-[0.18em] text-cyan-400"
                                >
                                    RIFT MANAGER
                                </Link>
                                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">
                                    Brazil Tier 2 Career Mode
                                </p>
                            </div>

                            <nav className="hidden flex-wrap items-center gap-2 md:flex">
                                {navItems.map((item) => (
                                    <NavLink key={item.href} href={item.href} label={item.label} />
                                ))}
                            </nav>
                        </div>
                    </header>

                    <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
                </div>
            </body>
        </html>
    );
}