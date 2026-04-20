import { promoteToStarter } from "@/server/actions/roster-actions";

type PromoteFormProps = {
    playerId: string;
};

export function PromoteForm({ playerId }: PromoteFormProps) {
    return (
        <form action={promoteToStarter}>
            <input type="hidden" name="playerId" value={playerId} />
            <button
                type="submit"
                className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-emerald-400"
            >
                Virar titular
            </button>
        </form>
    );
}