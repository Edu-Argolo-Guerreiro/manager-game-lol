import { signFreeAgent } from "@/server/actions/market-actions";

type SignPlayerFormProps = {
    playerId: string;
};

export function SignPlayerForm({ playerId }: SignPlayerFormProps) {
    return (
        <form action={signFreeAgent}>
            <input type="hidden" name="playerId" value={playerId} />
            <button
                type="submit"
                className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-400"
            >
                Contratar
            </button>
        </form>
    );
}