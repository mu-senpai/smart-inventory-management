'use client';

import { Pagination } from 'antd';
import { useMemo } from 'react';

interface TablePaginationProps {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, size: number) => void;
    showSizeChanger?: boolean;
    className?: string;
}

export default function TablePagination({
    current,
    pageSize,
    total,
    onChange,
    showSizeChanger = false,
    className = ''
}: TablePaginationProps) {

    const startRecord = useMemo(() => {
        return total === 0 ? 0 : (current - 1) * pageSize + 1;
    }, [current, pageSize, total]);

    const endRecord = useMemo(() => {
        return Math.min(current * pageSize, total);
    }, [current, pageSize, total]);

    return (
        <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}>
            {/* Results Info */}
            <div className="text-sm text-gray-600 order-2 sm:order-1">
                Showing {startRecord}-{endRecord} of {total}
            </div>

            {/* Pagination */}
            <div className="order-1 sm:order-2">
                <Pagination
                    current={current}
                    pageSize={pageSize}
                    total={total}
                    onChange={onChange}
                    showSizeChanger={showSizeChanger}
                    // pageSizeOptions={pageSizeOptions}
                    showQuickJumper={false}
                    size="default"
                    className="flex justify-center"
                    itemRender={(page, type, originalElement) => {
                        if (type === 'prev') {
                            return (
                                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                                    Previous
                                </button>
                            );
                        }
                        if (type === 'next') {
                            return (
                                <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                                    Next
                                </button>
                            );
                        }
                        if (type === 'page') {
                            return (
                                <button
                                    className={`w-8 h-8 border cursor-pointer border-gray-300 rounded-md text-sm hover:bg-gray-50 ${page === current ? '!bg-[#272877] !text-white !border-[#272877]' : ''
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        }
                        return originalElement;
                    }}
                />
            </div>
        </div>
    );
}