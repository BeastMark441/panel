import { useState } from 'react';
import { Dialog } from '@/components/elements/dialog';
import Button from '@/components/elements/Button';
import { useConsolePatternTrigger } from '@/components/server/features/useConsolePatternTrigger';
import { extractHytaleOauthUrl, hytaleOauthUrlPattern } from '@/components/server/features/hytaleOauth';

const hytaleOauthUrlPatterns = [hytaleOauthUrlPattern];

const HytaleOauthRequireFeature = () => {
    const [link, setLink] = useState<string | null>(null);
    const dialog = useConsolePatternTrigger(hytaleOauthUrlPatterns, {
        onTrigger: (line) => setLink(extractHytaleOauthUrl(line)),
    });

    const close = () => {
        dialog.hide();
        setLink(null);
    };

    const handleLogin = () => {
        if (link) {
            window.open(link, '_blank', 'noopener,noreferrer');
            close();
        }
    };

    return (
        <Dialog open={dialog.open} title='Требуется аутентификация' onClose={close}>
            <p className='text-foreground'>
                Чтобы скачать или обновить файлы сервера, необходимо пройти аутентификацию в вашей учётной записи
                Hytale. Войдите в аккаунт, чтобы продолжить.
            </p>
            <div className='mt-8 sm:flex items-center justify-end'>
                <Button isSecondary onClick={close} className='w-full sm:w-auto border-transparent'>
                    Отмена
                </Button>
                <Button onClick={handleLogin} disabled={!link} className='mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto'>
                    Войти
                </Button>
            </div>
        </Dialog>
    );
};

export default HytaleOauthRequireFeature;
