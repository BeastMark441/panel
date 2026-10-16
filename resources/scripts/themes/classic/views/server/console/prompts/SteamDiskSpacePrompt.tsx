import { Dialog } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { Close } from './parts';

export default function SteamDiskSpacePrompt({ model }: ViewProps<'server.feature.steamDiskSpace'>) {
    return (
        <Dialog open={model.open} title='Недостаточно места на диске' onClose={model.close}>
            {model.admin ? (
                <>
                    <p className='mt-4'>
                        На этом сервере закончилось доступное место на диске, поэтому процесс установки или обновления
                        не может быть завершён.
                    </p>
                    <p className='mt-4'>
                        Проверьте, что на машине достаточно места, выполнив команду{' '}
                        <code className='font-mono bg-muted rounded-sm py-1 px-2'>df -h</code> на машине, где размещён
                        этот сервер. Удалите файлы или увеличьте доступное место на диске, чтобы устранить проблему.
                    </p>
                </>
            ) : (
                <p className='mt-4'>
                    На этом сервере закончилось доступное место на диске, поэтому процесс установки или обновления не
                    может быть завершён. Свяжитесь с администратором и сообщите ему о нехватке места на диске.
                </p>
            )}
            <Close onClick={model.close} />
        </Dialog>
    );
}
