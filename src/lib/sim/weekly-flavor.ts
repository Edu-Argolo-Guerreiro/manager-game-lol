type WeeklyEventParams = {
    teamName: string;
    planLabels: string[];
    playerNicknames: string[];
    avgMorale: number;
    avgFatigue: number;
};

type InterviewParams = {
    teamName: string;
    opponentName: string;
    won: boolean;
    scoreline: string;
};

function pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

export function generateWeeklyEvent(params: WeeklyEventParams) {
    const { teamName, planLabels, playerNicknames, avgMorale, avgFatigue } = params;
    const playerA = playerNicknames[0] ?? "Um jogador";
    const playerB = playerNicknames[1] ?? "outro companheiro";
    const dominantPlan = planLabels[2] ?? "Treino individual";

    if (avgFatigue >= 65) {
        return {
            title: "Semana pesada no treino",
            body: `${teamName} fechou uma preparação desgastante. ${playerA} sentiu o acúmulo físico, e a comissão precisou reduzir o ritmo em parte das atividades.`,
        };
    }

    if (avgMorale <= 48) {
        return {
            title: "Clima de pressão interna",
            body: `O ambiente ficou mais tenso durante a semana. ${playerA} e ${playerB} trocaram cobranças fortes após uma atividade de ${dominantPlan.toLowerCase()}.`,
        };
    }

    const generic = [
        {
            title: "Treino encaixou bem",
            body: `${teamName} teve uma semana produtiva. A comissão gostou da resposta do elenco em sessões de ${dominantPlan.toLowerCase()}.`,
        },
        {
            title: "Elenco respondeu ao plano",
            body: `${playerA} foi um dos destaques dos treinamentos, enquanto ${playerB} mostrou evolução nas atividades da semana.`,
        },
        {
            title: "Semana sem ruído externo",
            body: `A preparação foi estável e organizada. ${teamName} conseguiu treinar sem grandes interferências e chega mais alinhado para o fim de semana.`,
        },
    ];

    return pick(generic);
}

export function generateInterview(params: InterviewParams) {
    const { teamName, opponentName, won, scoreline } = params;

    const winQuotes = [
        `“A equipe respondeu bem ao plano da semana. ${scoreline} foi consequência do trabalho.”`,
        `“Gostei da postura competitiva. Respeitamos ${opponentName}, mas jogamos para vencer.”`,
        `“Foi uma atuação madura. ${teamName} mostrou evolução nos momentos decisivos.”`,
    ];

    const lossQuotes = [
        `“O placar ${scoreline} cobra detalhes que precisamos corrigir já para a próxima rodada.”`,
        `“Faltou consistência em momentos importantes. ${opponentName} aproveitou melhor as chances.”`,
        `“A derrota dói, mas serve de alerta. O time precisa reagir rápido.”`,
    ];

    return won ? pick(winQuotes) : pick(lossQuotes);
}