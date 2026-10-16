import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import {
    type AdminServer,
    updateAdminServerBuildInput,
    useAdminServerBuildAllocations,
    useAdminServerUnassignedAllocations,
    useUpdateAdminServerBuild,
} from '@/api/admin/servers/queries';
import {
    allocationLabel,
    serverBuildBodyFromFormValues,
    type ServerBuildValues,
} from '@/components/admin/servers/helpers';
import { type NumberInputValue, requiredNumber, submittedNumber } from '@/components/admin/numberInput';
import { useServerDetail } from '@/components/admin/servers/useServerDetail';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { ServerError } from '@/components/elements/ScreenBlock';

interface Props {
    server: AdminServer;
}

interface Values {
    cpu: NumberInputValue;
    threads: string;
    memory: NumberInputValue;
    swap: NumberInputValue;
    disk: NumberInputValue;
    io: NumberInputValue;
    oomDisabled: string;
    databaseLimit: NumberInputValue;
    allocationLimit: NumberInputValue;
    backupLimit: NumberInputValue;
    allocationId: number;
    addAllocations: number[];
    removeAllocations: number[];
}

const serverToValues = (server: AdminServer): Values => ({
    cpu: server.attributes.limits.cpu,
    threads: server.attributes.limits.threads ?? '',
    memory: server.attributes.limits.memory,
    swap: server.attributes.limits.swap,
    disk: server.attributes.limits.disk,
    io: server.attributes.limits.io,
    oomDisabled: server.attributes.limits.oom_disabled ? 'true' : 'false',
    databaseLimit: server.attributes.feature_limits.databases ?? 0,
    allocationLimit: server.attributes.feature_limits.allocations ?? 0,
    backupLimit: server.attributes.feature_limits.backups,
    allocationId: server.attributes.allocation,
    addAllocations: [],
    removeAllocations: [],
});

const validateCpu = requiredNumber('Укажите лимит CPU.', (value) => (value >= 0 ? undefined : 'Неверный лимит CPU.'));
const validateMemory = requiredNumber('Укажите лимит памяти.', (value) =>
    value >= 0 ? undefined : 'Неверный лимит памяти.'
);
const validateSwap = requiredNumber('Укажите лимит подкачки.', (value) =>
    value >= -1 ? undefined : 'Неверный лимит подкачки.'
);
const validateDisk = requiredNumber('Укажите лимит диска.', (value) =>
    value >= 0 ? undefined : 'Неверный лимит диска.'
);
const validateIo = requiredNumber('Укажите пропорцию IO.', (value): string | undefined => {
    if (value < 10) {
        return 'Пропорция IO должна быть не менее 10.';
    }

    if (value > 1000) {
        return 'Пропорция IO не должна превышать 1000.';
    }

    return undefined;
});
const validateDatabaseLimit = requiredNumber('Укажите лимит баз данных.', (value) =>
    value >= 0 ? undefined : 'Неверный лимит баз данных.'
);
const validateAllocationLimit = requiredNumber('Укажите лимит выделений.', (value) =>
    value >= 0 ? undefined : 'Неверный лимит выделений.'
);
const validateBackupLimit = requiredNumber('Укажите лимит резервных копий.', (value) =>
    value >= 0 ? undefined : 'Неверный лимит резервных копий.'
);

function ServerBuildForm({ server }: Props) {
    const { attributes } = server;
    const updateServerBuild = useUpdateAdminServerBuild();

    const { data: assignedResponse } = useAdminServerBuildAllocations(attributes.id, attributes.node);
    const assigned = assignedResponse?.data ?? [];

    const { data: unassignedResponse } = useAdminServerUnassignedAllocations(attributes.node);
    const unassigned = unassignedResponse?.data ?? [];

    const form = useAppForm({
        defaultValues: serverToValues(server),
        onSubmit: async ({ value }) => {
            const payload: ServerBuildValues = {
                allocationId: Number(value.allocationId),
                addAllocations: value.addAllocations.map(Number),
                removeAllocations: value.removeAllocations.map(Number),
                oomDisabled: value.oomDisabled === 'true',
                limits: {
                    cpu: submittedNumber(value.cpu),
                    threads: value.threads,
                    memory: submittedNumber(value.memory),
                    swap: submittedNumber(value.swap),
                    disk: submittedNumber(value.disk),
                    io: submittedNumber(value.io),
                },
                featureLimits: {
                    databases: submittedNumber(value.databaseLimit),
                    allocations: submittedNumber(value.allocationLimit),
                    backups: submittedNumber(value.backupLimit),
                },
            };

            try {
                await updateServerBuild.mutateAsync(
                    updateAdminServerBuildInput(attributes.id, serverBuildBodyFromFormValues(payload))
                );
                form.reset({ ...value, addAllocations: [], removeAllocations: [] });
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const defaultAllocationId = useStore(form.store, (state) => state.values.allocationId);

    const assignedOptions = assigned.map((allocation) => ({
        value: allocation.attributes.id,
        label: allocationLabel(allocation),
    }));

    const removableOptions = assignedOptions.filter((option) => option.value !== defaultAllocationId);

    return (
        <Form form={form}>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <TitledGreyBox title='Управление ресурсами'>
                    <form.AppField name='cpu' validators={{ onChange: validateCpu }}>
                        {(field) => (
                            <field.NumberField
                                id='cpu'
                                label='Лимит CPU (%)'
                                min={0}
                                description='Каждый поток системы — 100%. Установите 0 для неограниченного использования CPU.'
                            />
                        )}
                    </form.AppField>
                    <div className='mt-6'>
                        <form.AppField name='threads'>
                            {(field) => (
                                <field.TextField
                                    type='text'
                                    id='threads'
                                    label='Привязка CPU'
                                    description={
                                        'Продвинутые настройки: конкретные ядра CPU, на которых может работать процесс (например, 0, 0-1,3). ' +
                                        'Оставьте пустым, чтобы разрешить все ядра.'
                                    }
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='memory' validators={{ onChange: validateMemory }}>
                            {(field) => (
                                <field.NumberField
                                    id='memory'
                                    label='Выделенная память (МБ)'
                                    min={0}
                                    description='Максимальный объём памяти для этого контейнера. Установите 0 для неограниченного объёма.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='swap' validators={{ onChange: validateSwap }}>
                            {(field) => (
                                <field.NumberField
                                    id='swap'
                                    label='Выделенная подкачка (МБ)'
                                    min={-1}
                                    description='Установите 0 для отключения подкачки или -1 для неограниченной подкачки.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='disk' validators={{ onChange: validateDisk }}>
                            {(field) => (
                                <field.NumberField
                                    id='disk'
                                    label='Лимит дискового пространства (МБ)'
                                    min={0}
                                    description='Установите 0 для неограниченного использования диска.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='io' validators={{ onChange: validateIo }}>
                            {(field) => (
                                <field.NumberField
                                    id='io'
                                    label='Пропорция блочного IO'
                                    min={10}
                                    max={1000}
                                    description='Продвинутые настройки: значение от 10 до 1000.'
                                />
                            )}
                        </form.AppField>
                    </div>
                    <div className='mt-6'>
                        <form.AppField name='oomDisabled'>
                            {(field) => (
                                <field.SelectField
                                    id='oomDisabled'
                                    label='OOM Killer'
                                    description='Включение OOM Killer может привести к неожиданному завершению процессов сервера.'
                                    options={[
                                        { value: 'false', label: 'Включён' },
                                        { value: 'true', label: 'Выключен' },
                                    ]}
                                />
                            )}
                        </form.AppField>
                    </div>
                </TitledGreyBox>
                <div className='space-y-6'>
                    <TitledGreyBox title='Лимиты возможностей'>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <form.AppField name='databaseLimit' validators={{ onChange: validateDatabaseLimit }}>
                                {(field) => <field.NumberField id='database_limit' label='Лимит баз данных' min={0} />}
                            </form.AppField>
                            <form.AppField name='allocationLimit' validators={{ onChange: validateAllocationLimit }}>
                                {(field) => <field.NumberField id='allocation_limit' label='Лимит выделений' min={0} />}
                            </form.AppField>
                            <form.AppField name='backupLimit' validators={{ onChange: validateBackupLimit }}>
                                {(field) => (
                                    <field.NumberField id='backup_limit' label='Лимит резервных копий' min={0} />
                                )}
                            </form.AppField>
                        </div>
                    </TitledGreyBox>
                    <TitledGreyBox title='Управление выделениями'>
                        <form.AppField name='allocationId'>
                            {(field) => (
                                <field.SelectField
                                    id='allocationId'
                                    label='Игровой порт'
                                    description='Адрес подключения по умолчанию для этого сервера.'
                                    options={assignedOptions}
                                    onChange={(value) =>
                                        form.setFieldValue('removeAllocations', (current) =>
                                            current.filter((id) => id !== Number(value))
                                        )
                                    }
                                />
                            )}
                        </form.AppField>
                        <div className='mt-6'>
                            <form.AppField name='addAllocations'>
                                {(field) => (
                                    <field.MultiSelectField
                                        id='addAllocations'
                                        label='Назначить дополнительные порты'
                                        description='Неназначенные порты на этом узле, которые будут назначены серверу.'
                                        options={unassigned.map((allocation) => ({
                                            value: allocation.attributes.id,
                                            label: allocationLabel(allocation),
                                        }))}
                                    />
                                )}
                            </form.AppField>
                        </div>
                        <div className='mt-6'>
                            <form.AppField name='removeAllocations'>
                                {(field) => (
                                    <field.MultiSelectField
                                        id='removeAllocations'
                                        label='Удалить дополнительные порты'
                                        description='Выберите порты, которые нужно удалить с этого сервера.'
                                        options={removableOptions}
                                    />
                                )}
                            </form.AppField>
                        </div>
                    </TitledGreyBox>
                </div>
            </div>
            <div className='flex justify-end mt-6'>
                <form.AppForm>
                    <form.SubmitButton>Обновить конфигурацию</form.SubmitButton>
                </form.AppForm>
            </div>
        </Form>
    );
}

export default function ServerBuildTab() {
    const { server } = useServerDetail();

    if (server.attributes.container.installed !== 1) {
        return <ServerError message='Доступ к этому ресурсу невозможен из-за текущего состояния установки.' />;
    }

    return <ServerBuildForm key={`${server.attributes.id}:${server.attributes.updated_at}`} server={server} />;
}
