import { prisma } from "@/lib/prisma";

export async function getUpcomingMatchesForPlayerTeam() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId || !save.currentSeasonId) return [];

    return prisma.match.findMany({
        where: {
            seasonId: save.currentSeasonId,
            played: false,
            OR: [
                { homeTeamId: save.playerTeamId },
                { awayTeamId: save.playerTeamId },
            ],
        },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
        orderBy: [
            { week: "asc" },
        ],
        take: 5,
    });
}