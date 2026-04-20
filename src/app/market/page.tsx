import { SignPlayerForm } from "@/components/market/sign-player-form";
import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getFreeAgents } from "@/server/services/player-service";
import { getPlayerTeam } from "@/server/services/team-service";

export default async function MarketPage() {
    const freeAgents = await getFreeAgents();
    const team = await getPlayerTeam();

    return (
        <div>
            <PageHeader
                title="Mercado"
                subtitle="Jogadores livres disponíveis para contratação."
            />

            <div className="mb-6 flex items-center gap-4 rounded-[28px] border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
                <TeamBadge shortName={team?.shortName ?? "ORG"} size="lg" />
                <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">Caixa disponível</p>
                    <p className="mt-2 text-3xl font-black text-white">
                        R$ {(team?.budget ?? 0).toLocaleString("pt-BR")}
                    </p>
                </div>
            </div>

            <SectionCard title="Free Agents">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                <th className="px-3 py-3">Nick</th>
                                <th className="px-3 py-3">Nac.</th>
                                <th className="px-3 py-3">Rota</th>
                                <th className="px-3 py-3">OVR</th>
                                <th className="px-3 py-3">Potencial</th>
                                <th className="px-3 py-3">Idade</th>
                                <th className="px-3 py-3">Salário</th>
                                <th className="px-3 py-3">Valor</th>
                                <th className="px-3 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {freeAgents.map((player) => (
                                <tr key={player.id} className="border-b border-zinc-900">
                                    <td className="px-3 py-3 font-medium text-white">{player.nickname}</td>
                                    <td className="px-3 py-3 text-zinc-300">{player.nationality}</td>
                                    <td className="px-3 py-3 text-zinc-300">{player.role}</td>
                                    <td className="px-3 py-3 font-semibold text-cyan-400">{player.overall}</td>
                                    <td className="px-3 py-3 text-zinc-300">{player.potential}</td>
                                    <td className="px-3 py-3 text-zinc-300">{player.age}</td>
                                    <td className="px-3 py-3 text-zinc-300">
                                        R$ {player.salary.toLocaleString("pt-BR")}
                                    </td>
                                    <td className="px-3 py-3 text-zinc-300">
                                        R$ {player.marketValue.toLocaleString("pt-BR")}
                                    </td>
                                    <td className="px-3 py-3">
                                        <SignPlayerForm playerId={player.id} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>
        </div>
    );
}