type TopbarProps = {
    currentWeek?: number;
    totalWeeks?: number;
    phaseLabel?: string;
    budget?: number;
};

export function Topbar({
    currentWeek = 1,
    totalWeeks = 18,
    phaseLabel = "Fase regular",
    budget = 0,
}: TopbarProps) {
    return (
        <header className="app-topbar sticky top-0 z-40 flex h-[84px] items-center justify-between border-b px-8">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#5a8cff]" />
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#9db2d8]">
                        Semana <span className="text-xl font-black text-[#f7c84b]">{currentWeek}</span>
                        <span className="ml-1 text-xs text-[#64789f]">de {totalWeeks}</span>
                    </p>
                </div>

                <div className="rounded-xl border border-[rgba(139,92,246,0.35)] bg-[rgba(139,92,246,0.12)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b799ff]">
                    {phaseLabel}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-[rgba(31,224,125,0.24)] bg-[rgba(31,224,125,0.08)] px-5 py-3">
                    <p className="text-sm font-black text-[#1fe07d]">
                        $ R$ {budget.toLocaleString("pt-BR")}
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-[rgba(61,91,147,0.28)] bg-[rgba(16,27,48,0.78)] px-4 py-3">
                    <span className="text-[#f7c84b]">★</span>
                    <span className="text-sm font-semibold text-[#f7c84b]">82/100</span>
                </div>

                <button className="rounded-2xl border border-[rgba(90,140,255,0.45)] bg-gradient-to-r from-[#5a8cff] to-[#7aa7ff] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(90,140,255,0.28)] transition hover:brightness-110">
                    Avançar semana
                </button>
            </div>
        </header>
    );
}