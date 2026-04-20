import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getPlayerTeam } from "@/server/services/team-service";

export default async function RosterPage() {
    const team = await getPlayerTeam();

    const starters = team?.players.filter((player) => player.status === "STARTER") ?? [];
    const bench = team?.players.filter((player) => player.status === "BENCH") ?? [];

    return (
        <div>
            <PageHeader
                title="Elenco"
                subtitle="Titulares e reservas da sua organização."
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard title="Titulares">
                    <div className="space-y-3">
                        {starters.map((player) => (
                            <div
                                key={player.id}
                                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-white">{player.nickname}</p>
                                        <p className="text-sm text-zinc-400">
                                            {player.role} • {player.nationality} • {player.age} anos
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-cyan-400">{player.overall}</p>
                                        <p className="text-xs text-zinc-500">OVR</p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
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
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Salário</p>
                                        <p className="font-semibold text-white">
                                            R$ {player.salary.toLocaleString("pt-BR")}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-zinc-900 p-3">
                                        <p className="text-zinc-500">Valor de mercado</p>
                                        <p className="font-semibold text-white">
                                            R$ {player.marketValue.toLocaleString("pt-BR")}
                                        </p>
                                    </div>
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
                                className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-white">{player.nickname}</p>
                                        <p className="text-sm text-zinc-400">
                                            {player.role} • {player.nationality} • {player.age} anos
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-zinc-200">{player.overall}</p>
                                        <p className="text-xs text-zinc-500">OVR</p>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
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
                                </div>
                            </div>
                        ))}

                        {bench.length === 0 ? (
                            <p className="text-sm text-zinc-400">Nenhum reserva encontrado.</p>
                        ) : null}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}