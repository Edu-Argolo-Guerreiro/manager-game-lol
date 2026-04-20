"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function promoteToStarter(formData: FormData) {
    const playerId = String(formData.get("playerId") ?? "");
    if (!playerId) return;

    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player?.teamId) return;

    await prisma.player.updateMany({
        where: {
            teamId: player.teamId,
            role: player.role,
            status: "STARTER",
        },
        data: {
            status: "BENCH",
        },
    });

    await prisma.player.update({
        where: { id: player.id },
        data: {
            status: "STARTER",
            morale: Math.min(player.morale + 3, 100),
        },
    });

    revalidatePath("/roster");
    revalidatePath("/dashboard");
}

export async function moveToBench(formData: FormData) {
    const playerId = String(formData.get("playerId") ?? "");
    if (!playerId) return;

    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player?.teamId) return;

    const anotherBenchSameRole = await prisma.player.findFirst({
        where: {
            teamId: player.teamId,
            role: player.role,
            status: "BENCH",
            NOT: {
                id: player.id,
            },
        },
    });

    if (!anotherBenchSameRole) return;

    await prisma.player.update({
        where: { id: player.id },
        data: {
            status: "BENCH",
            morale: Math.max(player.morale - 4, 1),
        },
    });

    await prisma.player.update({
        where: { id: anotherBenchSameRole.id },
        data: {
            status: "STARTER",
            morale: Math.min(anotherBenchSameRole.morale + 3, 100),
        },
    });

    revalidatePath("/roster");
    revalidatePath("/dashboard");
}

export async function sellPlayer(formData: FormData) {
    const playerId = String(formData.get("playerId") ?? "");
    if (!playerId) return;

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId) return;

    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player || player.teamId !== save.playerTeamId) return;

    const sameRolePlayers = await prisma.player.findMany({
        where: {
            teamId: save.playerTeamId,
            role: player.role,
        },
        orderBy: [{ overall: "desc" }],
    });

    if (sameRolePlayers.length <= 1) return;

    const sellValue =
        player.status === "STARTER"
            ? Math.floor(player.marketValue * 0.88)
            : Math.floor(player.marketValue * 0.74);

    const replacement =
        player.status === "STARTER"
            ? sameRolePlayers.find((p) => p.id !== player.id && p.status === "BENCH")
            : null;

    await prisma.player.update({
        where: { id: player.id },
        data: {
            teamId: null,
            status: "FREE_AGENT",
            morale: Math.max(player.morale - 6, 1),
            contractYears: 2,
        },
    });

    if (player.status === "STARTER" && replacement) {
        await prisma.player.update({
            where: { id: replacement.id },
            data: {
                status: "STARTER",
                morale: Math.min(replacement.morale + 4, 100),
            },
        });
    }

    await prisma.team.update({
        where: { id: save.playerTeamId },
        data: {
            budget: {
                increment: sellValue,
            },
        },
    });

    revalidatePath("/roster");
    revalidatePath("/market");
    revalidatePath("/dashboard");
    revalidatePath("/finances");
}