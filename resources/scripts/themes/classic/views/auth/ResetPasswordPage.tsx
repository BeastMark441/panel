import { Button, Input, PanelLink } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { TextField } from '../shared/fields';
import AuthCard, { authLinkClass } from './AuthCard';

export default function ResetPasswordPage({ model, className }: ViewProps<'page.auth.passwordReset'>) {
    const { fields, Captcha } = model;

    return (
        <AuthCard title='Сбросить пароль' submit={model.submit} className={className}>
            <div>
                <label htmlFor='password-reset-email'>Электронная почта</label>
                <Input id='password-reset-email' value={model.email} $isLight disabled />
            </div>
            <div className='mt-6'>
                <TextField
                    field={fields.password}
                    light
                    label='Новый пароль'
                    description='Пароли должны состоять как минимум из 8 символов.'
                />
            </div>
            <div className='mt-6'>
                <TextField field={fields.passwordConfirmation} light label='Подтвердите новый пароль' />
            </div>
            <div className='mt-6'>
                <Button type='submit' size='xlarge' disabled={!model.canSubmit} isLoading={model.submitting}>
                    Сбросить пароль
                </Button>
            </div>
            {Captcha && <Captcha />}
            <div className='mt-6 text-center'>
                <PanelLink destination={model.login} className={authLinkClass}>
                    Вернуться к входу
                </PanelLink>
            </div>
        </AuthCard>
    );
}
