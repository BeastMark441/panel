import React from 'react';
import Button from '@/components/elements/Button';
import Can from '@/components/elements/Can';
import { useServerStatus, useSocketConnected, useSocketInstance } from '@/state/server';
import type { PowerAction } from '@/components/server/console/types';
import { Dialog } from '@/components/elements/dialog';

interface PowerButtonProps {
    className?: string;
}

export default function PowerButtons({ className }: PowerButtonProps) {
    const status = useServerStatus();
    const instance = useSocketInstance();
    const connected = useSocketConnected();

    const killable = status === 'stopping';
    const onButtonClick = (action: PowerAction, e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void => {
        e.preventDefault();

        if (instance) {
            instance.send('set state', action);
        }
    };

    return (
        <div className={className}>
            <Can action='control.start'>
                <Button
                    className='flex-1'
                    disabled={!connected || status !== 'offline'}
                    onClick={onButtonClick.bind(null, 'start')}
                >
                    Запустить
                </Button>
            </Can>
            <Can action='control.restart'>
                <Button.Text
                    className='flex-1'
                    disabled={!connected || !status}
                    onClick={onButtonClick.bind(null, 'restart')}
                >
                    Перезапустить
                </Button.Text>
            </Can>
            <Can action='control.stop'>
                {killable ? (
                    <Dialog.ConfirmTrigger
                        key='killable'
                        hideCloseIcon
                        title='Принудительная остановка процесса'
                        confirm='Продолжить'
                        trigger={({ onClick }) => (
                            <Button.Danger className='flex-1' disabled={!connected} onClick={onClick}>
                                Прервать
                            </Button.Danger>
                        )}
                        onConfirmed={(event, close) => {
                            close();
                            onButtonClick('kill', event);
                        }}
                    >
                        Принудительная остановка сервера может привести к повреждению данных.
                    </Dialog.ConfirmTrigger>
                ) : (
                    <Button.Danger
                        key='stoppable'
                        className='flex-1'
                        disabled={!connected || status === 'offline'}
                        onClick={onButtonClick.bind(null, 'stop')}
                    >
                        Остановить
                    </Button.Danger>
                )}
            </Can>
        </div>
    );
}
