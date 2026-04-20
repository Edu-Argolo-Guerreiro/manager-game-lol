type StatCardProps = {
    label: string;
    value: string | number;
    helper?: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            {helper ? <p className="mt-2 text-xs text-zinc-500">{helper}</p> : null}
        </div>
    );
}