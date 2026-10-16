import { useMemo } from 'react';
import { ArrowDownCircle, Clock, Code, FileArchive, ListTodo, ToggleRight, type LucideIcon } from 'lucide-react';
import {
    actionsColumn,
    Badge,
    DeleteAction,
    Dialog,
    EditAction,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Icon,
    RowActions,
    SpinnerOverlay,
    Table,
    type ScheduleTask,
    type ScheduleTasksModel,
    type TableColumn,
} from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import NewTaskButton from './NewTaskButton';
import TaskDialog from './TaskDialog';

const actionDetails = (action: string): [string, LucideIcon] => {
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

function TaskIdentity({ task }: { task: ScheduleTask }) {
    const [title, icon] = actionDetails(task.action);

    return (
        <div className='flex min-w-48 items-start gap-3'>
            <Icon icon={icon} className='mt-0.5 hidden text-muted-foreground md:block' />
            <div className='min-w-0'>
                <p className='font-medium'>{title}</p>
                {task.payload ? (
                    <code className='mt-1 block max-w-xl whitespace-pre-wrap break-all text-xs text-muted-foreground'>
                        {task.payload}
                    </code>
                ) : null}
            </div>
        </div>
    );
}

function TaskActions({ model, task }: { model: ScheduleTasksModel; task: ScheduleTask }) {
    const name = `задача ${task.sequence} (${actionDetails(task.action)[0]})`;

    return (
        <RowActions>
            {model.canUpdate && (
                <>
                    <Dialog.Trigger
                        trigger={({ onClick }) => <EditAction aria-label={`Изменить ${name}`} onClick={onClick} />}
                    >
                        {(dialog) => (
                            <TaskDialog
                                {...dialog}
                                form={model.form}
                                task={task}
                                onSubmit={(values) => model.actions.update(task.id, values)}
                            />
                        )}
                    </Dialog.Trigger>
                    <Dialog.ConfirmTrigger
                        title='Подтвердите удаление задачи'
                        confirm='Удалить задачу'
                        onConfirmed={async (_event, close) => {
                            if (await model.actions.remove(task.id)) {
                                close();
                            }
                        }}
                        trigger={({ onClick }) => <DeleteAction aria-label={`Удалить ${name}`} onClick={onClick} />}
                    >
                        Вы действительно хотите удалить эту задачу? Это действие нельзя отменить.
                    </Dialog.ConfirmTrigger>
                </>
            )}
        </RowActions>
    );
}

function columns(model: ScheduleTasksModel): TableColumn<ScheduleTask>[] {
    return [
        {
            id: 'action',
            label: 'Задача',
            sortValue: (task) => actionDetails(task.action)[0],
            cell: (task) => <TaskIdentity task={task} />,
        },
        {
            id: 'delay',
            label: 'Задержка',
            sortValue: (task) => task.timeOffset,
            cell: (task) =>
                task.sequence > 1 && task.timeOffset > 0 ? (
                    <span className='inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground'>
                        <Icon icon={Clock} className='h-3.5 w-3.5' />
                        через {task.timeOffset} с
                    </span>
                ) : (
                    '-'
                ),
            headerClassName: 'hidden md:table-cell w-32',
            cellClassName: 'hidden md:table-cell w-32',
        },
        {
            id: 'continue_on_failure',
            label: 'Поведение при ошибке',
            cell: (task) =>
                task.continueOnFailure ? (
                    <Badge tone='warning' className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full'>
                        <Icon icon={ArrowDownCircle} className='h-3.5 w-3.5' />
                        Продолжает
                    </Badge>
                ) : (
                    <span className='text-xs text-muted-foreground'>Останавливается</span>
                ),
            headerClassName: 'hidden lg:table-cell w-36',
            cellClassName: 'hidden lg:table-cell w-36',
        },
        actionsColumn(2, (task) => <TaskActions model={model} task={task} />),
    ];
}

export default function ScheduleTasks({ model, className }: ViewProps<'server.schedule.tasks'>) {
    const tableColumns = useMemo(() => columns(model), [model]);

    return (
        <>
            <SpinnerOverlay visible={model.deleting} fixed size='large' />
            <Table
                rows={model.tasks}
                columns={tableColumns}
                keyOf={(task) => String(task.id)}
                className={className}
                emptyState={
                    <Empty size='compact'>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <ListTodo />
                            </EmptyMedia>
                            <EmptyTitle>Нет задач</EmptyTitle>
                            <EmptyDescription>
                                Добавьте задачу, чтобы указать, что это расписание должно делать при запуске.
                            </EmptyDescription>
                        </EmptyHeader>
                        {model.canUpdate && (
                            <EmptyContent>
                                <NewTaskButton form={model.form} onSubmit={model.actions.create} />
                            </EmptyContent>
                        )}
                    </Empty>
                }
            />
        </>
    );
}
