import React from "react";
import Card from "@/components/ui/Card";

export interface SummaryItem {
    label: string;
    value: number | string;
    color: string;
    bg: string;
    icon: React.ElementType;
}

interface SummaryCardsProps {
    items: SummaryItem[];
}

export default function SummaryCards({
    items,
}: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item) => {
                const Icon = item.icon;

                return (
                    <Card key={item.label}>
                        <div
                            className="h-[3px]"
                            style={{
                                background: item.color,
                            }}
                        />

                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                                    style={{
                                        background: item.bg,
                                    }}
                                >
                                    <Icon
                                        size={17}
                                        style={{
                                            color: item.color,
                                        }}
                                    />
                                </div>

                                <p
                                    className="text-2xl font-bold"
                                    style={{
                                        color: "#0f2244",
                                        fontFamily: "'DM Serif Display', serif",
                                    }}
                                >
                                    {item.value}
                                </p>
                            </div>

                            <p
                                className="text-[12px] font-semibold"
                                style={{
                                    color: "#6b7da0",
                                }}
                            >
                                {item.label}
                            </p>
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}