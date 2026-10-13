import React, { useState } from 'react';
import { AlertCircle, FileArchive, RefreshCw, Settings2, Trash2, UploadCloud } from 'lucide-react';
import { getExtensionStates, useExtensionRegistry } from '@/extensions/registry';
import { cn } from '@/lib/cn';
import { httpErrorToHuman } from '@/api/http';
import {
    disableAdminExtensionInput,
    enableAdminExtensionInput,
    extensionReplacement,
    installAdminExtensionInput,
    removeAdminExtensionInput,
    updateAdminExtensionSettingsInput,
    type AdminExtension,
    type AdminExtensionReplacement,
    type AdminExtensionSettingField,
    type AdminExtensionSettingValue,
    useAdminExtensions,
    useAdminExtensionSettings,
    useDisableAdminExtension,
    useEnableAdminExtension,
    useInstallAdminExtension,
    useRemoveAdminExtension,
    uploadAdminExtensionSettingFileInput,
    clearAdminExtensionSettingFileInput,
    useClearAdminExtensionSettingFile,
    useUploadAdminExtensionSettingFile,
    useUpdateAdminExtensionSettings,
} from '@/api/admin/extensions/queries';
import SettingField, { submittedItems, type SettingFileActions } from './SettingField';
import SettingsSections, { settingsBodyClass } from './SettingsSections';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import Button from '@/components/elements/Button';
import Icon from '@/components/elements/Icon';
import Label from '@/components/elements/Label';
import NamedIcon from '@/components/elements/NamedIcon';
import ListToolbar from '@/components/elements/ListToolbar';
import { NewButton } from '@/components/elements/NewButton';
import Spinner from '@/components/elements/Spinner';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Alert } from '@/components/elements/alert';
import { Dialog } from '@/components/elements/dialog';
import { ServerError } from '@/components/elements/ScreenBlock';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import Checkbox from '@/components/ui/Checkbox';
import Switch from '@/components/ui/Switch';
import { FileInput } from '@/components/form/controls';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { emptyCompactClass } from '@/components/ui/styles';

type ExtensionState = NonNullable<AdminExtension['state']>;

type ActionButtonProps = {
    label: string;
    icon: React.ComponentProps<typeof Icon>['icon'];
    disabled?: boolean;
    color?: React.ComponentProps<typeof Button>['color'];
    isLoading?: boolean;
    onClick: () => void;
};

// Ошибка на любом другом этапе возникла во время работы расширения, а не его загрузки.
const LOAD_PHASES = new Set(['register', 'boot', 'compatibility']);

const stateBadge = (state: ExtensionState = '', errorPhase?: string | null) => {
    switch (state) {
        case 'not_registered':
            return { label: 'Не настроено', className: 'bg-accent/10 text-accent' };
        case 'error':
            return {
                label: !errorPhase || LOAD_PHASES.has(errorPhase) ? 'Ошибка загрузки' : 'Ошибка выполнения',
                className: 'bg-destructive/15 text-destructive',
            };
        case 'invalid':
            return { label: 'Некорректный пакет', className: 'bg-destructive/15 text-destructive' };
        default:
            return null;
    }
};

const extensionName = (extension: AdminExtension): string => extension.name || extension.id || 'Неизвестное расширение';

const extensionId = (extension: AdminExtension): string => extension.id || extensionName(extension);

const canRemove = (extension: AdminExtension): boolean => extension.state !== 'invalid' && !!extension.id;

const canEnable = (extension: AdminExtension): boolean =>
    extension.state !== 'invalid' && !extension.enabled && !!extension.id;

const canDisable = (extension: AdminExtension): boolean => extension.enabled === true && !!extension.id;

const extensionInitials = (extension: AdminExtension): string =>
    extensionName(extension)
        .split(/[\s_-]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || 'EX';

function ExtensionMarkContent({ extension }: { extension: AdminExtension }) {
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const iconUrl = extension.icon_url;

    if (iconUrl && iconUrl !== failedUrl) {
        return (
            <img
                src={iconUrl}
                alt=''
                loading='lazy'
                decoding='async'
                className='h-full w-full object-contain'
                onError={() => setFailedUrl(iconUrl)}
            />
        );
    }

    if (extension.icon) {
        return <NamedIcon name={extension.icon} size={20} />;
    }

    return <>{extensionInitials(extension)}</>;
}

export function ExtensionMark({ extension }: { extension: AdminExtension }) {
    return (
        <div
            className='flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-secondary text-sm font-semibold text-secondary-foreground'
            aria-hidden='true'
        >
            <ExtensionMarkContent extension={extension} />
        </div>
    );
}

function ActionButton({ label, icon, disabled, color = 'grey', isLoading, onClick }: ActionButtonProps) {
    return (
        <NewButton
            icon={icon}
            color={color}
            isSecondary
            disabled={disabled}
            isLoading={isLoading}
            className='h-8 px-2.5 text-sm'
            onClick={onClick}
        >
            {label}
        </NewButton>
    );
}

function ReplacementNotice({ replacement }: { replacement: AdminExtensionReplacement }) {
    const installed = replacement.installedVersion ? `версии v${replacement.installedVersion}` : 'без указанной версии';

    return (
        <Alert type='warning' title='Заменить установленное расширение?'>
            Этот пакет содержит расширение <code className='font-mono'>{replacement.id}</code> версии v
            {replacement.version}. Расширение <code className='font-mono'>{replacement.id}</code> {installed} уже
            установлено. При установке файлы существующего расширения будут заменены.
            {replacement.enabled &&
                ' Расширение включено и останется включённым, поэтому миграции и код новой версии будут выполнены сразу.'}
        </Alert>
    );
}

function InstallExtensionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [enable, setEnable] = useState(false);
    const [replacement, setReplacement] = useState<AdminExtensionReplacement | null>(null);
    const installExtension = useInstallAdminExtension();
    const submitting = installExtension.isPending;

    const submit = async () => {
        if (!file) {
            return;
        }

        try {
            await installExtension.mutateAsync(installAdminExtensionInput(file, enable, replacement !== null));
            onClose();
        } catch (error) {
            // Замена пакета с уже установленным ID требует подтверждения администратора.
            // Уведомления об остальных ошибках выводятся обработчиком мутации.
            const conflict = extensionReplacement(error);

            if (conflict) {
                setReplacement(conflict);
            }
        }
    };

    return (
        <Dialog
            open={open}
            title='Установить расширение'
            preventExternalClose={submitting}
            hideCloseIcon={submitting}
            onClose={onClose}
        >
            <SpinnerOverlay visible={submitting} />
            <div className='space-y-5'>
                <div>
                    <Label htmlFor='extension_package'>Пакет расширения</Label>
                    <FileInput
                        id='extension_package'
                        accept='.pteroext,.zip,application/zip'
                        aria-label='Пакет расширения'
                        disabled={submitting}
                        onChange={(event) => {
                            setFile(event.currentTarget.files?.[0] ?? null);
                            setReplacement(null);
                        }}
                    />
                </div>
                <label className='flex items-center gap-3 text-sm text-foreground'>
                    <Checkbox checked={enable} onChange={setEnable} disabled={submitting} />
                    Включить после установки
                </label>
                {replacement && <ReplacementNotice replacement={replacement} />}
            </div>
            <div className='flex flex-wrap justify-end mt-6'>
                <Button
                    type='button'
                    isSecondary
                    className='w-full sm:w-auto sm:mr-2'
                    disabled={submitting}
                    onClick={onClose}
                >
                    Закрыть
                </Button>
                <Button
                    type='button'
                    color={replacement ? 'red' : 'primary'}
                    className='w-full mt-4 sm:w-auto sm:mt-0'
                    disabled={!file || submitting}
                    isLoading={submitting}
                    onClick={() => void submit()}
                >
                    {replacement ? `Заменить ${replacement.id}` : 'Установить'}
                </Button>
            </div>
        </Dialog>
    );
}

function InstallExtensionButton() {
    return (
        <Dialog.Trigger
            trigger={({ onClick }) => (
                <NewButton icon={UploadCloud} onClick={onClick}>
                    Установить
                </NewButton>
            )}
        >
            {({ open, onClose }) => <InstallExtensionDialog open={open} onClose={onClose} />}
        </Dialog.Trigger>
    );
}

function ExtensionToolbar({
    failedCount,
    isFetching,
    onRefresh,
}: {
    failedCount: number;
    isFetching: boolean;
    onRefresh: () => void;
}) {
    return (
        <ListToolbar
            summary={
                failedCount > 0 && (
                    <span className='inline-flex items-center gap-1.5 text-warning'>
                        <Icon icon={AlertCircle} />
                        {`Требуют внимания: ${failedCount}`}
                    </span>
                )
            }
        >
            <div className='flex items-center gap-2'>
                <Tooltip content='Обновить'>
                    <span className='inline-flex'>
                        <Button
                            type='button'
                            color='grey'
                            isSecondary
                            aria-label='Обновить список расширений'
                            disabled={isFetching}
                            isLoading={isFetching}
                            className='inline-flex h-9 w-9 items-center justify-center p-0'
                            onClick={onRefresh}
                        >
                            <Icon icon={RefreshCw} />
                        </Button>
                    </span>
                </Tooltip>
                <InstallExtensionButton />
            </div>
        </ListToolbar>
    );
}

const resolveSettingValue = (
    values: Record<string, AdminExtensionSettingValue | undefined>,
    field: AdminExtensionSettingField
): AdminExtensionSettingValue | undefined => {
    if (field.input in values) {
        return values[field.input];
    }

    // Секретные значения приходят скрытыми; пустая строка означает сохранение текущего значения.
    return field.field === 'password' ? '' : field.value;
};

const shouldIncludeSettingValue = (
    field: AdminExtensionSettingField,
    value: AdminExtensionSettingValue | undefined
): value is AdminExtensionSettingValue => {
    // Файлы сохраняются через отдельный обработчик загрузки.
    if (value === undefined || field.field === 'file') {
        return false;
    }

    return !(field.field === 'password' && value === '');
};

const buildSettingsPayload = (
    schema: AdminExtensionSettingField[],
    getValue: (field: AdminExtensionSettingField) => AdminExtensionSettingValue | undefined
) => {
    const settings: Record<string, AdminExtensionSettingValue> = {};

    for (const field of schema) {
        const value = getValue(field);

        if (shouldIncludeSettingValue(field, value)) {
            settings[field.input] = field.field === 'list' ? submittedItems(value) : value;
        }
    }

    return settings;
};

function SettingsEmptyState({ extensionEnabled }: { extensionEnabled: boolean | undefined }) {
    return (
        <Empty className={emptyCompactClass}>
            <EmptyHeader>
                <EmptyMedia variant='icon'>
                    <Settings2 />
                </EmptyMedia>
                <EmptyTitle>{extensionEnabled ? 'Нет настроек' : 'Настройки недоступны'}</EmptyTitle>
                <EmptyDescription>
                    {extensionEnabled
                        ? 'Это расширение не предоставляет настроек.'
                        : 'Включите расширение, чтобы загрузить его настройки.'}
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}

function SettingsDialogContent({
    error,
    showLoading,
    registered,
    schema,
    extensionEnabled,
    getValue,
    onChange,
    fileActions,
}: {
    error: unknown;
    showLoading: boolean;
    registered: boolean;
    schema: AdminExtensionSettingField[];
    extensionEnabled: boolean | undefined;
    getValue: (field: AdminExtensionSettingField) => AdminExtensionSettingValue | undefined;
    onChange: (field: AdminExtensionSettingField) => (value: AdminExtensionSettingValue) => void;
    fileActions: (field: AdminExtensionSettingField) => SettingFileActions;
}) {
    if (error) {
        return (
            <div className={settingsBodyClass}>
                <Alert type='danger'>
                    <span>{httpErrorToHuman(error)}</span>
                </Alert>
            </div>
        );
    }

    if (showLoading) {
        return (
            <div className={cn(settingsBodyClass, 'justify-center')}>
                <Spinner size='large' centered />
            </div>
        );
    }

    if (!registered || schema.length === 0) {
        return (
            <div className={cn(settingsBodyClass, 'justify-center')}>
                <SettingsEmptyState extensionEnabled={extensionEnabled} />
            </div>
        );
    }

    return (
        <SettingsSections
            schema={schema}
            renderField={(field) => (
                <SettingField
                    key={field.input}
                    field={field}
                    value={getValue(field)}
                    onChange={onChange(field)}
                    file={field.field === 'file' ? fileActions(field) : undefined}
                />
            )}
        />
    );
}

function SettingsDialogActions({
    submitting,
    canSave,
    onCancel,
    onSubmit,
}: {
    submitting: boolean;
    canSave: boolean;
    onCancel: () => void;
    onSubmit: () => void;
}) {
    return (
        <div className='flex flex-wrap justify-end mt-6'>
            <Button
                type='button'
                isSecondary
                className='w-full sm:w-auto sm:mr-2'
                disabled={submitting}
                onClick={onCancel}
            >
                Отмена
            </Button>
            <Button
                type='button'
                className='w-full mt-4 sm:w-auto sm:mt-0'
                disabled={submitting || !canSave}
                isLoading={submitting}
                onClick={onSubmit}
            >
                Сохранить настройки
            </Button>
        </div>
    );
}

function SettingsDialog({
    extension,
    open,
    onClose,
}: {
    extension: AdminExtension;
    open: boolean;
    onClose: () => void;
}) {
    const id = extension.id ?? '';
    const { data, error, isFetching } = useAdminExtensionSettings(id, { enabled: open && id.length > 0 });
    const updateSettings = useUpdateAdminExtensionSettings();
    const uploadFile = useUploadAdminExtensionSettingFile();
    const clearFile = useClearAdminExtensionSettingFile();
    const [values, setValues] = useState<Record<string, AdminExtensionSettingValue | undefined>>({});
    const submitting = updateSettings.isPending;

    const registered = data?.data?.registered ?? false;
    const schema = data?.data.schema ?? [];
    const showLoading = isFetching && !data;

    const getValue = (field: AdminExtensionSettingField): AdminExtensionSettingValue | undefined =>
        resolveSettingValue(values, field);

    const handleChange = (field: AdminExtensionSettingField) => (value: AdminExtensionSettingValue) =>
        setValues((current) => ({ ...current, [field.input]: value }));

    const fileActions = (field: AdminExtensionSettingField): SettingFileActions => ({
        pending: uploadFile.isPending || clearFile.isPending,
        onUpload: (file) => uploadFile.mutate(uploadAdminExtensionSettingFileInput(id, field.input, file)),
        onClear: () => clearFile.mutate(clearAdminExtensionSettingFileInput(id, field.input)),
    });

    const submit = async () => {
        const settings = buildSettingsPayload(schema, getValue);

        try {
            await updateSettings.mutateAsync(updateAdminExtensionSettingsInput(id, settings));
            onClose();
        } catch {
            // Уведомление об ошибке выводится обработчиком мутации.
        }
    };

    return (
        <Dialog
            open={open}
            title={`Настройки расширения «${extensionName(extension)}»`}
            preventExternalClose={submitting}
            hideCloseIcon={submitting}
            onClose={onClose}
        >
            <SpinnerOverlay visible={submitting} />
            <SettingsDialogContent
                error={error}
                showLoading={showLoading}
                registered={registered}
                schema={schema}
                extensionEnabled={extension.enabled}
                getValue={getValue}
                onChange={handleChange}
                fileActions={fileActions}
            />
            <SettingsDialogActions
                submitting={submitting}
                canSave={registered && schema.length > 0}
                onCancel={onClose}
                onSubmit={submit}
            />
        </Dialog>
    );
}

type ExtensionMutationState = {
    isPending: boolean;
    variables?: { path: { extension?: string } };
};

const isPendingFor = (mutation: ExtensionMutationState, extension: AdminExtension): boolean =>
    mutation.isPending && mutation.variables?.path.extension === extension.id;

const extensionSubtitle = (extension: AdminExtension): string =>
    [extension.version ? `v${extension.version}` : null, extension.author && `Автор: ${extension.author}`]
        .filter(Boolean)
        .join(' · ');

function ExtensionCardHeader({ extension, name, id }: { extension: AdminExtension; name: string; id: string }) {
    const subtitle = extensionSubtitle(extension);
    const badge = stateBadge(extension.state as ExtensionState | undefined, extension.error_phase);

    return (
        <div className='flex min-w-0 items-start gap-3'>
            <ExtensionMark extension={extension} />
            <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                    <h2 className='truncate text-base font-semibold text-foreground' title={`${name} (${id})`}>
                        {name}
                    </h2>
                    {badge && (
                        <span className={cn('rounded-sm px-1.5 py-0.5 text-xs font-medium', badge.className)}>
                            {badge.label}
                        </span>
                    )}
                </div>
                <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                    {subtitle && <>{subtitle} · </>}
                    <span className='font-mono'>{id}</span>
                </p>
            </div>
        </div>
    );
}

function ExtensionCardDetails({ extension }: { extension: AdminExtension }) {
    return (
        <>
            <p
                className='mt-3 line-clamp-3 text-sm leading-relaxed text-card-foreground/80'
                title={extension.description || undefined}
            >
                {extension.description || 'Описание не указано.'}
            </p>

            {extension.state === 'not_registered' && (
                <p className='mt-3 text-sm text-muted-foreground'>
                    Расширение найдено в папке расширений. Включите его, чтобы завершить настройку.
                </p>
            )}

            {extension.error && (
                <div className='mt-3 rounded-sm border border-destructive/30 bg-destructive/10 p-3'>
                    <p className='break-words text-sm text-destructive'>{extension.error}</p>
                    {extension.errored_at && (
                        <p className='mt-1 text-xs text-destructive/80'>
                            {extension.error_phase && <>На этапе {extension.error_phase}, </>}
                            {new Date(extension.errored_at).toLocaleString()}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}

function ExtensionToggle({ extension, name }: { extension: AdminExtension; name: string }) {
    const enableExtension = useEnableAdminExtension();
    const disableExtension = useDisableAdminExtension();
    const pending = isPendingFor(enableExtension, extension) || isPendingFor(disableExtension, extension);
    const allowed = extension.enabled ? canDisable(extension) : canEnable(extension);

    const onChange = (checked: boolean) => {
        if (!extension.id) {
            return;
        }

        if (checked) {
            enableExtension.mutate(enableAdminExtensionInput(extension.id));
        } else {
            disableExtension.mutate(disableAdminExtensionInput(extension.id));
        }
    };

    return (
        <Switch
            aria-label={`Включить расширение «${name}»`}
            className='mr-auto'
            checked={extension.enabled === true}
            disabled={pending || !allowed}
            onChange={onChange}
        />
    );
}

function RemoveExtensionButton({ extension, name }: { extension: AdminExtension; name: string }) {
    const removeExtension = useRemoveAdminExtension();
    const removePending = isPendingFor(removeExtension, extension);

    const submitRemove = (close: () => void) => {
        if (!extension.id) {
            return;
        }

        removeExtension.mutate(removeAdminExtensionInput(extension.id, name), {
            onSuccess: close,
        });
    };

    return (
        <Dialog.ConfirmTrigger
            title='Удалить расширение'
            confirm='Удалить'
            preventExternalClose={removePending}
            hideCloseIcon={removePending}
            pending={removePending}
            trigger={({ onClick }) => (
                <ActionButton
                    label='Удалить'
                    icon={Trash2}
                    color='red'
                    disabled={!canRemove(extension) || removePending}
                    isLoading={removePending}
                    onClick={onClick}
                />
            )}
            onConfirmed={(_event, close) => submitRemove(close)}
        >
            <SpinnerOverlay visible={removePending} />
            При удалении расширения <strong>{name}</strong> будут удалены его файлы, опубликованные ресурсы, настройки,
            добавленные им разрешения дополнительных пользователей и запись об установке.
        </Dialog.ConfirmTrigger>
    );
}

function ExtensionCard({ extension }: { extension: AdminExtension }) {
    const id = extensionId(extension);
    const name = extensionName(extension);

    return (
        <article className='flex h-full flex-col rounded-sm border border-border bg-card p-4'>
            <ExtensionCardHeader extension={extension} name={name} id={id} />
            <ExtensionCardDetails extension={extension} />

            <div className='mt-auto pt-4'>
                <div className='flex flex-wrap items-center gap-2 border-t border-border pt-4'>
                    <ExtensionToggle extension={extension} name={name} />
                    {extension.enabled && (
                        <Dialog.Trigger
                            trigger={({ onClick }) => (
                                <ActionButton label='Настройки' icon={Settings2} onClick={onClick} />
                            )}
                        >
                            {({ open, onClose }) => (
                                <SettingsDialog extension={extension} open={open} onClose={onClose} />
                            )}
                        </Dialog.Trigger>
                    )}
                    <RemoveExtensionButton extension={extension} name={name} />
                </div>
            </div>
        </article>
    );
}

function EmptyExtensionsState() {
    return (
        <Empty className='border bg-card'>
            <EmptyHeader>
                <EmptyMedia variant='icon'>
                    <FileArchive />
                </EmptyMedia>
                <EmptyTitle>Расширения не установлены</EmptyTitle>
                <EmptyDescription>
                    Установите пакет расширения, чтобы добавить в эту панель дополнительные функции и интеграции.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <InstallExtensionButton />
            </EmptyContent>
        </Empty>
    );
}

function ExtensionGrid({ extensions }: { extensions: AdminExtension[] }) {
    if (extensions.length === 0) {
        return <EmptyExtensionsState />;
    }

    return (
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3'>
            {extensions.map((extension) => (
                <ExtensionCard key={extension.id ?? extension.name} extension={extension} />
            ))}
        </div>
    );
}

export default function ExtensionsContainer() {
    const runtimeStates = useExtensionRegistry(getExtensionStates);
    const runtimeFailures = runtimeStates.filter((state) => state.status === 'failed');
    const { data, error, isFetching, refetch } = useAdminExtensions();
    const extensions = data?.data ?? [];
    const failedCount = extensions.filter((extension) => ['error', 'invalid'].includes(extension.state ?? '')).length;

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => refetch()} />;
    }

    return (
        <AdminContentBlock
            title='Админ · Расширения'
            heading='Расширения'
            description='Управляйте расширениями, которые добавляют функции и интеграции в вашу панель.'
        >
            {runtimeFailures.length > 0 && (
                <Alert type='danger' className='mb-4'>
                    {runtimeFailures.map((state) => (
                        <p key={state.id}>
                            {state.id}: {state.error}
                        </p>
                    ))}
                </Alert>
            )}
            {data?.meta?.enabled === false && (
                <Alert type='warning' className='mb-4'>
                    На этой панели расширения отключены, поэтому установленные расширения не загрузятся. Установите{' '}
                    <code className='font-mono'>PTERODACTYL_EXTENSIONS_ENABLED=true</code> в файле{' '}
                    <code className='font-mono'>.env</code>, чтобы включить их.
                </Alert>
            )}
            {data && <ExtensionToolbar failedCount={failedCount} isFetching={isFetching} onRefresh={() => refetch()} />}
            {data ? <ExtensionGrid extensions={extensions} /> : <Spinner size='large' centered />}
        </AdminContentBlock>
    );
}
