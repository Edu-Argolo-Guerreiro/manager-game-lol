export type SimPlayer = {
    overall: number;
    form: number;
    morale: number;
    fatigue: number;
    teamwork: number;
    teamfight: number;
    clutch: number;
    status: string;
};

export type SimStaff = {
    role: string;
    quality: number;
};

export function calculateTeamStrength(
    players: SimPlayer[],
    staff: SimStaff[]
): number {
    const starters = players.filter((player) => player.status === "STARTER");

    if (starters.length === 0) return 0;

    const baseOverall =
        starters.reduce((acc, player) => acc + player.overall, 0) / starters.length;

    const avgForm =
        starters.reduce((acc, player) => acc + player.form, 0) / starters.length;

    const avgMorale =
        starters.reduce((acc, player) => acc + player.morale, 0) / starters.length;

    const avgFatigue =
        starters.reduce((acc, player) => acc + player.fatigue, 0) / starters.length;

    const avgTeamwork =
        starters.reduce((acc, player) => acc + player.teamwork, 0) / starters.length;

    const avgTeamfight =
        starters.reduce((acc, player) => acc + player.teamfight, 0) / starters.length;

    const avgClutch =
        starters.reduce((acc, player) => acc + player.clutch, 0) / starters.length;

    const headCoach =
        staff.find((member) => member.role === "HEAD_COACH")?.quality ?? 60;

    const analyst =
        staff.find((member) => member.role === "ANALYST")?.quality ?? 60;

    const coachBonus = (headCoach - 60) * 0.18;
    const analystBonus = (analyst - 60) * 0.08;

    const formBonus = (avgForm - 70) * 0.12;
    const moraleBonus = (avgMorale - 70) * 0.12;
    const fatiguePenalty = avgFatigue * 0.12;
    const synergyBonus = (avgTeamwork - 70) * 0.1;
    const teamfightBonus = (avgTeamfight - 70) * 0.08;
    const clutchBonus = (avgClutch - 70) * 0.06;

    return Number(
        (
            baseOverall +
            coachBonus +
            analystBonus +
            formBonus +
            moraleBonus +
            synergyBonus +
            teamfightBonus +
            clutchBonus -
            fatiguePenalty
        ).toFixed(2)
    );
}