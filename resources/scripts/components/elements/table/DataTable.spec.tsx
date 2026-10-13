/** @vitest-environment jsdom */

import { useState } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import { afterEach, describe, expect, it } from 'vitest';
import DataTable from './DataTable';
import DataTablePagination from './DataTablePagination';

interface TestRow {
    id: number;
    name: string;
}

const rows: TestRow[] = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Bravo' },
];

const noRows: TestRow[] = [];

const columns = [{ accessorKey: 'name', header: 'Название' }] satisfies ColumnDef<TestRow>[];

const TestTable = ({ total = 3 }: { total?: number }) => {
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 2 });
    const table = useReactTable({
        data: rows,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => String(row.id),
        manualPagination: true,
        rowCount: total,
        state: { pagination },
        onPaginationChange: setPagination,
    });

    return (
        <>
            <DataTable table={table} emptyState='Нет записей' />
            <DataTablePagination table={table} total={total} count={2} itemLabel='Серверы' />
        </>
    );
};

const mergedColumns = [
    { accessorKey: 'name', header: 'Название' },
    { id: 'size', header: 'Размер', cell: () => null, meta: { sortColumnIds: ['id'] } },
    { accessorKey: 'id', header: 'ID', enableSorting: true },
] satisfies ColumnDef<TestRow>[];

const MergedSortTable = ({ sorting }: { sorting: SortingState }) => {
    const table = useReactTable({
        data: rows,
        columns: mergedColumns,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        state: { sorting, columnVisibility: { id: false } },
    });

    return <DataTable table={table} emptyState='Нет записей' />;
};

afterEach(cleanup);

describe('DataTable', () => {
    it('отображает семантические заголовки и строки через модель строк TanStack', () => {
        render(<TestTable />);

        expect(screen.getByRole('columnheader', { name: 'Название' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Bravo' })).toBeInTheDocument();
    });

    it('управляет контролируемой ручной пагинацией через экземпляр таблицы', async () => {
        const user = userEvent.setup();

        render(<TestTable />);

        await user.click(screen.getByRole('button', { name: 'Следующая страница' }));

        expect(screen.getByLabelText('Страница 2 из 2')).toBeInTheDocument();
        expect(screen.getByLabelText('Серверы: показано 3–3 из 3')).toBeInTheDocument();
    });

    it('показывает только диапазон записей, если все строки помещаются на одной странице', () => {
        render(<TestTable total={2} />);

        expect(screen.getByLabelText('Серверы: показано 1–2 из 2')).toBeInTheDocument();
        expect(screen.queryByLabelText('Страница 1 из 1')).not.toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('заменяет таблицу пустым состоянием, если строк нет', () => {
        const EmptyTable = ({ isFetching }: { isFetching?: boolean }) => {
            const table = useReactTable({ data: noRows, columns, getCoreRowModel: getCoreRowModel() });

            return (
                <>
                    <DataTable table={table} isFetching={isFetching} emptyState={<p>Серверов пока нет</p>} />
                    <DataTablePagination table={table} total={0} count={0} itemLabel='Серверы' />
                </>
            );
        };

        const { container, rerender } = render(<EmptyTable />);

        expect(screen.getByText('Серверов пока нет')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/^Серверы: показано/)).not.toBeInTheDocument();
        expect(container.firstElementChild).toHaveAttribute('aria-busy', 'false');

        rerender(<EmptyTable isFetching />);

        expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true');
    });

    it('отображает строковое пустое состояние как описание отсутствия записей', () => {
        const StringTable = () => {
            const table = useReactTable({ data: noRows, columns, getCoreRowModel: getCoreRowModel() });

            return <DataTable table={table} emptyState='Нет записей' />;
        };

        render(<StringTable />);

        expect(screen.getByText('Нет записей')).toHaveAttribute('data-slot', 'empty-description');
    });

    it('отражает состояние сортировки скрытых столбцов в управляющем ими заголовке', () => {
        const { rerender } = render(<MergedSortTable sorting={[{ id: 'id', desc: true }]} />);

        expect(screen.getByRole('columnheader', { name: 'Размер' })).toHaveAttribute('aria-sort', 'descending');
        expect(screen.queryByRole('columnheader', { name: 'ID' })).not.toBeInTheDocument();

        rerender(<MergedSortTable sorting={[]} />);

        expect(screen.getByRole('columnheader', { name: 'Размер' })).not.toHaveAttribute('aria-sort');
    });
});
