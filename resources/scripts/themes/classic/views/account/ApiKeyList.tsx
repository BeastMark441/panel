import { useMemo, useState } from 'react';
import { KeyRound } from 'lucide-react';
import {
    Code,
    ContentBox,
    DeleteAction,
    Dialog,
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    formatDate,
    RowActions,
    Spinner,
    SpinnerOverlay,
    Table,
    type ApiKeyItem,
    type TableColumn,
} from '@/sdk';
import type { ViewProps } from '@/sdk/theme';

const apiKeyColumns = (onDelete: (identifier: string) => void): TableColumn<ApiKeyItem>[] => [
    {
        id: 'description',
        label: 'Описание',
        sortValue: (key) => key.description,
        cell: (key) => (
            <div className='min-w-40'>
                <p className='truncate font-medium'>{key.description}</p>
                <p className='mt-0.5 truncate font-mono text-xs text-muted-foreground md:hidden'>{key.identifier}</p>
            </div>
        ),
    },
    {
        id: 'identifier',
        label: 'Идентификатор',
        sortValue: (key) => key.identifier,
        cell: (key) => <code className='font-mono text-xs text-muted-foreground'>{key.identifier}</code>,
        headerClassName: 'hidden md:table-cell',
        cellClassName: 'hidden md:table-cell',
    },
    {
        id: 'last_used_at',
        label: 'Последнее использование',
        sortValue: (key) => key.lastUsedAt,
        cell: (key) => (
            <span className='whitespace-nowrap text-xs text-muted-foreground'>
                {key.lastUsedAt ? formatDate(key.lastUsedAt, 'MMM D, YYYY HH:mm') : 'никогда'}
            </span>
        ),
        headerClassName: 'hidden lg:table-cell w-40',
        cellClassName: 'hidden lg:table-cell w-40',
    },
    {
        id: 'actions',
        label: <span className='sr-only'>Действия</span>,
        cell: (key) => (
            <RowActions>
                <DeleteAction
                    aria-label={`Удалить API-ключ «${key.description}»`}
                    onClick={() => onDelete(key.identifier)}
                />
            </RowActions>
        ),
        headerClassName: 'w-14 text-right',
        cellClassName: 'w-14 text-right',
    },
];

export default function ApiKeyList({ model, className }: ViewProps<'account.apiKeys.list'>) {
    const [deleteIdentifier, setDeleteIdentifier] = useState('');
    const columns = useMemo(() => apiKeyColumns(setDeleteIdentifier), []);

    return (
        <ContentBox title='API-ключи' className={className}>
            <SpinnerOverlay visible={model.deleting} />
            <Dialog.Confirm
                title='Удаление API-ключа'
                confirm='Удалить ключ'
                open={!!deleteIdentifier}
                pending={model.deleting}
                onClose={() => setDeleteIdentifier('')}
                onConfirmed={() => void model.remove(deleteIdentifier).then(() => setDeleteIdentifier(''))}
            >
                Все запросы, использующие ключ <Code>{deleteIdentifier}</Code>, перестанут действовать.
            </Dialog.Confirm>
            {model.loading ? (
                <Spinner size='large' centered />
            ) : (
                <Table
                    rows={model.keys}
                    columns={columns}
                    keyOf={(key) => key.identifier}
                    emptyState={
                        <Empty size='compact'>
                            <EmptyHeader>
                                <EmptyMedia variant='icon'>
                                    <KeyRound />
                                </EmptyMedia>
                                <EmptyTitle>Нет API-ключей</EmptyTitle>
                                <EmptyDescription>
                                    Создайте ключ, чтобы использовать Client API из собственных скриптов и инструментов.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    }
                />
            )}
        </ContentBox>
    );
}
