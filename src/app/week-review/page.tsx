import Link from "next/link";
import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { prisma } from "@/lib/prisma";

type WeekReviewPageProps = {
    searchParams?: Promise<{
        week?: string;
    }>;
};

export default async function WeekReviewPage({
    searchParams,
}: WeekReviewPageProps) {
    const params = (await searchParams) ?? {};
    const week = Number(params.week ?? "1");

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    const season = save?.currentSeasonId
        ? await prisma.season.findUnique({
            where: { id: save.currentSeasonId },
        })
        : null;

    const playerTeamId = save?.playerTeamId ?? null;

    const matches =
        season
            ? await prisma.match.findMany({
                where: {
                    seasonId: season.id,
                    week,
                    played: true,
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    winnerTeam: true,
                },
                orderBy: [{ matchDay: "asc" }, { division: "asc" }],
            })
            : [];

    const playerMatches =
        playerTeamId
            ? matches.filter(
                (match) =>
                    match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId
            )
            : [];

    const weekPlan =
        season && playerTeamId
            ? await prisma.teamWeekPlan.findUnique({
                where: {
                    seasonId_teamId_week: {
                        seasonId: season.id,
                        teamId: playerTeamId,
                        week,
                    },
                },
            })
            : null;

    return (
        <div>
            <PageHeader
                title={`Review da Rodada • Semana ${week}`}
                subtitle="Resumo dos confrontos, clima interno e fala pós-jogo."
            />

            <div className="mb-6 flex flex-wrap gap-3">
                <Link
                    href="/dashboard"
                    className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                >
                    Voltar ao dashboard
                </Link>

                <Link
                    href="/standings"
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                    Ver classificação
                </Link>
            </div>

            {weekPlan?.weeklyEventTitle || weekPlan?.interviewQuote ? (
                <div className="mb-6 grid gap-6 xl:grid-cols-2">
                    <SectionCard title="Evento da semana">
                        {weekPlan?.weeklyEventTitle ? (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                                <p className="text-lg font-bold text-white">{weekPlan.weeklyEventTitle}</p>
                                <p className="mt-3 text-sm leading-7 text-zinc-300">
                                    {weekPlan.weeklyEventBody}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">Nenhum evento registrado.</p>
                        )}
                    </SectionCard>

                    <SectionCard title="Entrevista pós-jogo">
                        {weekPlan?.interviewQuote ? (
                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                                <p className="text-sm leading-7 text-zinc-300">
                                    {weekPlan.interviewQuote}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400">Ainda sem entrevista registrada.</p>
                        )}
                    </SectionCard>
                </div>
            ) : null}

            {playerMatches.length > 0 ? (
                <SectionCard title="Jogos da sua organização no fim de semana">
                    <div className="space-y-4">
                        {playerMatches.map((playerMatch) => (
                            <div
                                key={playerMatch.id}
                                className="rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl"
                            >
                                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                                    {playerMatch.matchDay === "SATURDAY" ? "Jogo de sábado" : "Jogo de domingo"}
                                </p>

                                <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                                    <div className="flex items-center gap-4">
                                        <TeamBadge shortName={playerMatch.homeTeam.shortName} size="lg" />
                                        <div>
                                            <p className="text-sm text-zinc-500">Mandante</p>
                                            <p className="text-2xl font-bold text-white">{playerMatch.homeTeam.name}</p>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-4xl font-black text-cyan-300">
                                            {playerMatch.homeScore} x {playerMatch.awayScore}
                                        </p>
                                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                                            Resultado final
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-zinc-500">Visitante</p>
                                            <p className="text-2xl font-bold text-white">{playerMatch.awayTeam.name}</p>
                                        </div>
                                        <TeamBadge shortName={playerMatch.awayTeam.shortName} size="lg" />
                                    </div>
                                </div>

                                <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                                    <p className="text-sm leading-7 text-zinc-300">
                                        {playerMatch.summary}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            ) : null}

            <div className={playerMatches.length > 0 ? "mt-6" : ""}>
                <SectionCard title="Resultados completos da rodada">
                    {matches.length === 0 ? (
                        <p className="text-sm text-zinc-400">Nenhum jogo encontrado para esta semana.</p>
                    ) : (
                        <div className="space-y-4">
                            {matches.map((match) => {
                                const isPlayerMatch =
                                    match.homeTeamId === playerTeamId || match.awayTeamId === playerTeamId;

                                return (
                                    <div
                                        key={match.id}
                                        className={[
                                            "rounded-2xl border p-4",
                                            isPlayerMatch
                                                ? "border-cyan-800 bg-cyan-500/5"
                                                : "border-zinc-800 bg-zinc-950",
                                        ].join(" ")}
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <p className="text-sm uppercase tracking-[0.14em] text-zinc-500">
                                                {match.division} • {match.matchDay === "SATURDAY" ? "Sábado" : "Domingo"}
                                            </p>
                                            <p className="text-sm text-zinc-400">
                                                Vencedor: {match.winnerTeam?.name ?? "-"}
                                            </p>
                                        </div>

                                        <div className="mt-3 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                                            <div className="flex items-center gap-3">
                                                <TeamBadge shortName={match.homeTeam.shortName} size="sm" />
                                                <p className="font-semibold text-white">{match.homeTeam.name}</p>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-2xl font-black text-white">
                                                    {match.homeScore} x {match.awayScore}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <p className="text-right font-semibold text-white">
                                                    {match.awayTeam.name}
                                                </p>
                                                <TeamBadge shortName={match.awayTeam.shortName} size="sm" />
                                            </div>
                                        </div>

                                        <p className="mt-4 text-sm leading-7 text-zinc-300">
                                            {match.summary}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}