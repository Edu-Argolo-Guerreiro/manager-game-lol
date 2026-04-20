import { Division } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getTeamsByDivision(division: Division) {
    return prisma.team.findMany({
        where: { division },
        orderBy: [
            { wins: "desc" },
            { losses: "asc" },
            { reputation: "desc" },
        ],
        include: {
            players: true,
            staff: true,
        },
    });
}

export async function getPlayerTeam() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId) return null;

    return prisma.team.findUnique({
        where: { id: save.playerTeamId },
        include: {
            players: {
                orderBy: [
                    { status: "asc" },
                    { role: "asc" },
                    { overall: "desc" },
                ],
            },
            staff: true,
        },
    });
}

export async function getStandings(division: Division) {
    return prisma.team.findMany({
        where: { division },
        select: {
            id: true,
            name: true,
            shortName: true,
            wins: true,
            losses: true,
            budget: true,
            reputation: true,
            fanbase: true,
        },
        orderBy: [
            { wins: "desc" },
            { losses: "asc" },
            { reputation: "desc" },
        ],
    });
}