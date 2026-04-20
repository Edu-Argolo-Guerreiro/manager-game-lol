import Link from "next/link";

export default function HomePage() {
    return (
        <div className="flex min-h-[70vh] items-center">
            <div className="max-w-3xl">
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
                    League of Legends Manager
                </p>

                <h1 className="text-5xl font-black leading-tight text-white">
                    Monte sua organização, suba de divisão e construa uma dinastia.
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
                    Gerencie elenco, staff, finanças e calendário competitivo em um manager
                    offline inspirado em Brasfoot e Football Manager, só que voltado para o
                    competitivo de LoL.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        href="/dashboard"
                        className="rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-400"
                    >
                        Entrar no jogo
                    </Link>

                    <Link
                        href="/roster"
                        className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Ver elenco
                    </Link>
                </div>
            </div>
        </div>
    );
}