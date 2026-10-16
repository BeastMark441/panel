import { Button, PanelLink } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { TextField } from '../shared/fields';
import AuthCard, { authLinkClass } from './AuthCard';

export default function ForgotPasswordPage({ model, className }: ViewProps<'page.auth.password'>) {
    const { Captcha } = model;

    return (
        <AuthCard title='Запрос на сброс пароля' submit={model.submit} className={className}>
            <TextField
                field={model.fields.email}
                light
                label='Электронная почта'
                description='Введите адрес электронной почты, привязанный к вашей учетной записи, чтобы получить инструкции по сбросу пароля.'
            />
            <div className='mt-6'>
                <Button type='submit' size='xlarge' disabled={!model.canSubmit} isLoading={model.submitting}>
                    Отправить письмо
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
