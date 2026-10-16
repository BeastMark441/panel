import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import type { AdminEgg } from '@/api/admin/eggs/queries';
import { updateAdminEggScriptInput, useAdminEggs, useUpdateAdminEggScript } from '@/api/admin/eggs/queries';
import { useEggDetail } from '@/components/admin/eggs/useEggDetail';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import type { CodemirrorEditorHandle } from '@/components/elements/LazyCodemirrorEditor';
import CodemirrorEditor from '@/components/elements/LazyCodemirrorEditor';

interface Props {
    egg: AdminEgg;
}

interface Values {
    scriptContainer: string;
    scriptEntry: string;
    scriptIsPrivileged: boolean;
    copyScriptFrom: number;
}

const eggToFormValues = (egg: AdminEgg): Values => ({
    scriptContainer: egg.attributes.script.container,
    scriptEntry: egg.attributes.script.entry,
    scriptIsPrivileged: egg.attributes.script.privileged ?? false,
    copyScriptFrom: egg.attributes.script.extends ?? 0,
});

function EggScriptForm({ egg }: Props) {
    const scriptEditor = useRef<CodemirrorEditorHandle | null>(null);

    const { data: eggsResponse } = useAdminEggs();
    const eggs = eggsResponse?.data ?? [];
    const updateEggScript = useUpdateAdminEggScript();

    const form = useAppForm({
        defaultValues: eggToFormValues(egg),
        onSubmit: async ({ value }) => {
            try {
                const scriptInstall = scriptEditor.current?.getValue() ?? egg.attributes.script.install;

                await updateEggScript.mutateAsync(
                    updateAdminEggScriptInput(egg.attributes.id, {
                        script_install: scriptInstall,
                        script_is_privileged: value.scriptIsPrivileged,
                        script_entry: value.scriptEntry,
                        script_container: value.scriptContainer,
                        copy_script_from: Number(value.copyScriptFrom) > 0 ? Number(value.copyScriptFrom) : null,
                    })
                );
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const copyScriptFrom = useStore(form.store, (state) => state.values.copyScriptFrom);
    const copyableEggs = eggs.filter(
        (option) => option.attributes.id !== egg.attributes.id && option.attributes.script.extends === null
    );
    const copiedFromEgg = eggs.find((option) => option.attributes.id === Number(copyScriptFrom));
    const dependentEggs = eggs.filter((option) => option.attributes.script.extends === egg.attributes.id);

    return (
        <Form form={form}>
            <TitledGreyBox title='Скрипт установки'>
                {Number(copyScriptFrom) > 0 && (
                    <p className='text-xs text-warning mb-4'>
                        Этот шаблон Egg копирует свой скрипт установки
                        {copiedFromEgg ? (
                            <>
                                {' '}
                                из{' '}
                                <Link
                                    to='/panel/eggs/$eggId/script'
                                    params={{ eggId: copiedFromEgg.attributes.id }}
                                    className='text-accent transition-colors duration-150 hover:text-accent/80'
                                >
                                    {copiedFromEgg.attributes.name}
                                </Link>
                            </>
                        ) : (
                            ' из другого шаблона'
                        )}
                        . Изменения скрипта ниже не будут применены, пока в выпадающем списке «Скопировать скрипт из»
                        выбрано не «Нет».
                    </p>
                )}
                <CodemirrorEditor
                    ref={scriptEditor}
                    mode='text/x-sh'
                    initialContent={egg.attributes.script.install ?? undefined}
                    className='h-96'
                    onContentSaved={() => {}}
                />
            </TitledGreyBox>
            <TitledGreyBox title='Настройки скрипта' className='mt-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <form.AppField name='copyScriptFrom'>
                        {(field) => (
                            <field.SelectField
                                id='copyScriptFrom'
                                label='Скопировать скрипт из'
                                description='Если выбрано, скрипт выше игнорируется и используется скрипт выбранного шаблона Egg.'
                                options={[
                                    { value: 0, label: 'Нет' },
                                    ...copyableEggs.map((option) => ({
                                        value: option.attributes.id,
                                        label: option.attributes.name,
                                    })),
                                ]}
                            />
                        )}
                    </form.AppField>
                    <form.AppField name='scriptContainer'>
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='scriptContainer'
                                label='Контейнер скрипта'
                                description='Docker-контейнер, используемый при запуске этого скрипта для сервера.'
                            />
                        )}
                    </form.AppField>
                    <form.AppField name='scriptEntry'>
                        {(field) => (
                            <field.TextField
                                type='text'
                                id='scriptEntry'
                                label='Команда entrypoint скрипта'
                                description='Команда entrypoint, используемая для этого скрипта.'
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-6'>
                    <form.AppField name='scriptIsPrivileged'>
                        {(field) => (
                            <field.SwitchField
                                label='Привилегированный скрипт установки'
                                description={
                                    'Выполнять скрипт установки с повышенными привилегиями, предоставляя доступ к ' +
                                    'docker-сокету узла. Включайте эту опцию только в том случае, если вы доверяете скрипту.'
                                }
                            />
                        )}
                    </form.AppField>
                </div>
            </TitledGreyBox>
            {dependentEggs.length > 0 && (
                <TitledGreyBox title='Шаблоны Egg, использующие этот скрипт' className='mt-6'>
                    <p className='text-sm text-muted-foreground mb-4'>
                        Изменения этого скрипта установки влияют на перечисленные шаблоны Egg, так как они копируют его.
                    </p>
                    <div className='space-y-2'>
                        {dependentEggs.map((dependent) => (
                            <Link
                                key={dependent.attributes.id}
                                to='/panel/eggs/$eggId/script'
                                params={{ eggId: dependent.attributes.id }}
                                className='block rounded-sm bg-muted px-3 py-2 text-sm text-foreground hover:text-accent'
                            >
                                {dependent.attributes.name}
                            </Link>
                        ))}
                    </div>
                </TitledGreyBox>
            )}
            <div className='flex justify-end mt-6'>
                <form.AppForm>
                    <form.SubmitButton>Сохранить изменения</form.SubmitButton>
                </form.AppForm>
            </div>
        </Form>
    );
}

export default function EggScriptTab() {
    const egg = useEggDetail();

    return <EggScriptForm key={egg.attributes.id} egg={egg} />;
}
