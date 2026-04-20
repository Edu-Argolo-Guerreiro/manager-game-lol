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
    { name: "Aurora Stars", shortName: "AUR", division: Division.TIER2, budget: 900000, reputation: 48, fanbase: 20000, createdByPlayer: true },
    { name: "Black Falcons", shortName: "BLF", division: Division.TIER2, budget: 820000, reputation: 45, fanbase: 18000 },
    { name: "Vortex Gaming", shortName: "VTX", division: Division.TIER2, budget: 870000, reputation: 47, fanbase: 21000 },
    { name: "Solar Wolves", shortName: "SLW", division: Division.TIER2, budget: 790000, reputation: 43, fanbase: 17000 },
    { name: "Iron Tempest", shortName: "IRT", division: Division.TIER2, budget: 830000, reputation: 44, fanbase: 19500 },
    { name: "Nova Rage", shortName: "NVR", division: Division.TIER2, budget: 810000, reputation: 42, fanbase: 16000 },
    { name: "Crimson Tide", shortName: "CRT", division: Division.TIER2, budget: 850000, reputation: 46, fanbase: 22000 },
    { name: "Titan Forge", shortName: "TTF", division: Division.TIER2, budget: 800000, reputation: 44, fanbase: 18500 },

    { name: "Phoenix Prime", shortName: "PHX", division: Division.TIER1, budget: 2100000, reputation: 78, fanbase: 120000 },
    { name: "Royal Nexus", shortName: "RNX", division: Division.TIER1, budget: 2200000, reputation: 81, fanbase: 135000 },
    { name: "Omega Rush", shortName: "OMG", division: Division.TIER1, budget: 2050000, reputation: 76, fanbase: 110000 },
    { name: "Blue Horizon", shortName: "BLH", division: Division.TIER1, budget: 1980000, reputation: 74, fanbase: 98000 },
    { name: "Thunder Core", shortName: "THC", division: Division.TIER1, budget: 2150000, reputation: 79, fanbase: 128000 },
    { name: "Infinity Vipers", shortName: "IFV", division: Division.TIER1, budget: 2080000, reputation: 77, fanbase: 118000 },
    { name: "Red Dominion", shortName: "RDD", division: Division.TIER1, budget: 2250000, reputation: 82, fanbase: 140000 },
    { name: "Echo Force", shortName: "ECH", division: Division.TIER1, budget: 1950000, reputation: 73, fanbase: 92000 },
];

function createPlayer(
    nickname: string,
    role: Role,
    overall: number,
    potential: number,
    status: PlayerStatus = PlayerStatus.STARTER
): SeedPlayer {
    const ageByRole = {
        [Role.TOP]: 23,
        [Role.JG]: 22,
        [Role.MID]: 21,
        [Role.ADC]: 22,
        [Role.SUP]: 24,
    };

    return {
        nickname,
        nationality: "BR",
        age: ageByRole[role],
        role,
        overall,
        potential,
        salary: overall >= 75 ? 85000 : overall >= 70 ? 60000 : 38000,
        marketValue: overall >= 75 ? 550000 : overall >= 70 ? 360000 : 220000,
        contractYears: 2,
        morale: 70 + Math.floor(Math.random() * 21),
        form: 68 + Math.floor(Math.random() * 21),
        teamwork: 65 + Math.floor(Math.random() * 26),
        discipline: 65 + Math.floor(Math.random() * 26),
        championPool: 65 + Math.floor(Math.random() * 26),
        clutch: 60 + Math.floor(Math.random() * 31),
        shotcalling: role === Role.SUP || role === Role.JG ? 68 + Math.floor(Math.random() * 23) : 55 + Math.floor(Math.random() * 25),
        laneStrength: 65 + Math.floor(Math.random() * 26),
        teamfight: 65 + Math.floor(Math.random() * 26),
        status,
    };
}

function createRosterForTier2(baseName: string): SeedPlayer[] {
    return [
        createPlayer(`${baseName}Top`, Role.TOP, 68 + Math.floor(Math.random() * 5), 77 + Math.floor(Math.random() * 8)),
        createPlayer(`${baseName}Jg`, Role.JG, 67 + Math.floor(Math.random() * 5), 76 + Math.floor(Math.random() * 9)),
        createPlayer(`${baseName}Mid`, Role.MID, 69 + Math.floor(Math.random() * 5), 79 + Math.floor(Math.random() * 7)),
        createPlayer(`${baseName}Adc`, Role.ADC, 68 + Math.floor(Math.random() * 5), 78 + Math.floor(Math.random() * 8)),
        createPlayer(`${baseName}Sup`, Role.SUP, 67 + Math.floor(Math.random() * 5), 77 + Math.floor(Math.random() * 8)),
        createPlayer(`${baseName}TopB`, Role.TOP, 63 + Math.floor(Math.random() * 4), 73 + Math.floor(Math.random() * 6), PlayerStatus.BENCH),
        createPlayer(`${baseName}JgB`, Role.JG, 63 + Math.floor(Math.random() * 4), 73 + Math.floor(Math.random() * 6), PlayerStatus.BENCH),
    ];
}

function createRosterForTier1(baseName: string): SeedPlayer[] {
    return [
        createPlayer(`${baseName}Top`, Role.TOP, 75 + Math.floor(Math.random() * 5), 82 + Math.floor(Math.random() * 6)),
        createPlayer(`${baseName}Jg`, Role.JG, 74 + Math.floor(Math.random() * 5), 82 + Math.floor(Math.random() * 6)),
        createPlayer(`${baseName}Mid`, Role.MID, 76 + Math.floor(Math.random() * 5), 84 + Math.floor(Math.random() * 5)),
        createPlayer(`${baseName}Adc`, Role.ADC, 75 + Math.floor(Math.random() * 5), 83 + Math.floor(Math.random() * 5)),
        createPlayer(`${baseName}Sup`, Role.SUP, 74 + Math.floor(Math.random() * 5), 82 + Math.floor(Math.random() * 6)),
        createPlayer(`${baseName}TopB`, Role.TOP, 69 + Math.floor(Math.random() * 4), 77 + Math.floor(Math.random() * 6), PlayerStatus.BENCH),
        createPlayer(`${baseName}MidB`, Role.MID, 69 + Math.floor(Math.random() * 4), 78 + Math.floor(Math.random() * 6), PlayerStatus.BENCH),
    ];
}

function createFreeAgents(): SeedPlayer[] {
    return [
        createPlayer("Raptor", Role.TOP, 71, 80, PlayerStatus.FREE_AGENT),
        createPlayer("Hexa", Role.JG, 72, 81, PlayerStatus.FREE_AGENT),
        createPlayer("Nyx", Role.MID, 73, 83, PlayerStatus.FREE_AGENT),
        createPlayer("Blitz", Role.ADC, 72, 80, PlayerStatus.FREE_AGENT),
        createPlayer("Aegis", Role.SUP, 71, 79, PlayerStatus.FREE_AGENT),
        createPlayer("Kairo", Role.TOP, 66, 78, PlayerStatus.FREE_AGENT),
        createPlayer("Dust", Role.JG, 67, 76, PlayerStatus.FREE_AGENT),
        createPlayer("Ion", Role.MID, 68, 79, PlayerStatus.FREE_AGENT),
        createPlayer("Volt", Role.ADC, 67, 77, PlayerStatus.FREE_AGENT),
        createPlayer("Mint", Role.SUP, 66, 76, PlayerStatus.FREE_AGENT),
        createPlayer("Atlas", Role.TOP, 75, 79, PlayerStatus.FREE_AGENT),
        createPlayer("Mako", Role.JG, 74, 80, PlayerStatus.FREE_AGENT),
        createPlayer("Shade", Role.MID, 76, 84, PlayerStatus.FREE_AGENT),
        createPlayer("Pulse", Role.ADC, 75, 82, PlayerStatus.FREE_AGENT),
        createPlayer("Ward", Role.SUP, 74, 80, PlayerStatus.FREE_AGENT),
    ];
}

async function createStaffForTeam(teamId: string, division: Division) {
    const baseQuality = division === Division.TIER1 ? 74 : 63;
    const baseSalary = division === Division.TIER1 ? 55000 : 28000;

    await prisma.staff.createMany({
        data: [
            {
                name: `Coach ${teamId.slice(-4)}`,
                role: StaffRole.HEAD_COACH,
                quality: baseQuality + Math.floor(Math.random() * 8),
                salary: baseSalary,
                contractYears: 2,
                teamId,
            },
            {
                name: `Analyst ${teamId.slice(-4)}`,
                role: StaffRole.ANALYST,
                quality: baseQuality - 2 + Math.floor(Math.random() * 8),
                salary: Math.floor(baseSalary * 0.75),
                contractYears: 2,
                teamId,
            },
            {
                name: `Manager ${teamId.slice(-4)}`,
                role: StaffRole.MANAGER,
                quality: baseQuality - 3 + Math.floor(Math.random() * 8),
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

        const roster =
            team.division === Division.TIER1
                ? createRosterForTier1(team.shortName)
                : createRosterForTier2(team.shortName);

        for (const player of roster) {
            await prisma.player.create({
                data: {
                    ...player,
                    teamId: team.id,
                },
            });
        }

        await createStaffForTeam(team.id, team.division);
    }

    const freeAgents = createFreeAgents();
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