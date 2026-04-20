import { IndividualFocus } from "@prisma/client";
import { setPlayerIndividualFocus } from "@/server/actions/player-training-actions";

type PlayerFocusFormProps = {
    playerId: string;
    currentFocus: IndividualFocus;
};

const options: { value: IndividualFocus; label: string }[] = [
    { value: "NONE", label: "Neutro" },
    { value: "FARM", label: "Farm" },
    { value: "TEAMFIGHT", label: "Teamfight" },
    { value: "CHAMP_POOL", label: "Champion Pool" },
    { value: "SHOTCALLING", label: "Shotcalling" },
    { value: "LANING", label: "Lane" },
    { value: "DISCIPLINE", label: "Disciplina" },
];

export function PlayerFocusForm({
    playerId,
    currentFocus,
}: PlayerFocusFormProps) {
    return (
        <form action={setPlayerIndividualFocus} className="flex gap-2">
            <input type="hidden" name="playerId" value={playerId} />
            <select
                name="focus"
                defaultValue={currentFocus}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-cyan-500"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <button
                type="submit"
                className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-400"
            >
                Definir
            </button>
        </form>
    );
}