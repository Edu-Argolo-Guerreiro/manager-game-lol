import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getCurrentSeason, getMatchesByWeek } from "@/server/services/season-service";

export default async function CalendarPage() {
    const season = await getCurrentSeason();
    const currentWeek = season?.currentWeek ?? 1;
    const shownWeek =
        season?.isFinished && currentWeek > 1 ? currentWeek - 1 : currentWeek;

    const matches = await getMatchesByWeek(shownWeek);

    return (
        <div>
            <PageHeader
                title="Calendário"
                subtitle="Partidas da semana atual ou da última semana jogada."
            />

            <SectionCard title={`Semana ${shownWeek}`}>
                <div className="space-y-3">
                    {matches.map((match) => (
                        <div
                            key={match.id}
                            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                        >
                            <p className="text-sm text-zinc-500">
                                {match.division} • {match.phase} • MD{match.bestOf}
                            </p>

                            {match.played ? (
                                <>
                                    <p className="mt-1 font-semibold text-white">
                                        {match.homeTeam.shortName} {match.homeScore} x {match.awayScore}{" "}
                                        {match.awayTeam.shortName}
                                    </p>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        Vencedor: {match.winnerTeam?.shortName ?? "-"}
                                    </p>
                                </>
                            ) : (
                                <p className="mt-1 font-semibold text-white">
                                    {match.homeTeam.shortName} vs {match.awayTeam.shortName}
                                </p>
                            )}
                        </div>
                    ))}

                    {matches.length === 0 ? (
                        <p className="text-sm text-zinc-400">Nenhuma partida nesta semana.</p>
                    ) : null}
                </div>
            </SectionCard>
        </div>
    );
}