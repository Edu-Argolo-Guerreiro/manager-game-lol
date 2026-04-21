type StatDeltaProps = {
    value: number;
};

export function StatDelta({ value }: StatDeltaProps) {
    if (value === 0) {
        return <span className="text-xs text-zinc-500">•</span>;
    }

    if (value > 0) {
        return <span className="text-xs font-semibold text-emerald-300">▲ {value}</span>;
    }

    return <span className="text-xs font-semibold text-rose-300">▼ {Math.abs(value)}</span>;
}