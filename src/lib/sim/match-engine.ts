export function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function simulateBestOf(
    homeStrength: number,
    awayStrength: number,
    bestOf: number
) {
    const winsNeeded = Math.ceil(bestOf / 2);

    let homeWins = 0;
    let awayWins = 0;

    while (homeWins < winsNeeded && awayWins < winsNeeded) {
        const homeScore = homeStrength + randomBetween(-4, 4);
        const awayScore = awayStrength + randomBetween(-4, 4);

        if (homeScore >= awayScore) {
            homeWins += 1;
        } else {
            awayWins += 1;
        }
    }

    return {
        homeScore: homeWins,
        awayScore: awayWins,
        homeWon: homeWins > awayWins,
    };
}