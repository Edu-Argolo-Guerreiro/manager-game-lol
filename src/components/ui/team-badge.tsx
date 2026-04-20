type TeamBadgeProps = {
    shortName: string;
    size?: "sm" | "md" | "lg";
};

export function TeamBadge({ shortName, size = "md" }: TeamBadgeProps) {
    const sizeClass =
        size === "sm"
            ? "h-9 w-9 text-xs"
            : size === "lg"
                ? "h-14 w-14 text-lg"
                : "h-11 w-11 text-sm";

    return (
        <div
            className={`flex ${sizeClass} items-center justify-center rounded-2xl border border-cyan-900 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 font-bold tracking-wide text-cyan-300 shadow-inner`}
        >
            {shortName}
        </div>
    );
}