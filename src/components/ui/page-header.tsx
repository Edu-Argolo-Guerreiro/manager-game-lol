type PageHeaderProps = {
    title: string;
    subtitle?: string;
    rightSlot?: React.ReactNode;
};

export function PageHeader({
    title,
    subtitle,
    rightSlot,
}: PageHeaderProps) {
    return (
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 className="page-title">{title}</h1>
                {subtitle ? <p className="page-subtitle mt-3">{subtitle}</p> : null}
            </div>

            {rightSlot ? <div>{rightSlot}</div> : null}
        </div>
    );
}