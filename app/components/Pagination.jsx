import React from 'react';
import { Button } from '@/app/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/app/lib/utils';

const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        const half = Math.floor(maxPagesToShow / 2);

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (currentPage > half + 2) {
                pageNumbers.push('...');
            }

            let start = Math.max(2, currentPage - half);
            let end = Math.min(totalPages - 1, currentPage + half);
            
            if (currentPage <= half + 1) {
                end = maxPagesToShow - 1;
            }
            if (currentPage >= totalPages - half) {
                start = totalPages - maxPagesToShow + 2;
            }

            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }

            if (currentPage < totalPages - half - 1) {
                pageNumbers.push('...');
            }
            pageNumbers.push(totalPages);
        }

        return pageNumbers.map((num, index) =>
            typeof num === 'number' ? (
                <Button
                    key={index}
                    variant={currentPage === num ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => onPageChange(num)}
                >
                    {num}
                </Button>
            ) : (
                <span key={index} className="flex h-10 w-10 items-center justify-center">
                    <MoreHorizontal className="h-4 w-4" />
                </span>
            )
        );
    };

    if (totalPages <= 1) return null;

    return (
        <nav className={cn("flex items-center justify-center gap-2 mt-16", className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            {renderPageNumbers()}
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </nav>
    );
};

export default Pagination;