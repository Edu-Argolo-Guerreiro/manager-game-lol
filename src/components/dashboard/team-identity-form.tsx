import { updatePlayerTeamIdentity } from "@/server/actions/team-actions";

type TeamIdentityFormProps = {
    currentName: string;
    currentShortName: string;
};

export function TeamIdentityForm({
    currentName,
    currentShortName,
}: TeamIdentityFormProps) {
    return (
        <form action={updatePlayerTeamIdentity} className="grid gap-3 md:grid-cols-[1fr_120px_auto]">
            <input
                type="text"
                name="name"
                defaultValue={currentName}
                placeholder="Nome da organização"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500"
            />

            <input
                type="text"
                name="shortName"
                defaultValue={currentShortName}
                maxLength={6}
                placeholder="SIGLA"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm uppercase text-white outline-none transition focus:border-cyan-500"
            />

            <button
                type="submit"
                className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
            >
                Salvar identidade
            </button>
        </form>
    );
}