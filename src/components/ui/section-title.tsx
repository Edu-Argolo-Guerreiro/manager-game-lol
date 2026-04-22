type SectionTitleProps = {
    eyebrow?: string;
    title: string;
    rightSlot?: React.ReactNode;
};

export function SectionTitle({
    eyebrow,
    title,
    rightSlot,
}: SectionTitleProps) {
    return (
        <div className="mb-5 flex items-end justify-between gap-4">
            <div>
                {eyebrow ? <p className="ui-label">{eyebrow}</p> : null}
                <h2 className="mt-2 text-xl font-black uppercase tracking-[0.08em] text-white">
                    {title}
                </h2>
            </div>

            {rightSlot ? <div>{rightSlot}</div> : null}
        </div>
    );
}