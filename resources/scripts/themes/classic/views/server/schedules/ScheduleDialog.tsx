import { useState } from 'react';
import { Dialog, Form, Switch, useAppForm, type ScheduleFormValues } from '@/sdk';
import ScheduleCheatsheet from './ScheduleCheatsheet';

interface Props {
    open: boolean;
    onClose: () => void;
    /** The values the form starts from. */
    values: ScheduleFormValues;
    /** The form edits an existing schedule rather than creating one. */
    editing: boolean;
    onSubmit: (values: ScheduleFormValues) => Promise<boolean>;
}

const cronFieldsClass = [
    'mt-6 grid grid-cols-2 items-end gap-4 sm:grid-cols-5',
    '[&_label]:text-xs [&_label]:text-muted-foreground',
    '[&_input]:text-center [&_input]:font-mono',
].join(' ');

function ScheduleForm({ values, editing, onSubmit, onClose }: Omit<Props, 'open'>) {
    const [showCheatsheet, setShowCheatsheet] = useState(false);
    const form = useAppForm({
        defaultValues: { ...values },
        onSubmit: async ({ value }) => {
            if (await onSubmit(value)) {
                onClose();
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
            <div className={cronFieldsClass}>
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
                    onChange={() => setShowCheatsheet((shown) => !shown)}
                />
                {showCheatsheet && <ScheduleCheatsheet />}
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
                        {editing ? 'Сохранить изменения' : 'Создать расписание'}
                    </form.SubmitButton>
                </form.AppForm>
            </div>
        </Form>
    );
}

/** Creates a schedule, or edits one, with its name, cron fields and switches. */
export default function ScheduleDialog({ open, onClose, ...props }: Props) {
    return (
        <Dialog
            open={open}
            title={props.editing ? 'Редактирование расписания' : 'Создание расписания'}
            onClose={onClose}
        >
            <ScheduleForm {...props} onClose={onClose} />
        </Dialog>
    );
}
