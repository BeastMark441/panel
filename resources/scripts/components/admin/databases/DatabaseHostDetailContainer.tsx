import { useMemo } from 'react';
import { useStore } from '@tanstack/react-form';
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Database, Trash2 } from 'lucide-react';
import { useAppForm, Form } from '@/components/form';
import { httpErrorToHuman } from '@/api/http';
import {
    type AdminDatabaseHost,
    deleteAdminDatabaseHostInput,
    updateAdminDatabaseHostInput,
    useAdminDatabaseHost,
    useAdminDatabaseHostDatabases,
    useDeleteAdminDatabaseHost,
    useUpdateAdminDatabaseHost,
} from '@/api/admin/database-hosts/queries';
import {
    databaseHostBodyFromFormValues,
    databaseHostFormValues,
    databaseHostValidators,
} from '@/components/admin/databases/databaseHostForm';
import DatabaseHostNodeSelect from '@/components/admin/databases/DatabaseHostNodeSelect';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import ExtensionFormFields from '@/components/admin/extensions/ExtensionFormFields';
import { useExtensionPayload } from '@/extensions/forms';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Icon from '@/components/elements/Icon';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import DataTable from '@/components/elements/table/DataTable';
import DataTablePagination from '@/components/elements/table/DataTablePagination';
import { Dialog } from '@/components/elements/dialog';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ServerError } from '@/components/elements/ScreenBlock';
import { getPageSearch, usePageSearch } from '@/router/search';
import { databaseHostDetailRoute } from '@/router/routeTree';
import { relationshipAttributes } from '@/api/relationships';

function DatabaseHostDetailForm({ host }: { host: AdminDatabaseHost }) {
    const navigate = useNavigate();
    const updateDatabaseHost = useUpdateAdminDatabaseHost();
    const deleteDatabaseHost = useDeleteAdminDatabaseHost();

    const { withExtensionPayload } = useExtensionPayload('admin.database_host');
    const form = useAppForm({
        defaultValues: databaseHostFormValues(host),
        onSubmit: async ({ value }) => {
            try {
                const updated = await updateDatabaseHost.mutateAsync(
                    updateAdminDatabaseHostInput(
                        host.attributes.id,
                        databaseHostBodyFromFormValues(withExtensionPayload(value, host))
                    )
                );

                form.reset(databaseHostFormValues(updated));
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const nodeId = useStore(form.store, (state) => state.values.nodeId);

    const onDelete = (close: () => void) => {
        deleteDatabaseHost
            .mutateAsync(deleteAdminDatabaseHostInput(host.attributes.id, host.attributes.name))
            .then(() => navigate({ to: '/panel/databases' }))
            .catch(close);
    };

    return (
        <Form form={form} className='m-0'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <TitledGreyBox title='Данные хоста'>
                    <form.AppField name='name' validators={databaseHostValidators.name}>
                        {(field) => <field.TextField type='text' id='name' label='Название' />}
                    </form.AppField>
                    <div className='mt-6'>
                        <form.AppField name='host' validators={databaseHostValidators.host}>
                            {(field) => (
                                <field.TextField
                                    type='text'
                                    id='host'
                                    label='Хост'
                                    description='IP-адрес или FQDN, используемый при подключении Панели к этому хосту MySQL.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='port' validators={databaseHostValidators.port}>
                            {(field) => <field.NumberField id='port' label='Порт' />}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <DatabaseHostNodeSelect
                            id='nodeId'
                            value={nodeId}
                            onChange={(value) => form.setFieldValue('nodeId', value)}
                        />
                    </div>
                    <div className='mt-6 text-sm text-muted-foreground'>
                        <p>Баз данных: {host.attributes.databases_count}</p>
                        <p>
                            {(() => {
                                const node = relationshipAttributes(host.attributes.relationships?.node);

                                return node === undefined ? 'Глобальный хост' : `Связан с узлом ${node.name}`;
                            })()}
                        </p>
                    </div>
                </TitledGreyBox>

                <TitledGreyBox title='Данные пользователя'>
                    <form.AppField name='username' validators={databaseHostValidators.username}>
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='username'
                                label='Имя пользователя'
                                description='Пользователь сервера баз данных, имеющий право создавать пользователей и базы данных.'
                            />
                        )}
                    </form.AppField>
                    <div className='mt-6'>
                        <form.AppField name='password'>
                            {(field) => (
                                <field.TextField
                                    type='password'
                                    id='password'
                                    label='Пароль'
                                    description='Оставьте поле пустым, чтобы сохранить текущий пароль.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <p className='text-sm text-destructive mt-6'>
                        Настроенная учетная запись должна обладать правом WITH GRANT OPTION; также не следует
                        использовать для нее те же учетные данные, что и для базы данных панели.
                    </p>
                    <div className='flex justify-end mt-6'>
                        <Dialog.ConfirmTrigger
                            title='Удалить хост базы данных'
                            confirm='Удалить хост'
                            pending={deleteDatabaseHost.isPending}
                            trigger={({ onClick }) => (
                                <Button type='button' color='red' isSecondary className='mr-2' onClick={onClick}>
                                    <Icon icon={Trash2} />
                                    Удалить хост
                                </Button>
                            )}
                            onConfirmed={(_event, close) => onDelete(close)}
                        >
                            Удаление <strong>{host.attributes.name}</strong> необратимо. Хосты, с которыми связаны базы
                            данных, удалить нельзя.
                        </Dialog.ConfirmTrigger>
                        <form.AppForm>
                            <form.SubmitButton>Сохранить Изменения</form.SubmitButton>
                        </form.AppForm>
                    </div>
                </TitledGreyBox>
            </div>
            <form.AppField name='extensions'>
                {() => (
                    <ExtensionFormFields
                        form='admin.database_host'
                        mode='edit'
                        resource={host}
                        error={updateDatabaseHost.error}
                        boxed
                        submitLabel='Сохранить Изменения'
                        className='mt-4'
                    />
                )}
            </form.AppField>
        </Form>
    );
}

function DatabaseHostDatabases({ hostId }: { hostId: number }) {
    const navigate = useNavigate();
    const page = usePageSearch();

    const { data: databases, isFetching } = useAdminDatabaseHostDatabases(hostId, page);
    const pagination = {
        pageIndex: Math.max(page - 1, 0),
        pageSize: databases?.meta.pagination.per_page ?? 50,
    };
    const data = useMemo(() => databases?.data ?? [], [databases?.data]);
    const columns = useMemo(
        () =>
            [
                {
                    id: 'server',
                    header: 'Сервер',
                    cell: ({ row }) => (
                        <Link
                            to='/panel/servers/$id/database'
                            params={{ id: row.original.attributes.server.id }}
                            className='block truncate text-sm text-foreground hover:text-accent'
                        >
                            {row.original.attributes.server.name}
                        </Link>
                    ),
                },
                {
                    id: 'database',
                    header: 'База данных',
                    cell: ({ row }) => (
                        <span className='block truncate font-mono text-xs'>{row.original.attributes.name}</span>
                    ),
                    meta: { headerClassName: 'hidden sm:table-cell', cellClassName: 'hidden sm:table-cell' },
                },
                {
                    id: 'username',
                    header: 'Имя пользователя',
                    cell: ({ row }) => <span className='text-xs'>{row.original.attributes.username}</span>,
                    meta: { headerClassName: 'hidden md:table-cell', cellClassName: 'hidden md:table-cell' },
                },
                {
                    id: 'connections',
                    header: 'Макс. соединений',
                    cell: ({ row }) => (
                        <span className='text-xs text-muted-foreground'>
                            {row.original.attributes.max_connections ?? 'Без ограничений'}
                        </span>
                    ),
                    meta: { headerClassName: 'w-28 text-right', cellClassName: 'w-28 text-right' },
                },
            ] satisfies ColumnDef<NonNullable<typeof databases>['data'][number]>[],
        []
    );
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (database) => `${database.attributes.server.id}:${database.attributes.name}`,
        manualPagination: true,
        rowCount: databases?.meta.pagination.total ?? 0,
        state: { pagination },
        onPaginationChange: (updater) => {
            const next = updater instanceof Function ? updater(pagination) : updater;

            if (next.pageIndex !== pagination.pageIndex) {
                void navigate({
                    to: '/panel/databases/$id',
                    params: { id: hostId },
                    search: getPageSearch(next.pageIndex + 1),
                    replace: true,
                    viewTransition: false,
                });
            }
        },
    });

    return (
        <TitledGreyBox title='База данных' className='mt-4'>
            {databases ? (
                <>
                    <DataTable
                        table={table}
                        isFetching={isFetching}
                        emptyState={
                            <Empty size='compact'>
                                <EmptyHeader>
                                    <EmptyMedia variant='icon'>
                                        <Database />
                                    </EmptyMedia>
                                    <EmptyTitle>Нет баз данных</EmptyTitle>
                                    <EmptyDescription>
                                        Здесь будут отображаться базы данных, созданные для серверов на этом хосте.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        }
                    />
                    <DataTablePagination
                        table={table}
                        total={databases.meta.pagination.total}
                        count={databases.meta.pagination.count}
                        itemLabel='Базы данных'
                    />
                </>
            ) : (
                <Spinner size='small' centered />
            )}
        </TitledGreyBox>
    );
}

export default function DatabaseHostDetailContainer() {
    const loadedHost = databaseHostDetailRoute.useLoaderData();
    const hostId = loadedHost.attributes.id;

    const { data: host = loadedHost, error } = useAdminDatabaseHost(hostId);

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} />;
    }

    if (!host) {
        return (
            <AdminContentBlock title='Админ · Хост баз данных' heading='Хост баз данных'>
                <Spinner size='large' centered />
            </AdminContentBlock>
        );
    }

    return (
        <AdminContentBlock
            title={`Админ · Хост баз данных · ${host.attributes.name}`}
            heading={host.attributes.name}
            description={`${host.attributes.username}@${host.attributes.host}:${host.attributes.port}`}
        >
            <Link
                to='/panel/databases'
                className='inline-flex items-center text-sm text-muted-foreground hover:text-accent mb-4'
            >
                <Icon icon={ArrowLeft} className='mr-2' />
                К списку хостов баз данных
            </Link>

            <DatabaseHostDetailForm key={`${host.attributes.id}:${host.attributes.updated_at}`} host={host} />
            <DatabaseHostDatabases hostId={host.attributes.id} />
        </AdminContentBlock>
    );
}
