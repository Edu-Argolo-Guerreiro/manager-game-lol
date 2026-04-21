import { BenchForm } from "@/components/roster/bench-form";
import { PlayerFocusForm } from "@/components/roster/player-focus-form";
import { PlayerHistoryCard } from "@/components/roster/player-history-card";
import { PromoteForm } from "@/components/roster/promote-form";
import { SellPlayerForm } from "@/components/roster/sell-player-form";
import { StatDelta } from "@/components/roster/stat-delta";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getPlayerTeam } from "@/server/services/team-service";

function moodColor(mood: string) {
    if (mood.includes("Muito feliz")) return "text-emerald-300";
    if (mood.includes("Motivado")) return "text-cyan-300";
    if (mood.includes("Neutro")) return "text-zinc-300";
    if (mood.includes("Insatisfeito")) return "text-amber-300";
    return "text-rose-300";
}

function fatigueColor(fatigue: number) {
    if (fatigue <= 20) return "text-emerald-300";
    if (fatigue <= 45) return "text-cyan-300";
    if (fatigue <= 65) return "text-amber-300";
    return "text-rose-300";
}

function focusLabel(focus: string) {
    if (focus === "NONE") return "Neutro";
    if (focus === "FARM") return "Farm";
    if (focus === "TEAMFIGHT") return "Teamfight";
    if (focus === "CHAMP_POOL") return "Champion Pool";
    if (focus === "SHOTCALLING") return "Shotcalling";
    if (focus === "LANING") return "Lane";
    if (focus === "DISCIPLINE") return "Disciplina";
    return focus;
}

function PlayerCard({
    player,
    starter,
}: {
    player: NonNullable<Awaited<ReturnType<typeof getPlayerTeam>>>["players"][number];
    starter: boolean;
}) {
    return (
        <div
            className={[
                "rounded-2xl bg-zinc-950 p-4",
                starter ? "border border-cyan-900/40" : "border border-amber-900/30",
            ].join(" ")}
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div
                        className={[
                            "mb-2 inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
                            starter
                                ? "bg-cyan-500/15 text-cyan-300"
                                : "bg-amber-500/15 text-amber-300",
                        ].join(" ")}
                    >
                        {starter ? "Titular" : "Reserva"}
                    </div>
                    <p className="font-semibold text-white">{player.nickname}</p>
                    <p className="text-sm text-zinc-400">
                        {player.role} • {player.nationality} • {player.age} anos
                    </p>
                    <p className={`mt-2 text-xs font-semibold ${moodColor(player.moodNote)}`}>
                        {player.moodNote}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        Foco atual: {focusLabel(player.individualFocus)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold text-cyan-400">{player.overall}</p>
                    <div className="mt-1 flex justify-end">
                        <StatDelta value={player.lastOverallDelta} />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-900 p-3">
                    <p className="text-zinc-500">Potencial</p>
                    <p className="font-semibold text-white">{player.potential}</p>
                </div>
                <div className="rounded-lg bg-zinc-900 p-3">
                    <p className="text-zinc-500">Moral</p>
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-white">{player.morale}</p>
                        <StatDelta value={player.lastMoraleDelta} />
                    </div>
                </div>
                <div className="rounded-lg bg-zinc-900 p-3">
                    <p className="text-zinc-500">Forma</p>
                    <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-white">{player.form}</p>
                        <StatDelta value={player.lastFormDelta} />
                    </div>
                </div>
                <div className="rounded-lg bg-zinc-900 p-3">
                    <p className="text-zinc-500">Fadiga</p>
                    <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold ${fatigueColor(player.fatigue)}`}>
                            {player.fatigue}
                        </p>
                        <StatDelta value={-player.lastFatigueDelta} />
                    </div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-zinc-900 p-3">
                    <p className="text-zinc-500">Salário</p>
                    <p className="font-semibold text-white">
                        R$ {player.salary.toLocaleString("pt-BR")}
                    </p>
                </div>
                <div className="rounded-lg bg-zinc-900 p-3">
                    <p className="text-zinc-500">Venda estimada</p>
                    <p className="font-semibold text-emerald-300">
                        R${" "}
                        {Math.floor(
                            player.marketValue * (starter ? 0.88 : 0.74)
                        ).toLocaleString("pt-BR")}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <PlayerFocusForm
                    playerId={player.id}
                    currentFocus={player.individualFocus}
                />
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
                {starter ? <BenchForm playerId={player.id} /> : <PromoteForm playerId={player.id} />}
                <SellPlayerForm playerId={player.id} />
            </div>
        </div>
    );
}

export default async function RosterPage() {
    const team = await getPlayerTeam();

    const starters = team?.players.filter((player) => player.status === "STARTER") ?? [];
    const bench = team?.players.filter((player) => player.status === "BENCH") ?? [];

    return (
        <div>
            <PageHeader
                title="Elenco"
                subtitle="Titulares, reservas, humor, fadiga, foco individual e histórico."
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard title="Titulares">
                    <div className="space-y-3">
                        {starters.map((player) => (
                            <PlayerCard key={player.id} player={player} starter />
                        ))}

                        {starters.length === 0 ? (
                            <p className="text-sm text-zinc-400">Nenhum titular encontrado.</p>
                        ) : null}
                    </div>
                </SectionCard>

                <SectionCard title="Reservas">
                    <div className="space-y-3">
                        {bench.map((player) => (
                            <PlayerCard key={player.id} player={player} starter={false} />
                        ))}

                        {bench.length === 0 ? (
                            <p className="text-sm text-zinc-400">Nenhum reserva encontrado.</p>
                        ) : null}
                    </div>
                </SectionCard>
            </div>

            <div className="mt-6">
                <SectionCard title="Histórico recente dos jogadores">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[...starters, ...bench].map((player) => (
                            <PlayerHistoryCard
                                key={player.id}
                                nickname={player.nickname}
                                moodNote={player.moodNote}
                                history={player.careerHistory}
                            />
                        ))}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}