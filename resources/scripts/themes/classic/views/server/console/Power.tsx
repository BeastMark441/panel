import { Button, Dialog } from '@/sdk';
import { Slot, type ViewProps } from '@/sdk/theme';

export default function Power({ model, className }: ViewProps<'server.power'>) {
    const { permissions, enabled, actions } = model;

    return (
        <div className={className}>
            <Slot name='server.console.power.before' data={model.server} />
            {(permissions.start || permissions.stop || permissions.restart) && (
                <div className='flex sm:justify-end space-x-2'>
                    {permissions.start && (
                        <Button className='flex-1' disabled={!enabled.start} onClick={actions.start}>
                            Запустить
                        </Button>
                    )}
                    {permissions.restart && (
                        <Button.Text className='flex-1' disabled={!enabled.restart} onClick={actions.restart}>
                            Перезапустить
                        </Button.Text>
                    )}
                    {permissions.stop &&
                        (model.killable ? (
                            <Dialog.ConfirmTrigger
                                key='killable'
                                hideCloseIcon
                                title='Принудительная остановка процесса'
                                confirm='Продолжить'
                                trigger={({ onClick }) => (
                                    <Button.Danger className='flex-1' disabled={!enabled.kill} onClick={onClick}>
                                        Прервать
                                    </Button.Danger>
                                )}
                                onConfirmed={(_event, close) => {
                                    close();
                                    actions.kill();
                                }}
                            >
                                Принудительная остановка сервера может привести к повреждению данных.
                            </Dialog.ConfirmTrigger>
                        ) : (
                            <Button.Danger
                                key='stoppable'
                                className='flex-1'
                                disabled={!enabled.stop}
                                onClick={actions.stop}
                            >
                                Остановить
                            </Button.Danger>
                        ))}
                </div>
            )}
            <Slot name='server.console.power.after' data={model.server} />
        </div>
    );
}
