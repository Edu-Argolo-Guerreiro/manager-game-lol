"use server";

import { StaffRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function hireStaff(formData: FormData) {
    const staffId = String(formData.get("staffId") ?? "");
    if (!staffId) return;

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.playerTeamId) return;

    const team = await prisma.team.findUnique({
        where: { id: save.playerTeamId },
        include: { staff: true },
    });

    const target = await prisma.staff.findUnique({
        where: { id: staffId },
    });

    if (!team || !target) return;
    if (target.teamId) return;

    const totalCost = target.salary * 3;

    if (team.budget < totalCost) return;

    const currentSameRole = team.staff.find((member) => member.role === target.role);

    if (currentSameRole) {
        await prisma.staff.update({
            where: { id: currentSameRole.id },
            data: {
                teamId: null,
            },
        });
    }

    await prisma.staff.update({
        where: { id: target.id },
        data: {
            teamId: team.id,
            contractYears: 2,
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

    revalidatePath("/staff");
    revalidatePath("/dashboard");
    revalidatePath("/finances");
}

export async function generateStaffMarketIfEmpty() {
    const freeStaffCount = await prisma.staff.count({
        where: {
            teamId: null,
        },
    });

    if (freeStaffCount > 0) return;

    const generated = [
        {
            name: "Reapered",
            role: StaffRole.HEAD_COACH,
            quality: 80,
            salary: 62000,
            contractYears: 2,
            teamId: null,
        },
        {
            name: "SeeEl",
            role: StaffRole.HEAD_COACH,
            quality: 75,
            salary: 52000,
            contractYears: 2,
            teamId: null,
        },
        {
            name: "Astro Analyst",
            role: StaffRole.ANALYST,
            quality: 74,
            salary: 36000,
            contractYears: 2,
            teamId: null,
        },
        {
            name: "Vision Draft",
            role: StaffRole.ANALYST,
            quality: 71,
            salary: 32000,
            contractYears: 2,
            teamId: null,
        },
        {
            name: "Marco GM",
            role: StaffRole.MANAGER,
            quality: 73,
            salary: 28000,
            contractYears: 2,
            teamId: null,
        },
        {
            name: "Business Nexus",
            role: StaffRole.MANAGER,
            quality: 69,
            salary: 24000,
            contractYears: 2,
            teamId: null,
        },
    ];

    await prisma.staff.createMany({
        data: generated,
    });
}