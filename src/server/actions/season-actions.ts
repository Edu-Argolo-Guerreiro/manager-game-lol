"use server";

import { prisma } from "@/lib/prisma";
import { calculateTeamStrength } from "@/lib/sim/team-strength";
import { simulateBestOf } from "@/lib/sim/match-engine";
import { revalidatePath } from "next/cache";

export async function advanceWeek() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.currentSeasonId) return;

    const season = await prisma.season.findUnique({
        where: { id: save.currentSeasonId },
    });

    if (!season || season.isFinished) return;

    const matches = await prisma.match.findMany({
        where: {
            seasonId: season.id,
            week: season.currentWeek,
            played: false,
        },
        include: {
            homeTeam: {
                include: {
                    players: true,
                    staff: true,
                },
            },
            awayTeam: {
                include: {
                    players: true,
                    staff: true,
                },
            },
        },
    });

    for (const match of matches) {
        const homeStrength = calculateTeamStrength(
            match.homeTeam.players,
            match.homeTeam.staff
        );

        const awayStrength = calculateTeamStrength(
            match.awayTeam.players,
            match.awayTeam.staff
        );

        const result = simulateBestOf(homeStrength, awayStrength, match.bestOf);

        const winnerTeamId = result.homeWon ? match.homeTeamId : match.awayTeamId;

        await prisma.match.update({
            where: { id: match.id },
            data: {
                played: true,
                homeScore: result.homeScore,
                awayScore: result.awayScore,
                winnerTeamId,
                summary: `${match.homeTeam.shortName} ${result.homeScore} x ${result.awayScore} ${match.awayTeam.shortName}`,
            },
        });

        if (result.homeWon) {
            await prisma.team.update({
                where: { id: match.homeTeamId },
                data: { wins: { increment: 1 } },
            });

            await prisma.team.update({
                where: { id: match.awayTeamId },
                data: { losses: { increment: 1 } },
            });
        } else {
            await prisma.team.update({
                where: { id: match.awayTeamId },
                data: { wins: { increment: 1 } },
            });

            await prisma.team.update({
                where: { id: match.homeTeamId },
                data: { losses: { increment: 1 } },
            });
        }
    }

    const remainingMatches = await prisma.match.count({
        where: {
            seasonId: season.id,
            played: false,
        },
    });

    if (remainingMatches === 0) {
        await prisma.season.update({
            where: { id: season.id },
            data: {
                isFinished: true,
            },
        });
    } else {
        await prisma.season.update({
            where: { id: season.id },
            data: {
                currentWeek: { increment: 1 },
            },
        });
    }

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/standings");
    revalidatePath("/finances");
}