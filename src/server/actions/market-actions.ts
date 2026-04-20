"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function signFreeAgent(formData: FormData) {
    const playerId = String(formData.get("playerId") ?? "");

    if (!playerId) return;

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId) return;

    const team = await prisma.team.findUnique({
        where: { id: save.playerTeamId },
        include: {
            players: true,
        },
    });

    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!team || !player) return;
    if (player.status !== "FREE_AGENT") return;

    const totalCost = player.marketValue + player.salary;

    if (team.budget < totalCost) return;

    const sameRolePlayers = team.players.filter((p) => p.role === player.role);

    const newStatus = sameRolePlayers.length === 0 ? "STARTER" : "BENCH";

    await prisma.player.update({
        where: { id: player.id },
        data: {
            teamId: team.id,
            status: newStatus,
            contractYears: 2,
            morale: Math.min(player.morale + 5, 100),
        },
    });

    await prisma.team.update({
        where: { id: team.id },
        data: {
            budget: {
                decrement: totalCost,
            },
        },
    });

    revalidatePath("/market");
    revalidatePath("/roster");
    revalidatePath("/dashboard");
    revalidatePath("/finances");
}