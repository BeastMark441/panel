import { useMemo } from 'react';
import { Archive, ArrowLeft, Lock } from 'lucide-react';
import {
    actionsColumn,
    Badge,
    bytesToString,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    formatDate,
    fromNow,
    Icon,
    ListToolbar,
    NewButton,
    Spinner,
    SpinnerOverlay,
    Table,
    type BackupListModel,
    type BackupSummary,
    type TableColumn,
} from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import BackupActions from './BackupActions';
import CreateBackupButton from './CreateBackupButton';

const backupUsage = (model: BackupListModel): string | null => {
    const { limit, count } = model;

    if (limit === 0 && model.backups.length > 0) {
        return 'Невозможно создать резервные копии: лимит для этого сервера равен 0.';
    }

    if (model.permissions.create && limit > 0 && count > 0) {
        return `Для этого сервера создано ${count} из ${limit} резервных копий.`;
    }

    return null;
};

const canAddBackup = (model: BackupListModel): boolean => model.permissions.create && model.limit > model.count;

function BackupIdentity({ backup }: { backup: BackupSummary }) {
    return (
        <div className='flex min-w-44 items-center gap-3'>
            {backup.completedAt === null ? (
                <Spinner size='small' />
            ) : (
                <Icon
                    icon={backup.locked ? Lock : Archive}
                    className={backup.locked ? 'text-warning' : 'text-muted-foreground'}
                />
            )}
            <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                    {backup.completedAt !== null && !backup.successful ? (
                        <Badge tone='danger' size='sm'>
                            Ошибка
                        </Badge>
                    ) : null}
                    <p className='truncate font-medium'>{backup.name}</p>
                </div>
                <p className='mt-0.5 truncate font-mono text-xs text-muted-foreground'>{backup.checksum}</p>
            </div>
        </div>
    );
}

function columns(model: BackupListModel): TableColumn<BackupSummary>[] {
    const { permissions } = model;
    const hasActions = permissions.download || permissions.restore || permissions.delete;

    return [
        { id: 'name', label: 'Резервная копия', cell: (backup) => <BackupIdentity backup={backup} /> },
        {
            id: 'bytes',
            label: 'Размер',
            cell: (backup) => (
                <span className='whitespace-nowrap text-xs'>
                    {backup.completedAt && backup.successful ? bytesToString(backup.bytes) : '-'}
                </span>
            ),
            headerClassName: 'hidden md:table-cell w-28',
            cellClassName: 'hidden md:table-cell w-28',
        },
        {
            id: 'created_at',
            label: 'Создана',
            cell: (backup) => (
                <time
                    dateTime={backup.createdAt}
                    title={formatDate(backup.createdAt, 'ddd, MMMM D, YYYY HH:mm:ss')}
                    className='whitespace-nowrap text-xs text-muted-foreground'
                >
                    {fromNow(backup.createdAt)}
                </time>
            ),
            headerClassName: 'hidden sm:table-cell w-32',
            cellClassName: 'hidden sm:table-cell w-32',
        },
        actionsColumn(2, (backup) =>
            hasActions && backup.completedAt ? <BackupActions model={model} backup={backup} /> : null
        ),
    ];
}

function EmptyBackups({ model }: { model: BackupListModel }) {
    if (model.pagination.page > 1) {
        return (
            <Empty size='compact'>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <Archive />
                    </EmptyMedia>
                    <EmptyTitle>На этой странице нет резервных копий</EmptyTitle>
                    <EmptyDescription>Эта страница находится за пределами списка резервных копий.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <NewButton isSecondary icon={ArrowLeft} onClick={() => model.actions.setPage(1)}>
                        Первая страница
                    </NewButton>
                </EmptyContent>
            </Empty>
        );
    }

    return (
        <Empty size='compact'>
            <EmptyHeader>
                <EmptyMedia variant='icon'>
                    <Archive />
                </EmptyMedia>
                <EmptyTitle>Нет резервных копий</EmptyTitle>
                <EmptyDescription>
                    {model.limit > 0
                        ? 'У этого сервера пока нет резервных копий.'
                        : 'Невозможно создать резервные копии: лимит для этого сервера равен 0.'}
                </EmptyDescription>
            </EmptyHeader>
            {canAddBackup(model) && (
                <EmptyContent>
                    <CreateBackupButton model={model} />
                </EmptyContent>
            )}
        </Empty>
    );
}

export default function BackupList({ model, className }: ViewProps<'server.backups'>) {
    const tableColumns = useMemo(() => columns(model), [model]);
    const usage = backupUsage(model);
    const canAdd = canAddBackup(model);
    const { pending } = model;

    return (
        <div className={className}>
            {(usage || canAdd) && (
                <ListToolbar summary={usage}>{canAdd && <CreateBackupButton model={model} />}</ListToolbar>
            )}
            <SpinnerOverlay visible={pending.download || pending.remove || pending.restore || pending.lock} fixed />
            <Table
                rows={model.backups}
                columns={tableColumns}
                keyOf={(backup) => backup.uuid}
                emptyState={<EmptyBackups model={model} />}
                pagination={{
                    ...model.pagination,
                    itemLabel: 'резервных копий',
                    onPageSelect: model.actions.setPage,
                }}
            />
        </div>
    );
}
