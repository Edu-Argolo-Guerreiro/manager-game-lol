"use server";

import { Division, IndividualFocus, MatchPhase, ScheduleAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateTeamStrength } from "@/lib/sim/team-strength";
import { generateMatchNarrative, simulateBestOf } from "@/lib/sim/match-engine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

async function applyMonthlyFinance(playerTeamId: string) {
    const team = await prisma.team.findUnique({
        where: { id: playerTeamId },
        include: {
            players: true,
            staff: true,
        },
    });

    if (!team) return;

    const playerPayroll = team.players.reduce((acc, player) => acc + player.salary, 0);
    const staffPayroll = team.staff.reduce((acc, staff) => acc + staff.salary, 0);

    const payroll = playerPayroll + staffPayroll;
    const sponsorIncome = 140000 + team.reputation * 1400;
    const fanIncome = Math.floor(team.fanbase * 2.2);
    const monthlyNet = sponsorIncome + fanIncome - payroll;

    await prisma.team.update({
        where: { id: team.id },
        data: {
            budget: {
                increment: monthlyNet,
            },
        },
    });
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

async function applyIndividualFocus(playerId: string, focus: IndividualFocus) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player || focus === "NONE") return;

    let championPool = player.championPool;
    let laneStrength = player.laneStrength;
    let teamfight = player.teamfight;
    let shotcalling = player.shotcalling;
    let discipline = player.discipline;
    let fatigue = player.fatigue;
    let form = player.form;

    if (focus === "FARM") {
        laneStrength += 1;
        form += 1;
        fatigue += 2;
    }

    if (focus === "TEAMFIGHT") {
        teamfight += 1;
        fatigue += 2;
    }

    if (focus === "CHAMP_POOL") {
        championPool += 1;
        fatigue += 2;
    }

    if (focus === "SHOTCALLING") {
        shotcalling += 1;
        fatigue += 2;
    }

    if (focus === "LANING") {
        laneStrength += 1;
        fatigue += 2;
    }

    if (focus === "DISCIPLINE") {
        discipline += 1;
        fatigue += 1;
    }

    await prisma.player.update({
        where: { id: player.id },
        data: {
            championPool: clamp(championPool, 1, 100),
            laneStrength: clamp(laneStrength, 1, 100),
            teamfight: clamp(teamfight, 1, 100),
            shotcalling: clamp(shotcalling, 1, 100),
            discipline: clamp(discipline, 1, 100),
            fatigue: clamp(fatigue, 0, 100),
            form: clamp(form, 1, 100),
        },
    });
}

async function applyActionToPlayers(teamId: string, action: ScheduleAction) {
    const players = await prisma.player.findMany({
        where: { teamId },
    });

    for (const player of players) {
        let morale = player.morale;
        let form = player.form;
        let fatigue = player.fatigue;
        let teamwork = player.teamwork;
        let championPool = player.championPool;
        let laneStrength = player.laneStrength;

        if (action === "REST") {
            morale += 2;
            fatigue -= 10;
        }

        if (action === "LIGHT") {
            form += 1;
            fatigue -= 2;
        }

        if (action === "TACTICAL") {
            form += 1;
            teamwork += 1;
            fatigue += 4;
            if (player.discipline < 68) morale -= 1;
        }

        if (action === "INTENSE") {
            form += 2;
            fatigue += 8;
            if (player.discipline < 72) morale -= 2;
        }

        if (action === "INDIVIDUAL") {
            laneStrength += 1;
            championPool += 1;
            fatigue += 5;
            if (player.teamwork < 68) morale -= 1;
            await applyIndividualFocus(player.id, player.individualFocus);
        }

        if (action === "REVIEW") {
            teamwork += 1;
            fatigue += 2;
        }

        if (action === "PREP") {
            form += 1;
            fatigue += 2;
        }

        if (action === "MATCHDAY") {
            fatigue += 6;
        }

        await prisma.player.update({
            where: { id: player.id },
            data: {
                morale: clamp(morale, 1, 100),
                form: clamp(form, 1, 100),
                fatigue: clamp(fatigue, 0, 100),
                teamwork: clamp(teamwork, 1, 100),
                championPool: clamp(championPool, 1, 100),
                laneStrength: clamp(laneStrength, 1, 100),
            },
        });
    }
}

async function applyWeekPlan(teamId: string, seasonId: string, week: number) {
    const plan = await prisma.teamWeekPlan.upsert({
        where: {
            seasonId_teamId_week: {
                seasonId,
                teamId,
                week,
            },
        },
        update: {},
        create: {
            seasonId,
            teamId,
            week,
        },
    });

    const weekdayActions: ScheduleAction[] = [
        plan.monday,
        plan.tuesday,
        plan.wednesday,
        plan.thursday,
        plan.friday,
        plan.saturday,
        plan.sunday,
    ];

    for (const action of weekdayActions) {
        await applyActionToPlayers(teamId, action);
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

    const simulatedWeek = season.currentWeek;

    if (save.playerTeamId) {
        await applyWeekPlan(save.playerTeamId, season.id, simulatedWeek);
    }

    const matches = await prisma.match.findMany({
        where: {
            seasonId: season.id,
            week: simulatedWeek,
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
        const winnerShortName = result.homeWon
            ? match.homeTeam.shortName
            : match.awayTeam.shortName;

        const summary = generateMatchNarrative({
            homeTeamName: match.homeTeam.name,
            awayTeamName: match.awayTeam.name,
            homeShortName: match.homeTeam.shortName,
            awayShortName: match.awayTeam.shortName,
            homeStrength,
            awayStrength,
            homeScore: result.homeScore,
            awayScore: result.awayScore,
            winnerShortName,
        });

        await prisma.match.update({
            where: { id: match.id },
            data: {
                played: true,
                homeScore: result.homeScore,
                awayScore: result.awayScore,
                winnerTeamId,
                summary,
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

    if (save.playerTeamId && simulatedWeek % 4 === 0) {
        await applyMonthlyFinance(save.playerTeamId);
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
    revalidatePath("/staff");
    revalidatePath("/week-review");

    redirect(`/week-review?week=${simulatedWeek}`);
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
        orderBy: [{ wins: "desc" }, { losses: "asc" }, { reputation: "desc" }],
    });

    const tier2Standings = await prisma.team.findMany({
        where: { division: Division.TIER2 },
        orderBy: [{ wins: "desc" }, { losses: "asc" }, { reputation: "desc" }],
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
    revalidatePath("/staff");
}