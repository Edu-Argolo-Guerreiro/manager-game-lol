import { PrismaClient, Division, Role, StaffRole, PlayerStatus } from "@prisma/client";

const prisma = new PrismaClient();

type SeedTeam = {
    name: string;
    shortName: string;
    division: Division;
    budget: number;
    reputation: number;
    fanbase: number;
    createdByPlayer?: boolean;
};

type SeedPlayer = {
    nickname: string;
    nationality: string;
    age: number;
    role: Role;
    overall: number;
    potential: number;
    salary: number;
    marketValue: number;
    contractYears: number;
    morale: number;
    form: number;
    teamwork: number;
    discipline: number;
    championPool: number;
    clutch: number;
    shotcalling: number;
    laneStrength: number;
    teamfight: number;
    status: PlayerStatus;
};

const teams: SeedTeam[] = [
    { name: "paiN Gaming Academy", shortName: "PNG.A", division: Division.TIER2, budget: 1150000, reputation: 58, fanbase: 42000, createdByPlayer: true },
    { name: "RED Academy", shortName: "RED.A", division: Division.TIER2, budget: 820000, reputation: 45, fanbase: 18000 },
    { name: "LOUD Academy", shortName: "LLL.A", division: Division.TIER2, budget: 870000, reputation: 47, fanbase: 21000 },
    { name: "FURIA Academy", shortName: "FUR.A", division: Division.TIER2, budget: 790000, reputation: 43, fanbase: 17000 },
    { name: "INTZ Academy", shortName: "ITZ.A", division: Division.TIER2, budget: 830000, reputation: 44, fanbase: 19500 },
    { name: "Vivo Keyd Stars Academy", shortName: "VKS.A", division: Division.TIER2, budget: 810000, reputation: 42, fanbase: 16000 },
    { name: "KaBuM! Academy", shortName: "KBM.A", division: Division.TIER2, budget: 850000, reputation: 46, fanbase: 22000 },
    { name: "Liberty Academy", shortName: "LBR.A", division: Division.TIER2, budget: 800000, reputation: 44, fanbase: 18500 },

    { name: "paiN Gaming", shortName: "PNG", division: Division.TIER1, budget: 2100000, reputation: 78, fanbase: 120000 },
    { name: "LOUD", shortName: "LLL", division: Division.TIER1, budget: 2200000, reputation: 81, fanbase: 135000 },
    { name: "FURIA", shortName: "FUR", division: Division.TIER1, budget: 2050000, reputation: 76, fanbase: 110000 },
    { name: "RED Canids", shortName: "RED", division: Division.TIER1, budget: 1980000, reputation: 74, fanbase: 98000 },
    { name: "Vivo Keyd Stars", shortName: "VKS", division: Division.TIER1, budget: 2150000, reputation: 79, fanbase: 128000 },
    { name: "KaBuM! Esports", shortName: "KBM", division: Division.TIER1, budget: 2080000, reputation: 77, fanbase: 118000 },
    { name: "INTZ", shortName: "ITZ", division: Division.TIER1, budget: 2250000, reputation: 82, fanbase: 140000 },
    { name: "Liberty", shortName: "LBR", division: Division.TIER1, budget: 1950000, reputation: 73, fanbase: 92000 },
];

function makePlayer(data: Partial<SeedPlayer> & Pick<SeedPlayer, "nickname" | "role" | "overall" | "potential">): SeedPlayer {
    const ageByRole: Record<Role, number> = {
        TOP: 23,
        JG: 22,
        MID: 22,
        ADC: 23,
        SUP: 24,
    };

    const role = data.role;
    const overall = data.overall;

    return {
        nickname: data.nickname,
        nationality: data.nationality ?? "BR",
        age: data.age ?? ageByRole[role],
        role,
        overall,
        potential: data.potential,
        salary: data.salary ?? (overall >= 78 ? 105000 : overall >= 74 ? 78000 : overall >= 70 ? 56000 : 38000),
        marketValue: data.marketValue ?? (overall >= 78 ? 720000 : overall >= 74 ? 520000 : overall >= 70 ? 340000 : 220000),
        contractYears: data.contractYears ?? 2,
        morale: data.morale ?? 78,
        form: data.form ?? 76,
        teamwork: data.teamwork ?? 75,
        discipline: data.discipline ?? 74,
        championPool: data.championPool ?? 74,
        clutch: data.clutch ?? 73,
        shotcalling: data.shotcalling ?? 70,
        laneStrength: data.laneStrength ?? 74,
        teamfight: data.teamfight ?? 75,
        status: data.status ?? PlayerStatus.STARTER,
    };
}

function createGenericRoster(baseName: string, division: Division): SeedPlayer[] {
    if (division === Division.TIER1) {
        return [
            makePlayer({ nickname: `${baseName}Top`, role: Role.TOP, overall: 75, potential: 81 }),
            makePlayer({ nickname: `${baseName}Jg`, role: Role.JG, overall: 74, potential: 81 }),
            makePlayer({ nickname: `${baseName}Mid`, role: Role.MID, overall: 76, potential: 82 }),
            makePlayer({ nickname: `${baseName}Adc`, role: Role.ADC, overall: 75, potential: 82 }),
            makePlayer({ nickname: `${baseName}Sup`, role: Role.SUP, overall: 74, potential: 80, shotcalling: 77 }),
            makePlayer({ nickname: `${baseName}TopB`, role: Role.TOP, overall: 69, potential: 76, status: PlayerStatus.BENCH }),
            makePlayer({ nickname: `${baseName}MidB`, role: Role.MID, overall: 70, potential: 77, status: PlayerStatus.BENCH }),
        ];
    }

    return [
        makePlayer({ nickname: `${baseName}Top`, role: Role.TOP, overall: 68, potential: 76 }),
        makePlayer({ nickname: `${baseName}Jg`, role: Role.JG, overall: 67, potential: 76 }),
        makePlayer({ nickname: `${baseName}Mid`, role: Role.MID, overall: 69, potential: 77 }),
        makePlayer({ nickname: `${baseName}Adc`, role: Role.ADC, overall: 68, potential: 76 }),
        makePlayer({ nickname: `${baseName}Sup`, role: Role.SUP, overall: 67, potential: 75, shotcalling: 74 }),
        makePlayer({ nickname: `${baseName}TopB`, role: Role.TOP, overall: 63, potential: 72, status: PlayerStatus.BENCH }),
        makePlayer({ nickname: `${baseName}JgB`, role: Role.JG, overall: 63, potential: 72, status: PlayerStatus.BENCH }),
    ];
}

function createRealPlayerRoster(): SeedPlayer[] {
    return [
        makePlayer({
            nickname: "Robo",
            role: Role.TOP,
            nationality: "BR",
            age: 27,
            overall: 79,
            potential: 82,
            laneStrength: 81,
            teamfight: 79,
            clutch: 78,
            teamwork: 76,
        }),
        makePlayer({
            nickname: "CarioK",
            role: Role.JG,
            nationality: "BR",
            age: 25,
            overall: 78,
            potential: 82,
            shotcalling: 79,
            teamwork: 78,
            teamfight: 78,
            clutch: 77,
        }),
        makePlayer({
            nickname: "tinowns",
            role: Role.MID,
            nationality: "BR",
            age: 28,
            overall: 80,
            potential: 82,
            laneStrength: 82,
            championPool: 80,
            clutch: 79,
            teamfight: 80,
        }),
        makePlayer({
            nickname: "Route",
            role: Role.ADC,
            nationality: "KR",
            age: 24,
            overall: 79,
            potential: 83,
            laneStrength: 80,
            teamfight: 81,
            clutch: 78,
            teamwork: 74,
        }),
        makePlayer({
            nickname: "Ceos",
            role: Role.SUP,
            nationality: "BR",
            age: 25,
            overall: 77,
            potential: 80,
            shotcalling: 81,
            teamwork: 79,
            teamfight: 78,
        }),
        makePlayer({
            nickname: "brTT",
            role: Role.ADC,
            nationality: "BR",
            age: 35,
            overall: 75,
            potential: 75,
            status: PlayerStatus.BENCH,
            clutch: 81,
            teamfight: 78,
            laneStrength: 74,
        }),
        makePlayer({
            nickname: "JoJo",
            role: Role.TOP,
            nationality: "BR",
            age: 24,
            overall: 71,
            potential: 77,
            status: PlayerStatus.BENCH,
            laneStrength: 73,
            teamfight: 70,
        }),
    ];
}

function createRealFreeAgents(): SeedPlayer[] {
    return [
        makePlayer({ nickname: "TitaN", role: Role.ADC, nationality: "BR", age: 25, overall: 78, potential: 81, status: PlayerStatus.FREE_AGENT, clutch: 79, laneStrength: 79 }),
        makePlayer({ nickname: "Dynquedo", role: Role.MID, nationality: "BR", age: 26, overall: 79, potential: 82, status: PlayerStatus.FREE_AGENT, laneStrength: 81, championPool: 79 }),
        makePlayer({ nickname: "Croc", role: Role.JG, nationality: "KR", age: 26, overall: 77, potential: 80, status: PlayerStatus.FREE_AGENT, shotcalling: 76, teamwork: 73 }),
        makePlayer({ nickname: "Wizer", role: Role.TOP, nationality: "KR", age: 24, overall: 78, potential: 82, status: PlayerStatus.FREE_AGENT, laneStrength: 80 }),
        makePlayer({ nickname: "esA", role: Role.SUP, nationality: "BR", age: 29, overall: 74, potential: 74, status: PlayerStatus.FREE_AGENT, shotcalling: 79, teamwork: 77 }),
        makePlayer({ nickname: "Aegis", role: Role.JG, nationality: "BR", age: 26, overall: 74, potential: 77, status: PlayerStatus.FREE_AGENT, shotcalling: 75 }),
        makePlayer({ nickname: "Envy", role: Role.MID, nationality: "BR", age: 22, overall: 73, potential: 80, status: PlayerStatus.FREE_AGENT, laneStrength: 75 }),
        makePlayer({ nickname: "Trigo", role: Role.TOP, nationality: "BR", age: 22, overall: 71, potential: 79, status: PlayerStatus.FREE_AGENT }),
        makePlayer({ nickname: "fNb", role: Role.TOP, nationality: "BR", age: 28, overall: 74, potential: 75, status: PlayerStatus.FREE_AGENT, laneStrength: 75 }),
        makePlayer({ nickname: "Shini", role: Role.JG, nationality: "BR", age: 28, overall: 73, potential: 74, status: PlayerStatus.FREE_AGENT }),
        makePlayer({ nickname: "Tockers", role: Role.MID, nationality: "BR", age: 29, overall: 74, potential: 74, status: PlayerStatus.FREE_AGENT, championPool: 76 }),
        makePlayer({ nickname: "Bvoy", role: Role.ADC, nationality: "KR", age: 27, overall: 77, potential: 79, status: PlayerStatus.FREE_AGENT }),
        makePlayer({ nickname: "Damage", role: Role.ADC, nationality: "BR", age: 23, overall: 72, potential: 78, status: PlayerStatus.FREE_AGENT }),
        makePlayer({ nickname: "RedBert", role: Role.SUP, nationality: "BR", age: 26, overall: 73, potential: 76, status: PlayerStatus.FREE_AGENT, shotcalling: 76 }),
        makePlayer({ nickname: "JojoC", role: Role.SUP, nationality: "BR", age: 22, overall: 71, potential: 78, status: PlayerStatus.FREE_AGENT, teamwork: 76 }),
    ];
}

async function createStaffForTeam(teamId: string, division: Division, isPlayerTeam = false) {
    const baseQuality = division === Division.TIER1 ? 74 : 63;
    const baseSalary = division === Division.TIER1 ? 55000 : 28000;

    await prisma.staff.createMany({
        data: [
            {
                name: isPlayerTeam ? "Ranger" : `Coach ${teamId.slice(-4)}`,
                role: StaffRole.HEAD_COACH,
                quality: isPlayerTeam ? 78 : baseQuality + Math.floor(Math.random() * 8),
                salary: baseSalary,
                contractYears: 2,
                teamId,
            },
            {
                name: isPlayerTeam ? "Analyst Mylon" : `Analyst ${teamId.slice(-4)}`,
                role: StaffRole.ANALYST,
                quality: isPlayerTeam ? 74 : baseQuality - 2 + Math.floor(Math.random() * 8),
                salary: Math.floor(baseSalary * 0.75),
                contractYears: 2,
                teamId,
            },
            {
                name: isPlayerTeam ? "Manager Baiano" : `Manager ${teamId.slice(-4)}`,
                role: StaffRole.MANAGER,
                quality: isPlayerTeam ? 72 : baseQuality - 3 + Math.floor(Math.random() * 8),
                salary: Math.floor(baseSalary * 0.7),
                contractYears: 2,
                teamId,
            },
        ],
    });
}

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
                    phase: "REGULAR_SEASON",
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

async function main() {
    await prisma.match.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.player.deleteMany();
    await prisma.team.deleteMany();
    await prisma.season.deleteMany();
    await prisma.saveState.deleteMany();

    for (const teamData of teams) {
        const team = await prisma.team.create({
            data: teamData,
        });

        const roster = team.createdByPlayer
            ? createRealPlayerRoster()
            : createGenericRoster(team.shortName, team.division);

        for (const player of roster) {
            await prisma.player.create({
                data: {
                    ...player,
                    teamId: team.id,
                },
            });
        }

        await createStaffForTeam(team.id, team.division, Boolean(team.createdByPlayer));
    }

    const freeAgents = createRealFreeAgents();
    for (const player of freeAgents) {
        await prisma.player.create({
            data: player,
        });
    }

    const season = await prisma.season.create({
        data: {
            year: 2026,
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
        season.id,
        Division.TIER2,
        tier2Teams.map((t) => t.id)
    );

    await createRoundRobinMatches(
        season.id,
        Division.TIER1,
        tier1Teams.map((t) => t.id)
    );

    const playerTeam = await prisma.team.findFirst({
        where: { createdByPlayer: true },
        select: { id: true },
    });

    await prisma.saveState.create({
        data: {
            currentSeasonId: season.id,
            playerTeamId: playerTeam?.id,
        },
    });

    console.log("Seed concluído com sucesso.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });