import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Button from '@/components/elements/Button';
import { useCurrentUser } from '@/api/account/queries';
import { useConsolePatternTrigger } from '@/components/server/features/useConsolePatternTrigger';

const steamDiskSpaceErrors = ['steamcmd needs 250mb of free disk space to update', '0x202 after update job'];

const SteamDiskSpaceFeature = () => {
    const dialog = useConsolePatternTrigger(steamDiskSpaceErrors);
    const loading = false;
    const isAdmin = useCurrentUser().rootAdmin;

    return (
        <Dialog
            open={dialog.open}
            title='Недостаточно места на диске'
            onClose={dialog.hide}
            preventExternalClose={loading}
            hideCloseIcon={loading}
        >
            <SpinnerOverlay visible={loading} />
            {isAdmin ? (
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
                    <div className='mt-8 sm:flex items-center justify-end'>
                        <Button onClick={dialog.hide} className='w-full sm:w-auto border-transparent'>
                            Закрыть
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <p className='mt-4'>
                        На этом сервере закончилось доступное место на диске, поэтому процесс установки или обновления
                        не может быть завершён. Свяжитесь с администратором и сообщите ему о нехватке места на диске.
                    </p>
                    <div className='mt-8 sm:flex items-center justify-end'>
                        <Button onClick={dialog.hide} className='w-full sm:w-auto border-transparent'>
                            Закрыть
                        </Button>
                    </div>
                </>
            )}
        </Dialog>
    );
};

export default SteamDiskSpaceFeature;
