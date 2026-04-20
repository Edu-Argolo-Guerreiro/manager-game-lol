"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function runMarketingCampaign(formData: FormData) {
    const type = String(formData.get("type") ?? "");

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId) return;

    const team = await prisma.team.findUnique({
        where: { id: save.playerTeamId },
    });

    if (!team) return;

    if (type === "social") {
        const cost = 25000;
        if (team.budget < cost) return;

        await prisma.team.update({
            where: { id: team.id },
            data: {
                budget: { decrement: cost },
                fanbase: { increment: 1800 },
            },
        });
    }

    if (type === "merch") {
        const cost = 40000;
        if (team.budget < cost) return;

        await prisma.team.update({
            where: { id: team.id },
            data: {
                budget: { increment: 55000 },
                fanbase: { increment: 900 },
            },
        });
    }

    if (type === "meet") {
        const cost = 30000;
        if (team.budget < cost) return;

        await prisma.team.update({
            where: { id: team.id },
            data: {
                budget: { decrement: cost },
                fanbase: { increment: 2500 },
                reputation: { increment: 1 },
            },
        });
    }

    revalidatePath("/dashboard");
    revalidatePath("/finances");
}