type StatusBadgeProps = {
    children: React.ReactNode;
    tone?: "blue" | "green" | "red" | "yellow" | "purple" | "neutral";
};

export function StatusBadge({
    children,
    tone = "neutral",
}: StatusBadgeProps) {
    const toneMap = {
        blue: "border-[rgba(90,140,255,0.3)] bg-[rgba(90,140,255,0.12)] text-[#7fb0ff]",
        green: "border-[rgba(31,224,125,0.3)] bg-[rgba(31,224,125,0.12)] text-[#1fe07d]",
        red: "border-[rgba(255,95,109,0.3)] bg-[rgba(255,95,109,0.12)] text-[#ff5f6d]",
        yellow: "border-[rgba(247,200,75,0.3)] bg-[rgba(247,200,75,0.12)] text-[#f7c84b]",
        purple: "border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.12)] text-[#b799ff]",
        neutral: "border-[rgba(61,91,147,0.3)] bg-[rgba(16,27,48,0.82)] text-[#9db2d8]",
    };

    return (
        <span
            className={`inline-flex rounded-xl border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${toneMap[tone]}`}
        >
            {children}
        </span>
    );
}