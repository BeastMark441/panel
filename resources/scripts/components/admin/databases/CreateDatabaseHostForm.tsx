import { useStore } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { createAdminDatabaseHostInput, useCreateAdminDatabaseHost } from '@/api/admin/database-hosts/queries';
import {
    databaseHostBodyFromFormValues,
    databaseHostValidators,
    newDatabaseHostFormValues,
} from '@/components/admin/databases/databaseHostForm';
import DatabaseHostNodeSelect from '@/components/admin/databases/DatabaseHostNodeSelect';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import ExtensionFormFields from '@/components/admin/extensions/ExtensionFormFields';
import { useExtensionPayload } from '@/extensions/forms';
import Icon from '@/components/elements/Icon';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { useAppForm, Form } from '@/components/form';

export default function CreateDatabaseHostForm() {
    const navigate = useNavigate();
    const createDatabaseHost = useCreateAdminDatabaseHost();

    const { withExtensionPayload } = useExtensionPayload('admin.database_host');
    const form = useAppForm({
        defaultValues: newDatabaseHostFormValues(),
        onSubmit: async ({ value }) => {
            try {
                const host = await createDatabaseHost.mutateAsync(
                    createAdminDatabaseHostInput(databaseHostBodyFromFormValues(withExtensionPayload(value)))
                );

                void navigate({ to: '/panel/databases/$id', params: { id: host.attributes.id } });
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const nodeId = useStore(form.store, (state) => state.values.nodeId);

    return (
        <AdminContentBlock
            title='Админ · Создание хоста баз данных'
            heading='Создание хоста баз данных'
            description='Добавьте хост, на котором будут создаваться базы данных серверов.'
        >
            <Link
                to='/panel/databases'
                className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
            >
                <Icon icon={ArrowLeft} className='mr-2' />
                К списку хостов баз данных
            </Link>
            <Form form={form}>
                <div className='space-y-6'>
                    <TitledGreyBox title='Сведения о хосте'>
                        <div className='space-y-6'>
                            <form.AppField name='name' validators={databaseHostValidators.name}>
                                {(field) => (
                                    <field.TextField
                                        type='text'
                                        id='name'
                                        label='Название'
                                        description='Короткое легко читаемое название, по которому будет идентифицироваться этот хост.'
                                    />
                                )}
                            </form.AppField>
                            <div className='grid grid-cols-1 sm:grid-cols-[1fr_8rem] gap-6'>
                                <form.AppField name='host' validators={databaseHostValidators.host}>
                                    {(field) => (
                                        <field.TextField
                                            type='text'
                                            id='host'
                                            label='Хост'
                                            description='Имя хоста или IP-адрес, по которому доступен этот сервер баз данных.'
                                        />
                                    )}
                                </form.AppField>
                                <form.AppField name='port' validators={databaseHostValidators.port}>
                                    {(field) => <field.NumberField id='port' label='Порт' />}
                                </form.AppField>
                            </div>
                            <DatabaseHostNodeSelect
                                id='nodeId'
                                value={nodeId}
                                onChange={(value) => form.setFieldValue('nodeId', value)}
                            />
                        </div>
                    </TitledGreyBox>
                    <TitledGreyBox title='Учётные данные'>
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
                            <form.AppField name='password' validators={databaseHostValidators.requiredPassword}>
                                {(field) => (
                                    <field.TextField
                                        type='password'
                                        id='password'
                                        label='Пароль'
                                        description='Пароль учётной записи, используемой для подключения к этому хосту.'
                                    />
                                )}
                            </form.AppField>
                        </div>
                    </TitledGreyBox>
                    <form.AppField name='extensions'>
                        {() => (
                            <ExtensionFormFields
                                form='admin.database_host'
                                mode='create'
                                error={createDatabaseHost.error}
                                boxed
                            />
                        )}
                    </form.AppField>
                    <div className='flex justify-end'>
                        <form.AppForm>
                            <form.SubmitButton>Создать хост</form.SubmitButton>
                        </form.AppForm>
                    </div>
                </div>
            </Form>
        </AdminContentBlock>
    );
}
