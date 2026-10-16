import { createContext, use, useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { getCoreRowModel, useReactTable, type ColumnDef, type Table } from '@tanstack/react-table';
import { useAppForm, Form } from '@/components/form';
import { Network, Trash2 } from 'lucide-react';
import {
    type AdminAllocation,
    bulkDeleteAdminNodeAllocationsInput,
    type CreateAllocationValues,
    createAdminNodeAllocationsInput,
    deleteAdminNodeAllocationInput,
    deleteAdminNodeIpBlockAllocationsInput,
    updateAdminNodeAllocationAliasInput,
    useAdminNodeAllocations,
    useBulkDeleteAdminNodeAllocations,
    useCreateAdminNodeAllocations,
    useDeleteAdminNodeAllocation,
    useDeleteAdminNodeIpBlockAllocations,
    useUpdateAdminNodeAllocationAlias,
} from '@/api/admin/nodes/queries';
import { useNodeDetail } from '@/components/admin/nodes/useNodeDetail';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Icon from '@/components/elements/Icon';
import { TextInput } from '@/components/form/controls';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import DataTable from '@/components/elements/table/DataTable';
import DataTablePagination from '@/components/elements/table/DataTablePagination';
import { actionsColumn, DeleteAction, RowActions } from '@/components/elements/table/RowActions';
import { Dialog } from '@/components/elements/dialog';
import { Alert } from '@/components/elements/alert';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { emptyCompactClass } from '@/components/ui/styles';
import { cardTitleClass } from '@/components/ui/typography';
import { httpErrorToHuman } from '@/api/http';
import { cn } from '@/lib/cn';
import { getPageSearch, usePageSearch } from '@/router/search';

const countLabel = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    let noun = 'аллокаций';

    if (mod10 === 1 && mod100 !== 11) {
        noun = 'аллокация';
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
        noun = 'аллокации';
    }

    return `${count} ${noun}`;
};

const ghostDangerClass = 'rounded-sm text-muted-foreground transition-colors hover:bg-popover hover:text-destructive';

const unassignedAllocationIds = (items: AdminAllocation[]) => {
    const ids: number[] = [];

    for (const allocation of items) {
        if (!allocation.attributes.assigned) {
            ids.push(allocation.attributes.id);
        }
    }

    return ids;
};

const groupAllocationsByIp = (items: AdminAllocation[]) => {
    const map = new Map<string, AdminAllocation[]>();

    for (const allocation of items) {
        const list = map.get(allocation.attributes.ip) ?? [];

        list.push(allocation);
        map.set(allocation.attributes.ip, list);
    }

    return [...map.entries()];
};

const paginationColumns = [{ id: 'allocation', header: 'Аллокация', cell: () => null }] as ColumnDef<AdminAllocation>[];

interface AllocationTableContextValue {
    nodeId: number;
    selected: ReadonlySet<number>;
    toggle: (id: number) => void;
    toggleGroup: (items: AdminAllocation[]) => void;
    deleteAllocation: (allocation: AdminAllocation) => void;
}

const AllocationTableContext = createContext<AllocationTableContextValue | null>(null);

const useAllocationTable = (): AllocationTableContextValue => {
    const context = use(AllocationTableContext);

    if (!context) {
        throw new Error('An allocation table cell was rendered outside of its allocation tab.');
    }

    return context;
};

const AllocationGroupCheckbox = ({ allocations }: { allocations: AdminAllocation[] }) => {
    const { selected, toggleGroup } = useAllocationTable();
    const unassignedIds = unassignedAllocationIds(allocations);
    const allSelected = unassignedIds.length > 0 && unassignedIds.every((id) => selected.has(id));
    const ip = allocations[0]?.attributes.ip;

    return (
        <Checkbox
            aria-label={ip ? `Выбрать все незанятые аллокации на ${ip}` : 'Выбрать все незанятые аллокации'}
            checked={allSelected}
            indeterminate={!allSelected && unassignedIds.some((id) => selected.has(id))}
            disabled={unassignedIds.length === 0}
            onChange={() => toggleGroup(allocations)}
        />
    );
};

const AllocationCheckbox = ({ allocation }: { allocation: AdminAllocation }) => {
    const { selected, toggle } = useAllocationTable();

    return (
        <Checkbox
            aria-label={`Выбрать аллокацию ${allocation.attributes.ip}:${allocation.attributes.port}`}
            checked={selected.has(allocation.attributes.id)}
            disabled={allocation.attributes.assigned}
            onChange={() => toggle(allocation.attributes.id)}
        />
    );
};

const AllocationAliasCell = ({ allocation }: { allocation: AdminAllocation }) => {
    const { nodeId } = useAllocationTable();
    const savedAlias = allocation.attributes.alias ?? '';
    const [draft, setDraft] = useState<string | null>(null);
    const updateAlias = useUpdateAdminNodeAllocationAlias();

    const saveAlias = () => {
        if (draft === null) {
            return;
        }

        if (draft === savedAlias) {
            setDraft(null);

            return;
        }

        const alias = draft;

        updateAlias.mutate(updateAdminNodeAllocationAliasInput(nodeId, allocation.attributes.id, alias), {
            onSuccess: () => setDraft((current) => (current === alias ? null : current)),
        });
    };

    return (
        <TextInput
            type='text'
            value={draft ?? savedAlias}
            placeholder='Добавить алиас'
            aria-label={`Алиас для ${allocation.attributes.ip}:${allocation.attributes.port}`}
            onChange={(e) => setDraft(e.currentTarget.value)}
            onBlur={saveAlias}
            className='h-8 border border-transparent bg-transparent px-2 py-1 placeholder:text-muted-foreground focus:bg-input'
        />
    );
};

const AllocationServerCell = ({ allocation }: { allocation: AdminAllocation }) => {
    const { assigned, server_id: serverId, server_name: serverName } = allocation.attributes;

    if (!assigned) {
        return (
            <span className='inline-flex items-center rounded-sm border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
                Не назначена
            </span>
        );
    }

    if (serverId === null) {
        return <span className='text-sm text-muted-foreground'>Назначена</span>;
    }

    return (
        <Link
            to='/panel/servers/$id'
            params={{ id: serverId }}
            className='block truncate text-sm text-foreground transition-colors hover:text-accent'
        >
            {serverName ?? 'Назначена'}
        </Link>
    );
};

const AllocationDeleteCell = ({ allocation }: { allocation: AdminAllocation }) => {
    const { deleteAllocation } = useAllocationTable();

    if (allocation.attributes.assigned) {
        return null;
    }

    const address = `${allocation.attributes.ip}:${allocation.attributes.port}`;

    return (
        <RowActions>
            <Dialog.ConfirmTrigger
                title='Удалить эту аллокацию?'
                confirm='Удалить'
                trigger={({ onClick }) => (
                    <DeleteAction aria-label={`Удалить аллокацию ${address}`} onClick={onClick} />
                )}
                onConfirmed={(_event, close) => {
                    close();
                    deleteAllocation(allocation);
                }}
            >
                Аллокация <strong>{address}</strong> будет безвозвратно удалена. Это действие нельзя отменить.
            </Dialog.ConfirmTrigger>
        </RowActions>
    );
};

const allocationColumns = [
    {
        id: 'selected',
        header: ({ table }) => <AllocationGroupCheckbox allocations={table.options.data} />,
        cell: ({ row }) => <AllocationCheckbox allocation={row.original} />,
        meta: { headerClassName: 'w-10', cellClassName: 'w-10' },
    },
    {
        id: 'port',
        header: 'Порт',
        cell: ({ row }) => (
            <span className='font-mono text-sm tabular-nums text-foreground'>{row.original.attributes.port}</span>
        ),
        meta: { headerClassName: 'w-24', cellClassName: 'w-24' },
    },
    {
        id: 'alias',
        header: 'Алиас',
        cell: ({ row }) => <AllocationAliasCell allocation={row.original} />,
        meta: { cellClassName: 'py-2 pl-1' },
    },
    {
        id: 'server',
        header: 'Сервер',
        cell: ({ row }) => <AllocationServerCell allocation={row.original} />,
        meta: { headerClassName: 'hidden w-44 sm:table-cell', cellClassName: 'hidden sm:table-cell' },
    },
    actionsColumn<AdminAllocation>(1, (allocation) => <AllocationDeleteCell allocation={allocation} />),
] satisfies ColumnDef<AdminAllocation>[];

interface AllocationGroupTableProps {
    ip: string;
    allocations: AdminAllocation[];
    isFetching: boolean;
    onDeleteBlock: (ip: string) => void;
}

const AllocationGroupTable = ({ ip, allocations, isFetching, onDeleteBlock }: AllocationGroupTableProps) => {
    const table = useReactTable({
        data: allocations,
        columns: allocationColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (allocation) => String(allocation.attributes.id),
    });
    const unassignedCount = unassignedAllocationIds(allocations).length;

    return (
        <section className='pt-4'>
            <div className='flex items-center justify-between gap-4 px-3 pb-2'>
                <div className='flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5'>
                    <h3 className='truncate font-mono text-sm font-medium text-foreground'>{ip}</h3>
                    <p className='text-xs text-muted-foreground'>
                        {countLabel(allocations.length)} · незанято: {unassignedCount}
                    </p>
                </div>
                <Dialog.ConfirmTrigger
                    title='Удалить аллокации для IP-блока?'
                    confirm='Удалить'
                    trigger={({ onClick }) => (
                        <button
                            type='button'
                            aria-label={`Удалить IP-блок ${ip}`}
                            className={cn(
                                'inline-flex shrink-0 items-center gap-1.5 px-2 py-1 text-xs font-medium',
                                ghostDangerClass
                            )}
                            onClick={onClick}
                        >
                            <Icon icon={Trash2} aria-hidden />
                            Удалить IP-блок
                        </button>
                    )}
                    onConfirmed={(_event, close) => {
                        close();
                        onDeleteBlock(ip);
                    }}
                >
                    Будут безвозвратно удалены все незанятые аллокации для <strong>{ip}</strong>. Это действие нельзя
                    отменить.
                </Dialog.ConfirmTrigger>
            </div>
            <DataTable
                table={table}
                isFetching={isFetching}
                className='rounded-none border-0 bg-transparent'
                tableClassName='table-fixed'
                emptyState='Нет аллокаций для этого адреса.'
            />
        </section>
    );
};

interface ExistingAllocationsSummaryProps {
    selectedCount: number;
    total: number | undefined;
    onBulkDelete: () => void;
}

const ExistingAllocationsSummary = ({ selectedCount, total, onBulkDelete }: ExistingAllocationsSummaryProps) => {
    if (selectedCount > 0) {
        return (
            <div className='-my-1 flex items-center gap-3'>
                <span className='text-xs text-muted-foreground'>Выбрано: {selectedCount}</span>
                <Dialog.ConfirmTrigger
                    title='Удалить выбранные аллокации?'
                    confirm='Удалить'
                    trigger={({ onClick }) => (
                        <Button size='xsmall' color='red' onClick={onClick}>
                            Удалить выбранные
                        </Button>
                    )}
                    onConfirmed={(_event, close) => {
                        close();
                        onBulkDelete();
                    }}
                >
                    Будут безвозвратно удалены выбранные аллокации ({selectedCount}). Это действие нельзя отменить.
                </Dialog.ConfirmTrigger>
            </div>
        );
    }

    if (total === undefined) {
        return null;
    }

    return <span className='text-xs text-muted-foreground'>{countLabel(total)}</span>;
};

type NodeAllocationsQuery = ReturnType<typeof useAdminNodeAllocations>;

interface AllocationListProps {
    query: NodeAllocationsQuery;
    paginationTable: Table<AdminAllocation>;
    showPagination: boolean;
    onBlockDelete: (ip: string) => void;
}

const AllocationList = ({ query, paginationTable, showPagination, onBlockDelete }: AllocationListProps) => {
    const { data: allocations, error, isFetching: loading, refetch } = query;
    const grouped = useMemo(() => groupAllocationsByIp(allocations?.data ?? []), [allocations?.data]);

    if (error && !loading) {
        return (
            <div className='space-y-4 p-3'>
                <Alert type='danger'>{httpErrorToHuman(error)}</Alert>
                <Button.Text type='button' onClick={() => refetch()}>
                    Повторить
                </Button.Text>
            </div>
        );
    }

    if (!allocations) {
        return <Spinner size='large' centered />;
    }

    return (
        <>
            {grouped.length === 0 ? (
                <Empty className={emptyCompactClass}>
                    <EmptyHeader>
                        <EmptyMedia variant='icon'>
                            <Network />
                        </EmptyMedia>
                        <EmptyTitle>Аллокации пока отсутствуют</EmptyTitle>
                        <EmptyDescription>
                            Укажите IP-адреса и порты в форме, чтобы сделать их доступными для серверов.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <div className='divide-y divide-border'>
                    {grouped.map(([ip, items]) => (
                        <AllocationGroupTable
                            key={ip}
                            ip={ip}
                            allocations={items}
                            isFetching={loading}
                            onDeleteBlock={onBlockDelete}
                        />
                    ))}
                </div>
            )}
            {showPagination && (
                <DataTablePagination
                    table={paginationTable}
                    total={allocations.meta.pagination.total}
                    count={allocations.meta.pagination.count}
                    itemLabel='Аллокации'
                    className='mt-0 border-t border-border px-3 py-2'
                />
            )}
        </>
    );
};

export default function NodeAllocationTab() {
    const { node } = useNodeDetail();
    const { attributes } = node;
    const navigate = useNavigate();
    const page = usePageSearch();
    const [selected, setSelected] = useState<number[]>([]);
    const createAllocations = useCreateAdminNodeAllocations();
    const { mutate: deleteAllocation } = useDeleteAdminNodeAllocation();
    const { mutate: bulkDeleteAllocations } = useBulkDeleteAdminNodeAllocations();
    const { mutate: ipBlockDeleteAllocations } = useDeleteAdminNodeIpBlockAllocations();

    const query = useAdminNodeAllocations(attributes.id, page);
    const allocations = query.data;
    const pagination = { pageIndex: Math.max(page - 1, 0), pageSize: allocations?.meta.pagination.per_page ?? 50 };
    const paginationData = useMemo(() => allocations?.data ?? [], [allocations?.data]);
    const paginationTable = useReactTable({
        data: paginationData,
        columns: paginationColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (allocation) => String(allocation.attributes.id),
        manualPagination: true,
        rowCount: allocations?.meta.pagination.total ?? 0,
        state: { pagination },
        onPaginationChange: (updater) => {
            const next = updater instanceof Function ? updater(pagination) : updater;

            if (next.pageIndex !== pagination.pageIndex) {
                void navigate({
                    to: '/panel/nodes/$id/allocation',
                    params: { id: attributes.id },
                    search: getPageSearch(next.pageIndex + 1),
                    replace: true,
                    viewTransition: false,
                });
            }
        },
    });

    const createForm = useAppForm({
        defaultValues: { ip: '', alias: '', ports: '' },
        onSubmit: async ({ value }) => {
            const ports = value.ports
                .split(/[\s,]+/)
                .map((entry) => entry.trim())
                .filter((entry) => entry.length > 0);

            const payload: CreateAllocationValues = { ip: value.ip, alias: value.alias, ports };

            try {
                await createAllocations.mutateAsync(createAdminNodeAllocationsInput(attributes.id, payload));
                createForm.reset();
                void navigate({
                    to: '/panel/nodes/$id/allocation',
                    params: { id: attributes.id },
                    search: {},
                    replace: true,
                    viewTransition: false,
                });
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const toggle = useCallback(
        (id: number) =>
            setSelected((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id])),
        []
    );

    const toggleGroup = useCallback((items: AdminAllocation[]) => {
        const unassignedIds = unassignedAllocationIds(items);

        if (unassignedIds.length === 0) {
            return;
        }

        setSelected((current) => {
            const currentSet = new Set(current);
            const allSelected = unassignedIds.every((id) => currentSet.has(id));

            if (allSelected) {
                const unassignedSet = new Set(unassignedIds);

                return current.filter((id) => !unassignedSet.has(id));
            }

            return [...current, ...unassignedIds.filter((id) => !currentSet.has(id))];
        });
    }, []);

    const onDeleteSingle = useCallback(
        (allocation: AdminAllocation) => {
            deleteAllocation(deleteAdminNodeAllocationInput(attributes.id, allocation.attributes.id), {
                onSuccess: () => {
                    setSelected((current) => current.filter((v) => v !== allocation.attributes.id));
                },
            });
        },
        [attributes.id, deleteAllocation]
    );

    const onBulkDelete = () => {
        bulkDeleteAllocations(bulkDeleteAdminNodeAllocationsInput(attributes.id, selected), {
            onSuccess: () => {
                setSelected([]);
            },
        });
    };

    const onBlockDelete = useCallback(
        (ip: string) => {
            ipBlockDeleteAllocations(deleteAdminNodeIpBlockAllocationsInput(attributes.id, ip), {
                onSuccess: () => {
                    setSelected([]);
                },
            });
        },
        [attributes.id, ipBlockDeleteAllocations]
    );

    const tableContext = useMemo<AllocationTableContextValue>(
        () => ({
            nodeId: attributes.id,
            selected: new Set(selected),
            toggle,
            toggleGroup,
            deleteAllocation: onDeleteSingle,
        }),
        [attributes.id, onDeleteSingle, selected, toggle, toggleGroup]
    );

    const showPagination = allocations !== undefined && (allocations.meta.pagination.total_pages > 1 || page > 1);

    return (
        <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-3'>
            <TitledGreyBox
                className='lg:col-span-2'
                contentClassName='p-0'
                title={
                    <div className='flex min-h-5 items-center justify-between gap-3'>
                        <h2 className={cardTitleClass}>Существующие аллокации</h2>
                        <ExistingAllocationsSummary
                            selectedCount={selected.length}
                            total={allocations?.meta.pagination.total}
                            onBulkDelete={onBulkDelete}
                        />
                    </div>
                }
            >
                <AllocationTableContext.Provider value={tableContext}>
                    <AllocationList
                        query={query}
                        paginationTable={paginationTable}
                        showPagination={showPagination}
                        onBlockDelete={onBlockDelete}
                    />
                </AllocationTableContext.Provider>
            </TitledGreyBox>
            <Form form={createForm}>
                <TitledGreyBox title='Назначить новые аллокации' contentClassName='space-y-6 px-3 pt-4'>
                    <createForm.AppField
                        name='ip'
                        validators={{
                            onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите IP-адрес.'),
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='allocation_ip'
                                label='IP-адрес'
                                description='Введите IP-адрес, к которому будут назначены порты.'
                            />
                        )}
                    </createForm.AppField>
                    <createForm.AppField name='alias'>
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='allocation_alias'
                                label='Алиас IP'
                                description='Необязательный алиас по умолчанию для этих аллокаций.'
                            />
                        )}
                    </createForm.AppField>
                    <createForm.AppField
                        name='ports'
                        validators={{
                            onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите хотя бы один порт.'),
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='allocation_ports'
                                label='Порты'
                                description={
                                    'Введите отдельные порты или диапазоны портов (например, 25565-25570), ' +
                                    'разделённые запятыми или пробелами.'
                                }
                            />
                        )}
                    </createForm.AppField>
                    <div className='flex justify-end'>
                        <createForm.AppForm>
                            <createForm.SubmitButton>Создать аллокации</createForm.SubmitButton>
                        </createForm.AppForm>
                    </div>
                </TitledGreyBox>
            </Form>
        </div>
    );
}
