import Link from "next/link";

export default function HomePage() {
    return (
        <div className="grid min-h-[78vh] items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
                <div className="inline-flex rounded-full border border-cyan-900 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                    Solo Manager Experience
                </div>

                <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.05] text-white md:text-6xl">
                    Construa sua org de LoL, monte o elenco e suba até o topo.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                    Um manager offline inspirado em Brasfoot e Football Manager, mas focado
                    em League of Legends: elenco, staff, mercado, calendário, classificação
                    e progressão de temporadas.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        href="/dashboard"
                        className="rounded-2xl bg-cyan-500 px-6 py-4 font-bold text-zinc-950 transition hover:bg-cyan-400"
                    >
                        Continuar carreira
                    </Link>

                    <Link
                        href="/market"
                        className="rounded-2xl border border-zinc-700 bg-zinc-900/80 px-6 py-4 font-semibold text-white transition hover:border-zinc-600 hover:bg-zinc-800"
                    >
                        Ver mercado
                    </Link>
                </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
                        Modo atual
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-white">Road to Tier 1</h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                        Comece no Tier 2 brasileiro, faça contratações, ajuste lineup,
                        sobreviva ao orçamento e leve sua organização até a elite.
                    </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-sm text-zinc-500">Foco</p>
                        <p className="mt-2 text-xl font-bold text-white">Gestão de elenco</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-sm text-zinc-500">Cenário</p>
                        <p className="mt-2 text-xl font-bold text-white">Brasil Tier 2</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-sm text-zinc-500">Loop</p>
                        <p className="mt-2 text-xl font-bold text-white">Semana a semana</p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-sm text-zinc-500">Objetivo</p>
                        <p className="mt-2 text-xl font-bold text-white">Subir de divisão</p>
                    </div>
                </div>
            </div>
        </div>
    );
}