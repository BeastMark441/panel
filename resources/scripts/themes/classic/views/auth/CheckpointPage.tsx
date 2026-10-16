import { Button, PanelLink } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { TextField } from '../shared/fields';
import AuthCard, { authLinkClass } from './AuthCard';

export default function CheckpointPage({ model, className }: ViewProps<'page.auth.checkpoint'>) {
    const { recovery } = model;

    return (
        <AuthCard title='Проверка устройства' submit={model.submit} className={className}>
            <div className='mt-6'>
                <TextField
                    field={model.fields.code}
                    light
                    title={recovery ? 'Код восстановления' : 'Код аутентификации'}
                    description={
                        recovery
                            ? 'Чтобы продолжить, введите один из кодов восстановления, сгенерированных при настройке двухфакторной аутентификации для этой учетной записи.'
                            : 'Введите двухфакторный токен, сгенерированный вашим устройством.'
                    }
                    autoFocus
                />
            </div>
            <div className='mt-6'>
                <Button type='submit' size='xlarge' disabled={!model.canSubmit} isLoading={model.submitting}>
                    Продолжить
                </Button>
            </div>
            <div className='mt-6 text-center'>
                <button
                    type='button'
                    onClick={model.toggleRecovery}
                    className='cursor-pointer appearance-none border-0 bg-transparent p-0 text-xs text-muted-foreground tracking-wide uppercase no-underline hover:text-foreground'
                >
                    {recovery ? 'У меня есть устройство' : 'Я потерял свое устройство'}
                </button>
            </div>
            <div className='mt-6 text-center'>
                <PanelLink destination={model.login} className={authLinkClass}>
                    Вернуться к входу
                </PanelLink>
            </div>
        </AuthCard>
    );
}
