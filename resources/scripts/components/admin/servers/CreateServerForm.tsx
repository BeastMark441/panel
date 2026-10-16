import { type ReactNode, useRef, useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import {
    createAdminServerInput,
    type EggForServer,
    useAdminEggForServer,
    useAdminServerUnassignedAllocations,
    useCreateAdminServer,
    useFetchAdminEggForServer,
} from '@/api/admin/servers/queries';
import {
    allocationLabel,
    createServerBodyFromFormValues,
    type CreateServerValues,
} from '@/components/admin/servers/helpers';
import { type NumberInputValue, requiredNumber, submittedNumber } from '@/components/admin/numberInput';
import { type AdminUser, useAllAdminUsers } from '@/api/admin/users/queries';
import { type LocationWithNodes, useAdminNodesGroupedByLocation, useAdminNodeTags } from '@/api/admin/nodes/queries';
import { type AdminEggListItem, useAdminEggs } from '@/api/admin/eggs/queries';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import TagCheckAlert from '@/components/admin/tags/TagCheckAlert';
import {
    nodeAcceptsEgg,
    nodeRejectsEggMessage,
    tagCheckError,
    type TagCheckMeta,
} from '@/components/admin/tags/helpers';
import ExtensionFormFields from '@/components/admin/extensions/ExtensionFormFields';
import { type ExtensionFormValues, initialExtensionValues, useExtensionPayload } from '@/extensions/forms';
import Icon from '@/components/elements/Icon';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Label from '@/components/elements/Label';
import Spinner from '@/components/elements/Spinner';
import { Alert } from '@/components/elements/alert';
import type { AppForm } from '@/components/form';
import { useAppForm, Form } from '@/components/form';
import Select from '@/components/ui/Select';
import { relationshipData } from '@/api/relationships';

interface Values extends Omit<
    CreateServerValues,
    'databaseLimit' | 'allocationLimit' | 'backupLimit' | 'cpu' | 'memory' | 'swap' | 'disk' | 'io'
> {
    databaseLimit: NumberInputValue;
    allocationLimit: NumberInputValue;
    backupLimit: NumberInputValue;
    cpu: NumberInputValue;
    memory: NumberInputValue;
    swap: NumberInputValue;
    disk: NumberInputValue;
    io: NumberInputValue;
    extensions: ExtensionFormValues;
}

type ServerForm = AppForm<Values, TagCheckMeta>;

const initialValues: Values = {
    name: '',
    description: '',
    ownerId: 0,
    startOnCompletion: true,

    allocationId: 0,
    allocationAdditional: [],

    databaseLimit: 0,
    allocationLimit: 0,
    backupLimit: 0,

    cpu: 0,
    threads: '',
    memory: 0,
    swap: 0,
    disk: 0,
    io: 500,
    enableOomKiller: true,

    eggId: 0,
    skipScripts: false,

    image: '',
    startup: '',

    environment: {},

    extensions: initialExtensionValues(),
};

const createServerValues = (values: Values): CreateServerValues => ({
    ...values,
    databaseLimit: submittedNumber(values.databaseLimit),
    allocationLimit: submittedNumber(values.allocationLimit),
    backupLimit: submittedNumber(values.backupLimit),
    cpu: submittedNumber(values.cpu),
    memory: submittedNumber(values.memory),
    swap: submittedNumber(values.swap),
    disk: submittedNumber(values.disk),
    io: submittedNumber(values.io),
});

const CoreDetailsBox = ({ form, users }: { form: ServerForm; users: AdminUser[] }) => (
    <TitledGreyBox title='Основные сведения'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-6'>
                <form.AppField
                    name='name'
                    validators={{
                        onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите название сервера.'),
                    }}
                >
                    {(field) => (
                        <field.TextField
                            type='text'
                            id='name'
                            label='Название сервера'
                            description='Допустимые символы: a-z A-Z 0-9 _ - . и пробел.'
                        />
                    )}
                </form.AppField>
                <form.AppField
                    name='ownerId'
                    validators={{
                        onChange: ({ value }) => (value >= 1 ? undefined : 'Выберите владельца сервера.'),
                    }}
                >
                    {(field) => (
                        <field.SelectField
                            id='ownerId'
                            label='Владелец сервера'
                            description='Пользователь, которому будет принадлежать этот сервер.'
                            options={[
                                { value: 0, label: 'Выберите владельца сервера…', disabled: true },
                                ...users.map((user) => ({
                                    value: user.attributes.id ?? 0,
                                    label: `${user.attributes.email} (${user.attributes.username})`,
                                })),
                            ]}
                        />
                    )}
                </form.AppField>
            </div>
            <div className='space-y-6'>
                <form.AppField name='description'>
                    {(field) => (
                        <field.TextField
                            type='text'
                            id='description'
                            label='Описание сервера'
                            description='Краткое описание этого сервера.'
                        />
                    )}
                </form.AppField>
                <div className='mt-6'>
                    <form.AppField name='startOnCompletion'>
                        {(field) => (
                            <field.SwitchField
                                label='Запустить сервер после установки'
                                description='Автоматически запустить этот сервер после завершения установки.'
                            />
                        )}
                    </form.AppField>
                </div>
            </div>
        </div>
    </TitledGreyBox>
);

const AllocationBox = ({
    form,
    locations,
    nodeId,
    onNodeChange,
}: {
    form: ServerForm;
    locations: LocationWithNodes[];
    nodeId: number;
    onNodeChange: (nodeId: number) => void;
}) => {
    const { data: allocationsResponse, isFetching: loading } = useAdminServerUnassignedAllocations(nodeId);
    const allocations = allocationsResponse?.data ?? [];

    const defaultAllocationId = useStore(form.store, (state) => state.values.allocationId);

    const allocationOptions = allocations.map((allocation) => ({
        value: allocation.attributes.id,
        label: allocationLabel(allocation),
    }));

    const additionalOptions = allocationOptions.filter((option) => option.value !== defaultAllocationId);

    return (
        <TitledGreyBox title='Управление выделениями'>
            <div className='relative grid grid-cols-1 md:grid-cols-3 gap-6'>
                {loading && <Spinner size='small' centered />}
                <div>
                    <Label htmlFor='nodeId'>Узел</Label>
                    <Select
                        id='nodeId'
                        value={nodeId}
                        placeholder='Выберите узел…'
                        onChange={(value) => {
                            onNodeChange(Number(value));
                            form.setFieldValue('allocationId', 0);
                            form.setFieldValue('allocationAdditional', []);
                        }}
                        groups={locations.map((group) => ({
                            label: group.location.attributes.long
                                ? `${group.location.attributes.long} (${group.location.attributes.short})`
                                : group.location.attributes.short,
                            options: group.nodes.map((node) => ({ value: node.id, label: node.name })),
                        }))}
                    />
                    <p className='input-help'>Узел, на котором будет размещён этот сервер.</p>
                </div>
                <div>
                    <form.AppField
                        name='allocationId'
                        validators={{
                            onChange: ({ value }) => (value >= 1 ? undefined : 'Выберите основное выделение.'),
                        }}
                    >
                        {(field) => (
                            <field.SelectField
                                id='allocationId'
                                label='Основное выделение'
                                description='Основное выделение, которое будет назначено этому серверу.'
                                disabled={nodeId <= 0}
                                options={[
                                    { value: 0, label: 'Выберите выделение…', disabled: true },
                                    ...allocationOptions,
                                ]}
                                onChange={(value) =>
                                    form.setFieldValue('allocationAdditional', (current) =>
                                        current.filter((id) => id !== Number(value))
                                    )
                                }
                            />
                        )}
                    </form.AppField>
                </div>
                <div>
                    <form.AppField name='allocationAdditional'>
                        {(field) => (
                            <field.MultiSelectField
                                id='allocationAdditional'
                                label='Дополнительные выделения'
                                description='Дополнительные выделения, которые будут назначены серверу при создании.'
                                disabled={nodeId <= 0}
                                options={additionalOptions}
                            />
                        )}
                    </form.AppField>
                </div>
            </div>
        </TitledGreyBox>
    );
};

const FeatureLimitsBox = ({ form }: { form: ServerForm }) => (
    <TitledGreyBox title='Лимиты возможностей'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <form.AppField name='databaseLimit' validators={{ onChange: requiredNumber('Укажите лимит баз данных.') }}>
                {(field) => (
                    <field.NumberField
                        id='databaseLimit'
                        label='Лимит баз данных'
                        min={0}
                        description='Максимальное количество баз данных, которое пользователь может создать для этого сервера.'
                    />
                )}
            </form.AppField>
            <form.AppField name='allocationLimit' validators={{ onChange: requiredNumber('Укажите лимит выделений.') }}>
                {(field) => (
                    <field.NumberField
                        id='allocationLimit'
                        label='Лимит выделений'
                        min={0}
                        description='Максимальное количество выделений, которое пользователь может создать для этого сервера.'
                    />
                )}
            </form.AppField>
            <form.AppField
                name='backupLimit'
                validators={{ onChange: requiredNumber('Укажите лимит резервных копий.') }}
            >
                {(field) => (
                    <field.NumberField
                        id='backupLimit'
                        label='Лимит резервных копий'
                        min={0}
                        description='Максимальное количество резервных копий, которое можно создать для этого сервера.'
                    />
                )}
            </form.AppField>
        </div>
    </TitledGreyBox>
);

const ResourceManagementBox = ({ form }: { form: ServerForm }) => (
    <TitledGreyBox title='Управление ресурсами'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <form.AppField name='cpu' validators={{ onChange: requiredNumber('Укажите лимит CPU.') }}>
                {(field) => (
                    <field.NumberField
                        id='cpu'
                        label='Лимит CPU (%)'
                        min={0}
                        description='Значение 0 разрешает неограниченное использование CPU. 100% соответствует одному потоку.'
                    />
                )}
            </form.AppField>
            <form.AppField name='threads'>
                {(field) => (
                    <field.TextField
                        type='text'
                        id='threads'
                        label='Привязка CPU'
                        description='Продвинутые настройки: конкретные потоки CPU (например, 0, 0-1,3) или оставьте пустым для всех.'
                    />
                )}
            </form.AppField>
            <form.AppField name='memory' validators={{ onChange: requiredNumber('Укажите лимит памяти.') }}>
                {(field) => (
                    <field.NumberField
                        id='memory'
                        label='Память (МБ)'
                        min={0}
                        description='Максимальный разрешённый объём памяти. Установите 0 для неограниченного объёма.'
                    />
                )}
            </form.AppField>
            <form.AppField name='swap' validators={{ onChange: requiredNumber('Укажите лимит подкачки.') }}>
                {(field) => (
                    <field.NumberField
                        id='swap'
                        label='Подкачка (МБ)'
                        min={-1}
                        description='Установите 0 для отключения подкачки или -1 для неограниченной подкачки.'
                    />
                )}
            </form.AppField>
            <form.AppField name='disk' validators={{ onChange: requiredNumber('Укажите лимит диска.') }}>
                {(field) => (
                    <field.NumberField
                        id='disk'
                        label='Дисковое пространство (МБ)'
                        min={0}
                        description='Установите 0 для неограниченного использования диска.'
                    />
                )}
            </form.AppField>
            <form.AppField
                name='io'
                validators={{
                    onChange: requiredNumber('Укажите вес блочного IO.', (value) =>
                        value >= 10 && value <= 1000
                            ? undefined
                            : 'Вес блочного IO должен быть в пределах от 10 до 1000.'
                    ),
                }}
            >
                {(field) => (
                    <field.NumberField
                        id='io'
                        label='Вес блочного IO'
                        min={10}
                        max={1000}
                        description='Продвинутые настройки: производительность IO по сравнению с другими контейнерами (от 10 до 1000).'
                    />
                )}
            </form.AppField>
        </div>
        <div className='mt-6'>
            <form.AppField name='enableOomKiller'>
                {(field) => (
                    <field.SwitchField
                        label='Включить OOM Killer'
                        description={
                            'Прерывает работу сервера при превышении лимита памяти. Включение OOM Killer может ' +
                            'привести к неожиданному завершению процессов сервера.'
                        }
                    />
                )}
            </form.AppField>
        </div>
    </TitledGreyBox>
);

const EggConfigurationBox = ({
    form,
    eggs,
    loadEgg,
    loading,
}: {
    form: ServerForm;
    eggs: AdminEggListItem[];
    loadEgg: (eggId: number) => void;
    loading: boolean;
}) => {
    const eggId = useStore(form.store, (state) => Number(state.values.eggId ?? 0));

    return (
        <TitledGreyBox title='Настройки яйца'>
            <div className='relative space-y-6'>
                {loading && <Spinner size='small' centered />}
                <div>
                    <Label htmlFor='eggId'>Яйцо</Label>
                    <Select
                        id='eggId'
                        value={eggId}
                        placeholder='Выберите яйцо…'
                        options={eggs.map((egg) => ({ value: egg.attributes.id, label: egg.attributes.name }))}
                        onChange={(value) => {
                            const nextEggId = Number(value);

                            form.setFieldValue('eggId', nextEggId);
                            loadEgg(nextEggId);
                        }}
                    />
                    <p className='input-help'>Выберите яйцо, которое определяет работу этого сервера.</p>
                </div>
                <div>
                    <form.AppField name='skipScripts'>
                        {(field) => (
                            <field.SwitchField
                                label='Пропустить скрипт установки яйца'
                                description='Пропустить скрипт установки яйца во время установки, если он привязан.'
                            />
                        )}
                    </form.AppField>
                </div>
            </div>
        </TitledGreyBox>
    );
};

const DockerImageBox = ({ form, egg }: { form: ServerForm; egg: EggForServer | null }) => {
    const image = useStore(form.store, (state) => state.values.image);
    const images = egg ? Object.entries(egg.attributes.docker_images) : [];
    const isCustom = !images.some(([, value]) => value === image);

    return (
        <TitledGreyBox title='Настройки Docker'>
            <div className='space-y-4'>
                <div>
                    <Label htmlFor='image'>Образ Docker</Label>
                    <Select
                        id='image'
                        value={isCustom ? 'custom' : image}
                        disabled={!egg}
                        onChange={(value) => form.setFieldValue('image', value === 'custom' ? '' : String(value))}
                        options={[
                            ...images.map(([name, value]) => ({ value, label: `${name} (${value})` })),
                            { value: 'custom', label: 'Собственный образ…' },
                        ]}
                    />
                </div>
                {(isCustom || images.length === 0) && (
                    <form.AppField
                        name='image'
                        validators={{
                            onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите образ Docker.'),
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='customImage'
                                label='Собственный образ'
                                placeholder='Введите собственный образ…'
                                description='Образ Docker по умолчанию, используемый для запуска этого сервера.'
                            />
                        )}
                    </form.AppField>
                )}
            </div>
        </TitledGreyBox>
    );
};

const StartupBox = ({ form, egg }: { form: ServerForm; egg: EggForServer | null }) => {
    const variables = relationshipData(egg?.attributes.relationships?.variables);

    return (
        <TitledGreyBox title='Настройки запуска'>
            <form.AppField
                name='startup'
                validators={{
                    onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите команду запуска.'),
                }}
            >
                {(field) => (
                    <field.TextField
                        type='text'
                        id='startup'
                        label='Команда запуска'
                        description='Доступны следующие подстановки: {{SERVER_MEMORY}}, {{SERVER_IP}} и {{SERVER_PORT}}.'
                    />
                )}
            </form.AppField>
            {variables.length > 0 && (
                <div className='mt-6'>
                    <p className='text-sm uppercase text-muted-foreground mb-4'>Переменные сервиса</p>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {variables.map(({ attributes }) => (
                            <form.AppField key={attributes.id} name={`environment.${attributes.env_variable}`}>
                                {(field) => (
                                    <field.TextField
                                        id={`env_${attributes.env_variable}`}
                                        label={attributes.name}
                                        description={attributes.description}
                                    />
                                )}
                            </form.AppField>
                        ))}
                    </div>
                </div>
            )}
        </TitledGreyBox>
    );
};

const EggSection = ({ form, eggs }: { form: ServerForm; eggs: AdminEggListItem[] }) => {
    const eggId = useStore(form.store, (state) => Number(state.values.eggId ?? 0));
    const fetchEgg = useFetchAdminEggForServer();

    const { data: egg = null, isFetching: loading } = useAdminEggForServer(eggId);
    const latestEggLoad = useRef(0);

    const loadEgg = async (nextEggId: number) => {
        const eggLoad = ++latestEggLoad.current;

        if (nextEggId <= 0) {
            form.setFieldValue('startup', '');
            form.setFieldValue('image', '');
            form.setFieldValue('environment', {});

            return;
        }

        const nextEgg = await fetchEgg(nextEggId);

        if (!nextEgg || eggLoad !== latestEggLoad.current) {
            return;
        }

        form.setFieldValue('startup', nextEgg.attributes.startup);

        const images = Object.values(nextEgg.attributes.docker_images);

        form.setFieldValue('image', images.length > 0 ? images[0] : '');

        const environment: Record<string, string> = {};

        for (const { attributes } of relationshipData(nextEgg.attributes.relationships?.variables)) {
            environment[attributes.env_variable] = attributes.default_value;
        }

        form.setFieldValue('environment', environment);
    };

    return (
        <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                <EggConfigurationBox
                    form={form}
                    eggs={eggs}
                    loadEgg={(nextEggId) => void loadEgg(nextEggId)}
                    loading={loading}
                />
                <DockerImageBox form={form} egg={egg} />
            </div>
            <StartupBox form={form} egg={egg} />
        </>
    );
};

interface TagRejection {
    message: string;
    nodeId: number;
    eggId: number;
}

const TagCheck = ({
    nodeId,
    eggId,
    rejection,
    pending,
    onCreateAnyway,
}: {
    nodeId: number;
    eggId: number;
    rejection: TagRejection | null;
    pending: boolean;
    onCreateAnyway: () => void;
}) => {
    const { data: node } = useAdminNodeTags(nodeId);
    const { data: egg } = useAdminEggForServer(eggId);

    if (rejection?.nodeId === nodeId && rejection.eggId === eggId) {
        return (
            <TagCheckAlert
                message={rejection.message}
                action='Создать всё равно'
                pending={pending}
                onAction={onCreateAnyway}
            />
        );
    }

    const nodeTags = relationshipData(node?.attributes.relationships?.tags);

    if (!node || !egg || nodeAcceptsEgg(nodeTags, relationshipData(egg.attributes.relationships?.tags))) {
        return null;
    }

    return <TagCheckAlert message={nodeRejectsEggMessage(node.attributes.name, nodeTags)} />;
};

const NoNodesAlert = () => (
    <Alert type='warning' className='text-sm'>
        <span>
            Чтобы добавить сервер на эту панель, необходимо настроить хотя бы один узел.{' '}
            <Link to='/panel/nodes' className='font-medium underline'>
                Управление узлами
            </Link>
        </span>
    </Alert>
);

const CreateServerBody = ({
    loading,
    hasNodes,
    children,
}: {
    loading: boolean;
    hasNodes: boolean;
    children: ReactNode;
}) => {
    if (loading) {
        return <Spinner size='large' centered />;
    }

    if (!hasNodes) {
        return <NoNodesAlert />;
    }

    return children;
};

export default function CreateServerForm() {
    const navigate = useNavigate();
    const createServer = useCreateAdminServer();

    const { data: users = [], isLoading: usersLoading } = useAllAdminUsers();
    const { data: locations = [], isLoading: locationsLoading } = useAdminNodesGroupedByLocation();
    const { data: eggs, isLoading: eggsLoading } = useAdminEggs();

    const loading = usersLoading || locationsLoading || eggsLoading;
    const hasNodes = locations.some((location) => location.nodes.length > 0);

    const [nodeId, setNodeId] = useState(0);
    const [rejection, setRejection] = useState<TagRejection | null>(null);

    const { extensionFormPayload } = useExtensionPayload('admin.server');
    const form = useAppForm({
        defaultValues: initialValues,
        onSubmitMeta: { ignoreTags: false },
        onSubmit: async ({ value, meta }) => {
            try {
                const server = await createServer.mutateAsync(
                    createAdminServerInput({
                        ...createServerBodyFromFormValues(createServerValues(value)),
                        ignore_tags: meta.ignoreTags,
                        extensions: extensionFormPayload(value.extensions),
                    })
                );

                void navigate({ to: '/panel/servers/$id', params: { id: server.attributes.id } });
            } catch (error) {
                const message = tagCheckError(error, 'primary_allocation_id');

                setRejection(message === null ? null : { message, nodeId, eggId: value.eggId });
            }
        },
    });
    const eggId = useStore(form.store, (state) => Number(state.values.eggId ?? 0));
    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

    return (
        <AdminContentBlock
            title='Админ · Создание сервера'
            heading='Создание сервера'
            description='Создание игрового сервера на одном из ваших узлов.'
        >
            <Link
                to='/panel/servers'
                className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
            >
                <Icon icon={ArrowLeft} className='mr-2' />
                К списку серверов
            </Link>
            <CreateServerBody loading={loading} hasNodes={hasNodes}>
                <Form form={form}>
                    <div className='space-y-6'>
                        <CoreDetailsBox form={form} users={users} />
                        <AllocationBox form={form} locations={locations} nodeId={nodeId} onNodeChange={setNodeId} />
                        <FeatureLimitsBox form={form} />
                        <ResourceManagementBox form={form} />
                        <EggSection form={form} eggs={eggs?.data ?? []} />
                        <form.AppField name='extensions'>
                            {() => (
                                <ExtensionFormFields
                                    form='admin.server'
                                    mode='create'
                                    error={createServer.error}
                                    boxed
                                />
                            )}
                        </form.AppField>
                        <TagCheck
                            nodeId={nodeId}
                            eggId={eggId}
                            rejection={rejection}
                            pending={isSubmitting}
                            onCreateAnyway={() => void form.handleSubmit({ ignoreTags: true })}
                        />
                        <div className='flex justify-end'>
                            <form.AppForm>
                                <form.SubmitButton>Создать сервер</form.SubmitButton>
                            </form.AppForm>
                        </div>
                    </div>
                </Form>
            </CreateServerBody>
        </AdminContentBlock>
    );
}
