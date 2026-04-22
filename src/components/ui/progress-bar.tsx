type ProgressBarProps = {
    value: number;
    max?: number;
    tone?: "blue" | "green" | "red" | "yellow" | "purple";
};

export function ProgressBar({
    value,
    max = 100,
    tone = "blue",
}: ProgressBarProps) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));

    const toneMap = {
        blue: "from-[#5a8cff] to-[#7fb0ff]",
        green: "from-[#1fe07d] to-[#51f39f]",
        red: "from-[#ff5f6d] to-[#ff8b8b]",
        yellow: "from-[#f7c84b] to-[#ffd86c]",
        purple: "from-[#8b5cf6] to-[#b799ff]",
    };

    return (
        <div className="h-2.5 w-full rounded-full bg-[rgba(37,58,99,0.55)]">
            <div
                className={`h-2.5 rounded-full bg-gradient-to-r ${toneMap[tone]}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}