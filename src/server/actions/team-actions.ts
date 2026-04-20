"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePlayerTeamIdentity(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const shortName = String(formData.get("shortName") ?? "").trim().toUpperCase();

    if (!name || !shortName) return;
    if (shortName.length > 6) return;

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId) return;

    const existingByName = await prisma.team.findFirst({
        where: {
            name,
            NOT: { id: save.playerTeamId },
        },
    });

    const existingByShort = await prisma.team.findFirst({
        where: {
            shortName,
            NOT: { id: save.playerTeamId },
        },
    });

    if (existingByName || existingByShort) return;

    await prisma.team.update({
        where: { id: save.playerTeamId },
        data: {
            name,
            shortName,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/standings");
    revalidatePath("/market");
    revalidatePath("/calendar");
    revalidatePath("/roster");
}