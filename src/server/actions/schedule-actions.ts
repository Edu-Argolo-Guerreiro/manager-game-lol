"use server";

import { ScheduleAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getOrCreateCurrentWeekPlan, getCurrentSaveContext } from "@/server/services/schedule-service";
import { revalidatePath } from "next/cache";

const allowedActions: ScheduleAction[] = [
    "REST",
    "LIGHT",
    "TACTICAL",
    "INTENSE",
    "INDIVIDUAL",
    "REVIEW",
    "PREP",
    "MATCHDAY",
];

export async function saveWeekPlan(formData: FormData) {
    const plan = await getOrCreateCurrentWeekPlan();
    if (!plan) return;

    const monday = String(formData.get("monday") ?? "REST") as ScheduleAction;
    const tuesday = String(formData.get("tuesday") ?? "TACTICAL") as ScheduleAction;
    const wednesday = String(formData.get("wednesday") ?? "INDIVIDUAL") as ScheduleAction;
    const thursday = String(formData.get("thursday") ?? "LIGHT") as ScheduleAction;
    const friday = String(formData.get("friday") ?? "REVIEW") as ScheduleAction;

    if (![monday, tuesday, wednesday, thursday, friday].every((item) => allowedActions.includes(item))) {
        return;
    }

    await prisma.teamWeekPlan.update({
        where: { id: plan.id },
        data: {
            monday,
            tuesday,
            wednesday,
            thursday,
            friday,
            saturday: "PREP",
            sunday: "MATCHDAY",
        },
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
}

export async function resetWeekPlan() {
    const plan = await getOrCreateCurrentWeekPlan();
    if (!plan) return;

    await prisma.teamWeekPlan.update({
        where: { id: plan.id },
        data: {
            monday: "REST",
            tuesday: "TACTICAL",
            wednesday: "INDIVIDUAL",
            thursday: "LIGHT",
            friday: "REVIEW",
            saturday: "PREP",
            sunday: "MATCHDAY",
        },
    });

    revalidatePath("/calendar");
    revalidatePath("/dashboard");
}

export async function getCurrentWeekOpponentLabel() {
    const context = await getCurrentSaveContext();
    if (!context) return null;

    const match = await prisma.match.findFirst({
        where: {
            seasonId: context.season.id,
            week: context.season.currentWeek,
            OR: [
                { homeTeamId: context.teamId },
                { awayTeamId: context.teamId },
            ],
        },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
    });

    if (!match) return null;

    return {
        match,
        opponentName:
            match.homeTeamId === context.teamId ? match.awayTeam.name : match.homeTeam.name,
    };
}