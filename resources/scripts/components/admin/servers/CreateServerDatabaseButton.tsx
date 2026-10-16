import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import { createAdminServerDatabaseInput, useCreateAdminServerDatabase } from '@/api/admin/servers/queries';
import { createServerDatabaseBodyFromFormValues } from '@/components/admin/servers/helpers';
import { useAllAdminDatabaseHosts } from '@/api/admin/database-hosts/queries';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Button from '@/components/elements/Button';
import { NewButton } from '@/components/elements/NewButton';

interface Props {
    serverId: number;
}

type CreateServerDatabaseDialogProps = Props & {
    open: boolean;
    onClose: () => void;
};

const validateDatabaseName = ({ value }: { value: string }): string | undefined => {
    if (value.length < 1) {
        return 'Укажите имя базы данных.';
    }

    if (value.length > 48) {
        return 'Имя базы данных не должно превышать 48 символов.';
    }

    return undefined;
};

function CreateServerDatabaseDialog({ serverId, open, onClose }: CreateServerDatabaseDialogProps) {
    const createDatabase = useCreateAdminServerDatabase();

    const { data: hosts = [] } = useAllAdminDatabaseHosts({ enabled: open });

    const form = useAppForm({
        defaultValues: { databaseName: '', connectionsFrom: '', databaseHostId: 0, maxConnections: '' },
        onSubmit: async ({ value }) => {
            try {
                await createDatabase.mutateAsync(
                    createAdminServerDatabaseInput(
                        serverId,
                        createServerDatabaseBodyFromFormValues({
                            databaseName: value.databaseName,
                            connectionsFrom: value.connectionsFrom || '%',
                            databaseHostId: Number(value.databaseHostId),
                            maxConnections: value.maxConnections === '' ? null : Number(value.maxConnections),
                        })
                    )
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
            title='Создание новой базы данных'
            preventExternalClose={isSubmitting}
            hideCloseIcon={isSubmitting}
            onClose={onClose}
        >
            <SpinnerOverlay visible={isSubmitting} />
            <Form form={form} className='m-0'>
                <form.AppField name='databaseName' validators={{ onChange: validateDatabaseName }}>
                    {(field) => (
                        <field.TextField
                            type='text'
                            id='database_name'
                            label='Имя базы данных'
                            description='Описательное имя этого экземпляра базы данных.'
                        />
                    )}
                </form.AppField>
                <div className='mt-6'>
                    <form.AppField name='databaseHostId'>
                        {(field) => (
                            <field.SelectField
                                id='database_host_id'
                                label='Хост базы данных'
                                description='Хост, на котором будет создана эта база данных.'
                                options={[
                                    { value: 0, label: 'Выберите хост базы данных...', disabled: true },
                                    ...hosts.map((host) => ({
                                        value: host.attributes.id,
                                        label: `${host.attributes.name} (${host.attributes.host}:${host.attributes.port})`,
                                    })),
                                ]}
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-6'>
                    <form.AppField name='connectionsFrom'>
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='connections_from'
                                label='Соединения с'
                                description={
                                    'Откуда разрешены подключения. Оставьте пустым, чтобы разрешать ' +
                                    'подключения отовсюду.'
                                }
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-6'>
                    <form.AppField name='maxConnections'>
                        {(field) => (
                            <field.TextField
                                type='number'
                                min={0}
                                id='max_connections'
                                label='Максимум соединений'
                                description='Максимальное количество одновременных соединений для этого пользователя базы данных.'
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
}

export default function CreateServerDatabaseButton(props: Props) {
    return (
        <Dialog.Trigger trigger={({ onClick }) => <NewButton onClick={onClick}>Новая база данных</NewButton>}>
            {({ open, onClose }) => <CreateServerDatabaseDialog {...props} open={open} onClose={onClose} />}
        </Dialog.Trigger>
    );
}
