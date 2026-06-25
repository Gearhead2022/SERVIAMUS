import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    totalEntries: number;

    calculateStartIndex: () => number;
    calculateEndIndex: () => number;

    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
};

const Pagination = ({
    currentPage,
    totalPages,
    totalEntries,
    calculateStartIndex,
    calculateEndIndex,
    setCurrentPage,
}: PaginationProps) => {

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];

        let startPage = Math.max(
            currentPage - 2,
            1
        );

        const endPage = Math.min(
            startPage + 4,
            totalPages
        );

        if (endPage - startPage < 4) {
            startPage = Math.max(
                endPage - 4,
                1
            );
        }

        for (
            let i = startPage;
            i <= endPage;
            i++
        ) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold transition-all
                    ${currentPage === i
                            ? "bg-blue-600 text-white"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                >
                    {i}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-5 py-2 px-4">

            {/* ENTRIES INFO */}
            <div className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                    {calculateStartIndex()}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                    {calculateEndIndex()}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                    {totalEntries}
                </span>{" "}
                entries
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex items-center gap-2">

                {/* PREVIOUS */}
                <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronLeft size={16} />
                </button>

                {/* PAGE NUMBERS */}
                {renderPageNumbers()}

                {/* NEXT */}
                <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;