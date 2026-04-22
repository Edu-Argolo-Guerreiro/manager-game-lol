"use server";

import { Division, IndividualFocus, MatchDay, MatchPhase, ScheduleAction } from "@prisma/client";
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

async function createInitialPlayoffsForDivision(
    seasonId: string,
    division: Division,
    week: number
) {
    const existingPlayoffs = await prisma.match.count({
        where: {
            seasonId,
            division,
            phase: MatchPhase.PLAYOFFS,
        },
    });

    if (existingPlayoffs > 0) return false;

    const standings = await getDivisionStandings(division);
    const slots = getPlayoffSlots(standings.length);

    if (slots === 6) {
        const seeds = standings.slice(0, 6);
        if (seeds.length < 6) return false;

        await prisma.match.createMany({
            data: [
                {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "ROUND1-A",
                    week,
                    bestOf: 3,
                    matchDay: MatchDay.SATURDAY,
                    homeTeamId: seeds[2].id,
                    awayTeamId: seeds[5].id,
                },
                {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "ROUND1-B",
                    week,
                    bestOf: 3,
                    matchDay: MatchDay.SUNDAY,
                    homeTeamId: seeds[3].id,
                    awayTeamId: seeds[4].id,
                },
            ],
        });

        return true;
    }

    if (slots === 8) {
        const seeds = standings.slice(0, 8);
        if (seeds.length < 8) return false;

        await prisma.match.createMany({
            data: [
                {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "QUARTER-1",
                    week,
                    bestOf: 3,
                    matchDay: MatchDay.SATURDAY,
                    homeTeamId: seeds[0].id,
                    awayTeamId: seeds[7].id,
                },
                {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "QUARTER-2",
                    week,
                    bestOf: 3,
                    matchDay: MatchDay.SATURDAY,
                    homeTeamId: seeds[3].id,
                    awayTeamId: seeds[4].id,
                },
                {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "QUARTER-3",
                    week,
                    bestOf: 3,
                    matchDay: MatchDay.SUNDAY,
                    homeTeamId: seeds[1].id,
                    awayTeamId: seeds[6].id,
                },
                {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "QUARTER-4",
                    week,
                    bestOf: 3,
                    matchDay: MatchDay.SUNDAY,
                    homeTeamId: seeds[2].id,
                    awayTeamId: seeds[5].id,
                },
            ],
        });

        return true;
    }

    return false;
}

async function createNextPlayoffRoundForDivision(
    seasonId: string,
    division: Division,
    week: number
) {
    const standings = await getDivisionStandings(division);
    const slots = getPlayoffSlots(standings.length);

    if (slots === 6) {
        const round1A = await prisma.match.findFirst({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "ROUND1-A",
                played: true,
            },
        });

        const round1B = await prisma.match.findFirst({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "ROUND1-B",
                played: true,
            },
        });

        const semisAlready = await prisma.match.count({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: { in: ["SEMI-1", "SEMI-2"] },
            },
        });

        if (round1A && round1B && semisAlready === 0) {
            const seeds = standings.slice(0, 6);

            await prisma.match.createMany({
                data: [
                    {
                        seasonId,
                        division,
                        phase: MatchPhase.PLAYOFFS,
                        playoffRound: "SEMI-1",
                        week,
                        bestOf: 5,
                        matchDay: MatchDay.SATURDAY,
                        homeTeamId: seeds[0].id,
                        awayTeamId: round1B.winnerTeamId!,
                    },
                    {
                        seasonId,
                        division,
                        phase: MatchPhase.PLAYOFFS,
                        playoffRound: "SEMI-2",
                        week,
                        bestOf: 5,
                        matchDay: MatchDay.SUNDAY,
                        homeTeamId: seeds[1].id,
                        awayTeamId: round1A.winnerTeamId!,
                    },
                ],
            });

            return true;
        }

        const semi1 = await prisma.match.findFirst({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "SEMI-1",
                played: true,
            },
        });

        const semi2 = await prisma.match.findFirst({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "SEMI-2",
                played: true,
            },
        });

        const finalAlready = await prisma.match.count({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "FINAL",
            },
        });

        if (semi1 && semi2 && finalAlready === 0) {
            await prisma.match.create({
                data: {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "FINAL",
                    week,
                    bestOf: 5,
                    matchDay: MatchDay.SUNDAY,
                    homeTeamId: semi1.winnerTeamId!,
                    awayTeamId: semi2.winnerTeamId!,
                },
            });

            return true;
        }
    }

    if (slots === 8) {
        const q1 = await prisma.match.findFirst({
            where: { seasonId, division, phase: MatchPhase.PLAYOFFS, playoffRound: "QUARTER-1", played: true },
        });
        const q2 = await prisma.match.findFirst({
            where: { seasonId, division, phase: MatchPhase.PLAYOFFS, playoffRound: "QUARTER-2", played: true },
        });
        const q3 = await prisma.match.findFirst({
            where: { seasonId, division, phase: MatchPhase.PLAYOFFS, playoffRound: "QUARTER-3", played: true },
        });
        const q4 = await prisma.match.findFirst({
            where: { seasonId, division, phase: MatchPhase.PLAYOFFS, playoffRound: "QUARTER-4", played: true },
        });

        const semisAlready = await prisma.match.count({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: { in: ["SEMI-1", "SEMI-2"] },
            },
        });

        if (q1 && q2 && q3 && q4 && semisAlready === 0) {
            await prisma.match.createMany({
                data: [
                    {
                        seasonId,
                        division,
                        phase: MatchPhase.PLAYOFFS,
                        playoffRound: "SEMI-1",
                        week,
                        bestOf: 5,
                        matchDay: MatchDay.SATURDAY,
                        homeTeamId: q1.winnerTeamId!,
                        awayTeamId: q2.winnerTeamId!,
                    },
                    {
                        seasonId,
                        division,
                        phase: MatchPhase.PLAYOFFS,
                        playoffRound: "SEMI-2",
                        week,
                        bestOf: 5,
                        matchDay: MatchDay.SUNDAY,
                        homeTeamId: q3.winnerTeamId!,
                        awayTeamId: q4.winnerTeamId!,
                    },
                ],
            });

            return true;
        }

        const semi1 = await prisma.match.findFirst({
            where: { seasonId, division, phase: MatchPhase.PLAYOFFS, playoffRound: "SEMI-1", played: true },
        });
        const semi2 = await prisma.match.findFirst({
            where: { seasonId, division, phase: MatchPhase.PLAYOFFS, playoffRound: "SEMI-2", played: true },
        });

        const finalAlready = await prisma.match.count({
            where: {
                seasonId,
                division,
                phase: MatchPhase.PLAYOFFS,
                playoffRound: "FINAL",
            },
        });

        if (semi1 && semi2 && finalAlready === 0) {
            await prisma.match.create({
                data: {
                    seasonId,
                    division,
                    phase: MatchPhase.PLAYOFFS,
                    playoffRound: "FINAL",
                    week,
                    bestOf: 5,
                    matchDay: MatchDay.SUNDAY,
                    homeTeamId: semi1.winnerTeamId!,
                    awayTeamId: semi2.winnerTeamId!,
                },
            });

            return true;
        }
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

async function applyPlayerDelta(playerId: string, data: {
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
}) {
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

        if (player.form >= 84 && player.morale >= 78 && player.fatigue <= 32 && player.overall < player.potential) {
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

async function applyDynamicReputation(playerTeamId: string, seasonId: string, week: number) {
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
        const playoffPrefix = match.phase === "PLAYOFFS" && match.playoffRound
            ? `${match.playoffRound} • `
            : "";

        const summary = `${playoffPrefix}${dayLabel}. ` + generateMatchNarrative({
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

    const remainingRegular = await prisma.match.count({
        where: {
            seasonId: season.id,
            phase: MatchPhase.REGULAR_SEASON,
            played: false,
        },
    });

    let createdPlayoffs = false;

    if (remainingRegular === 0) {
        const tier1Created = await createInitialPlayoffsForDivision(
            season.id,
            Division.TIER1,
            simulatedWeek + 1
        );
        const tier2Created = await createInitialPlayoffsForDivision(
            season.id,
            Division.TIER2,
            simulatedWeek + 1
        );

        createdPlayoffs = tier1Created || tier2Created;

        if (!createdPlayoffs) {
            const nextTier1 = await createNextPlayoffRoundForDivision(
                season.id,
                Division.TIER1,
                simulatedWeek + 1
            );
            const nextTier2 = await createNextPlayoffRoundForDivision(
                season.id,
                Division.TIER2,
                simulatedWeek + 1
            );

            createdPlayoffs = nextTier1 || nextTier2;
        }
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
                currentPhase: remainingRegular > 0 ? MatchPhase.REGULAR_SEASON : MatchPhase.PLAYOFFS,
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
}