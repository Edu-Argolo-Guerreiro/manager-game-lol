import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { WeekPlanForm } from "@/components/calendar/week-plan-form";
import { prisma } from "@/lib/prisma";
import { getCurrentSeason } from "@/server/services/season-service";
import { getPlayerTeam } from "@/server/services/team-service";
import { getOrCreateCurrentWeekPlan } from "@/server/services/schedule-service";

const actionLabels: Record<string, string> = {
    REST: "Descanso",
    LIGHT: "Treino leve",
    TACTICAL: "Treino tático",
    INTENSE: "Treino intenso",
    INDIVIDUAL: "Treino individual",
    REVIEW: "Review / VOD",
    PREP: "Preparação de jogo",
    MATCHDAY: "Dia de jogo",
};

export default async function CalendarPage() {
    const season = await getCurrentSeason();
    const team = await getPlayerTeam();
    const plan = await getOrCreateCurrentWeekPlan();

    const currentWeek = season?.currentWeek ?? 1;

    const match =
        season && team
            ? await prisma.match.findFirst({
                where: {
                    seasonId: season.id,
                    week: currentWeek,
                    OR: [{ homeTeamId: team.id }, { awayTeamId: team.id }],
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                },
            })
            : null;

    const starters = team?.players.filter((player) => player.status === "STARTER") ?? [];
    const avgFatigue =
        starters.length > 0
            ? Math.round(starters.reduce((acc, player) => acc + player.fatigue, 0) / starters.length)
            : 0;

    const avgMorale =
        starters.length > 0
            ? Math.round(starters.reduce((acc, player) => acc + player.morale, 0) / starters.length)
            : 0;

    const avgForm =
        starters.length > 0
            ? Math.round(starters.reduce((acc, player) => acc + player.form, 0) / starters.length)
            : 0;

    const weekCards = plan
        ? [
            { day: "Segunda", action: plan.monday },
            { day: "Terça", action: plan.tuesday },
            { day: "Quarta", action: plan.wednesday },
            { day: "Quinta", action: plan.thursday },
            { day: "Sexta", action: plan.friday },
            { day: "Sábado", action: plan.saturday },
            { day: "Domingo", action: plan.sunday },
        ]
        : [];

    return (
        <div>
            <PageHeader
                title="Calendário semanal"
                subtitle="Organize sua semana de trabalho antes do jogo de domingo."
            />

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <p className="text-sm text-zinc-500">Semana atual</p>
                    <p className="mt-2 text-2xl font-bold text-white">{currentWeek}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <p className="text-sm text-zinc-500">Forma média titulares</p>
                    <p className="mt-2 text-2xl font-bold text-cyan-300">{avgForm}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <p className="text-sm text-zinc-500">Fadiga média titulares</p>
                    <p className="mt-2 text-2xl font-bold text-amber-300">{avgFatigue}</p>
                </div>
            </div>

            <div className="mb-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <SectionCard title="Planejamento da semana">
                    {plan ? <WeekPlanForm plan={plan} /> : null}
                </SectionCard>

                <SectionCard title="Jogo do fim de semana">
                    {match ? (
                        <div className="space-y-4">
                            <p className="text-sm text-zinc-400">
                                A rodada oficial acontece no domingo. Sábado fica reservado para preparação.
                            </p>

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
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

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Moral média</span>
                                        <span className="font-medium text-white">{avgMorale}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Forma média</span>
                                        <span className="font-medium text-white">{avgForm}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400">Fadiga média</span>
                                        <span className="font-medium text-white">{avgFatigue}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-zinc-400">Nenhum confronto encontrado para esta semana.</p>
                    )}
                </SectionCard>
            </div>

            <SectionCard title="Agenda visual da semana">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                    {weekCards.map((item) => (
                        <div
                            key={item.day}
                            className={[
                                "rounded-2xl border p-4",
                                item.day === "Domingo"
                                    ? "border-cyan-900 bg-cyan-500/10"
                                    : item.day === "Sábado"
                                        ? "border-amber-900 bg-amber-500/10"
                                        : "border-zinc-800 bg-zinc-950",
                            ].join(" ")}
                        >
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                                {item.day}
                            </p>
                            <p className="mt-3 font-semibold text-white">
                                {actionLabels[item.action]}
                            </p>
                        </div>
                    ))}
                </div>
            </SectionCard>
        </div>
    );
}