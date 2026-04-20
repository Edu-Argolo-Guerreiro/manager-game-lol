import { PlayerStatus, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getFreeAgents(role?: Role) {
    return prisma.player.findMany({
        where: {
            status: PlayerStatus.FREE_AGENT,
            ...(role ? { role } : {}),
        },
        orderBy: [{ overall: "desc" }, { potential: "desc" }],
    });
}

export async function getPlayersByTeam(teamId: string) {
    return prisma.player.findMany({
        where: { teamId },
        orderBy: [{ status: "asc" }, { role: "asc" }, { overall: "desc" }],
    });
}

export async function getRosterCountByRole(teamId: string) {
    const players = await prisma.player.findMany({
        where: { teamId },
        select: {
            role: true,
            status: true,
        },
    });

    return {
        TOP: players.filter((p) => p.role === "TOP").length,
        JG: players.filter((p) => p.role === "JG").length,
        MID: players.filter((p) => p.role === "MID").length,
        ADC: players.filter((p) => p.role === "ADC").length,
        SUP: players.filter((p) => p.role === "SUP").length,
        total: players.length,
    };
}