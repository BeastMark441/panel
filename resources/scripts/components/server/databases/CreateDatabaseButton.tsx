import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useCurrentServerUuid } from '@/api/server/queries';
import { createServerDatabaseInput, useCreateServerDatabase } from '@/api/server/databases/queries';
import Button from '@/components/elements/Button';
import { NewButton } from '@/components/elements/NewButton';
import type { WithClassname } from '@/components/types';

const validateDatabaseName = (value: string): string | undefined => {
    if (value.length < 1) {
        return 'Укажите название базы данных.';
    }

    if (value.length < 3) {
        return 'Название базы данных должно быть не короче 3 символов.';
    }

    if (value.length > 48) {
        return 'Название базы данных не должно превышать 48 символов.';
    }

    if (!/^[\w\-.]{3,48}$/.test(value)) {
        return 'Название базы данных может содержать только буквы, цифры, подчёркивания, дефисы и (или) точки.';
    }

    return undefined;
};

const CreateDatabaseDialogContent = ({ onClose }: { onClose: () => void }) => {
    const uuid = useCurrentServerUuid()!;
    const createDatabase = useCreateServerDatabase();

    const form = useAppForm({
        defaultValues: { databaseName: '', connectionsFrom: '' },
        onSubmit: async ({ value }) => {
            try {
                await createDatabase.mutateAsync(
                    createServerDatabaseInput(uuid, {
                        databaseName: value.databaseName,
                        connectionsFrom: value.connectionsFrom || '%',
                    })
                );
                onClose();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting) || createDatabase.isPending;

    return (
        <Dialog
            open
            title='Создание новой базы данных'
            preventExternalClose={isSubmitting}
            hideCloseIcon={isSubmitting}
            onClose={() => {
                form.reset();
                onClose();
            }}
        >
            <SpinnerOverlay visible={isSubmitting} />
            <Form form={form} className='m-0'>
                <form.AppField
                    name='databaseName'
                    validators={{
                        onChange: ({ value }) => validateDatabaseName(value),
                    }}
                >
                    {(field) => (
                        <field.TextField
                            type='string'
                            id='database_name'
                            label='Название базы данных'
                            description='Понятное название вашей базы данных.'
                        />
                    )}
                </form.AppField>
                <div className='mt-6'>
                    <form.AppField
                        name='connectionsFrom'
                        validators={{
                            onChange: ({ value }) =>
                                /^[\w\-/.%:]*$/.test(value) ? undefined : 'Укажите корректный адрес хоста.',
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                type='string'
                                id='connections_from'
                                label='Соединения с'
                                description='Откуда разрешать соединения. Оставьте поле пустым, чтобы разрешать соединения с любого адреса.'
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
                            Создать базу данных
                        </form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </Dialog>
    );
};

const CreateDatabaseButton = ({ className }: WithClassname) => (
    <Dialog.Trigger
        trigger={({ onClick }) => (
            <NewButton className={className} onClick={onClick}>
                Новая база данных
            </NewButton>
        )}
    >
        {({ open, onClose }) => open && <CreateDatabaseDialogContent onClose={onClose} />}
    </Dialog.Trigger>
);

export default CreateDatabaseButton;
