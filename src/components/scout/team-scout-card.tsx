import Link from "next/link";
import { TeamBadge } from "@/components/ui/team-badge";

type TeamScoutCardProps = {
    id: string;
    name: string;
    shortName: string;
    division: string;
    reputation: number;
    fanbase: number;
    wins: number;
    losses: number;
};

export function TeamScoutCard({
    id,
    name,
    shortName,
    division,
    reputation,
    fanbase,
    wins,
    losses,
}: TeamScoutCardProps) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-center gap-3">
                <TeamBadge shortName={shortName} size="md" />
                <div>
                    <p className="font-semibold text-white">{name}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                        {division}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-zinc-900 p-3">
                    <p className="text-zinc-500">Campanha</p>
                    <p className="font-semibold text-white">
                        {wins}V / {losses}D
                    </p>
                </div>

                <div className="rounded-xl bg-zinc-900 p-3">
                    <p className="text-zinc-500">Reputação</p>
                    <p className="font-semibold text-white">{reputation}</p>
                </div>

                <div className="col-span-2 rounded-xl bg-zinc-900 p-3">
                    <p className="text-zinc-500">Fanbase</p>
                    <p className="font-semibold text-white">
                        {fanbase.toLocaleString("pt-BR")}
                    </p>
                </div>
            </div>

            <div className="mt-4">
                <Link
                    href={`/scout?teamId=${id}${division ? `&division=${division}` : ""}`}
                    className="inline-flex rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-cyan-400"
                >
                    Ver elenco
                </Link>
            </div>
        </div>
    );
}