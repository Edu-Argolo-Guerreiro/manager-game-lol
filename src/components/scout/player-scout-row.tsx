type PlayerScoutRowProps = {
    nickname: string;
    nationality: string;
    role: string;
    overall: number;
    potential: number;
    morale: number;
    fatigue: number;
    marketValue: number;
    contractYears: number;
    status: string;
    moodNote: string;
};

function fatigueColor(fatigue: number) {
    if (fatigue <= 20) return "text-emerald-300";
    if (fatigue <= 45) return "text-cyan-300";
    if (fatigue <= 65) return "text-amber-300";
    return "text-rose-300";
}

export function PlayerScoutRow({
    nickname,
    nationality,
    role,
    overall,
    potential,
    morale,
    fatigue,
    marketValue,
    contractYears,
    status,
    moodNote,
}: PlayerScoutRowProps) {
    return (
        <tr className="border-b border-zinc-900">
            <td className="px-3 py-3 font-medium text-white">{nickname}</td>
            <td className="px-3 py-3 text-zinc-300">{nationality}</td>
            <td className="px-3 py-3 text-zinc-300">{role}</td>
            <td className="px-3 py-3 font-semibold text-cyan-300">{overall}</td>
            <td className="px-3 py-3 text-zinc-300">{potential}</td>
            <td className="px-3 py-3 text-zinc-300">{morale}</td>
            <td className={`px-3 py-3 font-medium ${fatigueColor(fatigue)}`}>{fatigue}</td>
            <td className="px-3 py-3 text-zinc-300">
                R$ {marketValue.toLocaleString("pt-BR")}
            </td>
            <td className="px-3 py-3 text-zinc-300">{contractYears}</td>
            <td className="px-3 py-3">
                <span
                    className={[
                        "rounded-lg px-2 py-1 text-xs font-semibold",
                        status === "STARTER"
                            ? "bg-cyan-500/15 text-cyan-300"
                            : "bg-amber-500/15 text-amber-300",
                    ].join(" ")}
                >
                    {status === "STARTER" ? "Titular" : "Reserva"}
                </span>
            </td>
            <td className="px-3 py-3 text-zinc-400">{moodNote}</td>
        </tr>
    );
}