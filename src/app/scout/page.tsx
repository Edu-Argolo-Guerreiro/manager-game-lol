import Link from "next/link";
import { Division } from "@prisma/client";
import { TeamScoutCard } from "@/components/scout/team-scout-card";
import { PlayerScoutRow } from "@/components/scout/player-scout-row";
import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getScoutTeamDetails, getScoutTeams } from "@/server/services/scout-service";
import { getPlayerTeam } from "@/server/services/team-service";

type ScoutPageProps = {
    searchParams?: Promise<{
        division?: string;
        teamId?: string;
    }>;
};

export default async function ScoutPage({ searchParams }: ScoutPageProps) {
    const params = (await searchParams) ?? {};
    const playerTeam = await getPlayerTeam();

    const division =
        params.division === "TIER1"
            ? Division.TIER1
            : params.division === "TIER2"
                ? Division.TIER2
                : undefined;

    const teams = await getScoutTeams(division, playerTeam?.id);
    const selectedTeam =
        params.teamId ? await getScoutTeamDetails(params.teamId) : null;

    return (
        <div>
            <PageHeader
                title="Scout"
                subtitle="Monitore outros times, estude elencos e prepare futuras negociações."
            />

            <div className="mb-6 flex flex-wrap gap-3">
                <Link
                    href="/scout"
                    className={[
                        "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                        !division
                            ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800",
                    ].join(" ")}
                >
                    Todos
                </Link>

                <Link
                    href="/scout?division=TIER2"
                    className={[
                        "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                        division === "TIER2"
                            ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800",
                    ].join(" ")}
                >
                    Tier 2
                </Link>

                <Link
                    href="/scout?division=TIER1"
                    className={[
                        "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                        division === "TIER1"
                            ? "border-cyan-500 bg-cyan-500/15 text-cyan-300"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800",
                    ].join(" ")}
                >
                    Tier 1
                </Link>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                <SectionCard title="Times monitorados">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                        {teams.map((team) => (
                            <TeamScoutCard
                                key={team.id}
                                id={team.id}
                                name={team.name}
                                shortName={team.shortName}
                                division={team.division}
                                reputation={team.reputation}
                                fanbase={team.fanbase}
                                wins={team.wins}
                                losses={team.losses}
                            />
                        ))}

                        {teams.length === 0 ? (
                            <p className="text-sm text-zinc-400">Nenhum time encontrado.</p>
                        ) : null}
                    </div>
                </SectionCard>

                <SectionCard title="Detalhes do elenco">
                    {selectedTeam ? (
                        <div>
                            <div className="mb-5 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                                <TeamBadge shortName={selectedTeam.shortName} size="lg" />
                                <div>
                                    <p className="text-2xl font-bold text-white">{selectedTeam.name}</p>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        {selectedTeam.division} • {selectedTeam.wins}V / {selectedTeam.losses}D • Reputação {selectedTeam.reputation}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-6 grid gap-4 md:grid-cols-3">
                                {selectedTeam.staff.map((staff) => (
                                    <div
                                        key={staff.id}
                                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                                    >
                                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                                            {staff.role}
                                        </p>
                                        <p className="mt-2 font-semibold text-white">{staff.name}</p>
                                        <p className="mt-1 text-sm text-cyan-300">
                                            Qualidade {staff.quality}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                            <th className="px-3 py-3">Nick</th>
                                            <th className="px-3 py-3">Nac.</th>
                                            <th className="px-3 py-3">Rota</th>
                                            <th className="px-3 py-3">OVR</th>
                                            <th className="px-3 py-3">Potencial</th>
                                            <th className="px-3 py-3">Moral</th>
                                            <th className="px-3 py-3">Fadiga</th>
                                            <th className="px-3 py-3">Valor</th>
                                            <th className="px-3 py-3">Contrato</th>
                                            <th className="px-3 py-3">Status</th>
                                            <th className="px-3 py-3">Humor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTeam.players.map((player) => (
                                            <PlayerScoutRow
                                                key={player.id}
                                                nickname={player.nickname}
                                                nationality={player.nationality}
                                                role={player.role}
                                                overall={player.overall}
                                                potential={player.potential}
                                                morale={player.morale}
                                                fatigue={player.fatigue}
                                                marketValue={player.marketValue}
                                                contractYears={player.contractYears}
                                                status={player.status}
                                                moodNote={player.moodNote}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                            <p className="text-sm text-zinc-400">
                                Escolha um time à esquerda para analisar elenco, staff e situação atual.
                            </p>
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}