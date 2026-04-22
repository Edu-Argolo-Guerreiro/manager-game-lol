import { Division } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getPlayoffBracket } from "@/server/services/playoff-service";

function SeriesCard({
    title,
    home,
    away,
    score,
    winner,
    week,
    bestOf,
}: {
    title: string;
    home: string;
    away: string;
    score: string | null;
    winner: string | null;
    week: number | null;
    bestOf: number | null;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                {title} {week ? `• Semana ${week}` : ""}
                {bestOf ? ` • MD${bestOf}` : ""}
            </p>

            <div className="mt-3 space-y-2">
                <div className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white">{home}</div>
                <div className="rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white">{away}</div>
            </div>

            {score ? (
                <p className="mt-3 text-sm font-semibold text-cyan-300">{score}</p>
            ) : (
                <p className="mt-3 text-sm text-zinc-500">Ainda não jogada</p>
            )}

            {winner ? (
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-emerald-300">
                    Vencedor: {winner}
                </p>
            ) : null}
        </div>
    );
}

export default async function PlayoffsPage() {
    const tier1 = await getPlayoffBracket(Division.TIER1);
    const tier2 = await getPlayoffBracket(Division.TIER2);

    return (
        <div>
            <PageHeader
                title="Playoffs"
                subtitle="Chaveamento da pós-temporada. A fase regular agora vale só como seed."
            />

            <div className="space-y-8">
                {[{ title: "Tier 1", data: tier1 }, { title: "Tier 2", data: tier2 }].map((block) => (
                    <SectionCard key={block.title} title={block.title}>
                        {!block.data ? (
                            <p className="text-sm text-zinc-400">Sem dados de playoffs.</p>
                        ) : block.data.slots !== 6 ? (
                            <p className="text-sm text-zinc-400">
                                Essa visualização foi preparada para ligas com 8 times / 6 seeds nos playoffs.
                            </p>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid gap-4 lg:grid-cols-3">
                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 lg:col-span-2">
                                        <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                                            Seeds da fase regular
                                        </p>
                                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {block.data.standings.slice(0, 6).map((team, index) => (
                                                <div key={team.id} className="rounded-xl bg-zinc-900 p-3">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                                                        Seed {index + 1}
                                                    </p>
                                                    <p className="mt-1 font-semibold text-white">{team.shortName}</p>
                                                    <p className="text-sm text-zinc-400">
                                                        {team.wins}V / {team.losses}D
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                                        <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                                            Premiação
                                        </p>
                                        <div className="mt-4 space-y-3">
                                            {block.data.rewards.map((reward) => (
                                                <div key={reward.place} className="rounded-xl bg-zinc-900 p-3">
                                                    <p className="font-semibold text-white">{reward.place}</p>
                                                    <p className="text-sm text-zinc-400">{reward.reward}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 xl:grid-cols-2">
                                    <div>
                                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
                                            Chave superior
                                        </p>
                                        <div className="space-y-4">
                                            {block.data.rounds.upper.map((series) => (
                                                <SeriesCard
                                                    key={series.roundKey}
                                                    title={series.title}
                                                    home={series.home}
                                                    away={series.away}
                                                    score={series.score}
                                                    winner={series.winner}
                                                    week={series.week}
                                                    bestOf={series.bestOf}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                                            Chave inferior + final
                                        </p>
                                        <div className="space-y-4">
                                            {block.data.rounds.lower.map((series) => (
                                                <SeriesCard
                                                    key={series.roundKey}
                                                    title={series.title}
                                                    home={series.home}
                                                    away={series.away}
                                                    score={series.score}
                                                    winner={series.winner}
                                                    week={series.week}
                                                    bestOf={series.bestOf}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </SectionCard>
                ))}
            </div>
        </div>
    );
}