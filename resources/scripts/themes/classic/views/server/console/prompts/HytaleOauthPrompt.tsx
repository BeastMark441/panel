import { Button, Dialog } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { cancelClass } from './parts';

export default function HytaleOauthPrompt({ model }: ViewProps<'server.feature.hytaleOauth'>) {
    return (
        <Dialog open={model.open} title='Требуется аутентификация' onClose={model.close}>
            <p className='text-foreground'>
                Чтобы скачать или обновить файлы сервера, необходимо пройти аутентификацию в вашей учётной записи
                Hytale. Войдите в аккаунт, чтобы продолжить.
            </p>
            <div className='mt-8 sm:flex items-center justify-end'>
                <Button isSecondary onClick={model.close} className={cancelClass}>
                    Отмена
                </Button>
                <Button onClick={model.login} disabled={!model.link} className='mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto'>
                    Войти
                </Button>
            </div>
        </Dialog>
    );
}
