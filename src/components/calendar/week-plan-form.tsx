import { ScheduleAction, TeamWeekPlan } from "@prisma/client";
import { resetWeekPlan, saveWeekPlan } from "@/server/actions/schedule-actions";

type WeekPlanFormProps = {
    plan: TeamWeekPlan;
};

const weekdayOptions: Array<{ value: ScheduleAction; label: string }> = [
    { value: "REST", label: "Descanso" },
    { value: "LIGHT", label: "Treino leve" },
    { value: "TACTICAL", label: "Tático" },
    { value: "INTENSE", label: "Intenso" },
    { value: "INDIVIDUAL", label: "Individual" },
    { value: "REVIEW", label: "Review/VOD" },
];

function DaySelect({
    name,
    label,
    defaultValue,
}: {
    name: string;
    label: string;
    defaultValue: ScheduleAction;
}) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
            <select
                name={name}
                defaultValue={defaultValue}
                className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-3 text-sm text-white outline-none focus:border-cyan-500"
            >
                {weekdayOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function WeekPlanForm({ plan }: WeekPlanFormProps) {
    return (
        <div className="space-y-4">
            <form action={saveWeekPlan} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <DaySelect name="monday" label="Segunda" defaultValue={plan.monday} />
                    <DaySelect name="tuesday" label="Terça" defaultValue={plan.tuesday} />
                    <DaySelect name="wednesday" label="Quarta" defaultValue={plan.wednesday} />
                    <DaySelect name="thursday" label="Quinta" defaultValue={plan.thursday} />
                    <DaySelect name="friday" label="Sexta" defaultValue={plan.friday} />
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                    >
                        Salvar agenda da semana
                    </button>
                </div>
            </form>

            <form action={resetWeekPlan}>
                <button
                    type="submit"
                    className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                    Restaurar agenda padrão
                </button>
            </form>
        </div>
    );
}