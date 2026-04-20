"use server";

import { IndividualFocus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const allowedFocus: IndividualFocus[] = [
    "NONE",
    "FARM",
    "TEAMFIGHT",
    "CHAMP_POOL",
    "SHOTCALLING",
    "LANING",
    "DISCIPLINE",
];

export async function setPlayerIndividualFocus(formData: FormData) {
    const playerId = String(formData.get("playerId") ?? "");
    const focus = String(formData.get("focus") ?? "NONE") as IndividualFocus;

    if (!playerId || !allowedFocus.includes(focus)) return;

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId) return;

    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player || player.teamId !== save.playerTeamId) return;

    const historyLine =
        focus === "NONE"
            ? "Voltou ao treino individual neutro."
            : `Passou a focar em ${focus}.`;

    await prisma.player.update({
        where: { id: player.id },
        data: {
            individualFocus: focus,
            careerHistory: `${player.careerHistory}\n• ${historyLine}`,
        },
    });

    revalidatePath("/roster");
    revalidatePath("/calendar");
    revalidatePath("/dashboard");
}