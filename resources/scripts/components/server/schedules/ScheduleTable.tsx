import { Link } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';
import type { Schedule } from '@/api/server/schedules/queries';
import Can from '@/components/elements/Can';
import DataTableColumnHeader from '@/components/elements/table/DataTableColumnHeader';
import { actionsColumn, EditLinkAction, RowActions } from '@/components/elements/table/RowActions';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';
import dayjs from '@/lib/dayjs';
import { cn } from '@/lib/cn';

const scheduleStatus = (schedule: Schedule): 'processing' | 'active' | 'inactive' => {
    if (schedule.attributes.is_processing) {
        return 'processing';
    }

    return schedule.attributes.is_active ? 'active' : 'inactive';
};

const scheduleStatusLabel = {
    processing: 'Выполняется',
    active: 'Активно',
    inactive: 'Неактивно',
} satisfies Record<string, string>;

export const scheduleColumns = (serverId: string): ColumnDef<Schedule>[] => [
    {
        id: 'name',
        accessorFn: (schedule) => schedule.attributes.name,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Расписание' />,
        cell: ({ row }) => (
            <div className='min-w-40'>
                <Link
                    to='/server/$id/schedules/$scheduleId'
                    params={{ id: serverId, scheduleId: row.original.attributes.id }}
                    className='font-medium hover:text-primary'
                >
                    {row.original.attributes.name}
                </Link>
                <p className='mt-0.5 text-xs text-muted-foreground md:hidden'>
                    Последнее выполнение:{' '}
                    {row.original.attributes.last_run_at
                        ? dayjs(row.original.attributes.last_run_at).fromNow()
                        : 'никогда'}
                </p>
            </div>
        ),
    },
    {
        id: 'cron',
        accessorFn: (schedule) => Object.values(schedule.attributes.cron).join(' '),
        header: 'Cron',
        cell: ({ row }) => <ScheduleCronRow cron={row.original.attributes.cron} />,
        enableSorting: false,
        meta: { headerClassName: 'hidden lg:table-cell', cellClassName: 'hidden lg:table-cell' },
    },
    {
        id: 'last_run_at',
        accessorFn: (schedule) => schedule.attributes.last_run_at ?? '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Последнее выполнение' />,
        cell: ({ row }) => (
            <span className='whitespace-nowrap text-xs text-muted-foreground'>
                {row.original.attributes.last_run_at
                    ? dayjs(row.original.attributes.last_run_at).format('MMM D, YYYY HH:mm')
                    : 'Никогда'}
            </span>
        ),
        meta: { headerClassName: 'hidden md:table-cell w-40', cellClassName: 'hidden md:table-cell w-40' },
    },
    {
        id: 'status',
        accessorFn: scheduleStatus,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Статус' />,
        cell: ({ getValue }) => {
            const status = getValue<'processing' | 'active' | 'inactive'>();

            return (
                <span
                    className={cn(
                        'inline-flex rounded-full px-2 py-1 text-xs font-medium',
                        status === 'active' ? 'bg-success/90 text-success-foreground' : 'bg-popover text-foreground'
                    )}
                >
                    {scheduleStatusLabel[status] ?? status}
                </span>
            );
        },
        meta: { headerClassName: 'w-28', cellClassName: 'w-28' },
    },
    actionsColumn<Schedule>(1, (schedule) => (
        <Can action='schedule.update'>
            <RowActions>
                <EditLinkAction
                    aria-label={`Изменить ${schedule.attributes.name}`}
                    to='/server/$id/schedules/$scheduleId'
                    params={{ id: serverId, scheduleId: schedule.attributes.id }}
                />
            </RowActions>
        </Can>
    )),
];
