import { Dialog } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { Close, LimitIcon } from './parts';

export default function PidLimitPrompt({ model }: ViewProps<'server.feature.pidLimit'>) {
    return (
        <Dialog
            open={model.open}
            title={model.admin ? 'Достигнут предел памяти или процессов' : 'Возможно, достигнут предел ресурсов'}
            onClose={model.close}
        >
            <LimitIcon />
            {model.admin ? (
                <>
                    <p className='mt-4'>Сервер достиг максимального предела процессов или памяти.</p>
                    <p className='mt-4'>
                        Возможно, поможет увеличить <code className='font-mono bg-muted'>container_pid_limit</code> в
                        конфигурации Wings, <code className='font-mono bg-muted'>config.yml</code>.
                    </p>
                    <p className='mt-4'>
                        <b>Внимание: для применения изменений конфигурационного файла Wings необходимо перезапустить</b>
                    </p>
                </>
            ) : (
                <>
                    <p className='mt-4'>
                        Этот сервер пытается использовать больше ресурсов, чем выделено. Свяжитесь с администратором и
                        передайте ему ошибку, приведённую ниже.
                    </p>
                    <p className='mt-4'>
                        <code className='font-mono bg-muted'>
                            pthread_create failed, Possibly out of memory or process/resource limits reached
                        </code>
                    </p>
                </>
            )}
            <Close onClick={model.close} />
        </Dialog>
    );
}
