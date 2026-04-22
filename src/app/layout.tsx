import "./globals.css";
import type { Metadata } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Rift Manager",
    description: "Manager de League of Legends offline",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    const season = save?.currentSeasonId
        ? await prisma.season.findUnique({
            where: { id: save.currentSeasonId },
        })
        : null;

    const team = save?.playerTeamId
        ? await prisma.team.findUnique({
            where: { id: save.playerTeamId },
        })
        : null;

    const phaseLabel =
        season?.currentPhase === "PLAYOFFS" ? "Playoffs" : "Fase regular";

    return (
        <html lang="pt-BR">
            <body>
                <div className="app-shell flex min-h-screen">
                    <Sidebar
                        teamName={team?.name ?? "Rift Manager"}
                        shortName={team?.shortName ?? "RM"}
                        wins={team?.wins ?? 0}
                        losses={team?.losses ?? 0}
                        seasonLabel={season ? `Temporada ${season.year}` : "Sem temporada"}
                        weekLabel={season ? `Sem. ${season.currentWeek}` : "Sem. -"}
                    />

                    <div className="flex min-h-screen flex-1 flex-col">
                        <Topbar
                            currentWeek={season?.currentWeek ?? 1}
                            totalWeeks={18}
                            phaseLabel={phaseLabel}
                            budget={team?.budget ?? 0}
                        />

                        <main className="flex-1 px-8 py-7">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    );
}