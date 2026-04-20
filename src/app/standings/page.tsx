import { Division } from "@prisma/client";
import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { prisma } from "@/lib/prisma";
import { getStandings } from "@/server/services/team-service";

export default async function StandingsPage() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    const playerTeamId = save?.playerTeamId ?? null;

    const tier2 = await getStandings(Division.TIER2);
    const tier1 = await getStandings(Division.TIER1);

    return (
        <div>
            <PageHeader
                title="Classificação"
                subtitle="Acompanhe sua posição e as zonas de promoção e rebaixamento."
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard title="Tier 2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                    <th className="px-3 py-3">#</th>
                                    <th className="px-3 py-3">Time</th>
                                    <th className="px-3 py-3">V</th>
                                    <th className="px-3 py-3">D</th>
                                    <th className="px-3 py-3">Rep</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tier2.map((team, index) => {
                                    const isPlayerTeam = team.id === playerTeamId;
                                    const isPromotionSpot = index === 0;

                                    return (
                                        <tr
                                            key={team.id}
                                            className={[
                                                "border-b border-zinc-900",
                                                isPlayerTeam ? "bg-cyan-500/10" : "",
                                                isPromotionSpot ? "ring-1 ring-emerald-700/40" : "",
                                            ].join(" ")}
                                        >
                                            <td className="px-3 py-3">
                                                <span
                                                    className={[
                                                        "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                                                        isPromotionSpot
                                                            ? "bg-emerald-500/20 text-emerald-300"
                                                            : "bg-zinc-800 text-zinc-300",
                                                    ].join(" ")}
                                                >
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-3">
                                                    <TeamBadge shortName={team.shortName} size="sm" />
                                                    <div>
                                                        <p className="font-medium text-white">{team.name}</p>
                                                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                                                            {isPromotionSpot ? "Zona de promoção" : isPlayerTeam ? "Seu time" : team.shortName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-zinc-300">{team.wins}</td>
                                            <td className="px-3 py-3 text-zinc-300">{team.losses}</td>
                                            <td className="px-3 py-3 text-zinc-300">{team.reputation}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Tier 1">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                    <th className="px-3 py-3">#</th>
                                    <th className="px-3 py-3">Time</th>
                                    <th className="px-3 py-3">V</th>
                                    <th className="px-3 py-3">D</th>
                                    <th className="px-3 py-3">Rep</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tier1.map((team, index) => {
                                    const isPlayerTeam = team.id === playerTeamId;
                                    const isRelegationSpot = index === tier1.length - 1;

                                    return (
                                        <tr
                                            key={team.id}
                                            className={[
                                                "border-b border-zinc-900",
                                                isPlayerTeam ? "bg-cyan-500/10" : "",
                                                isRelegationSpot ? "ring-1 ring-rose-700/40" : "",
                                            ].join(" ")}
                                        >
                                            <td className="px-3 py-3">
                                                <span
                                                    className={[
                                                        "inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                                                        isRelegationSpot
                                                            ? "bg-rose-500/20 text-rose-300"
                                                            : "bg-zinc-800 text-zinc-300",
                                                    ].join(" ")}
                                                >
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                <div className="flex items-center gap-3">
                                                    <TeamBadge shortName={team.shortName} size="sm" />
                                                    <div>
                                                        <p className="font-medium text-white">{team.name}</p>
                                                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                                                            {isRelegationSpot ? "Zona de rebaixamento" : isPlayerTeam ? "Seu time" : team.shortName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-zinc-300">{team.wins}</td>
                                            <td className="px-3 py-3 text-zinc-300">{team.losses}</td>
                                            <td className="px-3 py-3 text-zinc-300">{team.reputation}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}