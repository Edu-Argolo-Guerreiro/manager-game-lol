"use server";

import { Division, MatchPhase } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateTeamStrength } from "@/lib/sim/team-strength";
import { simulateBestOf } from "@/lib/sim/match-engine";
import { revalidatePath } from "next/cache";

async function createRoundRobinMatches(seasonId: string, division: Division, teamIds: string[]) {
    const shuffled = [...teamIds];
    if (shuffled.length % 2 !== 0) return;

    const teams = [...shuffled];
    const rounds = teams.length - 1;
    const matchesPerRound = teams.length / 2;

    for (let round = 0; round < rounds; round++) {
        for (let i = 0; i < matchesPerRound; i++) {
            const home = teams[i];
            const away = teams[teams.length - 1 - i];

            if (!home || !away) continue;

            await prisma.match.create({
                data: {
                    seasonId,
                    division,
                    phase: MatchPhase.REGULAR_SEASON,
                    week: round + 1,
                    bestOf: 1,
                    homeTeamId: round % 2 === 0 ? home : away,
                    awayTeamId: round % 2 === 0 ? away : home,
                },
            });
        }

        const fixed = teams[0];
        const rest = teams.slice(1);
        rest.unshift(rest.pop()!);
        teams.splice(0, teams.length, fixed, ...rest);
    }
}

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
    revalidatePath("/roster");
    revalidatePath("/market");
}

export async function startNextSeason() {
    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.currentSeasonId || !save.playerTeamId) return;

    const currentSeason = await prisma.season.findUnique({
        where: { id: save.currentSeasonId },
    });

    if (!currentSeason?.isFinished) return;

    const tier1Standings = await prisma.team.findMany({
        where: { division: Division.TIER1 },
        orderBy: [
            { wins: "desc" },
            { losses: "asc" },
            { reputation: "desc" },
        ],
    });

    const tier2Standings = await prisma.team.findMany({
        where: { division: Division.TIER2 },
        orderBy: [
            { wins: "desc" },
            { losses: "asc" },
            { reputation: "desc" },
        ],
    });

    const promoted = tier2Standings[0];
    const relegated = tier1Standings[tier1Standings.length - 1];

    if (promoted && relegated) {
        await prisma.team.update({
            where: { id: promoted.id },
            data: {
                division: Division.TIER1,
                reputation: { increment: 6 },
                budget: { increment: 450000 },
                fanbase: { increment: 12000 },
            },
        });

        await prisma.team.update({
            where: { id: relegated.id },
            data: {
                division: Division.TIER2,
                reputation: Math.max(relegated.reputation - 5, 1),
                budget: Math.max(relegated.budget - 300000, 200000),
                fanbase: Math.max(relegated.fanbase - 9000, 5000),
            },
        });
    }

    await prisma.team.updateMany({
        data: {
            wins: 0,
            losses: 0,
        },
    });

    const nextSeason = await prisma.season.create({
        data: {
            year: currentSeason.year + 1,
            currentPhase: MatchPhase.REGULAR_SEASON,
            currentWeek: 1,
            isFinished: false,
        },
    });

    const tier2Teams = await prisma.team.findMany({
        where: { division: Division.TIER2 },
        select: { id: true },
        orderBy: { name: "asc" },
    });

    const tier1Teams = await prisma.team.findMany({
        where: { division: Division.TIER1 },
        select: { id: true },
        orderBy: { name: "asc" },
    });

    await createRoundRobinMatches(
        nextSeason.id,
        Division.TIER2,
        tier2Teams.map((team) => team.id)
    );

    await createRoundRobinMatches(
        nextSeason.id,
        Division.TIER1,
        tier1Teams.map((team) => team.id)
    );

    await prisma.saveState.update({
        where: { id: save.id },
        data: {
            currentSeasonId: nextSeason.id,
        },
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    revalidatePath("/standings");
    revalidatePath("/finances");
    revalidatePath("/roster");
    revalidatePath("/market");
}