import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useStore } from '@tanstack/react-form';
import {
    deleteServerDatabaseInput,
    type ServerDatabase,
    useDeleteServerDatabase,
} from '@/api/server/databases/queries';
import { useCurrentServerUuid } from '@/api/server/queries';
import Button from '@/components/elements/Button';
import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Label from '@/components/elements/Label';
import SecretInput from '@/components/elements/SecretInput';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import DataTableColumnHeader from '@/components/elements/table/DataTableColumnHeader';
import { actionsColumn, DeleteAction, RowActionButton, RowActions } from '@/components/elements/table/RowActions';
import { Dialog } from '@/components/elements/dialog';
import { Form, useAppForm } from '@/components/form';
import { TextInput } from '@/components/form/controls';
import RotatePasswordButton from '@/components/server/databases/RotatePasswordButton';
import { jdbcConnectionString, serverDatabaseShortName } from '@/lib/databases';
import { relationshipAttributes } from '@/api/relationships';

function DeleteDatabaseDialog({
    database,
    open,
    onClose,
}: {
    database: ServerDatabase;
    open: boolean;
    onClose: () => void;
}) {
    const uuid = useCurrentServerUuid()!;
    const deleteDatabase = useDeleteServerDatabase();
    const { attributes } = database;
    const form = useAppForm({
        defaultValues: { confirm: '' },
        onSubmit: async () => {
            try {
                await deleteDatabase.mutateAsync(deleteServerDatabaseInput(uuid, database));
                onClose();
                form.reset();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });
    const isSubmitting = useStore(form.store, (state) => state.isSubmitting) || deleteDatabase.isPending;
    const close = () => {
        onClose();
        form.reset();
    };

    return (
        <Dialog
            open={open}
            title='Подтверждение удаления базы данных'
            preventExternalClose={isSubmitting}
            hideCloseIcon={isSubmitting}
            onClose={close}
        >
            <SpinnerOverlay visible={isSubmitting} />
            <p className='text-sm'>
                Удаление базы данных необратимо. Будут удалены <strong>{attributes.name}</strong> и все связанные
                данные.
            </p>
            <Form form={form} className='m-0 mt-6'>
                <form.AppField
                    name='confirm'
                    validators={{
                        onChange: ({ value }) =>
                            value === attributes.name || value === serverDatabaseShortName(attributes.name)
                                ? undefined
                                : 'Укажите название базы данных.',
                    }}
                >
                    {(field) => (
                        <field.TextField
                            type='text'
                            id='confirm_name'
                            label='Название базы данных для подтверждения'
                            description='Введите название базы данных, чтобы подтвердить удаление.'
                        />
                    )}
                </form.AppField>
                <div className='mt-6 text-right'>
                    <Button type='button' isSecondary className='mr-2' onClick={close}>
                        Отмена
                    </Button>
                    <form.AppForm>
                        <form.SubmitButton color='red'>Удалить базу данных</form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </Dialog>
    );
}

function DatabaseConnectionDialog({
    database,
    open,
    onClose,
}: {
    database: ServerDatabase;
    open: boolean;
    onClose: () => void;
}) {
    const { attributes } = database;
    const connectionString = `${attributes.host.address}:${attributes.host.port}`;
    const password = relationshipAttributes(attributes.relationships?.password)?.password;
    const jdbcConnection = jdbcConnectionString({
        connectionString,
        name: attributes.name,
        password,
        username: attributes.username,
    });

    return (
        <Dialog open={open} title='Данные подключения к базе данных' onClose={onClose}>
            <div>
                <Label>Адрес</Label>
                <CopyOnClick text={connectionString}>
                    <TextInput type='text' readOnly value={connectionString} />
                </CopyOnClick>
            </div>
            <div className='mt-6'>
                <Label>Соединения с</Label>
                <TextInput type='text' readOnly value={attributes.connections_from} />
            </div>
            <div className='mt-6'>
                <Label>Имя пользователя</Label>
                <CopyOnClick text={attributes.username}>
                    <TextInput type='text' readOnly value={attributes.username} />
                </CopyOnClick>
            </div>
            <Can action='database.view_password'>
                <div className='mt-6'>
                    <Label>Пароль</Label>
                    <SecretInput value={password} label='Пароль' />
                </div>
            </Can>
            <div className='mt-6'>
                <Label>JDBC-строка подключения</Label>
                <CopyOnClick text={jdbcConnection} showInNotification={false}>
                    <TextInput type='text' readOnly value={jdbcConnection} />
                </CopyOnClick>
            </div>
            <div className='mt-6 flex justify-end gap-2'>
                <Can action='database.update'>
                    <RotatePasswordButton databaseId={attributes.id} />
                </Can>
                <Button isSecondary onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </Dialog>
    );
}

const DatabaseActions = ({ database }: { database: ServerDatabase }) => (
    <RowActions>
        <Dialog.Trigger
            trigger={({ onClick }) => (
                <RowActionButton
                    icon={Eye}
                    label='Данные подключения'
                    aria-label={`Данные подключения ${database.attributes.name}`}
                    onClick={onClick}
                />
            )}
        >
            {({ open, onClose }) => <DatabaseConnectionDialog database={database} open={open} onClose={onClose} />}
        </Dialog.Trigger>
        <Can action='database.delete'>
            <Dialog.Trigger
                trigger={({ onClick }) => (
                    <DeleteAction aria-label={`Удалить ${database.attributes.name}`} onClick={onClick} />
                )}
            >
                {({ open, onClose }) => <DeleteDatabaseDialog database={database} open={open} onClose={onClose} />}
            </Dialog.Trigger>
        </Can>
    </RowActions>
);

export const databaseColumns: ColumnDef<ServerDatabase>[] = [
    {
        id: 'name',
        accessorFn: (database) => database.attributes.name,
        header: ({ column }) => <DataTableColumnHeader column={column} title='База данных' />,
        cell: ({ row }) => (
            <CopyOnClick text={row.original.attributes.name}>
                <span className='font-medium'>{row.original.attributes.name}</span>
            </CopyOnClick>
        ),
    },
    {
        id: 'endpoint',
        accessorFn: (database) => `${database.attributes.host.address}:${database.attributes.host.port}`,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Адрес' />,
        cell: ({ getValue }) => (
            <CopyOnClick text={getValue<string>()}>
                <code className='whitespace-nowrap text-xs'>{getValue<string>()}</code>
            </CopyOnClick>
        ),
        meta: { headerClassName: 'hidden md:table-cell', cellClassName: 'hidden md:table-cell' },
    },
    {
        id: 'connections_from',
        accessorFn: (database) => database.attributes.connections_from,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Соединения с' />,
        meta: { headerClassName: 'hidden lg:table-cell', cellClassName: 'hidden lg:table-cell' },
    },
    {
        id: 'username',
        accessorFn: (database) => database.attributes.username,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Имя пользователя' />,
        cell: ({ getValue }) => (
            <CopyOnClick text={getValue<string>()}>
                <code className='text-xs'>{getValue<string>()}</code>
            </CopyOnClick>
        ),
        meta: { headerClassName: 'hidden xl:table-cell', cellClassName: 'hidden xl:table-cell' },
    },
    actionsColumn<ServerDatabase>(2, (database) => <DatabaseActions database={database} />),
];
