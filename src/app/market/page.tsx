import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getFreeAgents } from "@/server/services/player-service";

export default async function MarketPage() {
    const freeAgents = await getFreeAgents();

    return (
        <div>
            <PageHeader
                title="Mercado"
                subtitle="Jogadores livres disponíveis para contratação."
            />

            <SectionCard title="Free Agents">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                <th className="px-3 py-3">Nick</th>
                                <th className="px-3 py-3">Rota</th>
                                <th className="px-3 py-3">OVR</th>
                                <th className="px-3 py-3">Potencial</th>
                                <th className="px-3 py-3">Idade</th>
                                <th className="px-3 py-3">Salário</th>
                                <th className="px-3 py-3">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {freeAgents.map((player) => (
                                <tr key={player.id} className="border-b border-zinc-900">
                                    <td className="px-3 py-3 font-medium text-white">{player.nickname}</td>
                                    <td className="px-3 py-3 text-zinc-300">{player.role}</td>
                                    <td className="px-3 py-3 text-cyan-400">{player.overall}</td>
                                    <td className="px-3 py-3 text-zinc-300">{player.potential}</td>
                                    <td className="px-3 py-3 text-zinc-300">{player.age}</td>
                                    <td className="px-3 py-3 text-zinc-300">
                                        R$ {player.salary.toLocaleString("pt-BR")}
                                    </td>
                                    <td className="px-3 py-3 text-zinc-300">
                                        R$ {player.marketValue.toLocaleString("pt-BR")}
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