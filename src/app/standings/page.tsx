import { Division } from "@prisma/client";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getStandings } from "@/server/services/team-service";

export default async function StandingsPage() {
    const tier2 = await getStandings(Division.TIER2);
    const tier1 = await getStandings(Division.TIER1);

    return (
        <div>
            <PageHeader
                title="Classificação"
                subtitle="Tabela atual das divisões do campeonato."
            />

            <div className="grid gap-6 xl:grid-cols-2">
                <SectionCard title="Tier 2">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                    <th className="px-3 py-3">#</th>
                                    <th className="px-3 py-3">Time</th>
                                    <th className="px-3 py-3">V</th>
                                    <th className="px-3 py-3">D</th>
                                    <th className="px-3 py-3">Rep</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tier2.map((team, index) => (
                                    <tr key={team.id} className="border-b border-zinc-900">
                                        <td className="px-3 py-3 text-zinc-400">{index + 1}</td>
                                        <td className="px-3 py-3 font-medium text-white">{team.shortName}</td>
                                        <td className="px-3 py-3 text-zinc-300">{team.wins}</td>
                                        <td className="px-3 py-3 text-zinc-300">{team.losses}</td>
                                        <td className="px-3 py-3 text-zinc-300">{team.reputation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>

                <SectionCard title="Tier 1">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                    <th className="px-3 py-3">#</th>
                                    <th className="px-3 py-3">Time</th>
                                    <th className="px-3 py-3">V</th>
                                    <th className="px-3 py-3">D</th>
                                    <th className="px-3 py-3">Rep</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tier1.map((team, index) => (
                                    <tr key={team.id} className="border-b border-zinc-900">
                                        <td className="px-3 py-3 text-zinc-400">{index + 1}</td>
                                        <td className="px-3 py-3 font-medium text-white">{team.shortName}</td>
                                        <td className="px-3 py-3 text-zinc-300">{team.wins}</td>
                                        <td className="px-3 py-3 text-zinc-300">{team.losses}</td>
                                        <td className="px-3 py-3 text-zinc-300">{team.reputation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}