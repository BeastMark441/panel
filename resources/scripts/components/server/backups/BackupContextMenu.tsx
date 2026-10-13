import { useState } from 'react';
import { CloudDownload, Lock, PackageOpen, Unlock } from 'lucide-react';
import DropdownMenu from '@/components/elements/dropdown/DropdownMenu';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Can from '@/components/elements/Can';
import { DeleteAction, RowActions, RowActionsMenu } from '@/components/elements/table/RowActions';
import Checkbox from '@/components/ui/Checkbox';
import { Dialog } from '@/components/elements/dialog';
import { useCurrentServerUuid } from '@/api/server/queries';
import {
    backupDownloadUrlInput,
    deleteServerBackupInput,
    restoreServerBackupInput,
    type ServerBackup,
    toggleServerBackupLockInput,
    useBackupDownloadUrl,
    useDeleteServerBackup,
    useRestoreServerBackup,
    useToggleServerBackupLock,
} from '@/api/server/backups/queries';

interface Props {
    backup: ServerBackup;
    page: number;
}

const BackupContextMenu = ({ backup, page }: Props) => {
    const uuid = useCurrentServerUuid()!;
    const { attributes } = backup;
    const [modal, setModal] = useState('');
    const [truncate, setTruncate] = useState(false);
    const downloadBackup = useBackupDownloadUrl();
    const deleteBackup = useDeleteServerBackup(backup);
    const restoreBackup = useRestoreServerBackup(backup);
    const toggleBackupLock = useToggleServerBackupLock(page, backup);

    const loading =
        downloadBackup.isPending || deleteBackup.isPending || restoreBackup.isPending || toggleBackupLock.isPending;

    const doDownload = () => {
        downloadBackup
            .mutateAsync(backupDownloadUrlInput(uuid, backup))
            .then((url) => {
                window.location.assign(url);
            })
            .catch(() => {});
    };

    const doDeletion = () => {
        deleteBackup
            .mutateAsync(deleteServerBackupInput(uuid, backup))
            .then(() => setModal(''))
            .catch(() => {});
    };

    const doRestorationAction = () => {
        restoreBackup
            .mutateAsync(restoreServerBackupInput(uuid, backup, truncate))
            .then(() => setModal(''))
            .catch(() => {});
    };

    const onLockToggle = () => {
        if (attributes.is_locked && modal !== 'unlock') {
            return setModal('unlock');
        }

        toggleBackupLock.mutate(toggleServerBackupLockInput(uuid, backup), { onSuccess: () => setModal('') });
    };

    return (
        <>
            <Dialog.Confirm
                open={modal === 'unlock'}
                onClose={() => setModal('')}
                title={`Разблокировать «${attributes.name}»`}
                pending={toggleBackupLock.isPending}
                onConfirmed={onLockToggle}
            >
                Эта резервная копия больше не будет защищена от автоматического или случайного удаления.
            </Dialog.Confirm>
            <Dialog.Confirm
                open={modal === 'restore'}
                onClose={() => setModal('')}
                confirm='Восстановить'
                title={`Восстановить «${attributes.name}»`}
                pending={restoreBackup.isPending}
                onConfirmed={() => doRestorationAction()}
            >
                <p>
                    Сервер будет остановлен. До завершения восстановления вы не сможете управлять состоянием питания,
                    обращаться к файловому менеджеру или создавать дополнительные резервные копии.
                </p>
                <p className='mt-4 -mb-2 bg-card p-3 rounded-sm'>
                    <label htmlFor='restore_truncate' className='text-base flex items-center cursor-pointer'>
                        <Checkbox
                            className='mr-2 h-5 w-5 data-[checked]:border-destructive data-[checked]:bg-destructive data-[checked]:text-destructive-foreground'
                            id='restore_truncate'
                            value='true'
                            checked={truncate}
                            onChange={() => setTruncate((s) => !s)}
                        />
                        Удалить все файлы перед восстановлением резервной копии.
                    </label>
                </p>
            </Dialog.Confirm>
            <Dialog.Confirm
                title={`Удалить «${attributes.name}»`}
                confirm='Продолжить'
                open={modal === 'delete'}
                pending={deleteBackup.isPending}
                onClose={() => setModal('')}
                onConfirmed={doDeletion}
            >
                Это необратимая операция. Восстановить удалённую резервную копию невозможно.
            </Dialog.Confirm>
            <SpinnerOverlay visible={loading} fixed />
            <RowActions>
                <Can action='backup.delete'>
                    <DeleteAction
                        aria-label={`Удалить ${attributes.name}`}
                        disabled={attributes.is_locked}
                        disabledReason='Сначала разблокируйте эту резервную копию, чтобы удалить её.'
                        onClick={() => setModal('delete')}
                    />
                </Can>
                {attributes.is_successful && (
                    <RowActionsMenu label={`Дополнительные действия для ${attributes.name}`}>
                        <Can action='backup.download'>
                            <DropdownMenu.Item onClick={doDownload} icon={CloudDownload}>
                                Скачать
                            </DropdownMenu.Item>
                        </Can>
                        <Can action='backup.restore'>
                            <DropdownMenu.Item onClick={() => setModal('restore')} icon={PackageOpen}>
                                Восстановить
                            </DropdownMenu.Item>
                        </Can>
                        <Can action='backup.delete'>
                            <DropdownMenu.Item onClick={onLockToggle} icon={attributes.is_locked ? Unlock : Lock}>
                                {attributes.is_locked ? 'Разблокировать' : 'Заблокировать'}
                            </DropdownMenu.Item>
                        </Can>
                    </RowActionsMenu>
                )}
            </RowActions>
        </>
    );
};

export default BackupContextMenu;
