import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Rift Manager",
    description: "Manager de League of Legends offline",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className="bg-zinc-950 text-zinc-100">
                <div className="min-h-screen">
                    <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur">
                        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                            <Link href="/" className="text-xl font-bold tracking-wide text-cyan-400">
                                RIFT MANAGER
                            </Link>

                            <nav className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                                <Link href="/dashboard" className="rounded-md px-3 py-2 hover:bg-zinc-800">
                                    Dashboard
                                </Link>
                                <Link href="/roster" className="rounded-md px-3 py-2 hover:bg-zinc-800">
                                    Elenco
                                </Link>
                                <Link href="/market" className="rounded-md px-3 py-2 hover:bg-zinc-800">
                                    Mercado
                                </Link>
                                <Link href="/calendar" className="rounded-md px-3 py-2 hover:bg-zinc-800">
                                    Calendário
                                </Link>
                                <Link href="/standings" className="rounded-md px-3 py-2 hover:bg-zinc-800">
                                    Classificação
                                </Link>
                                <Link href="/finances" className="rounded-md px-3 py-2 hover:bg-zinc-800">
                                    Finanças
                                </Link>
                            </nav>
                        </div>
                    </header>

                    <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
                </div>
            </body>
        </html>
    );
}