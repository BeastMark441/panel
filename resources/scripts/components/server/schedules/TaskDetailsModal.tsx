import { useState } from 'react';
import { type Schedule, type Task } from '@/api/server/schedules/queries';
import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import {
    createScheduleTaskInput,
    updateScheduleTaskInput,
    useCreateServerScheduleTask,
    useUpdateServerScheduleTask,
} from '@/api/server/schedules/queries';
import { Dialog, type DialogProps } from '@/components/elements/dialog';
import { useCurrentServer } from '@/api/server/queries';

interface Props {
    schedule: Schedule;
    task?: Task;
}

type Action = 'command' | 'power' | 'backup';

interface TaskFormValues {
    action: Action;
    payload: string;
    timeOffset: number | null;
    continueOnFailure: boolean;
}

const validateTimeOffset = (value: number | null): string | undefined => {
    if (value === null) {
        return 'Укажите временной сдвиг.';
    }

    if (value < 0) {
        return 'Временной сдвиг должен составлять не менее 0 секунд.';
    }

    if (value > 900) {
        return 'Временной сдвиг должен быть меньше 900 секунд.';
    }

    return undefined;
};

const TaskDetailsForm = ({ schedule, task, onClose }: Props & { onClose: () => void }) => {
    const [formError, setFormError] = useState<string | null>(null);

    const server = useCurrentServer()!;
    const uuid = server.attributes.uuid;
    const createTask = useCreateServerScheduleTask(schedule);
    const updateTask = useUpdateServerScheduleTask(schedule);
    const backupLimit = server.attributes.feature_limits.backups;

    const initialAction = (task?.attributes.action || 'command') as Action;
    const initialPayload = task?.attributes.payload || '';

    const defaultValues: TaskFormValues = {
        action: initialAction,
        payload: initialPayload,
        timeOffset: task?.attributes.time_offset ?? 0,
        continueOnFailure: task?.attributes.continue_on_failure || false,
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            setFormError(null);
            if (backupLimit === 0 && value.action === 'backup') {
                setFormError(
                    'Нельзя создать задачу резервного копирования, если лимит резервных копий сервера установлен в 0.'
                );

                return;
            }

            const { timeOffset } = value;

            if (timeOffset === null) {
                return;
            }

            const values = { ...value, timeOffset };

            try {
                if (task) {
                    await updateTask.mutateAsync(updateScheduleTaskInput(uuid, schedule, task.attributes.id, values));
                } else {
                    await createTask.mutateAsync(createScheduleTaskInput(uuid, schedule, values));
                }

                onClose();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const action = useStore(form.store, (state) => state.values.action);
    const payloadValidators = {
        onChangeListenTo: ['action' as const],
        onChange: ({ value }: { value: string }) =>
            form.getFieldValue('action') !== 'command' || value.length > 0 ? undefined : 'Укажите данные задачи.',
    };
    const setPayloadForAction = (nextAction: Action) => {
        if (nextAction === initialAction) {
            form.setFieldValue('payload', initialPayload || '');

            return;
        }

        form.setFieldValue('payload', nextAction === 'power' ? 'start' : '');
    };

    return (
        <Form form={form} className='m-0'>
            {formError && (
                <div className='rounded-sm border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground mb-4'>
                    {formError}
                </div>
            )}
            <div className='flex'>
                <div className='mr-2 w-1/3'>
                    <form.AppField name='action'>
                        {(field) => (
                            <field.SelectField
                                label='Действие'
                                options={[
                                    { value: 'command', label: 'Отправить команду' },
                                    { value: 'power', label: 'Отправить действие питания' },
                                    { value: 'backup', label: 'Создать резервную копию' },
                                ]}
                                onChange={(value) => setPayloadForAction(value as Action)}
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='flex-1 ml-6'>
                    <form.AppField
                        name='timeOffset'
                        validators={{
                            onChange: ({ value }) => validateTimeOffset(value),
                        }}
                    >
                        {(field) => (
                            <field.NumberField
                                label='Временной сдвиг (в секундах)'
                                min={0}
                                max={900}
                                description='Время ожидания после выполнения предыдущей задачи перед запуском этой. Если это первая задача в расписании, сдвиг не применяется.'
                            />
                        )}
                    </form.AppField>
                </div>
            </div>
            <div className='mt-6'>
                {action === 'command' && (
                    <form.AppField name='payload' validators={payloadValidators}>
                        {(field) => <field.TextAreaField label='Данные' rows={6} />}
                    </form.AppField>
                )}
                {action === 'power' && (
                    <form.AppField name='payload' validators={payloadValidators}>
                        {(field) => (
                            <field.SelectField
                                label='Данные'
                                options={[
                                    { value: 'start', label: 'Запустить сервер' },
                                    { value: 'restart', label: 'Перезапустить сервер' },
                                    { value: 'stop', label: 'Остановить сервер' },
                                    { value: 'kill', label: 'Принудительно остановить сервер' },
                                ]}
                            />
                        )}
                    </form.AppField>
                )}
                {action === 'backup' && (
                    <form.AppField name='payload' validators={payloadValidators}>
                        {(field) => (
                            <field.TextAreaField
                                label='Игнорируемые файлы'
                                rows={6}
                                description='Необязательно. Перечислите файлы и папки, которые нужно исключить из этой резервной копии. По умолчанию используется содержимое файла .pteroignore. Если лимит резервных копий достигнут, самая старая копия будет удалена.'
                            />
                        )}
                    </form.AppField>
                )}
            </div>
            <div className='mt-6 bg-card border border-border shadow-inner p-4 rounded-sm'>
                <form.AppField name='continueOnFailure'>
                    {(field) => (
                        <field.SwitchField
                            description='Следующие задачи будут выполнены, даже если эта задача завершится с ошибкой.'
                            label='Продолжать при ошибке'
                        />
                    )}
                </form.AppField>
            </div>
            <div className='flex justify-end mt-6'>
                <form.AppForm>
                    <form.SubmitButton>{task ? 'Сохранить изменения' : 'Создать задачу'}</form.SubmitButton>
                </form.AppForm>
            </div>
        </Form>
    );
};

export default function TaskDetailsModal({ open, onClose, ...props }: Props & DialogProps) {
    const formKey = `${props.schedule.attributes.id}:${props.task?.attributes.id ?? 'new'}`;

    return (
        <Dialog open={open} title={props.task ? 'Редактирование задачи' : 'Создание задачи'} onClose={onClose}>
            <TaskDetailsForm key={formKey} {...props} onClose={onClose} />
        </Dialog>
    );
}
