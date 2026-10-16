import type { ColumnDef } from '@tanstack/react-table';
import { deleteAdminTagInput, type AdminTag, useDeleteAdminTag } from '@/api/admin/tags/queries';
import TagBadge from '@/components/admin/tags/TagBadge';
import TagFormDialog from '@/components/admin/tags/TagFormDialog';
import { Dialog } from '@/components/elements/dialog';
import DataTableColumnHeader from '@/components/elements/table/DataTableColumnHeader';
import { actionsColumn, DeleteAction, EditAction, RowActions } from '@/components/elements/table/RowActions';

const plural = (count: number, one: string, few: string, many: string): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;

    if (mod10 === 1 && mod100 !== 11) {
        return one;
    }

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return few;
    }

    return many;
};

const TagActionsCell = ({ tag }: { tag: AdminTag }) => {
    const deleteTag = useDeleteAdminTag();
    const { eggs_count: eggsCount, is_predefined: isPredefined, name, nodes_count: nodesCount } = tag.attributes;

    if (isPredefined) {
        return <span className='text-xs text-muted-foreground'>Встроенный</span>;
    }

    return (
        <RowActions>
            <Dialog.Trigger trigger={({ onClick }) => <EditAction aria-label={`Изменить ${name}`} onClick={onClick} />}>
                {({ open, onClose }) => <TagFormDialog tag={tag} open={open} onClose={onClose} />}
            </Dialog.Trigger>
            <Dialog.ConfirmTrigger
                title='Удаление тега'
                confirm='Удалить тег'
                onConfirmed={async (_event, close) => {
                    try {
                        await deleteTag.mutateAsync(deleteAdminTagInput(tag.attributes.id, name));
                        close();
                    } catch {
                        // Error toast is handled by the mutation.
                    }
                }}
                trigger={({ onClick }) => <DeleteAction aria-label={`Удалить ${name}`} onClick={onClick} />}
            >
                <p className='text-sm leading-relaxed text-muted-foreground'>
                    Это безвозвратно удалит <strong className='text-foreground'>{name}</strong> и снимет его с{' '}
                    {eggsCount} {plural(eggsCount, 'шаблона Egg', 'шаблонов Egg', 'шаблонов Egg')} и {nodesCount}{' '}
                    {plural(nodesCount, 'узла', 'узлов', 'узлов')}.
                </p>
            </Dialog.ConfirmTrigger>
        </RowActions>
    );
};

export const tagColumns = [
    {
        id: 'name',
        accessorFn: (tag) => tag.attributes.name,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Тег' />,
        cell: ({ row }) => <TagBadge tag={row.original} />,
        enableSorting: true,
        meta: { headerClassName: 'w-auto', cellClassName: 'w-auto' },
    },
    {
        id: 'slug',
        accessorFn: (tag) => tag.attributes.slug,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Слаг' />,
        cell: ({ row }) => (
            <span
                className='block w-0 min-w-full truncate font-mono text-xs text-muted-foreground'
                title={row.original.attributes.slug}
            >
                {row.original.attributes.slug}
            </span>
        ),
        enableSorting: true,
        meta: { headerClassName: 'hidden w-52 @lg:table-cell', cellClassName: 'hidden w-52 @lg:table-cell' },
    },
    {
        id: 'eggs_count',
        header: 'Шаблоны',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.attributes.eggs_count}</span>,
        enableSorting: false,
        meta: { headerClassName: 'hidden w-20 @xl:table-cell', cellClassName: 'hidden w-20 @xl:table-cell' },
    },
    {
        id: 'nodes_count',
        header: 'Узлы',
        cell: ({ row }) => <span className='tabular-nums'>{row.original.attributes.nodes_count}</span>,
        enableSorting: false,
        meta: { headerClassName: 'hidden w-20 @2xl:table-cell', cellClassName: 'hidden w-20 @2xl:table-cell' },
    },
    actionsColumn<AdminTag>(2, (tag) => <TagActionsCell tag={tag} />),
] satisfies ColumnDef<AdminTag>[];
