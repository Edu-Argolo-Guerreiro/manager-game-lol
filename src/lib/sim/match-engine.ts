export function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function randomItem<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
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

export function generateMatchNarrative(params: {
    homeTeamName: string;
    awayTeamName: string;
    homeShortName: string;
    awayShortName: string;
    homeStrength: number;
    awayStrength: number;
    homeScore: number;
    awayScore: number;
    winnerShortName: string;
}) {
    const {
        homeTeamName,
        awayTeamName,
        homeShortName,
        awayShortName,
        homeStrength,
        awayStrength,
        homeScore,
        awayScore,
        winnerShortName,
    } = params;

    const diff = Math.abs(homeStrength - awayStrength);
    const scoreLine = `${homeShortName} ${homeScore} x ${awayScore} ${awayShortName}`;

    const balancedPhrases = [
        `Série equilibrada do início ao fim. ${winnerShortName} levou a melhor nos momentos decisivos.`,
        `Confronto muito disputado entre ${homeTeamName} e ${awayTeamName}, decidido nos detalhes.`,
        `${winnerShortName} venceu uma partida truncada e soube fechar melhor os momentos importantes.`,
    ];

    const dominantPhrases = [
        `${winnerShortName} controlou o ritmo da série e venceu com autoridade.`,
        `Vitória segura de ${winnerShortName}, com superioridade clara durante o confronto.`,
        `${winnerShortName} impôs seu plano de jogo e quase não deu espaço ao adversário.`,
    ];

    const upsetPhrases = [
        `Resultado surpreendente: ${winnerShortName} superou o favoritismo pré-jogo.`,
        `${winnerShortName} arrancou uma vitória improvável e mexeu com a tabela.`,
        `Upset na rodada: ${winnerShortName} venceu mesmo entrando como azarão.`,
    ];

    const closeGameEvents = [
        "primeiro dragão garantido no timing certo",
        "luta decisiva no terceiro objetivo neutro",
        "bom controle de visão no mid game",
        "teamfight final melhor executada",
        "side lane mais bem trabalhada no fim",
    ];

    const dominantEvents = [
        "pressão forte no early game",
        "controle total dos objetivos neutros",
        "vantagem consistente de mapa",
        "execução limpa nas teamfights",
        "ritmo acelerado desde os primeiros minutos",
    ];

    const favoriteWon =
        (homeStrength >= awayStrength && winnerShortName === homeShortName) ||
        (awayStrength > homeStrength && winnerShortName === awayShortName);

    let baseText = "";
    let eventText = "";

    if (diff < 2.5) {
        baseText = randomItem(balancedPhrases);
        eventText = randomItem(closeGameEvents);
    } else if (!favoriteWon) {
        baseText = randomItem(upsetPhrases);
        eventText = randomItem(closeGameEvents);
    } else {
        baseText = randomItem(dominantPhrases);
        eventText = randomItem(dominantEvents);
    }

    return `${scoreLine}. ${baseText} Destaque para ${eventText}.`;
}