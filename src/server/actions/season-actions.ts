"use server";

import {
    Division,
    IndividualFocus,
    MatchDay,
    MatchPhase,
    ScheduleAction,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateTeamStrength } from "@/lib/sim/team-strength";
import { generateMatchNarrative, simulateBestOf } from "@/lib/sim/match-engine";
import { generateInterview, generateWeeklyEvent } from "@/lib/sim/weekly-flavor";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type StandingTeam = {
    id: string;
    name: string;
    shortName: string;
    division: Division;
    wins: number;
    losses: number;
    reputation: number;
};

type SeriesMatch = {
    id: string;
    seasonId: string;
    division: Division;
    homeTeamId: string;
    awayTeamId: string;
    winnerTeamId: string | null;
    played: boolean;
    playoffRound: string | null;
    homeScore: number | null;
    awayScore: number | null;
};

async function createWeekendDoubleRoundRobin(
    seasonId: string,
    division: Division,
    teamIds: string[]
) {
    const teamCount = teamIds.length;
    if (teamCount % 2 !== 0) return;

    const rounds = teamCount - 1;
    let rotation = [...teamIds];

    for (let round = 0; round < rounds; round++) {
        const week = round + 1;
        const saturdayPairs: Array<[string, string]> = [];
        const sundayPairs: Array<[string, string]> = [];

        for (let i = 0; i < teamCount / 2; i++) {
            const home = rotation[i];
            const away = rotation[teamCount - 1 - i];
            if (!home || !away) continue;

            saturdayPairs.push([home, away]);
            sundayPairs.push([away, home]);
        }

        for (const [home, away] of saturdayPairs) {
            await prisma.match.create({
                data: {
                    seasonId,
                    division,
                    phase: MatchPhase.REGULAR_SEASON,
                    week,
                    bestOf: 1,
                    matchDay: MatchDay.SATURDAY,
                    homeTeamId: home,
                    awayTeamId: away,
                },
            });
        }

        for (const [home, away] of sundayPairs) {
            await prisma.match.create({
                data: {
                    seasonId,
                    division,
                    phase: MatchPhase.REGULAR_SEASON,
                    week,
                    bestOf: 1,
                    matchDay: MatchDay.SUNDAY,
                    homeTeamId: home,
                    awayTeamId: away,
                },
            });
        }

        const fixed = rotation[0];
        const rest = rotation.slice(1);
        rest.unshift(rest.pop()!);
        rotation = [fixed, ...rest];
    }
}

function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
}

function moodFromMorale(morale: number) {
    if (morale >= 85) return "Muito feliz com a org";
    if (morale >= 72) return "Motivado";
    if (morale >= 58) return "Neutro";
    if (morale >= 45) return "Insatisfeito";
    return "Frustrado com o momento";
}

function actionLabel(action: ScheduleAction) {
    if (action === "REST") return "Descanso";
    if (action === "LIGHT") return "Treino leve";
    if (action === "TACTICAL") return "Treino tático";
    if (action === "INTENSE") return "Treino intenso";
    if (action === "INDIVIDUAL") return "Treino individual";
    if (action === "REVIEW") return "Review";
    if (action === "PREP") return "Preparação";
    return "Dia de jogo";
}

function getPlayoffSlots(teamCount: number) {
    if (teamCount >= 10) return 8;
    if (teamCount >= 8) return 6;
    if (teamCount >= 6) return 4;
    return 2;
}

async function getDivisionStandings(division: Division): Promise<StandingTeam[]> {
    return prisma.team.findMany({
        where: { division },
        orderBy: [{ wins: "desc" }, { losses: "asc" }, { reputation: "desc" }],
        select: {
            id: true,
            name: true,
            shortName: true,
            division: true,
            wins: true,
            losses: true,
            reputation: true,
        },
    });
}

function loserOf(match: SeriesMatch) {
    if (!match.winnerTeamId) return null;
    return match.winnerTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
}

async function getPlayoffMatch(
    seasonId: string,
    division: Division,
    playoffRound: string
) {
    return prisma.match.findFirst({
        where: {
            seasonId,
            division,
            phase: MatchPhase.PLAYOFFS,
            playoffRound,
        },
    });
}

async function createSixTeamDoubleElimNextSeries(
    seasonId: string,
    division: Division,
    week: number
) {
    const standings = await getDivisionStandings(division);
    const slots = getPlayoffSlots(standings.length);
    if (slots !== 6) return false;

    const seeds = standings.slice(0, 6);
    if (seeds.length < 6) return false;

    const seedMap = new Map<string, number>();
    seeds.forEach((team, index) => seedMap.set(team.id, index + 1));

    const s1 = await getPlayoffMatch(seasonId, division, "S1");
    const s2 = await getPlayoffMatch(seasonId, division, "S2");
    const s3 = await getPlayoffMatch(seasonId, division, "S3");
    const s4 = await getPlayoffMatch(seasonId, division, "S4");
    const s5 = await getPlayoffMatch(seasonId, division, "S5");
    const s6 = await getPlayoffMatch(seasonId, division, "S6");
    const s7 = await getPlayoffMatch(seasonId, division, "S7");
    const s8 = await getPlayoffMatch(seasonId, division, "S8");
    const s9 = await getPlayoffMatch(seasonId, division, "S9");
    const gf = await getPlayoffMatch(seasonId, division, "GF");

    if (!s1) {
        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S1",
                week,
                bestOf: 3,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: seeds[3].id,
                awayTeamId: seeds[4].id,
            },
        });
        return true;
    }

    if (s1.played && !s2) {
        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S2",
                week,
                bestOf: 3,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: seeds[2].id,
                awayTeamId: seeds[5].id,
            },
        });
        return true;
    }

    if (s1.played && s2?.played && !s3) {
        const w1 = s1.winnerTeamId!;
        const w2 = s2.winnerTeamId!;
        const seedW1 = seedMap.get(w1) ?? 99;
        const seedW2 = seedMap.get(w2) ?? 99;

        const seed1Opponent = seedW1 > seedW2 ? w1 : w2;
        const seed2Opponent = seed1Opponent === w1 ? w2 : w1;

        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S3",
                week,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: seeds[0].id,
                awayTeamId: seed1Opponent,
            },
        });

        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S4",
                week: week + 1,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: seeds[1].id,
                awayTeamId: seed2Opponent,
            },
        });

        return true;
    }

    if (s1.played && s4?.played && !s5) {
        const loserS1 = loserOf(s1);
        const loserS4 = loserOf(s4);
        if (!loserS1 || !loserS4) return false;

        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S5",
                week,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: loserS4,
                awayTeamId: loserS1,
            },
        });
        return true;
    }

    if (s2?.played && s3?.played && !s6) {
        const loserS2 = loserOf(s2);
        const loserS3 = loserOf(s3);
        if (!loserS2 || !loserS3) return false;

        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S6",
                week,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: loserS3,
                awayTeamId: loserS2,
            },
        });
        return true;
    }

    if (s3?.played && s4?.played && !s7) {
        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S7",
                week,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: s3.winnerTeamId!,
                awayTeamId: s4.winnerTeamId!,
            },
        });
        return true;
    }

    if (s5?.played && s6?.played && !s8) {
        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S8",
                week,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: s5.winnerTeamId!,
                awayTeamId: s6.winnerTeamId!,
            },
        });
        return true;
    }

    if (s7?.played && s8?.played && !s9) {
        const loserS7 = loserOf(s7);
        if (!loserS7) return false;

        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "S9",
                week,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: loserS7,
                awayTeamId: s8.winnerTeamId!,
            },
        });
        return true;
    }

    if (s7?.played && s9?.played && !gf) {
        await prisma.match.create({
            data: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "GF",
                week,
                bestOf: 5,
                matchDay: MatchDay.SATURDAY,
                homeTeamId: s7.winnerTeamId!,
                awayTeamId: s9.winnerTeamId!,
            },
        });
        return true;
    }

    return false;
}

async function maybeCreateNextPlayoffSeriesForDivision(
    seasonId: string,
    division: Division,
    week: number
) {
    const standings = await getDivisionStandings(division);
    const slots = getPlayoffSlots(standings.length);

    if (slots === 6) {
        return createSixTeamDoubleElimNextSeries(seasonId, division, week);
    }

    return false;
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
            budget: { increment: monthlyNet },
            marketingActionsUsed: 0,
        },
    });
}

async function applyPlayoffPrizes(seasonId: string) {
    const divisions: Division[] = [Division.TIER1, Division.TIER2];

    for (const division of divisions) {
        const gf = await getPlayoffMatch(seasonId, division, "GF");
        if (!gf?.played || !gf.winnerTeamId) continue;

        const runnerUpId = loserOf(gf);
        const s9 = await getPlayoffMatch(seasonId, division, "S9");
        const thirdPlaceId = s9?.played ? loserOf(s9) : null;

        const rewards =
            division === Division.TIER1
                ? {
                    first: { budget: 700000, reputation: 6, fanbase: 18000 },
                    second: { budget: 350000, reputation: 3, fanbase: 9000 },
                    third: { budget: 180000, reputation: 2, fanbase: 5000 },
                }
                : {
                    first: { budget: 400000, reputation: 5, fanbase: 12000 },
                    second: { budget: 220000, reputation: 3, fanbase: 7000 },
                    third: { budget: 100000, reputation: 2, fanbase: 3500 },
                };

        await prisma.team.update({
            where: { id: gf.winnerTeamId },
            data: {
                budget: { increment: rewards.first.budget },
                reputation: { increment: rewards.first.reputation },
                fanbase: { increment: rewards.first.fanbase },
            },
        });

        if (runnerUpId) {
            await prisma.team.update({
                where: { id: runnerUpId },
                data: {
                    budget: { increment: rewards.second.budget },
                    reputation: { increment: rewards.second.reputation },
                    fanbase: { increment: rewards.second.fanbase },
                },
            });
        }

        if (thirdPlaceId) {
            await prisma.team.update({
                where: { id: thirdPlaceId },
                data: {
                    budget: { increment: rewards.third.budget },
                    reputation: { increment: rewards.third.reputation },
                    fanbase: { increment: rewards.third.fanbase },
                },
            });
        }
    }
}

async function resetPlayerWeeklyDeltas(teamId: string) {
    await prisma.player.updateMany({
        where: { teamId },
        data: {
            lastMoraleDelta: 0,
            lastFormDelta: 0,
            lastFatigueDelta: 0,
            lastOverallDelta: 0,
        },
    });
}

async function applyPlayerDelta(
    playerId: string,
    data: {
        morale?: number;
        form?: number;
        fatigue?: number;
        teamwork?: number;
        championPool?: number;
        laneStrength?: number;
        teamfight?: number;
        shotcalling?: number;
        discipline?: number;
        overall?: number;
    }
) {
    const player = await prisma.player.findUnique({
        where: { id: playerId },
    });

    if (!player) return;

    const nextMorale = clamp(data.morale ?? player.morale, 1, 100);
    const nextForm = clamp(data.form ?? player.form, 1, 100);
    const nextFatigue = clamp(data.fatigue ?? player.fatigue, 0, 100);
    const nextOverall = clamp(data.overall ?? player.overall, 50, player.potential);

    await prisma.player.update({
        where: { id: player.id },
        data: {
            morale: nextMorale,
            form: nextForm,
            fatigue: nextFatigue,
            teamwork: clamp(data.teamwork ?? player.teamwork, 1, 100),
            championPool: clamp(data.championPool ?? player.championPool, 1, 100),
            laneStrength: clamp(data.laneStrength ?? player.laneStrength, 1, 100),
            teamfight: clamp(data.teamfight ?? player.teamfight, 1, 100),
            shotcalling: clamp(data.shotcalling ?? player.shotcalling, 1, 100),
            discipline: clamp(data.discipline ?? player.discipline, 1, 100),
            overall: nextOverall,
            lastMoraleDelta: nextMorale - player.morale,
            lastFormDelta: nextForm - player.form,
            lastFatigueDelta: nextFatigue - player.fatigue,
            lastOverallDelta: nextOverall - player.overall,
            moodNote: moodFromMorale(nextMorale),
        },
    });
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
        laneStrength += 2;
        form += 1;
        fatigue += 2;
    }

    if (focus === "TEAMFIGHT") {
        teamfight += 2;
        form += 1;
        fatigue += 2;
    }

    if (focus === "CHAMP_POOL") {
        championPool += 2;
        fatigue += 2;
    }

    if (focus === "SHOTCALLING") {
        shotcalling += 2;
        fatigue += 2;
    }

    if (focus === "LANING") {
        laneStrength += 2;
        fatigue += 2;
    }

    if (focus === "DISCIPLINE") {
        discipline += 2;
        fatigue += 1;
        form += 1;
    }

    await applyPlayerDelta(player.id, {
        championPool,
        laneStrength,
        teamfight,
        shotcalling,
        discipline,
        fatigue,
        form,
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
            fatigue -= 16;
            form += 1;
        }

        if (action === "LIGHT") {
            form += 1;
            fatigue -= 5;
        }

        if (action === "TACTICAL") {
            form += 1;
            teamwork += 1;
            fatigue += 3;
            if (player.discipline < 68) morale -= 1;
        }

        if (action === "INTENSE") {
            form += 2;
            fatigue += 8;
            if (player.discipline < 72) morale -= 2;
            if (player.teamwork < 65) morale -= 1;
        }

        if (action === "INDIVIDUAL") {
            laneStrength += 1;
            championPool += 1;
            fatigue += 4;
            if (player.teamwork < 68) morale -= 1;
        }

        if (action === "REVIEW") {
            teamwork += 1;
            fatigue += 1;
            morale += 1;
        }

        if (action === "PREP") {
            form += 1;
            fatigue += 2;
        }

        if (action === "MATCHDAY") {
            fatigue += 6;
        }

        await applyPlayerDelta(player.id, {
            morale,
            form,
            fatigue,
            teamwork,
            championPool,
            laneStrength,
        });

        if (action === "INDIVIDUAL") {
            await applyIndividualFocus(player.id, player.individualFocus);
        }
    }
}

async function applyPlayoffSeriesFatigue(teamId: string) {
    const starters = await prisma.player.findMany({
        where: {
            teamId,
            status: "STARTER",
        },
    });

    for (const player of starters) {
        await applyPlayerDelta(player.id, {
            fatigue: player.fatigue + 8,
            morale: player.morale - 1,
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

    return plan;
}

async function applyNaturalPerformanceDrift(teamId: string) {
    const players = await prisma.player.findMany({
        where: { teamId },
    });

    for (const player of players) {
        let overall = player.overall;

        if (
            player.form >= 84 &&
            player.morale >= 78 &&
            player.fatigue <= 32 &&
            player.overall < player.potential
        ) {
            overall += 1;
        }

        if (player.fatigue >= 78 || player.morale <= 38) {
            overall -= 1;
        }

        await applyPlayerDelta(player.id, {
            overall,
        });
    }
}

async function applyDynamicReputation(
    playerTeamId: string,
    seasonId: string,
    week: number
) {
    const team = await prisma.team.findUnique({
        where: { id: playerTeamId },
    });

    if (!team) return;

    const weekMatches = await prisma.match.findMany({
        where: {
            seasonId,
            week,
            OR: [{ homeTeamId: playerTeamId }, { awayTeamId: playerTeamId }],
        },
    });

    let delta = 0;

    for (const match of weekMatches) {
        if (match.winnerTeamId === playerTeamId) delta += 1;
        else delta -= 1;
    }

    const rep = clamp(team.reputation + delta, 1, 100);

    await prisma.team.update({
        where: { id: playerTeamId },
        data: {
            reputation: rep,
        },
    });
}

async function writeWeeklyFlavor(teamId: string, seasonId: string, week: number) {
    const plan = await prisma.teamWeekPlan.findUnique({
        where: {
            seasonId_teamId_week: {
                seasonId,
                teamId,
                week,
            },
        },
    });

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            players: {
                where: { status: "STARTER" },
                orderBy: { overall: "desc" },
            },
        },
    });

    if (!plan || !team) return;

    const avgMorale =
        team.players.length > 0
            ? Math.round(team.players.reduce((acc, p) => acc + p.morale, 0) / team.players.length)
            : 0;

    const avgFatigue =
        team.players.length > 0
            ? Math.round(team.players.reduce((acc, p) => acc + p.fatigue, 0) / team.players.length)
            : 0;

    const event = generateWeeklyEvent({
        teamName: team.name,
        planLabels: [
            actionLabel(plan.monday),
            actionLabel(plan.tuesday),
            actionLabel(plan.wednesday),
            actionLabel(plan.thursday),
            actionLabel(plan.friday),
        ],
        playerNicknames: team.players.map((p) => p.nickname),
        avgMorale,
        avgFatigue,
    });

    const teamMatches = await prisma.match.findMany({
        where: {
            seasonId,
            week,
            OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        },
        include: {
            homeTeam: true,
            awayTeam: true,
        },
        orderBy: [{ matchDay: "asc" }],
    });

    let interviewQuote: string | null = null;

    if (teamMatches.length > 0) {
        const lastMatch = teamMatches[teamMatches.length - 1];
        const won = lastMatch.winnerTeamId === teamId;
        const opponentName =
            lastMatch.homeTeamId === teamId ? lastMatch.awayTeam.name : lastMatch.homeTeam.name;

        interviewQuote = generateInterview({
            teamName: team.name,
            opponentName,
            won,
            scoreline: `${lastMatch.homeTeam.shortName} ${lastMatch.homeScore} x ${lastMatch.awayScore} ${lastMatch.awayTeam.shortName}`,
        });
    }

    await prisma.teamWeekPlan.update({
        where: { id: plan.id },
        data: {
            weeklyEventTitle: event.title,
            weeklyEventBody: event.body,
            interviewQuote,
        },
    });
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
        await resetPlayerWeeklyDeltas(save.playerTeamId);
        await applyWeekPlan(save.playerTeamId, season.id, simulatedWeek);
        await applyNaturalPerformanceDrift(save.playerTeamId);
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
        orderBy: [{ matchDay: "asc" }],
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

        const dayLabel = match.matchDay === "SATURDAY" ? "Sábado" : "Domingo";
        const playoffPrefix =
            match.phase === "PLAYOFFS" && match.playoffRound
                ? `${match.playoffRound} • `
                : "";

        const summary =
            `${playoffPrefix}${dayLabel}. ` +
            generateMatchNarrative({
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

        if (match.phase === "REGULAR_SEASON") {
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

        if (match.phase === "PLAYOFFS") {
            await applyPlayoffSeriesFatigue(match.homeTeamId);
            await applyPlayoffSeriesFatigue(match.awayTeamId);
        }
    }

    const remainingRegular = await prisma.match.count({
        where: {
            seasonId: season.id,
            phase: MatchPhase.REGULAR_SEASON,
            played: false,
        },
    });

    let createdPlayoffs = false;

    if (remainingRegular === 0) {
        const tier1Created = await maybeCreateNextPlayoffSeriesForDivision(
            season.id,
            Division.TIER1,
            simulatedWeek + 1
        );
        const tier2Created = await maybeCreateNextPlayoffSeriesForDivision(
            season.id,
            Division.TIER2,
            simulatedWeek + 1
        );

        createdPlayoffs = tier1Created || tier2Created;
    }

    if (save.playerTeamId) {
        await applyDynamicReputation(save.playerTeamId, season.id, simulatedWeek);
        await writeWeeklyFlavor(save.playerTeamId, season.id, simulatedWeek);
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

    if (remainingMatches === 0 && !createdPlayoffs) {
        await applyPlayoffPrizes(season.id);

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
                currentPhase:
                    remainingRegular > 0 ? MatchPhase.REGULAR_SEASON : MatchPhase.PLAYOFFS,
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
    revalidatePath("/scout");
    revalidatePath("/playoffs");

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
            marketingActionsUsed: 0,
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

    await createWeekendDoubleRoundRobin(
        nextSeason.id,
        Division.TIER2,
        tier2Teams.map((team) => team.id)
    );

    await createWeekendDoubleRoundRobin(
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
    revalidatePath("/scout");
    revalidatePath("/playoffs");
}