import Link from "next/link";
import { AdvanceWeekForm } from "@/components/dashboard/advance-week-form";
import { MarketingActionsForm } from "@/components/dashboard/marketing-actions-form";
import { NextSeasonForm } from "@/components/dashboard/next-season-form";
import { TeamIdentityForm } from "@/components/dashboard/team-identity-form";
import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    const season = save?.currentSeasonId
        ? await prisma.season.findUnique({
            where: { id: save.currentSeasonId },
        })
        : null;

    const team = save?.playerTeamId
        ? await prisma.team.findUnique({
            where: { id: save.playerTeamId },
            include: {
                players: true,
                staff: true,
            },
        })
        : null;

    const upcomingMatches =
        save?.currentSeasonId && save?.playerTeamId
            ? await prisma.match.findMany({
                where: {
                    seasonId: save.currentSeasonId,
                    played: false,
                    OR: [{ homeTeamId: save.playerTeamId }, { awayTeamId: save.playerTeamId }],
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
                orderBy: {
                    week: "asc",
                },
                take: 5,
            })
            : [];

    const lastPlayedWeek =
        season && season.currentWeek > 1 ? season.currentWeek - 1 : null;

    const lastResults =
        save?.currentSeasonId && lastPlayedWeek
            ? await prisma.match.findMany({
                where: {
                    seasonId: save.currentSeasonId,
                    week: lastPlayedWeek,
                    played: true,
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    winnerTeam: true,
                },
                orderBy: {
                    division: "asc",
                },
            })
            : [];

    const payroll =
        team?.players?.reduce((acc, player) => acc + player.salary, 0) ?? 0;

    const staffPayroll =
        team?.staff?.reduce((acc, member) => acc + member.salary, 0) ?? 0;

    const starters =
        team?.players?.filter((player) => player.status === "STARTER") ?? [];

    const avgOverall =
        starters.length > 0
            ? Math.round(starters.reduce((acc, player) => acc + player.overall, 0) / starters.length)
            : 0;

    const avgFatigue =
        starters.length > 0
            ? Math.round(starters.reduce((acc, player) => acc + player.fatigue, 0) / starters.length)
            : 0;

    const tier1Standings = await prisma.team.findMany({
        where: { division: "TIER1" },
        orderBy: [{ wins: "desc" }, { losses: "asc" }, { reputation: "desc" }],
        select: {
            id: true,
            name: true,
            shortName: true,
            wins: true,
            losses: true,
            division: true,
        },
    });

    const tier2Standings = await prisma.team.findMany({
        where: { division: "TIER2" },
        orderBy: [{ wins: "desc" }, { losses: "asc" }, { reputation: "desc" }],
        select: {
            id: true,
            name: true,
            shortName: true,
            wins: true,
            losses: true,
            division: true,
        },
    });

    const promotedPreview = season?.isFinished ? tier2Standings[0] : null;
    const relegatedPreview = season?.isFinished
        ? tier1Standings[tier1Standings.length - 1]
        : null;

    const championTier1 = season?.isFinished ? tier1Standings[0] : null;
    const yourPositionTier2 = team ? tier2Standings.findIndex((item) => item.id === team.id) + 1 : 0;
    const yourPositionTier1 = team ? tier1Standings.findIndex((item) => item.id === team.id) + 1 : 0;

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle="Sua central de comando da temporada."
            />

            {team ? (
                <div className="mb-6 rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-xl">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <TeamBadge shortName={team.shortName} size="lg" />
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
                                    Organização ativa
                                </p>
                                <h2 className="mt-1 text-3xl font-black text-white">{team.name}</h2>
                                <p className="mt-2 text-sm text-zinc-400">
                                    {team.division} • Reputação {team.reputation} • Torcida {team.fanbase.toLocaleString("pt-BR")}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            {!season?.isFinished ? <AdvanceWeekForm /> : null}
                            {season?.isFinished ? <NextSeasonForm /> : null}
                            {lastPlayedWeek ? (
                                <Link
                                    href={`/week-review?week=${lastPlayedWeek}`}
                                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                                >
                                    Ver última rodada
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="mb-3 text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
                            Personalizar identidade da org
                        </p>
                        <TeamIdentityForm
                            currentName={team.name}
                            currentShortName={team.shortName}
                        />
                    </div>
                </div>
            ) : null}

            {season?.isFinished && promotedPreview && relegatedPreview ? (
                <div className="mb-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-emerald-900 bg-emerald-950/40 p-5">
                        <p className="text-sm uppercase tracking-[0.18em] text-emerald-400">
                            Promoção prevista
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">{promotedPreview.name}</p>
                        <p className="mt-1 text-sm text-zinc-300">
                            Campeão/subida do Tier 2 para o Tier 1
                        </p>
                    </div>

                    <div className="rounded-2xl border border-amber-900 bg-amber-950/40 p-5">
                        <p className="text-sm uppercase tracking-[0.18em] text-amber-400">
                            Campeão Tier 1
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">
                            {championTier1?.name ?? "-"}
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">
                            Melhor campanha da elite na temporada
                        </p>
                    </div>

                    <div className="rounded-2xl border border-rose-900 bg-rose-950/40 p-5">
                        <p className="text-sm uppercase tracking-[0.18em] text-rose-400">
                            Rebaixamento previsto
                        </p>
                        <p className="mt-2 text-2xl font-bold text-white">{relegatedPreview.name}</p>
                        <p className="mt-1 text-sm text-zinc-300">
                            Último colocado do Tier 1 desce para o Tier 2
                        </p>
                    </div>
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <StatCard
                    label="Organização"
                    value={team?.name ?? "Sem time"}
                    helper={team ? `${team.shortName} • ${team.division}` : "Sem save ativo"}
                />
                <StatCard
                    label="Temporada"
                    value={season?.year ?? "-"}
                    helper={
                        season
                            ? season.isFinished
                                ? "Temporada finalizada"
                                : `Semana atual: ${season.currentWeek}`
                            : "Sem temporada ativa"
                    }
                />
                <StatCard
                    label="Caixa"
                    value={`R$ ${(team?.budget ?? 0).toLocaleString("pt-BR")}`}
                    helper="Orçamento disponível"
                />
                <StatCard
                    label="Overall médio"
                    value={avgOverall}
                    helper="Média dos titulares"
                />
                <StatCard
                    label="Fadiga média"
                    value={avgFatigue}
                    helper="Quanto menor, melhor"
                />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 space-y-6">
                    <SectionCard title="Confrontos da sua org">
                        {upcomingMatches.length === 0 ? (
                            <p className="text-sm text-zinc-400">Nenhuma partida encontrada.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-zinc-500">
                                                Semana {match.week} • {match.division} • MD{match.bestOf}
                                            </p>
                                            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                                {match.phase === "REGULAR_SEASON" ? "Regular" : "Playoffs"}
                                            </span>
                                        </div>

                                        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                                            <div className="flex items-center gap-3">
                                                <TeamBadge shortName={match.homeTeam.shortName} size="sm" />
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                                                        Mandante
                                                    </p>
                                                    <p className="font-semibold text-white">{match.homeTeam.name}</p>
                                                </div>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-lg font-black text-cyan-300">VS</p>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <div className="text-right">
                                                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                                                        Visitante
                                                    </p>
                                                    <p className="font-semibold text-white">{match.awayTeam.name}</p>
                                                </div>
                                                <TeamBadge shortName={match.awayTeam.shortName} size="sm" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="Resultados da última rodada">
                        {lastResults.length === 0 ? (
                            <p className="text-sm text-zinc-400">Ainda não há resultados para mostrar.</p>
                        ) : (
                            <div className="space-y-3">
                                {lastResults.map((match) => (
                                    <div
                                        key={match.id}
                                        className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
                                    >
                                        <p className="text-sm text-zinc-500">
                                            Semana {match.week} • {match.division}
                                        </p>
                                        <p className="mt-1 font-semibold text-white">
                                            {match.homeTeam.shortName} {match.homeScore} x {match.awayScore} {match.awayTeam.shortName}
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            Vencedor: {match.winnerTeam?.shortName ?? "-"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="Ações de marketing">
                        <MarketingActionsForm used={team?.marketingActionsUsed ?? 0} />
                    </SectionCard>
                </div>

                <div className="space-y-6">
                    <SectionCard title="Resumo financeiro">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Folha jogadores</span>
                                <span className="font-medium text-white">
                                    R$ {payroll.toLocaleString("pt-BR")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Folha staff</span>
                                <span className="font-medium text-white">
                                    R$ {staffPayroll.toLocaleString("pt-BR")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Torcida estimada</span>
                                <span className="font-medium text-white">
                                    {(team?.fanbase ?? 0).toLocaleString("pt-BR")}
                                </span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Resumo competitivo">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Vitórias</span>
                                <span className="font-medium text-white">{team?.wins ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Derrotas</span>
                                <span className="font-medium text-white">{team?.losses ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Posição atual</span>
                                <span className="font-medium text-white">
                                    {team?.division === "TIER2" ? yourPositionTier2 || "-" : yourPositionTier1 || "-"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Reputação</span>
                                <span className="font-medium text-white">{team?.reputation ?? 0}</span>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Core do elenco">
                        <div className="space-y-3">
                            {starters.slice(0, 5).map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3"
                                >
                                    <div>
                                        <p className="font-medium text-white">{player.nickname}</p>
                                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                                            {player.role} • {player.individualFocus}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-cyan-300">{player.overall}</p>
                                        <p className="text-xs text-zinc-500">OVR</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}