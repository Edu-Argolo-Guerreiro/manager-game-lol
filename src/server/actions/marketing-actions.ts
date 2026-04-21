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
    if (team.marketingActionsUsed >= 2) return;

    if (type === "social") {
        const cost = 30000;
        if (team.budget < cost) return;

        await prisma.team.update({
            where: { id: team.id },
            data: {
                budget: { decrement: cost },
                fanbase: { increment: 2200 },
                reputation: { increment: 1 },
                marketingActionsUsed: { increment: 1 },
            },
        });
    }

    if (type === "merch") {
        const setupCost = 35000;
        const grossReturn = 52000;
        if (team.budget < setupCost) return;

        await prisma.team.update({
            where: { id: team.id },
            data: {
                budget: { increment: grossReturn - setupCost },
                fanbase: { increment: 800 },
                marketingActionsUsed: { increment: 1 },
            },
        });
    }

    if (type === "meet") {
        const cost = 45000;
        if (team.budget < cost) return;

        await prisma.team.update({
            where: { id: team.id },
            data: {
                budget: { decrement: cost },
                fanbase: { increment: 3000 },
                reputation: { increment: 2 },
                marketingActionsUsed: { increment: 1 },
            },
        });
    }

    revalidatePath("/dashboard");
    revalidatePath("/finances");
}