import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatCard } from "@/components/ui/stat-card";
import { getUpcomingMatchesForPlayerTeam } from "@/server/services/match-service";
import { getCurrentSeason } from "@/server/services/season-service";
import { getPlayerTeam } from "@/server/services/team-service";

export default async function DashboardPage() {
    const team = await getPlayerTeam();
    const season = await getCurrentSeason();
    const upcomingMatches = await getUpcomingMatchesForPlayerTeam();

    const payroll =
        team?.players.reduce((acc, player) => acc + player.salary, 0) ?? 0;

    const staffPayroll =
        team?.staff.reduce((acc, member) => acc + member.salary, 0) ?? 0;

    const starters = team?.players.filter((player) => player.status === "STARTER") ?? [];
    const avgOverall =
        starters.length > 0
            ? Math.round(
                starters.reduce((acc, player) => acc + player.overall, 0) / starters.length
            )
            : 0;

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle="Visão geral da sua organização no save atual."
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Organização"
                    value={team?.name ?? "Sem time"}
                    helper={team ? `${team.shortName} • ${team.division}` : "Crie ou carregue um save"}
                />
                <StatCard
                    label="Temporada"
                    value={season?.year ?? "-"}
                    helper={season ? `Semana atual: ${season.currentWeek}` : "Sem temporada ativa"}
                />
                <StatCard
                    label="Caixa"
                    value={`R$ ${(team?.budget ?? 0).toLocaleString("pt-BR")}`}
                    helper="Orçamento disponível"
                />
                <StatCard
                    label="Overall médio"
                    value={avgOverall}
                    helper="Média dos 5 titulares"
                />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <SectionCard title="Próximas partidas">
                        {upcomingMatches.length === 0 ? (
                            <p className="text-sm text-zinc-400">Nenhuma partida encontrada.</p>
                        ) : (
                            <div className="space-y-3">
                                {upcomingMatches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm text-zinc-500">
                                                Semana {match.week} • {match.division} • MD{match.bestOf}
                                            </p>
                                            <p className="mt-1 font-semibold text-white">
                                                {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                                            </p>
                                        </div>

                                        <div className="text-sm text-zinc-400">
                                            {match.phase === "REGULAR_SEASON" ? "Temporada Regular" : "Playoffs"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>

                <div className="space-y-6">
                    <SectionCard title="Resumo financeiro">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Folha salarial jogadores</span>
                                <span className="font-medium text-white">
                                    R$ {payroll.toLocaleString("pt-BR")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Folha salarial staff</span>
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

                    <SectionCard title="Resumo esportivo">
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
                                <span className="text-zinc-400">Reputação</span>
                                <span className="font-medium text-white">{team?.reputation ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Nível da estrutura</span>
                                <span className="font-medium text-white">{team?.facilityLevel ?? 1}</span>
                            </div>
                        </div>
                    </SectionCard>
                </div>
            </div>
        </div>
    );
}