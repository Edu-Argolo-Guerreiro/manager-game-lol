import { StaffRole } from "@prisma/client";
import { HireStaffForm } from "@/components/staff/hire-staff-form";
import { TeamBadge } from "@/components/ui/team-badge";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { prisma } from "@/lib/prisma";
import { generateStaffMarketIfEmpty } from "@/server/actions/staff-actions";
import { getPlayerTeam } from "@/server/services/team-service";

export default async function StaffPage() {
    await generateStaffMarketIfEmpty();

    const team = await getPlayerTeam();

    const marketStaff = await prisma.staff.findMany({
        where: {
            teamId: null,
        },
        orderBy: [{ quality: "desc" }, { salary: "asc" }],
    });

    const currentCoach = team?.staff.find((member) => member.role === StaffRole.HEAD_COACH);
    const currentAnalyst = team?.staff.find((member) => member.role === StaffRole.ANALYST);
    const currentManager = team?.staff.find((member) => member.role === StaffRole.MANAGER);

    return (
        <div>
            <PageHeader
                title="Staff"
                subtitle="Gerencie a estrutura técnica e administrativa da sua organização."
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

            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <SectionCard title="Staff atual">
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Head Coach</p>
                            <p className="mt-2 text-xl font-bold text-white">
                                {currentCoach?.name ?? "Sem técnico"}
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Qualidade {currentCoach?.quality ?? 0} • Salário R${" "}
                                {(currentCoach?.salary ?? 0).toLocaleString("pt-BR")}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Analyst</p>
                            <p className="mt-2 text-xl font-bold text-white">
                                {currentAnalyst?.name ?? "Sem analyst"}
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Qualidade {currentAnalyst?.quality ?? 0} • Salário R${" "}
                                {(currentAnalyst?.salary ?? 0).toLocaleString("pt-BR")}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Manager</p>
                            <p className="mt-2 text-xl font-bold text-white">
                                {currentManager?.name ?? "Sem manager"}
                            </p>
                            <p className="mt-1 text-sm text-zinc-400">
                                Qualidade {currentManager?.quality ?? 0} • Salário R${" "}
                                {(currentManager?.salary ?? 0).toLocaleString("pt-BR")}
                            </p>
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Mercado de staff">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                                    <th className="px-3 py-3">Nome</th>
                                    <th className="px-3 py-3">Cargo</th>
                                    <th className="px-3 py-3">Qualidade</th>
                                    <th className="px-3 py-3">Salário</th>
                                    <th className="px-3 py-3">Custo entrada</th>
                                    <th className="px-3 py-3">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketStaff.map((member) => {
                                    const entryCost = member.salary * 3;
                                    const canAfford = (team?.budget ?? 0) >= entryCost;

                                    return (
                                        <tr key={member.id} className="border-b border-zinc-900">
                                            <td className="px-3 py-3 font-medium text-white">{member.name}</td>
                                            <td className="px-3 py-3 text-zinc-300">{member.role}</td>
                                            <td className="px-3 py-3 text-cyan-300">{member.quality}</td>
                                            <td className="px-3 py-3 text-zinc-300">
                                                R$ {member.salary.toLocaleString("pt-BR")}
                                            </td>
                                            <td className="px-3 py-3">
                                                <span className={canAfford ? "text-emerald-300" : "text-rose-300"}>
                                                    R$ {entryCost.toLocaleString("pt-BR")}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3">
                                                {canAfford ? (
                                                    <HireStaffForm staffId={member.id} />
                                                ) : (
                                                    <span className="text-xs font-semibold text-rose-300">
                                                        Caixa insuficiente
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </SectionCard>
            </div>
        </div>
    );
}