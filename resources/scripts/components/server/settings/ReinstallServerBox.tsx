import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Button from '@/components/elements/Button';
import { Dialog } from '@/components/elements/dialog';
import { useCurrentServer, useReinstallServer } from '@/api/server/queries';
import { canReinstallServer, SKIPPED_INSTALL_SCRIPT_MESSAGE } from '@/lib/serverStatus';

const ReinstallServerBox = () => {
    const server = useCurrentServer()!;
    const reinstallServer = useReinstallServer();
    const canReinstall = canReinstallServer(server.attributes.status, server.attributes.skip_scripts);

    const reinstall = async (close: () => void) => {
        try {
            await reinstallServer.mutateAsync({ path: { server_uuid: server.attributes.uuid } });
            close();
        } catch {
            // Error toast is handled by the mutation.
        }
    };

    return (
        <TitledGreyBox title='Переустановка сервера' className='relative'>
            <p className='text-sm'>
                При переустановке сервер будет остановлен, а затем повторно запущен скрипт установки, которым он был
                настроен.&nbsp;
                <strong className='font-medium'>
                    Некоторые файлы могут быть удалены или изменены в процессе, поэтому сохраните свои данные перед
                    продолжением.
                </strong>
            </p>
            {!canReinstall && <p className='mt-3 text-sm text-muted-foreground'>{SKIPPED_INSTALL_SCRIPT_MESSAGE}</p>}
            <Dialog.ConfirmTrigger
                title='Подтверждение переустановки сервера'
                confirm='Да, переустановить сервер'
                onConfirmed={(_event, close) => reinstall(close)}
                trigger={({ onClick }) => (
                    <div className='mt-6 text-right'>
                        <Button.Danger isSecondary disabled={!canReinstall} onClick={onClick}>
                            Переустановить сервер
                        </Button.Danger>
                    </div>
                )}
            >
                Сервер будет остановлен, а некоторые файлы могут быть удалены или изменены. Вы уверены, что хотите
                продолжить?
            </Dialog.ConfirmTrigger>
        </TitledGreyBox>
    );
};

export default ReinstallServerBox;
