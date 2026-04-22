type SectionCardProps = {
    title: string;
    children: React.ReactNode;
    subtitle?: string;
    rightSlot?: React.ReactNode;
};

export function SectionCard({
    title,
    children,
    subtitle,
    rightSlot,
}: SectionCardProps) {
    return (
        <section className="panel-card rounded-[24px] p-5">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <p className="ui-label">{title}</p>
                    {subtitle ? <p className="mt-2 text-sm text-[#8ea8d8]">{subtitle}</p> : null}
                </div>

                {rightSlot ? <div>{rightSlot}</div> : null}
            </div>

            {children}
        </section>
    );
}