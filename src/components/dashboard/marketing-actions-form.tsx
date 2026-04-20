import { runMarketingCampaign } from "@/server/actions/marketing-actions";

export function MarketingActionsForm() {
    return (
        <div className="grid gap-3 md:grid-cols-3">
            <form action={runMarketingCampaign}>
                <input type="hidden" name="type" value="social" />
                <button
                    type="submit"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left transition hover:border-cyan-700 hover:bg-zinc-900"
                >
                    <p className="font-semibold text-white">Campanha social</p>
                    <p className="mt-1 text-xs text-zinc-400">Custa R$ 25.000 • +1.800 fãs</p>
                </button>
            </form>

            <form action={runMarketingCampaign}>
                <input type="hidden" name="type" value="merch" />
                <button
                    type="submit"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left transition hover:border-cyan-700 hover:bg-zinc-900"
                >
                    <p className="font-semibold text-white">Drop de merchandising</p>
                    <p className="mt-1 text-xs text-zinc-400">Receita líquida simplificada • +900 fãs</p>
                </button>
            </form>

            <form action={runMarketingCampaign}>
                <input type="hidden" name="type" value="meet" />
                <button
                    type="submit"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left transition hover:border-cyan-700 hover:bg-zinc-900"
                >
                    <p className="font-semibold text-white">Meet & greet</p>
                    <p className="mt-1 text-xs text-zinc-400">Custa R$ 30.000 • +2.500 fãs • +1 rep</p>
                </button>
            </form>
        </div>
    );
}