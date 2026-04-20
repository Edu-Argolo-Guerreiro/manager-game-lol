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