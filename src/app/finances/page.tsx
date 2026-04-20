import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getPlayerTeam } from "@/server/services/team-service";

export default async function FinancesPage() {
    const team = await getPlayerTeam();

    const playerPayroll =
        team?.players.reduce((acc, player) => acc + player.salary, 0) ?? 0;

    const staffPayroll =
        team?.staff.reduce((acc, staff) => acc + staff.salary, 0) ?? 0;

    const totalPayroll = playerPayroll + staffPayroll;
    const estimatedRevenue = Math.floor((team?.fanbase ?? 0) * 2.5);
    const projectedBalance = (team?.budget ?? 0) + estimatedRevenue - totalPayroll;

    return (
        <div>
            <PageHeader
                title="Finanças"
                subtitle="Visão financeira simplificada da sua organização."
            />

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <SectionCard title="Caixa atual">
                    <p className="text-2xl font-bold text-white">
                        R$ {(team?.budget ?? 0).toLocaleString("pt-BR")}
                    </p>
                </SectionCard>

                <SectionCard title="Folha jogadores">
                    <p className="text-2xl font-bold text-white">
                        R$ {playerPayroll.toLocaleString("pt-BR")}
                    </p>
                </SectionCard>

                <SectionCard title="Folha staff">
                    <p className="text-2xl font-bold text-white">
                        R$ {staffPayroll.toLocaleString("pt-BR")}
                    </p>
                </SectionCard>

                <SectionCard title="Saldo projetado">
                    <p className="text-2xl font-bold text-white">
                        R$ {projectedBalance.toLocaleString("pt-BR")}
                    </p>
                </SectionCard>
            </div>

            <div className="mt-6">
                <SectionCard title="Resumo">
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Receita estimada por fanbase</span>
                            <span className="font-medium text-white">
                                R$ {estimatedRevenue.toLocaleString("pt-BR")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Despesa total mensal estimada</span>
                            <span className="font-medium text-white">
                                R$ {totalPayroll.toLocaleString("pt-BR")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Reputação</span>
                            <span className="font-medium text-white">{team?.reputation ?? 0}</span>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}