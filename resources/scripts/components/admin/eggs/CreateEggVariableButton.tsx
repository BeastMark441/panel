import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import { createAdminEggVariableInput, useCreateAdminEggVariable } from '@/api/admin/eggs/queries';
import {
    eggVariableBodyFromFormValues,
    validateEnvVariable,
    validateVariableName,
} from '@/components/admin/eggs/helpers';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Button from '@/components/elements/Button';
import { NewButton } from '@/components/elements/NewButton';

interface Props {
    eggId: number;
}

type CreateEggVariableDialogProps = Props & {
    open: boolean;
    onClose: () => void;
};

const initialValues = {
    name: '',
    description: '',
    envVariable: '',
    defaultValue: '',
    userViewable: true,
    userEditable: true,
    rules: 'required|string|max:20',
};

function CreateEggVariableDialog({ eggId, open, onClose }: CreateEggVariableDialogProps) {
    const createEggVariable = useCreateAdminEggVariable();

    const form = useAppForm({
        defaultValues: initialValues,
        onSubmit: async ({ value }) => {
            try {
                await createEggVariable.mutateAsync(
                    createAdminEggVariableInput(eggId, eggVariableBodyFromFormValues(value))
                );
                onClose();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

    return (
        <Dialog
            open={open}
            title='Создать переменную шаблона Egg'
            preventExternalClose={isSubmitting}
            hideCloseIcon={isSubmitting}
            onClose={onClose}
        >
            <SpinnerOverlay visible={isSubmitting} />
            <Form form={form} className='m-0'>
                <form.AppField
                    name='name'
                    validators={{
                        onChange: ({ value }) => validateVariableName(value),
                    }}
                >
                    {(field) => <field.TextField type='text' id='create_name' label='Название' />}
                </form.AppField>
                <div className='mt-6'>
                    <form.AppField name='description'>
                        {(field) => <field.TextAreaField id='create_description' label='Описание' rows={3} />}
                    </form.AppField>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
                    <form.AppField
                        name='envVariable'
                        validators={{
                            onChange: ({ value }) => validateEnvVariable(value),
                        }}
                    >
                        {(field) => <field.TextField type='text' id='create_env' label='Переменная окружения' />}
                    </form.AppField>
                    <form.AppField name='defaultValue'>
                        {(field) => <field.TextField type='text' id='create_default' label='Значение по умолчанию' />}
                    </form.AppField>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-6'>
                    <form.AppField name='userViewable'>
                        {(field) => <field.SwitchField label='Пользователи могут просматривать' />}
                    </form.AppField>
                    <form.AppField name='userEditable'>
                        {(field) => <field.SwitchField label='Пользователи могут редактировать' />}
                    </form.AppField>
                </div>
                <div className='mt-6'>
                    <form.AppField
                        name='rules'
                        validators={{
                            onChange: ({ value }) =>
                                value.length >= 1 ? undefined : 'Необходимо указать правила валидации.',
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='create_rules'
                                label='Правила ввода'
                                description='Стандартные правила валидации Laravel, используемые для проверки этой переменной.'
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='flex flex-wrap justify-end mt-6'>
                    <Button type='button' isSecondary className='w-full sm:w-auto sm:mr-2' onClick={onClose}>
                        Отмена
                    </Button>
                    <form.AppForm>
                        <form.SubmitButton className='w-full mt-4 sm:w-auto sm:mt-0'>
                            Создать переменную
                        </form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </Dialog>
    );
}

export default function CreateEggVariableButton(props: Props) {
    return (
        <Dialog.Trigger trigger={({ onClick }) => <NewButton onClick={onClick}>Новая переменная</NewButton>}>
            {({ open, onClose }) => <CreateEggVariableDialog {...props} open={open} onClose={onClose} />}
        </Dialog.Trigger>
    );
}
