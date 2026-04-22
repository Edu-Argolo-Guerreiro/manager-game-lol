import Link from "next/link";
import { NavLink } from "@/components/layout/nav-link";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "⌂" },
    { href: "/roster", label: "Elenco", icon: "👥" },
    { href: "/calendar", label: "Calendário", icon: "🗓" },
    { href: "/playoffs", label: "Playoffs", icon: "⌁" },
    { href: "/standings", label: "Classificação", icon: "≣" },
    { href: "/match", label: "Partida", icon: "⚔" },
    { href: "/scout", label: "Scout", icon: "◉" },
    { href: "/market", label: "Mercado", icon: "🛒" },
    { href: "/staff", label: "Staff", icon: "✦" },
    { href: "/finances", label: "Finanças", icon: "$" },
];

type SidebarProps = {
    teamName?: string;
    shortName?: string;
    wins?: number;
    losses?: number;
    seasonLabel?: string;
    weekLabel?: string;
};

export function Sidebar({
    teamName = "RIFT",
    shortName = "RF",
    wins = 0,
    losses = 0,
    seasonLabel = "TEMPORADA",
    weekLabel = "Sem. 1/18",
}: SidebarProps) {
    return (
        <aside className="app-sidebar flex h-screen w-[280px] flex-col">
            <div className="border-b border-[rgba(61,91,147,0.28)] px-6 py-6">
                <Link href="/dashboard" className="flex items-start gap-4">
                    <div className="glow-green flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(31,224,125,0.5)] bg-[rgba(31,224,125,0.08)] text-lg font-black text-[#1fe07d]">
                        {shortName}
                    </div>

                    <div className="min-w-0">
                        <p className="truncate text-lg font-black uppercase tracking-[0.14em] text-white">
                            {teamName}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8ea8d8]">
                            {seasonLabel}
                        </p>
                    </div>
                </Link>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[rgba(31,224,125,0.28)] bg-[rgba(31,224,125,0.08)] px-4 py-3">
                        <p className="text-center text-2xl font-black text-[#1fe07d]">{wins}</p>
                        <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db2d8]">
                            Vitórias
                        </p>
                    </div>

                    <div className="rounded-2xl border border-[rgba(255,95,109,0.28)] bg-[rgba(255,95,109,0.08)] px-4 py-3">
                        <p className="text-center text-2xl font-black text-[#ff5f6d]">{losses}</p>
                        <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9db2d8]">
                            Derrotas
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5">
                <nav className="space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.href}
                            href={item.href}
                            label={item.label}
                            icon={item.icon}
                        />
                    ))}
                </nav>
            </div>

            <div className="border-t border-[rgba(61,91,147,0.28)] px-5 py-5">
                <p className="ui-label">Temporada atual</p>
                <div className="mt-3 rounded-2xl border border-[rgba(61,91,147,0.3)] bg-[rgba(16,27,48,0.78)] p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">{seasonLabel}</span>
                        <span className="text-xs font-semibold text-[#5a8cff]">{weekLabel}</span>
                    </div>

                    <div className="mt-4 h-2 rounded-full bg-[rgba(37,58,99,0.55)]">
                        <div className="h-2 w-[62%] rounded-full bg-gradient-to-r from-[#1fe07d] to-[#5a8cff]" />
                    </div>

                    <p className="mt-3 text-xs text-[#8ea8d8]">Online • fase em andamento</p>
                </div>
            </div>
        </aside>
    );
}