import { moveToBench } from "@/server/actions/roster-actions";

type BenchFormProps = {
    playerId: string;
};

export function BenchForm({ playerId }: BenchFormProps) {
    return (
        <form action={moveToBench}>
            <input type="hidden" name="playerId" value={playerId} />
            <button
                type="submit"
                className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-amber-400"
            >
                Virar reserva
            </button>
        </form>
    );
}