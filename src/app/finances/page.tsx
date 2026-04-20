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
    const sponsorIncome = 140000 + (team?.reputation ?? 0) * 1400;
    const fanIncome = Math.floor((team?.fanbase ?? 0) * 2.2);
    const monthlyNet = sponsorIncome + fanIncome - totalPayroll;

    return (
        <div>
            <PageHeader
                title="Finanças"
                subtitle="Visão financeira mensal da sua organização."
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

                <SectionCard title="Saldo mensal estimado">
                    <p
                        className={[
                            "text-2xl font-bold",
                            monthlyNet >= 0 ? "text-emerald-300" : "text-rose-300",
                        ].join(" ")}
                    >
                        R$ {monthlyNet.toLocaleString("pt-BR")}
                    </p>
                </SectionCard>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <SectionCard title="Receitas mensais">
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Patrocínio base</span>
                            <span className="font-medium text-emerald-300">
                                R$ {sponsorIncome.toLocaleString("pt-BR")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Receita de fanbase</span>
                            <span className="font-medium text-emerald-300">
                                R$ {fanIncome.toLocaleString("pt-BR")}
                            </span>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Despesas mensais">
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Jogadores</span>
                            <span className="font-medium text-rose-300">
                                R$ {playerPayroll.toLocaleString("pt-BR")}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400">Staff</span>
                            <span className="font-medium text-rose-300">
                                R$ {staffPayroll.toLocaleString("pt-BR")}
                            </span>
                        </div>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}