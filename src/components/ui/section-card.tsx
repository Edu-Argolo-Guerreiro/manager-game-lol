type SectionCardProps = {
    title: string;
    children: React.ReactNode;
};

export function SectionCard({ title, children }: SectionCardProps) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>
            {children}
        </section>
    );
}