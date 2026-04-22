type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "success" | "danger" | "warning";
};

export function ActionButton({
    variant = "primary",
    className = "",
    children,
    ...props
}: ActionButtonProps) {
    const variants = {
        primary:
            "border-[rgba(90,140,255,0.45)] bg-gradient-to-r from-[#5a8cff] to-[#7aa7ff] text-white shadow-[0_10px_22px_rgba(90,140,255,0.24)] hover:brightness-110",
        secondary:
            "border-[rgba(61,91,147,0.35)] bg-[rgba(16,27,48,0.82)] text-white hover:bg-[rgba(22,39,70,0.92)]",
        success:
            "border-[rgba(31,224,125,0.38)] bg-[rgba(31,224,125,0.14)] text-[#1fe07d] hover:brightness-110",
        danger:
            "border-[rgba(255,95,109,0.38)] bg-[rgba(255,95,109,0.14)] text-[#ff5f6d] hover:brightness-110",
        warning:
            "border-[rgba(247,200,75,0.38)] bg-[rgba(247,200,75,0.14)] text-[#f7c84b] hover:brightness-110",
    };

    return (
        <button
            {...props}
            className={`rounded-2xl border px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}