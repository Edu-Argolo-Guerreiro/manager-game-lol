import { sellPlayer } from "@/server/actions/roster-actions";

type SellPlayerFormProps = {
    playerId: string;
};

export function SellPlayerForm({ playerId }: SellPlayerFormProps) {
    return (
        <form action={sellPlayer}>
            <input type="hidden" name="playerId" value={playerId} />
            <button
                type="submit"
                className="rounded-lg bg-rose-500 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-400"
            >
                Vender
            </button>
        </form>
    );
}