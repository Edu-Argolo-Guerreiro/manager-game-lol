import { Division } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getScoutTeams(division?: Division, excludeTeamId?: string) {
    return prisma.team.findMany({
        where: {
            ...(division ? { division } : {}),
            ...(excludeTeamId ? { NOT: { id: excludeTeamId } } : {}),
        },
        orderBy: [
            { division: "asc" },
            { reputation: "desc" },
            { name: "asc" },
        ],
        select: {
            id: true,
            name: true,
            shortName: true,
            division: true,
            reputation: true,
            fanbase: true,
            wins: true,
            losses: true,
        },
    });
}

export async function getScoutTeamDetails(teamId: string) {
    return prisma.team.findUnique({
        where: { id: teamId },
        include: {
            players: {
                orderBy: [
                    { status: "asc" },
                    { role: "asc" },
                    { overall: "desc" },
                ],
            },
            staff: {
                orderBy: [{ quality: "desc" }],
            },
        },
    });
}