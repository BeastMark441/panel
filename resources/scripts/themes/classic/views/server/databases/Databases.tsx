import { useMemo } from 'react';
import { Database, Eye } from 'lucide-react';
import {
    actionsColumn,
    Button,
    CopyOnClick,
    DeleteAction,
    Dialog,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    Form,
    Input,
    Label,
    ListToolbar,
    NewButton,
    RowActionButton,
    RowActions,
    SecretInput,
    Spinner,
    SpinnerOverlay,
    Table,
    useAppForm,
    type TableColumn,
} from '@/sdk';
import type { ServerDatabaseItem, ServerDatabasesModel, ViewProps } from '@/sdk/theme';

interface DatabaseDialogProps {
    model: ServerDatabasesModel;
    database: ServerDatabaseItem;
    open: boolean;
    onClose: () => void;
}

function CreateDatabaseDialog({ model, onClose }: { model: ServerDatabasesModel; onClose: () => void }) {
    const form = useAppForm({
        defaultValues: { databaseName: '', connectionsFrom: '' },
        onSubmit: async ({ value }) => {
            try {
                await model.actions.create({ name: value.databaseName, connectionsFrom: value.connectionsFrom });
                onClose();
            } catch {
                // The failure has already been reported.
            }
        },
    });

    return (
        <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
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
                            validators={{ onChange: ({ value }) => model.validate.name(value) }}
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
                                validators={{ onChange: ({ value }) => model.validate.connectionsFrom(value) }}
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
            )}
        </form.Subscribe>
    );
}

const CreateDatabaseButton = ({ model }: { model: ServerDatabasesModel }) => (
    <Dialog.Trigger trigger={({ onClick }) => <NewButton onClick={onClick}>Новая база данных</NewButton>}>
        {({ open, onClose }) => open && <CreateDatabaseDialog model={model} onClose={onClose} />}
    </Dialog.Trigger>
);

function DeleteDatabaseDialog({ model, database, open, onClose }: DatabaseDialogProps) {
    const form = useAppForm({
        defaultValues: { confirm: '' },
        onSubmit: async () => {
            try {
                await model.actions.remove(database.id);
                onClose();
                form.reset();
            } catch {
                // The failure has already been reported.
            }
        },
    });
    const close = () => {
        onClose();
        form.reset();
    };

    return (
        <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
                <Dialog
                    open={open}
                    title='Подтверждение удаления базы данных'
                    preventExternalClose={isSubmitting}
                    hideCloseIcon={isSubmitting}
                    onClose={close}
                >
                    <SpinnerOverlay visible={isSubmitting} />
                    <p className='text-sm'>
                        Удаление базы данных необратимо. Будут удалены <strong>{database.name}</strong> и все связанные
                        данные.
                    </p>
                    <Form form={form} className='m-0 mt-6'>
                        <form.AppField
                            name='confirm'
                            validators={{
                                onChange: ({ value }) =>
                                    value === database.name || value === database.shortName
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
            )}
        </form.Subscribe>
    );
}

function ConnectionDialog({ model, database, open, onClose }: DatabaseDialogProps) {
    return (
        <Dialog open={open} title='Данные подключения к базе данных' onClose={onClose}>
            <div>
                <Label>Адрес</Label>
                <CopyOnClick text={database.endpoint}>
                    <Input type='text' readOnly value={database.endpoint} />
                </CopyOnClick>
            </div>
            <div className='mt-6'>
                <Label>Соединения с</Label>
                <Input type='text' readOnly value={database.connectionsFrom} />
            </div>
            <div className='mt-6'>
                <Label>Имя пользователя</Label>
                <CopyOnClick text={database.username}>
                    <Input type='text' readOnly value={database.username} />
                </CopyOnClick>
            </div>
            {model.permissions.viewPassword && (
                <div className='mt-6'>
                    <Label>Пароль</Label>
                    <SecretInput value={database.password} label='Пароль' />
                </div>
            )}
            <div className='mt-6'>
                <Label>JDBC-строка подключения</Label>
                <CopyOnClick text={database.jdbc} showInNotification={false}>
                    <Input type='text' readOnly value={database.jdbc} />
                </CopyOnClick>
            </div>
            <div className='mt-6 flex justify-end gap-2'>
                {model.permissions.update && (
                    <Button
                        isSecondary
                        color='primary'
                        className='mr-2'
                        onClick={() => void model.actions.rotatePassword(database.id).catch(() => {})}
                        isLoading={model.rotating.includes(database.id)}
                    >
                        Сменить пароль
                    </Button>
                )}
                <Button isSecondary onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </Dialog>
    );
}

function DatabaseActions({ model, database }: { model: ServerDatabasesModel; database: ServerDatabaseItem }) {
    return (
        <RowActions>
            <Dialog.Trigger
                trigger={({ onClick }) => (
                    <RowActionButton
                        icon={Eye}
                        label='Данные подключения'
                        aria-label={`Данные подключения ${database.name}`}
                        onClick={onClick}
                    />
                )}
            >
                {({ open, onClose }) => (
                    <ConnectionDialog model={model} database={database} open={open} onClose={onClose} />
                )}
            </Dialog.Trigger>
            {model.permissions.delete && (
                <Dialog.Trigger
                    trigger={({ onClick }) => (
                        <DeleteAction aria-label={`Удалить ${database.name}`} onClick={onClick} />
                    )}
                >
                    {({ open, onClose }) => (
                        <DeleteDatabaseDialog model={model} database={database} open={open} onClose={onClose} />
                    )}
                </Dialog.Trigger>
            )}
        </RowActions>
    );
}

function databaseColumns(model: ServerDatabasesModel): TableColumn<ServerDatabaseItem>[] {
    return [
        {
            id: 'name',
            label: 'База данных',
            sortValue: (database) => database.name,
            cell: (database) => (
                <CopyOnClick text={database.name}>
                    <span className='font-medium'>{database.name}</span>
                </CopyOnClick>
            ),
        },
        {
            id: 'endpoint',
            label: 'Адрес',
            sortValue: (database) => database.endpoint,
            cell: (database) => (
                <CopyOnClick text={database.endpoint}>
                    <code className='whitespace-nowrap text-xs'>{database.endpoint}</code>
                </CopyOnClick>
            ),
            headerClassName: 'hidden md:table-cell',
            cellClassName: 'hidden md:table-cell',
        },
        {
            id: 'connections_from',
            label: 'Соединения с',
            sortValue: (database) => database.connectionsFrom,
            cell: (database) => database.connectionsFrom,
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell',
        },
        {
            id: 'username',
            label: 'Имя пользователя',
            sortValue: (database) => database.username,
            cell: (database) => (
                <CopyOnClick text={database.username}>
                    <code className='text-xs'>{database.username}</code>
                </CopyOnClick>
            ),
            headerClassName: 'hidden xl:table-cell',
            cellClassName: 'hidden xl:table-cell',
        },
        actionsColumn(2, (database) => <DatabaseActions model={model} database={database} />),
    ];
}

const EmptyState = ({ model }: { model: ServerDatabasesModel }) => (
    <Empty size='compact'>
        <EmptyHeader>
            <EmptyMedia variant='icon'>
                <Database />
            </EmptyMedia>
            <EmptyTitle>Нет баз данных</EmptyTitle>
            <EmptyDescription>
                {model.limit > 0
                    ? 'У этого сервера пока нет баз данных.'
                    : 'Создать базы данных нельзя, так как лимит для этого сервера равен 0.'}
            </EmptyDescription>
        </EmptyHeader>
        {model.canCreate && (
            <EmptyContent>
                <CreateDatabaseButton model={model} />
            </EmptyContent>
        )}
    </Empty>
);

export default function Databases({ model, className }: ViewProps<'server.databases'>) {
    const columns = useMemo(() => databaseColumns(model), [model]);
    const count = model.databases.length;
    const usage =
        model.permissions.create && model.limit > 0 && count > 0
            ? `Для этого сервера выделено ${count} из ${model.limit} баз данных.`
            : null;

    if (model.loading) {
        return (
            <div className={className}>
                <Spinner size='large' centered />
            </div>
        );
    }

    return (
        <div className={className}>
            {(usage || model.canCreate) && (
                <ListToolbar summary={usage}>{model.canCreate && <CreateDatabaseButton model={model} />}</ListToolbar>
            )}
            <Table
                rows={model.databases}
                columns={columns}
                keyOf={(database) => database.id}
                emptyState={<EmptyState model={model} />}
            />
        </div>
    );
}
