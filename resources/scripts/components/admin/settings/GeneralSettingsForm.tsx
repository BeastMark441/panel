import { useAppForm, Form } from '@/components/form';
import type { AdminSettings } from '@/api/admin/settings/queries';
import { useAdminLanguages } from '@/api/admin/languages/queries';
import { updateAdminGeneralSettingsInput, useUpdateAdminGeneralSettings } from '@/api/admin/settings/queries';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { languageOptions } from '@/components/admin/languageOptions';

export default function GeneralSettingsForm({ settings }: { settings: AdminSettings }) {
    const readOnly = settings.meta.load_environment_only;
    const updateGeneralSettings = useUpdateAdminGeneralSettings();
    const { data: languages, isLoading: languagesLoading } = useAdminLanguages();
    const languagesList = languageOptions(languages, settings.general['app:locale']);

    const form = useAppForm({
        defaultValues: {
            name: settings.general['app:name'],
            twoFactorRequired: settings.general['pterodactyl:auth:2fa_required'],
            locale: settings.general['app:locale'],
        },
        onSubmit: async ({ value }) => {
            if (readOnly) {
                return;
            }

            try {
                await updateGeneralSettings.mutateAsync(updateAdminGeneralSettingsInput(value));
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    return (
        <Form form={form}>
            <TitledGreyBox title='Общие'>
                <form.AppField name='name'>
                    {(field) => (
                        <field.TextField
                            type='text'
                            id='app_name'
                            label='Название компании'
                            description='Название вашей компании, используемое во всей Панели.'
                            disabled={readOnly}
                        />
                    )}
                </form.AppField>
                <div className='mt-4'>
                    <form.AppField name='twoFactorRequired'>
                        {(field) => (
                            <field.SelectField
                                id='twoFactorRequired'
                                label='Требовать двухфакторную аутентификацию'
                                options={[
                                    { value: 0, label: 'Не обязательно' },
                                    { value: 1, label: 'Обязательно для Администраторов' },
                                    { value: 2, label: 'Обязательно для всех пользователей' },
                                ]}
                                disabled={readOnly}
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-4'>
                    <form.AppField name='locale'>
                        {(field) => (
                            <field.SelectField
                                id='app_locale'
                                label='Язык по умолчанию'
                                options={languagesList}
                                disabled={readOnly || (languagesLoading && !languages)}
                                placeholder='Выберите язык'
                                description='Язык, используемый для панели по умолчанию.'
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='flex justify-end mt-4'>
                    <form.AppForm>
                        <form.SubmitButton disabled={readOnly}>Сохранить Изменения</form.SubmitButton>
                    </form.AppForm>
                </div>
            </TitledGreyBox>
        </Form>
    );
}
