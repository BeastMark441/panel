import { Button, Card, CopyOnClick, Input, ip, Label } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';

export default function ServerSftp({ model, className }: ViewProps<'server.sftp'>) {
    if (!model.allowed) {
        return null;
    }

    const host = `${ip(model.ip)}:${model.port}`;

    return (
        <Card title='Данные SFTP' className={className}>
            <div>
                <Label>Адрес сервера</Label>
                <CopyOnClick text={`sftp://${host}`}>
                    <Input type='text' value={`sftp://${host}`} readOnly />
                </CopyOnClick>
            </div>
            <div className='mt-6'>
                <Label>Имя пользователя</Label>
                <CopyOnClick text={model.username}>
                    <Input type='text' value={model.username} readOnly />
                </CopyOnClick>
            </div>
            <div className='mt-6 flex items-center'>
                <div className='flex-1'>
                    <div className='border-l-4 border-accent p-3'>
                        <p className='text-xs text-foreground'>
                            Пароль для SFTP такой же, как пароль для входа в эту панель.
                        </p>
                    </div>
                </div>
                <div className='ml-4'>
                    <a href={`sftp://${model.username}@${host}`}>
                        <Button.Text isSecondary>Запустить SFTP</Button.Text>
                    </a>
                </div>
            </div>
        </Card>
    );
}
