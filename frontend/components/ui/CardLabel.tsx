export default function CardLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#8a99b8" }}>
            {children}
        </p>
    );
}