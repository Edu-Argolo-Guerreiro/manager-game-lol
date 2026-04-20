type PlayerHistoryCardProps = {
    nickname: string;
    moodNote: string;
    history: string;
};

export function PlayerHistoryCard({
    nickname,
    moodNote,
    history,
}: PlayerHistoryCardProps) {
    const entries = history
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm font-semibold text-white">{nickname}</p>
            <p className="mt-1 text-sm text-cyan-300">{moodNote}</p>

            <div className="mt-4 space-y-2">
                {entries.slice(-4).reverse().map((entry, index) => (
                    <div
                        key={`${nickname}-${index}`}
                        className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300"
                    >
                        {entry}
                    </div>
                ))}
            </div>
        </div>
    );
}