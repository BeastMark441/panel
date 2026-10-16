import React from 'react';
import type { AppForm } from '@/components/form';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Label from '@/components/elements/Label';
import type { CodemirrorEditorHandle } from '@/components/elements/LazyCodemirrorEditor';
import CodemirrorEditor from '@/components/elements/LazyCodemirrorEditor';
import type { AdminEggListItem } from '@/api/admin/eggs/queries';
import type { EggFormValues } from '@/components/admin/eggs/helpers';

export type EggForm = AppForm<EggFormValues>;

const validateEggName = (value: string): string | undefined => {
    if (value.length < 1) {
        return 'Необходимо указать название шаблона Egg.';
    }

    if (value.length > 191) {
        return 'Название шаблона Egg не должно превышать 191 символ.';
    }

    return undefined;
};

const EggJsonField = ({
    label,
    description,
    initialContent,
    editorRef,
}: {
    label: string;
    description: string;
    initialContent: string;
    editorRef: React.RefObject<CodemirrorEditorHandle | null>;
}) => (
    <div>
        <Label>{label}</Label>
        <CodemirrorEditor
            ref={editorRef}
            mode='application/json'
            initialContent={initialContent}
            className='h-72'
            onContentSaved={() => {}}
        />
        <p className='input-help'>{description}</p>
    </div>
);

interface Props {
    form: EggForm;
    eggs: AdminEggListItem[];
    initialConfigLogs: string;
    initialConfigFiles: string;
    initialConfigStartup: string;
    logRef: React.RefObject<CodemirrorEditorHandle | null>;
    filesRef: React.RefObject<CodemirrorEditorHandle | null>;
    startupRef: React.RefObject<CodemirrorEditorHandle | null>;
}

const EggConfigurationFields = ({
    form,
    eggs,
    initialConfigLogs,
    initialConfigFiles,
    initialConfigStartup,
    logRef,
    filesRef,
    startupRef,
}: Props) => (
    <div className='space-y-4'>
        <TitledGreyBox title='Конфигурация'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-4'>
                    <form.AppField
                        name='name'
                        validators={{
                            onChange: ({ value }) => validateEggName(value),
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='name'
                                label='Название'
                                description={
                                    'Простое человекочитаемое название, используемое как идентификатор этого шаблона Egg. ' +
                                    'Именно его пользователи увидят как тип игрового сервера.'
                                }
                            />
                        )}
                    </form.AppField>
                    <form.AppField name='description'>
                        {(field) => (
                            <field.TextAreaField
                                id='description'
                                label='Описание'
                                rows={6}
                                description='Описание этого шаблона Egg.'
                            />
                        )}
                    </form.AppField>
                    <form.AppField name='forceOutgoingIp'>
                        {(field) => (
                            <field.SwitchField
                                label='Принудительно использовать исходящий IP'
                                description={
                                    'Принудительно направляет весь исходящий сетевой трафик через NAT на основной IP-адрес ' +
                                    'сервера (из основного назначения). Включение этой опции отключает внутреннюю сеть для ' +
                                    'серверов, использующих этот шаблон Egg.'
                                }
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='space-y-4'>
                    <form.AppField
                        name='dockerImages'
                        validators={{
                            onChange: ({ value }) =>
                                value.length >= 1 ? undefined : 'Необходимо указать хотя бы один Docker-образ.',
                        }}
                    >
                        {(field) => (
                            <field.TextAreaField
                                id='dockerImages'
                                label='Docker-образы'
                                rows={4}
                                placeholder='ghcr.io/pterodactyl/yolks:debian'
                                description={
                                    'Docker-образы, доступные серверам, использующим этот шаблон Egg. Указывайте по одному ' +
                                    'образу в строке. Необязательно: укажите отображаемое имя, добавив его перед образом с ' +
                                    'вертикальной чертой, например: Display Name|ghcr.io/my/egg.'
                                }
                            />
                        )}
                    </form.AppField>
                    <form.AppField
                        name='startup'
                        validators={{
                            onChange: ({ value }) =>
                                value.length >= 1 ? undefined : 'Необходимо указать команду запуска.',
                        }}
                    >
                        {(field) => (
                            <field.TextAreaField
                                id='startup'
                                label='Команда запуска'
                                rows={8}
                                description='Команда по умолчанию для запуска новых серверов, созданных на основе этого шаблона Egg.'
                            />
                        )}
                    </form.AppField>
                    <form.AppField name='featuresText'>
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='featuresText'
                                label='Возможности'
                                description={
                                    'Дополнительные возможности шаблона Egg через запятую. Полезно для настройки ' +
                                    'дополнительных модификаций панели.'
                                }
                            />
                        )}
                    </form.AppField>
                </div>
            </div>
        </TitledGreyBox>

        <TitledGreyBox title='Управление процессами'>
            <p className='text-xs text-warning mb-4'>
                Не изменяйте эти настройки, если вы не понимаете, как работает эта система. Все поля обязательны, если
                только вы не выбрали шаблон Egg в выпадающем списке «Скопировать настройки из», в этом случае поля
                процессов можно оставить пустыми, чтобы унаследовать настройки из выбранного шаблона.
            </p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <form.AppField name='configFrom'>
                    {(field) => (
                        <field.SelectField
                            id='configFrom'
                            label='Скопировать настройки из'
                            description='По умолчанию использовать настройки процессов из другого шаблона Egg.'
                            options={[
                                { value: 0, label: 'Нет' },
                                ...eggs.map((egg) => ({
                                    value: egg.attributes.id,
                                    label: `${egg.attributes.name} <${egg.attributes.author}>`,
                                })),
                            ]}
                        />
                    )}
                </form.AppField>
                <form.AppField name='configStop'>
                    {(field) => (
                        <field.TextField
                            type='text'
                            id='configStop'
                            label='Команда остановки'
                            description='Команда, отправляемая процессам сервера для корректной остановки. Для отправки SIGINT введите ^C.'
                        />
                    )}
                </form.AppField>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
                <EggJsonField
                    label='Конфигурация логов'
                    description={
                        'JSON-представление о том, где хранятся файлы логов и должен ли демон создавать кастомные логи. ' +
                        'Оставьте пустым, чтобы унаследовать этот блок из выбранного родительского шаблона Egg.'
                    }
                    initialContent={initialConfigLogs}
                    editorRef={logRef}
                />
                <EggJsonField
                    label='Конфигурационные файлы'
                    description={
                        'JSON-представление о том, какие конфигурационные файлы следует изменять и какие их части менять. ' +
                        'Оставьте пустым, чтобы унаследовать этот блок из выбранного родительского шаблона Egg.'
                    }
                    initialContent={initialConfigFiles}
                    editorRef={filesRef}
                />
                <EggJsonField
                    label='Конфигурация запуска'
                    description={
                        'JSON-представление значений, которые демон должен искать при запуске сервера, чтобы определить ' +
                        'завершение загрузки. Оставьте пустым, чтобы унаследовать этот блок из выбранного родительского шаблона Egg.'
                    }
                    initialContent={initialConfigStartup}
                    editorRef={startupRef}
                />
            </div>
        </TitledGreyBox>
    </div>
);

export default EggConfigurationFields;
