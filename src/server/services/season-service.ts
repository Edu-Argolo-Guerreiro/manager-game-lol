import { prisma } from "@/lib/prisma";

export async function getCurrentSeason() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.currentSeasonId) return null;

    return prisma.season.findUnique({
        where: { id: save.currentSeasonId },
    });
}

export async function getMatchesByWeek(week: number) {
    const season = await getCurrentSeason();
    if (!season) return [];

    return prisma.match.findMany({
        where: {
            seasonId: season.id,
            week,
        },
        include: {
            homeTeam: true,
            awayTeam: true,
            winnerTeam: true,
        },
        orderBy: [
            { division: "asc" },
            { phase: "asc" },
        ],
    });
}