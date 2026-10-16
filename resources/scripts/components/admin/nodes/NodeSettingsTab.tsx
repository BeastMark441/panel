import { useAppForm, Form } from '@/components/form';
import { type AdminNode, updateAdminNodeInput, useUpdateAdminNode } from '@/api/admin/nodes/queries';
import { useAllAdminLocations } from '@/api/admin/locations/queries';
import {
    type NodeFormValues,
    nodeFormValues,
    nodeNumberValidators,
    nodeValuesFromForm,
    validateNodeName,
} from '@/components/admin/nodes/nodeForm';
import { useNodeDetail } from '@/components/admin/nodes/useNodeDetail';
import ExtensionFormFields from '@/components/admin/extensions/ExtensionFormFields';
import { initialExtensionValues, useExtensionPayload } from '@/extensions/forms';
import TitledGreyBox from '@/components/elements/TitledGreyBox';

interface Values extends NodeFormValues {
    resetSecret: boolean;
}

const nodeToValues = (node: AdminNode): Values => ({ ...nodeFormValues(node), resetSecret: false });

const NodeSettingsForm = () => {
    const { node } = useNodeDetail();
    const updateNode = useUpdateAdminNode();

    const { data: locations = [] } = useAllAdminLocations();

    const { withExtensionPayload } = useExtensionPayload('admin.node');
    const form = useAppForm({
        defaultValues: nodeToValues(node),
        onSubmit: async ({ value }) => {
            const { resetSecret, ...values } = value;

            try {
                await updateNode.mutateAsync(
                    updateAdminNodeInput(
                        node.attributes.id,
                        nodeValuesFromForm(withExtensionPayload(values, node)),
                        resetSecret
                    )
                );
                form.setFieldValue('resetSecret', false);
                form.setFieldValue('extensions', initialExtensionValues());
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    return (
        <Form form={form}>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <TitledGreyBox title='Настройки'>
                    <form.AppField
                        name='name'
                        validators={{
                            onChange: ({ value }) => validateNodeName(value),
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='name'
                                label='Имя узла'
                                description='Короткий идентификатор для различения этого узла с другими.'
                            />
                        )}
                    </form.AppField>
                    <div className='mt-6'>
                        <form.AppField name='description'>
                            {(field) => <field.TextField type='text' id='description' label='Описание' />}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField
                            name='locationId'
                            validators={{
                                onChange: ({ value }) => (value >= 1 ? undefined : 'Выберите локацию.'),
                            }}
                        >
                            {(field) => (
                                <field.SelectField
                                    id='location_id'
                                    label='Локация'
                                    options={locations.map((location) => ({
                                        value: location.attributes.id,
                                        label: location.attributes.long
                                            ? `${location.attributes.long} (${location.attributes.short})`
                                            : location.attributes.short,
                                    }))}
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField
                            name='fqdn'
                            validators={{
                                onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите FQDN.'),
                            }}
                        >
                            {(field) => (
                                <field.TextField
                                    type='text'
                                    id='fqdn'
                                    label='FQDN'
                                    description='Имя домена или IP-адрес, указывающий на этот узел.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='scheme'>
                            {(field) => (
                                <field.SelectField
                                    id='scheme'
                                    label='Общение по SSL'
                                    options={[
                                        { value: 'https', label: 'SSL-подключение (https)' },
                                        { value: 'http', label: 'HTTP-подключение (http)' },
                                    ]}
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='public'>
                            {(field) => (
                                <field.SwitchField
                                    label='Разрешить автоматическую аллокацию'
                                    description='Открытые узлы доступны для автоматического развёртывания серверов.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='behindProxy'>
                            {(field) => (
                                <field.SwitchField
                                    label='За прокси'
                                    description='Включите, если узел находится за прокси, например Cloudflare.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='maintenanceMode'>
                            {(field) => (
                                <field.SwitchField
                                    label='Режим обслуживания'
                                    description='Серверы на узле в режиме обслуживания недоступны.'
                                />
                            )}
                        </form.AppField>
                    </div>
                </TitledGreyBox>
                <div className='space-y-6'>
                    <TitledGreyBox title='Лимиты аллокации'>
                        <div className='grid grid-cols-2 gap-4'>
                            <form.AppField name='memory' validators={nodeNumberValidators.memory}>
                                {(field) => <field.NumberField id='memory' label='Вся память (МиБ)' min={1} />}
                            </form.AppField>
                            <form.AppField
                                name='memoryOverallocate'
                                validators={nodeNumberValidators.memoryOverallocate}
                            >
                                {(field) => (
                                    <field.NumberField id='memory_overallocate' label='Переаллокация (%)' min={-1} />
                                )}
                            </form.AppField>
                            <form.AppField name='disk' validators={nodeNumberValidators.disk}>
                                {(field) => <field.NumberField id='disk' label='Место на диске (МиБ)' min={1} />}
                            </form.AppField>
                            <form.AppField name='diskOverallocate' validators={nodeNumberValidators.diskOverallocate}>
                                {(field) => (
                                    <field.NumberField id='disk_overallocate' label='Переаллокация (%)' min={-1} />
                                )}
                            </form.AppField>
                        </div>
                    </TitledGreyBox>
                    <TitledGreyBox title='Общие настройки'>
                        <form.AppField name='uploadSize' validators={nodeNumberValidators.uploadSize}>
                            {(field) => (
                                <field.NumberField
                                    id='upload_size'
                                    label='Макс. размер загрузки через веб (МиБ)'
                                    min={1}
                                />
                            )}
                        </form.AppField>
                        <div className='mt-6 grid grid-cols-2 gap-4'>
                            <form.AppField name='daemonListen' validators={nodeNumberValidators.daemonListen}>
                                {(field) => (
                                    <field.NumberField id='daemon_listen' label='Порт демона' min={1} max={65535} />
                                )}
                            </form.AppField>
                            <form.AppField name='daemonSftp' validators={nodeNumberValidators.daemonSftp}>
                                {(field) => (
                                    <field.NumberField id='daemon_sftp' label='SFTP-порт демона' min={1} max={65535} />
                                )}
                            </form.AppField>
                        </div>
                        <div className='mt-6'>
                            <form.AppField name='daemonBase'>
                                {(field) => (
                                    <field.TextField type='text' id='daemon_base' label='Базовый путь демона' />
                                )}
                            </form.AppField>
                        </div>
                    </TitledGreyBox>
                </div>
            </div>
            <form.AppField name='extensions'>
                {() => (
                    <ExtensionFormFields
                        form='admin.node'
                        mode='edit'
                        resource={node}
                        error={updateNode.error}
                        boxed
                        className='mt-6'
                    />
                )}
            </form.AppField>
            <TitledGreyBox title='Сохранение настроек' className='mt-6'>
                <form.AppField name='resetSecret'>
                    {(field) => (
                        <field.SwitchField
                            label='Сбросить главный ключ демона'
                            description={
                                'Сброс главного ключа демона делает недействительными запросы, использующие ' +
                                'старый ключ. Этот ключ используется для всех важных операций демона, включая создание и удаление серверов.'
                            }
                        />
                    )}
                </form.AppField>
                <div className='mt-6 text-right'>
                    <form.AppForm>
                        <form.SubmitButton>Сохранить изменения</form.SubmitButton>
                    </form.AppForm>
                </div>
            </TitledGreyBox>
        </Form>
    );
};

export default function NodeSettingsTab() {
    const { node } = useNodeDetail();

    return <NodeSettingsForm key={node.attributes.id} />;
}
