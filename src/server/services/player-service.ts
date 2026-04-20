import { PlayerStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getFreeAgents(role?: Role) {
    return prisma.player.findMany({
        where: {
            status: PlayerStatus.FREE_AGENT,
            ...(role ? { role } : {}),
        },
        orderBy: [
            { overall: "desc" },
            { potential: "desc" },
        ],
    });
}

export async function getPlayersByTeam(teamId: string) {
    return prisma.player.findMany({
        where: { teamId },
        orderBy: [
            { status: "asc" },
            { role: "asc" },
            { overall: "desc" },
        ],
    });
}