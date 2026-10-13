import { useState } from 'react';
import { Link, Navigate, useLocation, useSearch } from '@tanstack/react-router';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useAppForm } from '@/components/form';
import { useLoginCheckpoint } from '@/api/auth/queries';

export default function LoginCheckpointContainer() {
    const location = useLocation();

    // The login screen hands off the 2FA confirmation token via history state.
    const state = location.state as { token?: string } | null;
    const { redirect } = useSearch({ from: '/auth/login/checkpoint' });
    const loginCheckpoint = useLoginCheckpoint();
    const [isMissingDevice, setIsMissingDevice] = useState(false);

    const form = useAppForm({
        defaultValues: { code: '', recoveryCode: '' },
        onSubmit: async ({ value }) => {
            try {
                const response = await loginCheckpoint.mutateAsync({
                    body: {
                        confirmation_token: state?.token || '',
                        authentication_code: value.code,
                        recovery_token: value.recoveryCode || undefined,
                    },
                });

                if (response.data.complete) {
                    window.location.assign(redirect || response.data.intended || '/');
                }
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    if (!state?.token) {
        return <Navigate to='/auth/login' search={{ redirect }} replace />;
    }

    return (
        <LoginFormContainer form={form} title='Проверка устройства' className='w-full flex'>
            <div className='mt-6'>
                <form.AppField name={isMissingDevice ? 'recoveryCode' : 'code'}>
                    {(field) => (
                        <field.TextField
                            light
                            title={isMissingDevice ? 'Код восстановления' : 'Код аутентификации'}
                            description={
                                isMissingDevice
                                    ? 'Чтобы продолжить, введите один из кодов восстановления, сгенерированных при настройке двухфакторной аутентификации для этой учетной записи.'
                                    : 'Введите двухфакторный токен, сгенерированный вашим устройством.'
                            }
                            type='text'
                            autoComplete='one-time-code'
                            autoFocus
                        />
                    )}
                </form.AppField>
            </div>
            <div className='mt-6'>
                <form.AppForm>
                    <form.SubmitButton size='xlarge'>Продолжить</form.SubmitButton>
                </form.AppForm>
            </div>
            <div className='mt-6 text-center'>
                <button
                    type='button'
                    onClick={() => {
                        form.setFieldValue('code', '');
                        form.setFieldValue('recoveryCode', '');
                        setIsMissingDevice((s) => !s);
                    }}
                    className='cursor-pointer appearance-none border-0 bg-transparent p-0 text-xs text-muted-foreground tracking-wide uppercase no-underline hover:text-foreground'
                >
                    {isMissingDevice ? 'У меня есть устройство' : 'Я потерял свое устройство'}
                </button>
            </div>
            <div className='mt-6 text-center'>
                <Link
                    to='/auth/login'
                    search={{ redirect }}
                    className='text-xs text-muted-foreground tracking-wide uppercase no-underline hover:text-foreground'
                >
                    Вернуться к входу
                </Link>
            </div>
        </LoginFormContainer>
    );
}
