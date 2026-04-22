type TeamBadgeProps = {
    shortName: string;
    size?: "sm" | "md" | "lg";
};

export function TeamBadge({ shortName, size = "md" }: TeamBadgeProps) {
    const sizeMap = {
        sm: "h-10 w-10 text-xs rounded-xl",
        md: "h-14 w-14 text-sm rounded-2xl",
        lg: "h-18 w-18 text-lg rounded-[22px]",
    };

    return (
        <div
            className={`glow-blue inline-flex items-center justify-center border border-[rgba(90,140,255,0.45)] bg-[rgba(90,140,255,0.12)] font-black uppercase tracking-[0.12em] text-[#7fb0ff] ${sizeMap[size]}`}
        >
            {shortName}
        </div>
    );
}