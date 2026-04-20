import { advanceWeek } from "@/server/actions/season-actions";

export function AdvanceWeekForm() {
    return (
        <form action={advanceWeek} >
            <button
                type="submit"
                className="rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-400"
            >
                Avançar semana
            </button>
        </form>
    );
}