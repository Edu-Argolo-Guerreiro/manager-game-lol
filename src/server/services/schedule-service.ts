import { prisma } from "@/lib/prisma";

export async function getCurrentSaveContext() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.currentSeasonId || !save.playerTeamId) return null;

    const season = await prisma.season.findUnique({
        where: { id: save.currentSeasonId },
    });

    if (!season) return null;

    return {
        save,
        season,
        teamId: save.playerTeamId,
    };
}

export async function getOrCreateCurrentWeekPlan() {
    const context = await getCurrentSaveContext();
    if (!context) return null;

    const existing = await prisma.teamWeekPlan.findUnique({
        where: {
            seasonId_teamId_week: {
                seasonId: context.season.id,
                teamId: context.teamId,
                week: context.season.currentWeek,
            },
        },
    });

    if (existing) return existing;

    return prisma.teamWeekPlan.create({
        data: {
            seasonId: context.season.id,
            teamId: context.teamId,
            week: context.season.currentWeek,
        },
    });
}