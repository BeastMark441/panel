import { useMemo } from 'react';
import { CalendarClock } from 'lucide-react';
import {
    actionsColumn,
    Badge,
    cn,
    Dialog,
    EditLinkAction,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    formatDate,
    fromNow,
    ListToolbar,
    NewButton,
    PanelLink,
    RowActions,
    Spinner,
    Table,
    type ScheduleListModel,
    type ScheduleSummary,
    type TableColumn,
} from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import ScheduleCronRow from './ScheduleCronRow';
import ScheduleDialog from './ScheduleDialog';

const scheduleStatus = (schedule: ScheduleSummary): 'processing' | 'active' | 'inactive' => {
    if (schedule.processing) {
        return 'processing';
    }

    return schedule.active ? 'active' : 'inactive';
};

const scheduleStatusLabel = {
    processing: 'Выполняется',
    active: 'Активно',
    inactive: 'Неактивно',
};

const scheduleDestination = (model: ScheduleListModel, schedule: ScheduleSummary) =>
    ({
        to: '/server/$id/schedules/$scheduleId',
        params: { id: model.serverId, scheduleId: String(schedule.id) },
    }) as const;

function columns(model: ScheduleListModel): TableColumn<ScheduleSummary>[] {
    return [
        {
            id: 'name',
            label: 'Расписание',
            sortValue: (schedule) => schedule.name,
            cell: (schedule) => (
                <div className='min-w-40'>
                    <PanelLink
                        destination={scheduleDestination(model, schedule)}
                        className='font-medium hover:text-primary'
                    >
                        {schedule.name}
                    </PanelLink>
                    <p className='mt-0.5 text-xs text-muted-foreground md:hidden'>
                        Последнее выполнение: {schedule.lastRunAt ? fromNow(schedule.lastRunAt) : 'никогда'}
                    </p>
                </div>
            ),
        },
        {
            id: 'cron',
            label: 'Cron',
            cell: (schedule) => <ScheduleCronRow cron={schedule.cron} />,
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell',
        },
        {
            id: 'last_run_at',
            label: 'Последнее выполнение',
            sortValue: (schedule) => schedule.lastRunAt ?? '',
            cell: (schedule) => (
                <span className='whitespace-nowrap text-xs text-muted-foreground'>
                    {schedule.lastRunAt ? formatDate(schedule.lastRunAt, 'MMM D, YYYY HH:mm') : 'Никогда'}
                </span>
            ),
            headerClassName: 'hidden md:table-cell w-40',
            cellClassName: 'hidden md:table-cell w-40',
        },
        {
            id: 'status',
            label: 'Статус',
            sortValue: scheduleStatus,
            cell: (schedule) => {
                const status = scheduleStatus(schedule);

                return (
                    <Badge
                        tone={status === 'active' ? 'success' : 'neutral'}
                        className={cn('inline-flex rounded-full font-medium', status === 'active' && 'bg-success/90')}
                    >
                        {scheduleStatusLabel[status]}
                    </Badge>
                );
            },
            headerClassName: 'w-28',
            cellClassName: 'w-28',
        },
        actionsColumn(1, (schedule) =>
            model.canUpdate ? (
                <RowActions>
                    <EditLinkAction
                        aria-label={`Изменить ${schedule.name}`}
                        destination={scheduleDestination(model, schedule)}
                    />
                </RowActions>
            ) : null
        ),
    ];
}

function CreateScheduleButton({ model }: { model: ScheduleListModel }) {
    return (
        <Dialog.Trigger trigger={({ onClick }) => <NewButton onClick={onClick}>Новое расписание</NewButton>}>
            {(dialog) => <ScheduleDialog {...dialog} values={model.defaults} editing={false} onSubmit={model.create} />}
        </Dialog.Trigger>
    );
}

export default function ScheduleList({ model, className }: ViewProps<'server.schedules'>) {
    const tableColumns = useMemo(() => columns(model), [model]);

    if (model.loading) {
        return (
            <div className={className}>
                <Spinner size='large' centered />
            </div>
        );
    }

    return (
        <div className={className}>
            {model.canCreate && (
                <ListToolbar>
                    <CreateScheduleButton model={model} />
                </ListToolbar>
            )}
            <Table
                rows={model.schedules}
                columns={tableColumns}
                keyOf={(schedule) => String(schedule.id)}
                emptyState={
                    <Empty size='compact'>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <CalendarClock />
                            </EmptyMedia>
                            <EmptyTitle>Нет расписаний</EmptyTitle>
                            <EmptyDescription>
                                Расписания автоматически выполняют команды, действия питания и резервное копирование.
                            </EmptyDescription>
                        </EmptyHeader>
                        {model.canCreate && (
                            <EmptyContent>
                                <CreateScheduleButton model={model} />
                            </EmptyContent>
                        )}
                    </Empty>
                }
            />
        </div>
    );
}
