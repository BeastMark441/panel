import type { ColumnDef } from '@tanstack/react-table';
import { ArrowDownCircle, Clock, Code, FileArchive, ToggleRight, type LucideIcon } from 'lucide-react';
import {
    deleteScheduleTaskInput,
    type Schedule,
    type Task,
    useDeleteServerScheduleTask,
} from '@/api/server/schedules/queries';
import { useCurrentServerUuid } from '@/api/server/queries';
import Can from '@/components/elements/Can';
import Icon from '@/components/elements/Icon';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import DataTableColumnHeader from '@/components/elements/table/DataTableColumnHeader';
import { actionsColumn, DeleteAction, EditAction, RowActions } from '@/components/elements/table/RowActions';
import { Dialog } from '@/components/elements/dialog';
import TaskDetailsModal from '@/components/server/schedules/TaskDetailsModal';

const getActionDetails = (action: string): [string, LucideIcon] => {
    switch (action) {
        case 'command':
            return ['Отправка команды', Code];
        case 'power':
            return ['Отправка действия питания', ToggleRight];
        case 'backup':
            return ['Создание резервной копии', FileArchive];
        default:
            return ['Неизвестное действие', Code];
    }
};

const TaskIdentityCell = ({ task }: { task: Task }) => {
    const [title, icon] = getActionDetails(task.attributes.action);

    return (
        <div className='flex min-w-48 items-start gap-3'>
            <Icon icon={icon} className='mt-0.5 hidden text-muted-foreground md:block' />
            <div className='min-w-0'>
                <p className='font-medium'>{title}</p>
                {task.attributes.payload ? (
                    <code className='mt-1 block max-w-xl whitespace-pre-wrap break-all text-xs text-muted-foreground'>
                        {task.attributes.payload}
                    </code>
                ) : null}
            </div>
        </div>
    );
};

const TaskActionsCell = ({ schedule, task }: { schedule: Schedule; task: Task }) => {
    const uuid = useCurrentServerUuid()!;
    const deleteTask = useDeleteServerScheduleTask(schedule);
    const name = `задача ${task.attributes.sequence_id} (${getActionDetails(task.attributes.action)[0]})`;
    const onConfirmDeletion = async (close: () => void) => {
        try {
            await deleteTask.mutateAsync(deleteScheduleTaskInput(uuid, schedule, task.attributes.id));
            close();
        } catch {
            // Error toast is handled by the mutation.
        }
    };

    return (
        <RowActions>
            <SpinnerOverlay visible={deleteTask.isPending} fixed size='large' />
            <Can action='schedule.update'>
                <Dialog.Trigger
                    trigger={({ onClick }) => <EditAction aria-label={`Изменить ${name}`} onClick={onClick} />}
                >
                    {({ open, onClose }) => (
                        <TaskDetailsModal schedule={schedule} task={task} open={open} onClose={onClose} />
                    )}
                </Dialog.Trigger>
                <Dialog.ConfirmTrigger
                    title='Подтвердите удаление задачи'
                    confirm='Удалить задачу'
                    onConfirmed={(_event, close) => onConfirmDeletion(close)}
                    trigger={({ onClick }) => <DeleteAction aria-label={`Удалить ${name}`} onClick={onClick} />}
                >
                    Вы действительно хотите удалить эту задачу? Это действие нельзя отменить.
                </Dialog.ConfirmTrigger>
            </Can>
        </RowActions>
    );
};

export const scheduleTaskColumns = (schedule: Schedule): ColumnDef<Task>[] => [
    {
        id: 'action',
        accessorFn: (task) => getActionDetails(task.attributes.action)[0],
        header: ({ column }) => <DataTableColumnHeader column={column} title='Задача' />,
        cell: ({ row }) => <TaskIdentityCell task={row.original} />,
    },
    {
        id: 'delay',
        accessorFn: (task) => task.attributes.time_offset,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Задержка' />,
        cell: ({ row }) =>
            row.original.attributes.sequence_id > 1 && row.original.attributes.time_offset > 0 ? (
                <span className='inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground'>
                    <Icon icon={Clock} className='h-3.5 w-3.5' />
                    через {row.original.attributes.time_offset} с
                </span>
            ) : (
                '-'
            ),
        meta: { headerClassName: 'hidden md:table-cell w-32', cellClassName: 'hidden md:table-cell w-32' },
    },
    {
        id: 'continue_on_failure',
        accessorFn: (task) => task.attributes.continue_on_failure,
        header: 'Поведение при ошибке',
        cell: ({ row }) =>
            row.original.attributes.continue_on_failure ? (
                <span className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-warning px-2 py-1 text-xs text-warning-foreground'>
                    <Icon icon={ArrowDownCircle} className='h-3.5 w-3.5' />
                    Продолжает
                </span>
            ) : (
                <span className='text-xs text-muted-foreground'>Останавливается</span>
            ),
        enableSorting: false,
        meta: { headerClassName: 'hidden lg:table-cell w-36', cellClassName: 'hidden lg:table-cell w-36' },
    },
    actionsColumn<Task>(2, (task) => <TaskActionsCell schedule={schedule} task={task} />),
];
