import { useRef } from 'react';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStore } from '@tanstack/react-form';
import { useAppForm } from '@/components/form';
import type { InvisibleRecaptchaHandle } from '@/components/elements/InvisibleRecaptcha';
import InvisibleRecaptcha from '@/components/elements/InvisibleRecaptcha';
import { useSiteSettings } from '@/api/settings/queries';
import { useLogin } from '@/api/auth/queries';
import { toast } from 'sonner';
import Slot from '@/extensions/Slot';
import { useRouteSlotData } from '@/router/routeSlots';

const LoginContainer = () => {
    const navigate = useNavigate();
    const { redirect } = useSearch({ from: '/auth/login' });
    const slotData = useRouteSlotData();
    const recaptchaRef = useRef<InvisibleRecaptchaHandle>(null);

    const loginMutation = useLogin();
    const { enabled: recaptchaEnabled, siteKey } = useSiteSettings().recaptcha;

    const form = useAppForm({
        defaultValues: { username: '', password: '' },
        onSubmit: async ({ value }) => {
            let token = '';

            if (recaptchaEnabled) {
                token = (await recaptchaRef.current?.execute()) ?? '';
                if (!token) {
                    toast.error('Проверка капчи не удалась, пожалуйста, попробуйте еще раз.');

                    return;
                }
            }

            try {
                const response = await loginMutation.mutateAsync({
                    body: {
                        user: value.username,
                        password: value.password,
                        'g-recaptcha-response': token,
                    },
                });

                if (response.data.complete) {
                    window.location.assign(redirect || response.data.intended || '/');

                    return;
                }

                void navigate({
                    to: '/auth/login/checkpoint',
                    search: { redirect },
                    replace: true,
                    state: { token: response.data.confirmation_token },
                });
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting) || loginMutation.isPending;

    return (
        <LoginFormContainer form={form} title='Войдите, чтобы Продолжить' className='w-full flex'>
            <form.AppField
                name='username'
                validators={{
                    onChange: ({ value }) =>
                        value.length >= 1
                            ? undefined
                            : 'Необходимо указать имя пользователя или адрес электронной почты.',
                }}
            >
                {(field) => (
                    <field.TextField
                        light
                        type='text'
                        label='Имя пользователя или Электронная почта'
                        disabled={isSubmitting}
                    />
                )}
            </form.AppField>
            <div className='mt-6'>
                <form.AppField
                    name='password'
                    validators={{
                        onChange: ({ value }) =>
                            value.length >= 1 ? undefined : 'Пожалуйста, введите пароль от вашей учетной записи.',
                    }}
                >
                    {(field) => <field.TextField light type='password' label='Пароль' disabled={isSubmitting} />}
                </form.AppField>
            </div>
            <div className='mt-6'>
                <form.AppForm>
                    <form.SubmitButton size='xlarge'>Войти</form.SubmitButton>
                </form.AppForm>
            </div>
            <Slot name='auth.login.form.after' data={slotData} />
            {recaptchaEnabled && <InvisibleRecaptcha ref={recaptchaRef} siteKey={siteKey || ''} />}
            <div className='mt-6 text-center'>
                <Link
                    to='/auth/password'
                    className='text-xs text-muted-foreground tracking-wide no-underline uppercase hover:text-foreground'
                >
                    Забыли пароль?
                </Link>
            </div>
        </LoginFormContainer>
    );
};

export default LoginContainer;
