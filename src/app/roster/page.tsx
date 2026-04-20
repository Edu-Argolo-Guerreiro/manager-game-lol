import { BenchForm } from "@/components/roster/bench-form";
import { PlayerFocusForm } from "@/components/roster/player-focus-form";
import { PlayerHistoryCard } from "@/components/roster/player-history-card";
import { PromoteForm } from "@/components/roster/promote-form";
import { SellPlayerForm } from "@/components/roster/sell-player-form";
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
                            <div
                                key={player.id}
                                className="rounded-2xl border border-cyan-900/40 bg-zinc-950 p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="mb-2 inline-flex rounded-full bg-cyan-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                                            Titular
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
                                        <p className="text-xs text-zinc-500">OVR</p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Potencial</p>
                                        <p className="font-semibold text-white">{player.potential}</p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Moral</p>
                                        <p className="font-semibold text-white">{player.morale}</p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Forma</p>
                                        <p className="font-semibold text-white">{player.form}</p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Fadiga</p>
                                        <p className={`font-semibold ${fatigueColor(player.fatigue)}`}>
                                            {player.fatigue}
                                        </p>
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
                                            R$ {Math.floor(player.marketValue * 0.88).toLocaleString("pt-BR")}
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
                                    <BenchForm playerId={player.id} />
                                    <SellPlayerForm playerId={player.id} />
                                </div>
                            </div>
                        ))}

                        {starters.length === 0 ? (
                            <p className="text-sm text-zinc-400">Nenhum titular encontrado.</p>
                        ) : null}
                    </div>
                </SectionCard>

                <SectionCard title="Reservas">
                    <div className="space-y-3">
                        {bench.map((player) => (
                            <div
                                key={player.id}
                                className="rounded-2xl border border-amber-900/30 bg-zinc-950 p-4"
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="mb-2 inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                                            Reserva
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
                                        <p className="text-lg font-bold text-zinc-200">{player.overall}</p>
                                        <p className="text-xs text-zinc-500">OVR</p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Potencial</p>
                                        <p className="font-semibold text-white">{player.potential}</p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Moral</p>
                                        <p className="font-semibold text-white">{player.morale}</p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Forma</p>
                                        <p className="font-semibold text-white">{player.form}</p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Fadiga</p>
                                        <p className={`font-semibold ${fatigueColor(player.fatigue)}`}>
                                            {player.fatigue}
                                        </p>
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
                                            R$ {Math.floor(player.marketValue * 0.74).toLocaleString("pt-BR")}
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
                                    <PromoteForm playerId={player.id} />
                                    <SellPlayerForm playerId={player.id} />
                                </div>
                            </div>
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