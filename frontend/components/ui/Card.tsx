export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`bg-white rounded-2xl overflow-hidden ${className}`}
            style={{ boxShadow: "0 2px 8px rgba(15,34,68,0.08), 0 8px 24px rgba(15,34,68,0.05)" }}
        >
            {children}
        </div>
    );
}