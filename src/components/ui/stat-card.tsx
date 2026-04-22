type StatCardProps = {
    label: string;
    value: string | number;
    helper?: string;
    tone?: "default" | "positive" | "warning" | "negative" | "accent";
};

function toneClasses(tone: StatCardProps["tone"] = "default") {
    if (tone === "positive") {
        return {
            border: "border-[rgba(31,224,125,0.22)]",
            bg: "bg-[linear-gradient(180deg,rgba(13,43,33,0.55),rgba(11,29,24,0.55))]",
            value: "text-[#1fe07d]",
        };
    }

    if (tone === "warning") {
        return {
            border: "border-[rgba(247,200,75,0.22)]",
            bg: "bg-[linear-gradient(180deg,rgba(44,34,14,0.55),rgba(28,22,10,0.55))]",
            value: "text-[#f7c84b]",
        };
    }

    if (tone === "negative") {
        return {
            border: "border-[rgba(255,95,109,0.22)]",
            bg: "bg-[linear-gradient(180deg,rgba(45,18,28,0.55),rgba(28,11,16,0.55))]",
            value: "text-[#ff5f6d]",
        };
    }

    if (tone === "accent") {
        return {
            border: "border-[rgba(90,140,255,0.24)]",
            bg: "bg-[linear-gradient(180deg,rgba(17,36,74,0.55),rgba(13,24,50,0.55))]",
            value: "text-[#7fb0ff]",
        };
    }

    return {
        border: "border-[rgba(61,91,147,0.28)]",
        bg: "bg-[linear-gradient(180deg,rgba(18,29,55,0.82),rgba(16,27,48,0.82))]",
        value: "text-white",
    };
}

export function StatCard({
    label,
    value,
    helper,
    tone = "default",
}: StatCardProps) {
    const styles = toneClasses(tone);

    return (
        <div
            className={`rounded-[24px] border p-5 shadow-[0_10px_22px_rgba(0,0,0,0.18)] ${styles.border} ${styles.bg}`}
        >
            <p className="ui-label">{label}</p>
            <p className={`mt-4 text-4xl font-black ${styles.value}`}>{value}</p>
            {helper ? <p className="mt-3 text-sm text-[#8ea8d8]">{helper}</p> : null}
        </div>
    );
}