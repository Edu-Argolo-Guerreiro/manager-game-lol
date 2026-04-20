"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function getMoodFromMorale(morale: number) {
    if (morale >= 85) return "Muito feliz com a org";
    if (morale >= 72) return "Motivado";
    if (morale >= 58) return "Neutro";
    if (morale >= 45) return "Insatisfeito";
    return "Frustrado com o momento";
}

function appendHistory(current: string, entry: string) {
    return `${current}\n• ${entry}`;
}

export async function promoteToStarter(formData: FormData) {
    const playerId = String(formData.get("playerId") ?? "");
    if (!playerId) return;

    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player?.teamId) return;

    const currentStarter = await prisma.player.findFirst({
        where: {
            teamId: player.teamId,
            role: player.role,
            status: "STARTER",
        },
    });

    if (currentStarter && currentStarter.id !== player.id) {
        const benchedMorale = Math.max(currentStarter.morale - 6, 1);

        await prisma.player.update({
            where: { id: currentStarter.id },
            data: {
                status: "BENCH",
                morale: benchedMorale,
                moodNote: getMoodFromMorale(benchedMorale),
                careerHistory: appendHistory(
                    currentStarter.careerHistory,
                    "Perdeu a titularidade recentemente."
                ),
            },
        });
    }

    const promotedMorale = Math.min(player.morale + 5, 100);

    await prisma.player.update({
        where: { id: player.id },
        data: {
            status: "STARTER",
            morale: promotedMorale,
            moodNote: getMoodFromMorale(promotedMorale),
            careerHistory: appendHistory(
                player.careerHistory,
                "Assumiu a titularidade da equipe."
            ),
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

    const benchedMorale = Math.max(player.morale - 5, 1);
    const promotedMorale = Math.min(anotherBenchSameRole.morale + 4, 100);

    await prisma.player.update({
        where: { id: player.id },
        data: {
            status: "BENCH",
            morale: benchedMorale,
            moodNote: getMoodFromMorale(benchedMorale),
            careerHistory: appendHistory(
                player.careerHistory,
                "Foi movido para o banco de reservas."
            ),
        },
    });

    await prisma.player.update({
        where: { id: anotherBenchSameRole.id },
        data: {
            status: "STARTER",
            morale: promotedMorale,
            moodNote: getMoodFromMorale(promotedMorale),
            careerHistory: appendHistory(
                anotherBenchSameRole.careerHistory,
                "Subiu do banco para a equipe titular."
            ),
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
            morale: Math.max(player.morale - 8, 1),
            moodNote: "Disponível no mercado após saída da org",
            careerHistory: appendHistory(
                player.careerHistory,
                "Foi negociado e voltou ao mercado como free agent."
            ),
            contractYears: 2,
        },
    });

    if (player.status === "STARTER" && replacement) {
        const replacementMorale = Math.min(replacement.morale + 4, 100);

        await prisma.player.update({
            where: { id: replacement.id },
            data: {
                status: "STARTER",
                morale: replacementMorale,
                moodNote: getMoodFromMorale(replacementMorale),
                careerHistory: appendHistory(
                    replacement.careerHistory,
                    "Ganhou espaço após venda de um titular da posição."
                ),
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

export async function updatePlayerMoodAfterSigning(playerId: string, teamName: string) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player) return;

    const morale = Math.min(player.morale + 6, 100);

    await prisma.player.update({
        where: { id: playerId },
        data: {
            morale,
            moodNote: getMoodFromMorale(morale),
            careerHistory: appendHistory(
                player.careerHistory,
                `Assinou contrato com ${teamName}.`
            ),
        },
    });
}