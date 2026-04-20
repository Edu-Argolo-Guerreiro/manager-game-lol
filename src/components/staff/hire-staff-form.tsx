import { hireStaff } from "@/server/actions/staff-actions";

type HireStaffFormProps = {
    staffId: string;
};

export function HireStaffForm({ staffId }: HireStaffFormProps) {
    return (
        <form action={hireStaff}>
            <input type="hidden" name="staffId" value={staffId} />
            <button
                type="submit"
                className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-zinc-950 hover:bg-cyan-400"
            >
                Contratar
            </button>
        </form>
    );
}