import { useMemo } from 'react';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Server } from 'lucide-react';
import type { AppForm } from '@/components/form';
import { useAppForm, Form } from '@/components/form';
import { httpErrorToHuman } from '@/api/http';
import type { UserValues } from '@/api/admin/users/queries';
import { useAdminLanguages } from '@/api/admin/languages/queries';
import {
    type AdminUserWithServers,
    type AdminUserServer,
    deleteAdminUserInput,
    updateAdminUserInput,
    useAdminUserWithServers,
    useDeleteAdminUser,
    useUpdateAdminUser,
} from '@/api/admin/users/queries';
import ExtensionFormFields from '@/components/admin/extensions/ExtensionFormFields';
import { initialExtensionValues, useExtensionPayload } from '@/extensions/forms';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Icon from '@/components/elements/Icon';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import { Dialog } from '@/components/elements/dialog';
import { ServerError } from '@/components/elements/ScreenBlock';
import SubNavigation from '@/components/elements/SubNavigation';
import ResourceExtensionTabs from '@/extensions/ResourceExtensionTabs';
import {
    ExtensionResourceProvider,
    useCurrentResource,
    type ExtensionResourceContext,
} from '@/extensions/resourceContext';
import Slot from '@/extensions/Slot';
import { userDetailRoute } from '@/router/routeTree';
import { languageOptions } from '@/components/admin/languageOptions';
import {
    userFormValues,
    validateFirstName,
    validateLastName,
    validateUserEmail,
    validateUsername,
    validateUserPassword,
} from '@/components/admin/users/userForm';
import type { SelectOption } from '@/components/ui/Select';
import DataTable from '@/components/elements/table/DataTable';
import { actionsColumn, RowActions } from '@/components/elements/table/RowActions';
import ServerEditAction from '@/components/admin/servers/ServerEditAction';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { emptyCompactClass } from '@/components/ui/styles';
import { relationshipData } from '@/api/relationships';

type UserForm = AppForm<UserValues>;

const IdentityCard = ({
    form,
    languageOptions,
    languagesLoading,
}: {
    form: UserForm;
    languageOptions: SelectOption[];
    languagesLoading: boolean;
}) => (
    <TitledGreyBox title='Учётная запись'>
        <form.AppField name='email' validators={{ onChange: validateUserEmail }}>
            {(field) => (
                <field.TextField
                    type='email'
                    id='email'
                    label='Адрес электронной почты'
                    description='Адрес, по которому пользователь входит в панель и получает уведомления.'
                />
            )}
        </form.AppField>
        <div className='mt-6'>
            <form.AppField name='username' validators={{ onChange: validateUsername }}>
                {(field) => (
                    <field.TextField
                        type='text'
                        id='username'
                        label='Имя пользователя'
                        description='Уникальное имя, по которому определяется эта учётная запись.'
                    />
                )}
            </form.AppField>
        </div>
        <div className='mt-6 flex flex-wrap'>
            <div className='w-full sm:w-1/2 sm:pr-2'>
                <form.AppField name='nameFirst' validators={{ onChange: validateFirstName }}>
                    {(field) => <field.TextField type='text' id='name_first' label='Имя' />}
                </form.AppField>
            </div>
            <div className='w-full mt-6 sm:w-1/2 sm:mt-0 sm:pl-2'>
                <form.AppField name='nameLast' validators={{ onChange: validateLastName }}>
                    {(field) => <field.TextField type='text' id='name_last' label='Фамилия' />}
                </form.AppField>
            </div>
        </div>
        <div className='mt-6'>
            <form.AppField
                name='language'
                validators={{
                    onChange: ({ value }) => (value.length >= 1 ? undefined : 'Выберите язык.'),
                }}
            >
                {(field) => (
                    <field.SelectField
                        id='language'
                        label='Язык'
                        options={languageOptions}
                        disabled={languagesLoading}
                        placeholder='Выберите язык'
                        description='Язык по умолчанию для отображения панели.'
                    />
                )}
            </form.AppField>
        </div>
        <div className='mt-6'>
            <form.AppField name='rootAdmin'>
                {(field) => (
                    <field.SwitchField
                        label='Администратор'
                        description='Предоставить этой учётной записи полные административные права в панели.'
                    />
                )}
            </form.AppField>
        </div>
        <div className='flex justify-end mt-6'>
            <form.AppForm>
                <form.SubmitButton>Сохранить изменения</form.SubmitButton>
            </form.AppForm>
        </div>
    </TitledGreyBox>
);

const PasswordCard = ({ form }: { form: UserForm }) => (
    <TitledGreyBox title='Пароль'>
        <form.AppField name='password' validators={{ onChange: validateUserPassword }}>
            {(field) => (
                <field.TextField
                    type='password'
                    id='password'
                    label='Пароль'
                    description={
                        'Оставьте пустым, чтобы пароль пользователя остался прежним. Пользователь ' +
                        'не получит уведомление об изменении пароля.'
                    }
                    autoComplete='new-password'
                />
            )}
        </form.AppField>
        <div className='flex justify-end mt-6'>
            <form.AppForm>
                <form.SubmitButton>Сохранить изменения</form.SubmitButton>
            </form.AppForm>
        </div>
    </TitledGreyBox>
);

const DeleteUserCard = ({
    disabled,
    email,
    onDelete,
}: {
    disabled: boolean;
    email: string;
    onDelete: (close: () => void) => Promise<void>;
}) => (
    <TitledGreyBox title='Удаление пользователя'>
        <p className='text-sm text-muted-foreground'>
            Удалить учётную запись можно, только если к ней не привязаны серверы.
        </p>
        <div className='flex justify-end mt-6'>
            <Dialog.ConfirmTrigger
                title='Удалить пользователя'
                confirm='Удалить пользователя'
                trigger={({ onClick }) => (
                    <Button type='button' color='red' disabled={disabled} onClick={onClick}>
                        Удалить пользователя
                    </Button>
                )}
                onConfirmed={(_event, close) => onDelete(close)}
            >
                Удаление <strong>{email}</strong> необратимо. Будут удалены учётная запись и все связанные данные.
            </Dialog.ConfirmTrigger>
        </div>
    </TitledGreyBox>
);

const ownedServerColumns = [
    {
        id: 'name',
        header: 'Сервер',
        cell: ({ row }) => (
            <div className='min-w-0'>
                <Link
                    to='/panel/servers/$id'
                    params={{ id: row.original.attributes.id }}
                    className='block truncate text-sm text-foreground hover:text-accent'
                >
                    {row.original.attributes.name}
                </Link>
                <p className='mt-1 font-mono text-xs text-muted-foreground'>
                    {row.original.attributes.identifier}
                    {row.original.attributes.suspended ? (
                        <span className='ml-2 text-destructive'>заблокирован</span>
                    ) : null}
                </p>
            </div>
        ),
    },
    {
        id: 'id',
        header: 'ID',
        cell: ({ row }) => <span className='text-xs text-muted-foreground'>{row.original.attributes.id}</span>,
        meta: { headerClassName: 'w-16 text-right', cellClassName: 'w-16 text-right' },
    },
    actionsColumn<AdminUserServer>(1, (server) => (
        <RowActions>
            <ServerEditAction server={server} />
        </RowActions>
    )),
] satisfies ColumnDef<AdminUserServer>[];

const OwnedServersCard = ({ servers }: { servers: AdminUserServer[] }) => {
    const table = useReactTable({
        data: servers,
        columns: ownedServerColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (server) => server.attributes.uuid,
    });

    return (
        <TitledGreyBox title='Servers' className='mt-4'>
            <DataTable
                table={table}
                emptyState={
                    <Empty className={emptyCompactClass}>
                        <EmptyHeader>
                            <EmptyMedia variant='icon'>
                                <Server />
                            </EmptyMedia>
                            <EmptyTitle>Нет серверов</EmptyTitle>
                            <EmptyDescription>Этот пользователь не владеет ни одним сервером.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                }
            />
        </TitledGreyBox>
    );
};

const UserDetailContent = ({ user }: { user: AdminUserWithServers }) => {
    const navigate = useNavigate();
    const userId = user.attributes.id;

    const updateUser = useUpdateAdminUser();
    const deleteUser = useDeleteAdminUser();

    const { data: languages, isLoading: languagesLoading } = useAdminLanguages();
    const languagesList = languageOptions(languages, user.attributes.language);

    const { withExtensionPayload } = useExtensionPayload('admin.user');
    const form = useAppForm({
        defaultValues: userFormValues(user),
        onSubmit: async ({ value }) => {
            try {
                await updateUser.mutateAsync(updateAdminUserInput(userId, withExtensionPayload(value, user)));
                form.reset({ ...value, password: '', extensions: initialExtensionValues() });
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const onDelete = (close: () => void) =>
        deleteUser
            .mutateAsync(deleteAdminUserInput(userId, user.attributes.email))
            .then(() => navigate({ to: '/panel/users' }))
            .catch(close);

    const servers = relationshipData(user.attributes.relationships?.servers);
    const ownsServers = servers.length > 0;

    return (
        <>
            <Form form={form} className='m-0'>
                <Slot name='panel.users.detail.form' data={{ kind: 'admin.user', resource: user, form }} />
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <IdentityCard
                        form={form}
                        languageOptions={languagesList}
                        languagesLoading={languagesLoading && !languages}
                    />

                    <div className='flex flex-col gap-4'>
                        <PasswordCard form={form} />
                        <DeleteUserCard disabled={ownsServers} email={user.attributes.email} onDelete={onDelete} />
                    </div>
                </div>
                <form.AppField name='extensions'>
                    {() => (
                        <ExtensionFormFields
                            form='admin.user'
                            mode='edit'
                            resource={user}
                            error={updateUser.error}
                            boxed
                            submitLabel='Сохранить изменения'
                            className='mt-4'
                        />
                    )}
                </form.AppField>
            </Form>

            <OwnedServersCard servers={servers} />
        </>
    );
};

export function UserDetailLayout() {
    const loadedUser = userDetailRoute.useLoaderData();
    const userId = loadedUser.attributes.id;
    const { data: user = loadedUser, error } = useAdminUserWithServers(userId);

    const resourceContext = useMemo<Extract<ExtensionResourceContext, { kind: 'admin.user' }>>(
        () => ({ kind: 'admin.user', resource: user }),
        [user]
    );

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} />;
    }

    if (!user) {
        return (
            <AdminContentBlock title='Админ · Пользователь' heading='Пользователь'>
                <Spinner size='large' centered />
            </AdminContentBlock>
        );
    }

    return (
        <ExtensionResourceProvider.Provider value={resourceContext}>
            <AdminContentBlock
                title={`Админ · Пользователь · ${user.attributes.email}`}
                heading={user.attributes.email}
                description={
                    `${user.attributes.first_name ?? ''} ${user.attributes.last_name ?? ''}`.trim() ||
                    user.attributes.username
                }
            >
                <Link
                    to='/panel/users'
                    className='inline-flex items-center text-sm text-muted-foreground mb-4 hover:text-accent'
                >
                    <Icon icon={ArrowLeft} className='mr-2' />
                    К списку пользователей
                </Link>
                <Slot name='panel.users.detail.actions' data={resourceContext} />
                <SubNavigation className='mb-6 rounded-sm'>
                    <Link
                        data-core
                        to='/panel/users/$id'
                        params={{ id: user.attributes.id }}
                        activeOptions={{ exact: true, includeSearch: false }}
                    >
                        О пользователе
                    </Link>
                    <ResourceExtensionTabs parent='admin.user' basePath={`/panel/users/${user.attributes.id}`} />
                </SubNavigation>
                <Outlet />
            </AdminContentBlock>
        </ExtensionResourceProvider.Provider>
    );
}

export default function UserDetailContainer() {
    const resource = useCurrentResource();

    if (resource?.kind !== 'admin.user') {
        throw new Error('A user detail tab was rendered without its resource.');
    }

    return <UserDetailContent key={resource.resource.attributes.id} user={resource.resource} />;
}
