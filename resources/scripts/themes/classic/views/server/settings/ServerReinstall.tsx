import { Button, Card, cn, Dialog } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';

export default function ServerReinstall({ model, className }: ViewProps<'server.reinstall'>) {
    if (!model.allowed) {
        return null;
    }

    return (
        <Card title='Переустановка сервера' className={cn('relative', className)}>
            <p className='text-sm'>
                При переустановке сервер будет остановлен, а затем повторно запущен скрипт установки, которым он был
                настроен.&nbsp;
                <strong className='font-medium'>
                    Некоторые файлы могут быть удалены или изменены в процессе. Создайте резервную копию данных перед
                    продолжением.
                </strong>
            </p>
            {model.unavailable && <p className='mt-3 text-sm text-muted-foreground'>{model.unavailable}</p>}
            <Dialog.ConfirmTrigger
                title='Подтверждение переустановки сервера'
                confirm='Да, переустановить сервер'
                onConfirmed={async (_event, close) => {
                    if (await model.reinstall()) {
                        close();
                    }
                }}
                trigger={({ onClick }) => (
                    <div className='mt-6 text-right'>
                        <Button.Danger isSecondary disabled={model.unavailable !== null} onClick={onClick}>
                            Переустановить сервер
                        </Button.Danger>
                    </div>
                )}
            >
                Сервер будет остановлен, а некоторые файлы могут быть удалены или изменены. Вы уверены, что хотите
                продолжить?
            </Dialog.ConfirmTrigger>
        </Card>
    );
}
