import { Division, MatchPhase } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function getPlayoffSlots(teamCount: number) {
    if (teamCount >= 10) return 8;
    if (teamCount >= 8) return 6;
    if (teamCount >= 6) return 4;
    return 2;
}

function loserOf(match: {
    winnerTeamId: string | null;
    homeTeamId: string;
    awayTeamId: string;
}) {
    if (!match.winnerTeamId) return null;
    return match.winnerTeamId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
}

export async function getPlayoffBracket(division: Division) {
    const season = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
        include: {
            currentSeason: true,
        } as never,
    }).catch(() => null);

    const save = await prisma.saveState.findFirst({
        orderBy: { createdAt: "desc" },
    });

    if (!save?.currentSeasonId) return null;

    const standings = await prisma.team.findMany({
        where: { division },
        orderBy: [{ wins: "desc" }, { losses: "asc" }, { reputation: "desc" }],
        select: {
            id: true,
            name: true,
            shortName: true,
            wins: true,
            losses: true,
            reputation: true,
        },
    });

    const slots = getPlayoffSlots(standings.length);
    const matches = await prisma.match.findMany({
        where: {
            seasonId: save.currentSeasonId,
            division,
            phase: MatchPhase.PLAYOFFS,
        },
        include: {
            homeTeam: true,
            awayTeam: true,
            winnerTeam: true,
        },
        orderBy: [{ week: "asc" }],
    });

    const byRound = new Map(matches.map((m) => [m.playoffRound ?? "", m]));
    const seedMap = new Map(standings.map((team, index) => [team.id, index + 1]));
    const shortMap = new Map(standings.map((team) => [team.id, team.shortName]));

    if (slots !== 6) {
        return {
            seasonId: save.currentSeasonId,
            slots,
            standings,
            matches,
            rounds: [],
        };
    }

    const seeds = standings.slice(0, 6);

    function labelTeam(teamId?: string | null) {
        if (!teamId) return "—";
        const seed = seedMap.get(teamId);
        const short = shortMap.get(teamId);
        if (!short) return "—";
        return `#${seed} ${short}`;
    }

    function matchView(
        roundKey: string,
        fallbackHome: string,
        fallbackAway: string,
        title: string
    ) {
        const match = byRound.get(roundKey);

        return {
            roundKey,
            title,
            week: match?.week ?? null,
            bestOf: match?.bestOf ?? null,
            played: match?.played ?? false,
            home: match ? labelTeam(match.homeTeamId) : fallbackHome,
            away: match ? labelTeam(match.awayTeamId) : fallbackAway,
            winner: match?.winnerTeam ? labelTeam(match.winnerTeamId) : null,
            score:
                match && match.played
                    ? `${match.homeTeam.shortName} ${match.homeScore} x ${match.awayScore} ${match.awayTeam.shortName}`
                    : null,
        };
    }

    const s1 = byRound.get("S1");
    const s2 = byRound.get("S2");
    const s3 = byRound.get("S3");
    const s4 = byRound.get("S4");
    const s5 = byRound.get("S5");
    const s6 = byRound.get("S6");
    const s7 = byRound.get("S7");
    const s8 = byRound.get("S8");
    const s9 = byRound.get("S9");

    return {
        seasonId: save.currentSeasonId,
        slots,
        standings,
        matches,
        rewards:
            division === "TIER1"
                ? [
                    { place: "1º lugar", reward: "R$ 700.000 + rep + fanbase" },
                    { place: "2º lugar", reward: "R$ 350.000 + rep + fanbase" },
                    { place: "3º lugar", reward: "R$ 180.000 + rep + fanbase" },
                ]
                : [
                    { place: "1º lugar", reward: "R$ 400.000 + rep + fanbase" },
                    { place: "2º lugar", reward: "R$ 220.000 + rep + fanbase" },
                    { place: "3º lugar", reward: "R$ 100.000 + rep + fanbase" },
                ],
        rounds: {
            upper: [
                matchView("S1", `#4 ${seeds[3]?.shortName ?? "?"}`, `#5 ${seeds[4]?.shortName ?? "?"}`, "Série 1"),
                matchView("S2", `#3 ${seeds[2]?.shortName ?? "?"}`, `#6 ${seeds[5]?.shortName ?? "?"}`, "Série 2"),
                matchView(
                    "S3",
                    `#1 ${seeds[0]?.shortName ?? "?"}`,
                    s1?.winnerTeamId ? labelTeam(s1.winnerTeamId) : "Vencedor Série 1/2",
                    "Série 3"
                ),
                matchView(
                    "S4",
                    `#2 ${seeds[1]?.shortName ?? "?"}`,
                    s2?.winnerTeamId ? labelTeam(s2.winnerTeamId) : "Vencedor Série 1/2",
                    "Série 4"
                ),
                matchView(
                    "S7",
                    s3?.winnerTeamId ? labelTeam(s3.winnerTeamId) : "Vencedor Série 3",
                    s4?.winnerTeamId ? labelTeam(s4.winnerTeamId) : "Vencedor Série 4",
                    "Série 7"
                ),
            ],
            lower: [
                matchView(
                    "S5",
                    s4 ? labelTeam(loserOf(s4) ?? undefined) : "Perdedor Série 4",
                    s1 ? labelTeam(loserOf(s1) ?? undefined) : "Perdedor Série 1",
                    "Série 5"
                ),
                matchView(
                    "S6",
                    s3 ? labelTeam(loserOf(s3) ?? undefined) : "Perdedor Série 3",
                    s2 ? labelTeam(loserOf(s2) ?? undefined) : "Perdedor Série 2",
                    "Série 6"
                ),
                matchView(
                    "S8",
                    s5?.winnerTeamId ? labelTeam(s5.winnerTeamId) : "Vencedor Série 5",
                    s6?.winnerTeamId ? labelTeam(s6.winnerTeamId) : "Vencedor Série 6",
                    "Série 8"
                ),
                matchView(
                    "S9",
                    s7 ? labelTeam(loserOf(s7) ?? undefined) : "Perdedor Série 7",
                    s8?.winnerTeamId ? labelTeam(s8.winnerTeamId) : "Vencedor Série 8",
                    "Série 9"
                ),
                matchView(
                    "GF",
                    s7?.winnerTeamId ? labelTeam(s7.winnerTeamId) : "Vencedor Série 7",
                    s9?.winnerTeamId ? labelTeam(s9.winnerTeamId) : "Vencedor Série 9",
                    "Grande Final"
                ),
            ],
        },
    };
}