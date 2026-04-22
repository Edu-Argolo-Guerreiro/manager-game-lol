type PanelCardProps = {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
};

export function PanelCard({
    title,
    subtitle,
    children,
    className = "",
}: PanelCardProps) {
    return (
        <section className={`panel-card rounded-[24px] p-5 ${className}`}>
            {title ? (
                <div className="mb-5">
                    <p className="ui-label">{title}</p>
                    {subtitle ? (
                        <p className="mt-2 text-sm text-[#8ea8d8]">{subtitle}</p>
                    ) : null}
                </div>
            ) : null}

            {children}
        </section>
    );
}