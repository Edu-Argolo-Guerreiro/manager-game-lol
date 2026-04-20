import { Role } from "@prisma/client";
import { SignPlayerForm } from "@/components/market/sign-player-form";
import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getFreeAgents, getRosterCountByRole } from "@/server/services/player-service";
import { getPlayerTeam } from "@/server/services/team-service";

type MarketPageProps = {
    searchParams?: Promise<{
        role?: string;
    }>;
};

const roleOptions: Array<{ label: string; value: "ALL" | Role }> = [
    { label: "Todas", value: "ALL" },
    { label: "Top", value: "TOP" },
    { label: "Jungle", value: "JG" },
    { label: "Mid", value: "MID" },
    { label: "ADC", value: "ADC" },
    { label: "Support", value: "SUP" },
];

export default async function MarketPage({ searchParams }: MarketPageProps) {
    const params = (await searchParams) ?? {};
    const selectedRole =
        params.role && ["TOP", "JG", "MID", "ADC", "SUP"].includes(params.role)
            ? (params.role as Role)
            : undefined;

    const freeAgents = await getFreeAgents(selectedRole);
    const team = await getPlayerTeam();
    const rosterCount = team ? await getRosterCountByRole(team.id) : null;

    return (
        <div>
            <PageHeader
                title="Mercado"
                subtitle="Reforce sua organização com inteligência de orçamento."
            />

            <div className="mb-6 flex items-center gap-4 rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
                <TeamBadge shortName={team?.shortName ?? "ORG"} size="lg" />
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Caixa disponível</p>
                    <p className="mt-2 text-3xl font-black text-white">
                        R$ {(team?.budget ?? 0).toLocaleString("pt-BR")}
                    </p>
                </div>
            </div>

            <div className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <SectionCard title="Filtrar por rota">
                    <div className="flex flex-wrap gap-2">
                        {roleOptions.map((option) => {
                            const isActive =
                                (option.value === "ALL" && !selectedRole) ||
                                option.value === selectedRole;

                            const href =
                                option.value === "ALL"
                                    ? "/market"
                                    : `/market?role=${option.value}`;

                            return (
                                <a
                                    key={option.value}
                                    href={href}
                                    className={[
                                        "rounded-xl border px-4 py-2 text-sm font-medium transition",
                                        isActive
                                            ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                                            : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white",
                                    ].join(" ")}
                                >
                                    {option.label}
                                </a>
                            );
                        })}
                    </div>
                </SectionCard>

                <SectionCard title="Composição atual">
                    <div className="grid grid-cols-3 gap-3 text-sm md:grid-cols-6 xl:grid-cols-3">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                            <p className="text-zinc-500">TOP</p>
                            <p className="mt-1 font-bold text-white">{rosterCount?.TOP ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                            <p className="text-zinc-500">JG</p>
                            <p className="mt-1 font-bold text-white">{rosterCount?.JG ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                            <p className="text-zinc-500">MID</p>
                            <p className="mt-1 font-bold text-white">{rosterCount?.MID ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                            <p className="text-zinc-500">ADC</p>
                            <p className="mt-1 font-bold text-white">{rosterCount?.ADC ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                            <p className="text-zinc-500">SUP</p>
                            <p className="mt-1 font-bold text-white">{rosterCount?.SUP ?? 0}</p>
                        </div>
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                            <p className="text-zinc-500">Total</p>
                            <p className="mt-1 font-bold text-white">{rosterCount?.total ?? 0}</p>
                        </div>
                    </div>
                </SectionCard>
            </div>

            <SectionCard title="Free Agents">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                <th className="px-3 py-3">Nick</th>
                                <th className="px-3 py-3">Nac.</th>
                                <th className="px-3 py-3">Rota</th>
                                <th className="px-3 py-3">OVR</th>
                                <th className="px-3 py-3">Potencial</th>
                                <th className="px-3 py-3">Idade</th>
                                <th className="px-3 py-3">Salário</th>
                                <th className="px-3 py-3">Valor</th>
                                <th className="px-3 py-3">Custo total</th>
                                <th className="px-3 py-3">Chega como</th>
                                <th className="px-3 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {freeAgents.map((player) => {
                                const totalCost = player.salary + player.marketValue;
                                const canAfford = (team?.budget ?? 0) >= totalCost;
                                const sameRoleCount =
                                    player.role === "TOP"
                                        ? rosterCount?.TOP ?? 0
                                        : player.role === "JG"
                                            ? rosterCount?.JG ?? 0
                                            : player.role === "MID"
                                                ? rosterCount?.MID ?? 0
                                                : player.role === "ADC"
                                                    ? rosterCount?.ADC ?? 0
                                                    : rosterCount?.SUP ?? 0;

                                const arrivalLabel = sameRoleCount === 0 ? "Titular" : "Reserva";

                                return (
                                    <tr key={player.id} className="border-b border-zinc-900">
                                        <td className="px-3 py-3 font-medium text-white">{player.nickname}</td>
                                        <td className="px-3 py-3 text-zinc-300">{player.nationality}</td>
                                        <td className="px-3 py-3 text-zinc-300">{player.role}</td>
                                        <td className="px-3 py-3 font-semibold text-cyan-400">{player.overall}</td>
                                        <td className="px-3 py-3 text-zinc-300">{player.potential}</td>
                                        <td className="px-3 py-3 text-zinc-300">{player.age}</td>
                                        <td className="px-3 py-3 text-zinc-300">
                                            R$ {player.salary.toLocaleString("pt-BR")}
                                        </td>
                                        <td className="px-3 py-3 text-zinc-300">
                                            R$ {player.marketValue.toLocaleString("pt-BR")}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={canAfford ? "text-emerald-300" : "text-rose-300"}>
                                                R$ {totalCost.toLocaleString("pt-BR")}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span
                                                className={[
                                                    "rounded-lg px-2 py-1 text-xs font-semibold",
                                                    arrivalLabel === "Titular"
                                                        ? "bg-emerald-500/15 text-emerald-300"
                                                        : "bg-amber-500/15 text-amber-300",
                                                ].join(" ")}
                                            >
                                                {arrivalLabel}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            {canAfford ? (
                                                <SignPlayerForm playerId={player.id} />
                                            ) : (
                                                <span className="text-xs font-semibold text-rose-300">
                                                    Caixa insuficiente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
}