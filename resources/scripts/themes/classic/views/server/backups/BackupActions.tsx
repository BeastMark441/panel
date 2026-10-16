import { useState } from 'react';
import { CloudDownload, Lock, PackageOpen, Unlock } from 'lucide-react';
import {
    Checkbox,
    DeleteAction,
    Dialog,
    DropdownMenuItem,
    RowActions,
    RowActionsMenu,
    type BackupListModel,
    type BackupSummary,
} from '@/sdk';

type Confirming = '' | 'unlock' | 'restore' | 'delete';

/** A backup's delete action and its menu of download, restore and lock. */
export default function BackupActions({ model, backup }: { model: BackupListModel; backup: BackupSummary }) {
    const [confirming, setConfirming] = useState<Confirming>('');
    const [truncate, setTruncate] = useState(false);
    const { actions, pending, permissions } = model;
    const close = () => setConfirming('');
    const closeOnSuccess = (done: boolean) => {
        if (done) {
            close();
        }
    };

    const onLockToggle = () => {
        if (backup.locked && confirming !== 'unlock') {
            setConfirming('unlock');

            return;
        }

        void actions.toggleLock(backup.uuid).then(closeOnSuccess);
    };

    return (
        <>
            <Dialog.Confirm
                open={confirming === 'unlock'}
                onClose={close}
                title={`Разблокировать «${backup.name}»`}
                pending={pending.lock}
                onConfirmed={onLockToggle}
            >
                Эта резервная копия больше не будет защищена от автоматического или случайного удаления.
            </Dialog.Confirm>
            <Dialog.Confirm
                open={confirming === 'restore'}
                onClose={close}
                confirm='Восстановить'
                title={`Восстановить «${backup.name}»`}
                pending={pending.restore}
                onConfirmed={() => void actions.restore(backup.uuid, truncate).then(closeOnSuccess)}
            >
                <p>
                    Сервер будет остановлен. До завершения восстановления вы не сможете управлять питанием, обращаться к
                    файловому менеджеру или создавать дополнительные резервные копии.
                </p>
                <p className='mt-4 -mb-2 bg-card p-3 rounded-sm'>
                    <label htmlFor='restore_truncate' className='text-base flex items-center cursor-pointer'>
                        <Checkbox
                            className='mr-2 h-5 w-5 data-[checked]:border-destructive data-[checked]:bg-destructive data-[checked]:text-destructive-foreground'
                            id='restore_truncate'
                            value='true'
                            checked={truncate}
                            onChange={() => setTruncate((checked) => !checked)}
                        />
                        Удалить все файлы перед восстановлением резервной копии.
                    </label>
                </p>
            </Dialog.Confirm>
            <Dialog.Confirm
                title={`Удалить «${backup.name}»`}
                confirm='Продолжить'
                open={confirming === 'delete'}
                pending={pending.remove}
                onClose={close}
                onConfirmed={() => void actions.remove(backup.uuid).then(closeOnSuccess)}
            >
                Это необратимая операция. Восстановить удалённую резервную копию невозможно.
            </Dialog.Confirm>
            <RowActions>
                {permissions.delete && (
                    <DeleteAction
                        aria-label={`Удалить ${backup.name}`}
                        disabled={backup.locked}
                        disabledReason='Сначала разблокируйте эту резервную копию, чтобы удалить её.'
                        onClick={() => setConfirming('delete')}
                    />
                )}
                {backup.successful && (
                    <RowActionsMenu label={`Дополнительные действия для ${backup.name}`}>
                        {permissions.download && (
                            <DropdownMenuItem onClick={() => void actions.download(backup.uuid)} icon={CloudDownload}>
                                Скачать
                            </DropdownMenuItem>
                        )}
                        {permissions.restore && (
                            <DropdownMenuItem onClick={() => setConfirming('restore')} icon={PackageOpen}>
                                Восстановить
                            </DropdownMenuItem>
                        )}
                        {permissions.delete && (
                            <DropdownMenuItem onClick={onLockToggle} icon={backup.locked ? Unlock : Lock}>
                                {backup.locked ? 'Разблокировать' : 'Заблокировать'}
                            </DropdownMenuItem>
                        )}
                    </RowActionsMenu>
                )}
            </RowActions>
        </>
    );
}
