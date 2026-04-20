import { startNextSeason } from "@/server/actions/season-actions";

export function NextSeasonForm() {
    return (
        <form action={startNextSeason}>
            <button
                type="submit"
                className="rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
                Iniciar próxima temporada
            </button>
        </form>
    );
}