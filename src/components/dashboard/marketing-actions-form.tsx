import { runMarketingCampaign } from "@/server/actions/marketing-actions";

type MarketingActionsFormProps = {
    used: number;
};

export function MarketingActionsForm({ used }: MarketingActionsFormProps) {
    const remaining = Math.max(0, 2 - used);

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-sm text-zinc-400">Ações de marketing no mês</p>
                <p className="mt-2 text-lg font-bold text-white">
                    {used}/2 usadas
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                    Restantes: {remaining}
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <form action={runMarketingCampaign}>
                    <input type="hidden" name="type" value="social" />
                    <button
                        type="submit"
                        disabled={remaining === 0}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left transition hover:border-cyan-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <p className="font-semibold text-white">Campanha social</p>
                        <p className="mt-1 text-xs text-zinc-400">Custa R$ 30.000 • +2.200 fãs • +1 rep</p>
                    </button>
                </form>

                <form action={runMarketingCampaign}>
                    <input type="hidden" name="type" value="merch" />
                    <button
                        type="submit"
                        disabled={remaining === 0}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left transition hover:border-cyan-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <p className="font-semibold text-white">Drop de merchandising</p>
                        <p className="mt-1 text-xs text-zinc-400">Lucro líquido R$ 17.000 • +800 fãs</p>
                    </button>
                </form>

                <form action={runMarketingCampaign}>
                    <input type="hidden" name="type" value="meet" />
                    <button
                        type="submit"
                        disabled={remaining === 0}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-left transition hover:border-cyan-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <p className="font-semibold text-white">Meet & greet</p>
                        <p className="mt-1 text-xs text-zinc-400">Custa R$ 45.000 • +3.000 fãs • +2 rep</p>
                    </button>
                </form>
            </div>
        </div>
    );
}