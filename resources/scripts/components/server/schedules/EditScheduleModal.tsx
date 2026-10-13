import { useState } from 'react';
import { type Schedule } from '@/api/server/schedules/queries';
import { useAppForm, Form } from '@/components/form';
import Switch from '@/components/ui/Switch';
import {
    createServerScheduleInput,
    updateServerScheduleInput,
    useCreateServerSchedule,
    useUpdateServerSchedule,
} from '@/api/server/schedules/queries';
import { Dialog, type DialogProps } from '@/components/elements/dialog';
import ScheduleCheatsheetCards from '@/components/server/schedules/ScheduleCheatsheetCards';
import { useCurrentServerUuid } from '@/api/server/queries';

interface Props {
    schedule?: Schedule;
}

type ScheduleFormValues = {
    name: string;
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
    enabled: boolean;
    onlyWhenOnline: boolean;
};

const newScheduleDefaults: ScheduleFormValues = {
    name: '',
    minute: '*/5',
    hour: '*',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '*',
    enabled: true,
    onlyWhenOnline: true,
};

const scheduleDefaultValues = (schedule?: Schedule): ScheduleFormValues => {
    if (!schedule) {
        return { ...newScheduleDefaults };
    }

    const { name, cron, is_active, only_when_online } = schedule.attributes;

    return {
        name: name || newScheduleDefaults.name,
        minute: cron.minute || newScheduleDefaults.minute,
        hour: cron.hour || newScheduleDefaults.hour,
        dayOfMonth: cron.day_of_month || newScheduleDefaults.dayOfMonth,
        month: cron.month || newScheduleDefaults.month,
        dayOfWeek: cron.day_of_week || newScheduleDefaults.dayOfWeek,
        enabled: is_active ?? newScheduleDefaults.enabled,
        onlyWhenOnline: only_when_online ?? newScheduleDefaults.onlyWhenOnline,
    };
};

const scheduleSubmitValues = (value: ScheduleFormValues) => ({
    name: value.name,
    cron: {
        minute: value.minute,
        hour: value.hour,
        dayOfWeek: value.dayOfWeek,
        month: value.month,
        dayOfMonth: value.dayOfMonth,
    },
    onlyWhenOnline: value.onlyWhenOnline,
    isActive: value.enabled,
});

const EditScheduleForm = ({ schedule, onClose }: Props & { onClose: () => void }) => {
    const uuid = useCurrentServerUuid()!;
    const createSchedule = useCreateServerSchedule();
    const updateSchedule = useUpdateServerSchedule();
    const [showCheatsheet, setShowCheetsheet] = useState(false);

    const form = useAppForm({
        defaultValues: scheduleDefaultValues(schedule),
        onSubmit: async ({ value }) => {
            try {
                const values = scheduleSubmitValues(value);

                if (schedule) {
                    await updateSchedule.mutateAsync(updateServerScheduleInput(uuid, schedule.attributes.id, values));
                } else {
                    await createSchedule.mutateAsync(createServerScheduleInput(uuid, values));
                }

                onClose();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    return (
        <Form form={form}>
            <form.AppField name='name'>
                {(field) => (
                    <field.TextField
                        label='Название расписания'
                        description='Понятное для человека название этого расписания.'
                    />
                )}
            </form.AppField>
            <div
                className={
                    'mt-6 grid grid-cols-2 items-end gap-4 sm:grid-cols-5 ' +
                    '[&_label]:text-xs [&_label]:text-muted-foreground ' +
                    '[&_input]:text-center [&_input]:font-mono'
                }
            >
                <form.AppField name='minute'>{(field) => <field.TextField label='Минута' />}</form.AppField>
                <form.AppField name='hour'>{(field) => <field.TextField label='Час' />}</form.AppField>
                <form.AppField name='dayOfMonth'>{(field) => <field.TextField label='День месяца' />}</form.AppField>
                <form.AppField name='month'>{(field) => <field.TextField label='Месяц' />}</form.AppField>
                <form.AppField name='dayOfWeek'>{(field) => <field.TextField label='День недели' />}</form.AppField>
            </div>
            <p className='text-muted-foreground text-xs mt-2'>
                Система расписаний поддерживает синтаксис cron для определения момента запуска задач. Используйте поля
                выше, чтобы указать, когда задачи должны начать выполняться.
            </p>
            <div className='mt-6 bg-card border border-border shadow-inner p-4 rounded-sm'>
                <Switch
                    label='Показать шпаргалку'
                    description='Показать шпаргалку по cron с примерами.'
                    checked={showCheatsheet}
                    onChange={() => setShowCheetsheet((s) => !s)}
                />
                {showCheatsheet && <ScheduleCheatsheetCards />}
            </div>
            <div className='mt-6 bg-card border border-border shadow-inner p-4 rounded-sm'>
                <form.AppField name='onlyWhenOnline'>
                    {(field) => (
                        <field.SwitchField
                            description='Выполнять это расписание только тогда, когда сервер работает.'
                            label='Только когда сервер в сети'
                        />
                    )}
                </form.AppField>
            </div>
            <div className='mt-6 bg-card border border-border shadow-inner p-4 rounded-sm'>
                <form.AppField name='enabled'>
                    {(field) => (
                        <field.SwitchField
                            description='Это расписание будет автоматически выполняться, если оно включено.'
                            label='Расписание активно'
                        />
                    )}
                </form.AppField>
            </div>
            <div className='mt-6 text-right'>
                <form.AppForm>
                    <form.SubmitButton className='w-full sm:w-auto'>
                        {schedule ? 'Сохранить изменения' : 'Создать расписание'}
                    </form.SubmitButton>
                </form.AppForm>
            </div>
        </Form>
    );
};

export default function EditScheduleModal({ open, onClose, ...props }: Props & DialogProps) {
    return (
        <Dialog
            open={open}
            title={props.schedule ? 'Редактирование расписания' : 'Создание расписания'}
            onClose={onClose}
        >
            <EditScheduleForm {...props} onClose={onClose} />
        </Dialog>
    );
}
