import type { AppForm } from '@/components/form';
import { type AdminLocation, useAllAdminLocations } from '@/api/admin/locations/queries';
import { type NodeFormValues, nodeNumberValidators, validateNodeName } from '@/components/admin/nodes/nodeForm';
import TitledGreyBox from '@/components/elements/TitledGreyBox';

interface Props {
    form: AppForm<NodeFormValues>;
    prefix?: string;
    requiresSslScheme?: boolean;
}

type LocationOption = AdminLocation;

interface FormFieldsProps {
    form: AppForm<NodeFormValues>;
    prefix: string;
}

interface IdentityFieldsProps extends FormFieldsProps {
    locations: LocationOption[];
}

interface NetworkFieldsProps extends FormFieldsProps {
    requiresSslScheme: boolean;
}

const IdentityFields = ({ form, locations, prefix }: IdentityFieldsProps) => (
    <div className='space-y-6'>
        <form.AppField
            name='name'
            validators={{
                onChange: ({ value }) => validateNodeName(value),
            }}
        >
            {(field) => (
                <field.TextField
                    type='text'
                    id={`${prefix}name`}
                    label='Имя'
                    description='Короткий идентификатор для различения этого узла с другими.'
                />
            )}
        </form.AppField>
        <form.AppField name='description'>
            {(field) => (
                <field.TextField
                    type='text'
                    id={`${prefix}description`}
                    label='Описание'
                    description='Более подробное описание этого узла.'
                />
            )}
        </form.AppField>
        <form.AppField
            name='locationId'
            validators={{
                onChange: ({ value }) => (value >= 1 ? undefined : 'Выберите локацию.'),
            }}
        >
            {(field) => (
                <field.SelectField
                    id={`${prefix}location_id`}
                    label='Локация'
                    options={locations.map((location) => ({
                        value: location.attributes.id,
                        label: location.attributes.short,
                    }))}
                />
            )}
        </form.AppField>
    </div>
);

const NetworkFields = ({ form, prefix, requiresSslScheme }: NetworkFieldsProps) => {
    const schemeDescription = requiresSslScheme
        ? 'Панель работает по HTTPS, поэтому браузеры требуют SSL для подключения к узлам.'
        : 'В большинстве случаев следует использовать SSL. Используйте HTTP только для узлов без SSL.';

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-[1fr_16rem] gap-6'>
                <form.AppField
                    name='fqdn'
                    validators={{
                        onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите FQDN.'),
                    }}
                >
                    {(field) => (
                        <field.TextField
                            type='text'
                            id={`${prefix}fqdn`}
                            label='FQDN'
                            description='Имя домена или IP-адрес, указывающий на этот узел.'
                        />
                    )}
                </form.AppField>
                <form.AppField
                    name='scheme'
                    validators={{
                        onChange: ({ value }) =>
                            requiresSslScheme && value === 'http'
                                ? 'Подключение к узлу по HTTP недоступно, если панель загружается по HTTPS.'
                                : undefined,
                    }}
                >
                    {(field) => (
                        <field.SelectField
                            id={`${prefix}scheme`}
                            label='Общение по SSL'
                            options={[
                                { value: 'https', label: 'SSL-подключение (https)' },
                                {
                                    value: 'http',
                                    label: 'HTTP-подключение (http)',
                                    disabled: requiresSslScheme,
                                },
                            ]}
                            description={schemeDescription}
                        />
                    )}
                </form.AppField>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-x-8 gap-y-5'>
                <form.AppField name='public'>
                    {(field) => (
                        <field.SwitchField
                            label='Видимость узла'
                            description='Открытые узлы доступны для автоматического развёртывания серверов.'
                            controlPosition='end'
                            className='w-full'
                        />
                    )}
                </form.AppField>
                <form.AppField name='behindProxy'>
                    {(field) => (
                        <field.SwitchField
                            label='За прокси'
                            description='Включите, если узел находится за прокси, например Cloudflare.'
                            controlPosition='end'
                            className='w-full'
                        />
                    )}
                </form.AppField>
                <form.AppField name='maintenanceMode'>
                    {(field) => (
                        <field.SwitchField
                            label='Режим обслуживания'
                            description='Серверы на узле в режиме обслуживания недоступны.'
                            controlPosition='end'
                            className='w-full sm:col-span-2 xl:col-span-1'
                        />
                    )}
                </form.AppField>
            </div>
        </div>
    );
};

const ResourceFields = ({ form, prefix }: FormFieldsProps) => (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6'>
        <form.AppField name='memory' validators={nodeNumberValidators.memory}>
            {(field) => <field.NumberField id={`${prefix}memory`} label='Память (МиБ)' min={1} />}
        </form.AppField>
        <form.AppField name='memoryOverallocate' validators={nodeNumberValidators.memoryOverallocate}>
            {(field) => (
                <field.NumberField id={`${prefix}memory_overallocate`} label='Переаллокация памяти (%)' min={-1} />
            )}
        </form.AppField>
        <form.AppField name='disk' validators={nodeNumberValidators.disk}>
            {(field) => <field.NumberField id={`${prefix}disk`} label='Диск (МиБ)' min={1} />}
        </form.AppField>
        <form.AppField name='diskOverallocate' validators={nodeNumberValidators.diskOverallocate}>
            {(field) => (
                <field.NumberField id={`${prefix}disk_overallocate`} label='Переаллокация диска (%)' min={-1} />
            )}
        </form.AppField>
    </div>
);

const DaemonFields = ({ form, prefix }: FormFieldsProps) => (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-[12rem_12rem_12rem_1fr] gap-6'>
        <form.AppField name='daemonListen' validators={nodeNumberValidators.daemonListen}>
            {(field) => <field.NumberField id={`${prefix}daemon_listen`} label='Порт демона' min={1} max={65535} />}
        </form.AppField>
        <form.AppField name='daemonSftp' validators={nodeNumberValidators.daemonSftp}>
            {(field) => <field.NumberField id={`${prefix}daemon_sftp`} label='SFTP-порт демона' min={1} max={65535} />}
        </form.AppField>
        <form.AppField name='uploadSize' validators={nodeNumberValidators.uploadSize}>
            {(field) => <field.NumberField id={`${prefix}upload_size`} label='Лимит размера загрузки (МиБ)' min={1} />}
        </form.AppField>
        <form.AppField name='daemonBase'>
            {(field) => <field.TextField type='text' id={`${prefix}daemon_base`} label='Базовый путь демона' />}
        </form.AppField>
    </div>
);

export default function NodeFormFields({ form, prefix = '', requiresSslScheme = false }: Props) {
    const { data: locations = [] } = useAllAdminLocations();

    return (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
            <TitledGreyBox title='Основное'>
                <IdentityFields form={form} locations={locations} prefix={prefix} />
            </TitledGreyBox>
            <TitledGreyBox title='Сеть'>
                <NetworkFields form={form} prefix={prefix} requiresSslScheme={requiresSslScheme} />
            </TitledGreyBox>
            <TitledGreyBox title='Лимиты ресурсов' className='xl:col-span-2'>
                <ResourceFields form={form} prefix={prefix} />
            </TitledGreyBox>
            <TitledGreyBox title='Демон' className='xl:col-span-2'>
                <DaemonFields form={form} prefix={prefix} />
            </TitledGreyBox>
        </div>
    );
}
