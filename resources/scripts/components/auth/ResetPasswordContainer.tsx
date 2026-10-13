import { useRef } from 'react';
import { Link, useParams, useSearch } from '@tanstack/react-router';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useAppForm } from '@/components/form';
import { TextInput } from '@/components/form/controls';
import type { InvisibleRecaptchaHandle } from '@/components/elements/InvisibleRecaptcha';
import InvisibleRecaptcha from '@/components/elements/InvisibleRecaptcha';
import { useSiteSettings } from '@/api/settings/queries';
import { usePerformPasswordReset } from '@/api/auth/queries';
import { toast } from 'sonner';

export default function ResetPasswordContainer() {
    const params = useParams({ strict: false });
    const search = useSearch({ from: '/auth/password/reset/$token' });
    const email = search.email ?? '';
    const recaptchaRef = useRef<InvisibleRecaptchaHandle>(null);
    const resetPassword = usePerformPasswordReset();
    const { enabled: recaptchaEnabled, siteKey } = useSiteSettings().recaptcha;

    const form = useAppForm({
        defaultValues: { password: '', passwordConfirmation: '' },
        onSubmit: async ({ value }) => {
            let recaptchaToken = '';

            if (recaptchaEnabled) {
                recaptchaToken = (await recaptchaRef.current?.execute()) ?? '';
                if (!recaptchaToken) {
                    toast.error('Проверка капчи не удалась, пожалуйста, попробуйте еще раз.');

                    return;
                }
            }

            try {
                await resetPassword.mutateAsync({
                    body: {
                        email,
                        token: params.token ?? '',
                        password: value.password,
                        password_confirmation: value.passwordConfirmation,
                        'g-recaptcha-response': recaptchaToken,
                    },
                });
                window.location.assign('/');
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    return (
        <LoginFormContainer form={form} title='Сбросить пароль' className='w-full flex'>
            <div>
                <label htmlFor='password-reset-email'>Электронная почта</label>
                <TextInput id='password-reset-email' value={email} $isLight disabled />
            </div>
            <div className='mt-6'>
                <form.AppField
                    name='password'
                    validators={{
                        onChange: ({ value }) =>
                            value.length >= 8
                                ? undefined
                                : 'Ваш новый пароль должен состоять как минимум из 8 символов.',
                    }}
                >
                    {(field) => (
                        <field.TextField
                            light
                            label='Новый пароль'
                            type='password'
                            description='Пароли должны состоять как минимум из 8 символов.'
                        />
                    )}
                </form.AppField>
            </div>
            <div className='mt-6'>
                <form.AppField
                    name='passwordConfirmation'
                    validators={{
                        onChangeListenTo: ['password'],
                        onChange: ({ value, fieldApi }) =>
                            value === fieldApi.form.getFieldValue('password')
                                ? undefined
                                : 'Ваш новый пароль не совпадает.',
                    }}
                >
                    {(field) => <field.TextField light label='Подтвердите новый пароль' type='password' />}
                </form.AppField>
            </div>
            <div className='mt-6'>
                <form.AppForm>
                    <form.SubmitButton size='xlarge'>Сбросить пароль</form.SubmitButton>
                </form.AppForm>
            </div>
            {recaptchaEnabled && <InvisibleRecaptcha ref={recaptchaRef} siteKey={siteKey || ''} />}
            <div className='mt-6 text-center'>
                <Link
                    to='/auth/login'
                    className='text-xs text-muted-foreground tracking-wide no-underline uppercase hover:text-foreground'
                >
                    Вернуться к входу
                </Link>
            </div>
        </LoginFormContainer>
    );
}
