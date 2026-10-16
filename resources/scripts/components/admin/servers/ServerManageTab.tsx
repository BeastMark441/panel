import React from 'react';
import {
    type AdminServer,
    reinstallAdminServerInput,
    toggleAdminServerInstallStateInput,
    updateAdminServerSuspensionInput,
    useAdminServerTransferProgress,
    useReinstallAdminServer,
    useToggleAdminServerInstallState,
    useUpdateAdminServerSuspension,
} from '@/api/admin/servers/queries';
import { useAdminNodes } from '@/api/admin/nodes/queries';
import { useServerDetail } from '@/components/admin/servers/useServerDetail';
import TransferServerModal from '@/components/admin/servers/TransferServerModal';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Button from '@/components/elements/Button';
import { Dialog } from '@/components/elements/dialog';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { Alert, type AlertType } from '@/components/elements/alert';
import { isObject } from '@/lib/objects';
import { canReinstallServer, SKIPPED_INSTALL_SCRIPT_MESSAGE } from '@/lib/serverStatus';

interface Props {
    server: AdminServer;
}

const descriptionClass = 'text-sm leading-relaxed text-card-foreground';
const actionButtonClass =
    'whitespace-nowrap disabled:border-border disabled:bg-popover disabled:text-muted-foreground disabled:opacity-100';

type CardAlert = { type: AlertType; title: string; message: string };

const ManageActionCard = ({
    title,
    alert,
    description,
    action,
}: {
    title: string;
    alert?: CardAlert;
    description: React.ReactNode;
    action: React.ReactNode;
}) => (
    <TitledGreyBox title={title} className='flex h-full flex-col' contentClassName='flex flex-1 flex-col p-0'>
        <div className='flex flex-1 flex-col gap-3 p-3'>
            {alert && (
                <Alert type={alert.type}>
                    <strong className='font-semibold'>{alert.title}</strong> {alert.message}
                </Alert>
            )}
            <p className={descriptionClass}>{description}</p>
        </div>
        <div className='flex items-center justify-end border-t border-border p-3'>{action}</div>
    </TitledGreyBox>
);

// The span is what receives the hover: a disabled button does not emit pointer events.
const ActionTrigger = ({ reason, children }: { reason?: string; children: React.ReactElement }) => (
    <Tooltip content={reason} disabled={!reason}>
        <span className='inline-flex'>{children}</span>
    </Tooltip>
);

const reinstallBlockedReasonFor = (attributes: AdminServer['attributes']): string | undefined => {
    if (attributes.container.installed !== 1) {
        return 'Это действие недоступно, пока сервер не будет установлен.';
    }

    if (canReinstallServer(attributes.status, attributes.container.skip_scripts)) {
        return undefined;
    }

    return SKIPPED_INSTALL_SCRIPT_MESSAGE;
};

function ServerManageContent({ server }: Props) {
    const { attributes } = server;
    const reinstallServer = useReinstallAdminServer();
    const toggleInstallState = useToggleAdminServerInstallState();
    const updateSuspension = useUpdateAdminServerSuspension();
    const { data: transfer } = useAdminServerTransferProgress(attributes.id);
    const { data: nodes } = useAdminNodes({ page: 1 });

    const mutationOptions = (close: () => void) => ({ onSettled: close });

    const loading = reinstallServer.isPending || toggleInstallState.isPending || updateSuspension.isPending;
    const activeTransfer = isObject(transfer);
    const canTransfer = (nodes?.meta.pagination.total ?? 0) > 1;
    const reinstallBlockedReason = reinstallBlockedReasonFor(attributes);

    if (attributes.status === 'install_failed') {
        return (
            <TitledGreyBox title='Управление сервером невозможно'>
                <p className={descriptionClass}>
                    Этот сервер находится в состоянии неудачной установки и не может быть восстановлен. Удалите и
                    создайте сервер заново.
                </p>
            </TitledGreyBox>
        );
    }

    return (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            <ManageActionCard
                title='Переустановка сервера'
                alert={{ type: 'danger', title: 'Опасно!', message: 'Это может привести к перезаписи данных сервера.' }}
                description='Сервер будет переустановлен с использованием назначенных скриптов сервиса.'
                action={
                    <Dialog.ConfirmTrigger
                        title='Переустановка сервера'
                        confirm='Переустановить'
                        pending={reinstallServer.isPending}
                        trigger={({ onClick }) => (
                            <ActionTrigger reason={reinstallBlockedReason}>
                                <Button
                                    color='red'
                                    className={actionButtonClass}
                                    disabled={loading || reinstallBlockedReason !== undefined}
                                    onClick={onClick}
                                >
                                    Переустановить сервер
                                </Button>
                            </ActionTrigger>
                        )}
                        onConfirmed={(_event, close) =>
                            reinstallServer.mutate(reinstallAdminServerInput(attributes.id), mutationOptions(close))
                        }
                    >
                        Сервер будет переустановлен с использованием назначенных скриптов сервиса.{' '}
                        <strong>Это может привести к перезаписи данных сервера.</strong>
                    </Dialog.ConfirmTrigger>
                }
            />

            <ManageActionCard
                title='Состояние установки'
                description='Если нужно сменить состояние установки — с «не установлен» на «установлен» или наоборот — используйте кнопку ниже.'
                action={
                    <Dialog.ConfirmTrigger
                        title='Переключить состояние установки'
                        confirm='Переключить'
                        pending={toggleInstallState.isPending}
                        trigger={({ onClick }) => (
                            <Button className={actionButtonClass} disabled={loading} onClick={onClick}>
                                Переключить состояние установки
                            </Button>
                        )}
                        onConfirmed={(_event, close) =>
                            toggleInstallState.mutate(
                                toggleAdminServerInstallStateInput(attributes.id),
                                mutationOptions(close)
                            )
                        }
                    >
                        Состояние установки этого сервера будет переключено между «установлен» и «устанавливается».
                    </Dialog.ConfirmTrigger>
                }
            />

            {attributes.suspended ? (
                <ManageActionCard
                    title='Разблокировать сервер'
                    description='Сервер будет разблокирован, и пользовательский доступ будет восстановлен.'
                    action={
                        <Dialog.ConfirmTrigger
                            title='Разблокировать сервер'
                            confirm='Разблокировать'
                            pending={updateSuspension.isPending}
                            trigger={({ onClick }) => (
                                <Button
                                    color='green'
                                    className={actionButtonClass}
                                    disabled={loading}
                                    onClick={onClick}
                                >
                                    Разблокировать сервер
                                </Button>
                            )}
                            onConfirmed={(_event, close) =>
                                updateSuspension.mutate(
                                    updateAdminServerSuspensionInput(attributes.id, false),
                                    mutationOptions(close)
                                )
                            }
                        >
                            Сервер будет разблокирован, и пользовательский доступ будет восстановлен.
                        </Dialog.ConfirmTrigger>
                    }
                />
            ) : (
                <ManageActionCard
                    title='Заблокировать сервер'
                    description='Сервер будет заблокирован, все запущенные процессы будут остановлены, и доступ пользователя к файлам и управлению сервером будет немедленно отключён.'
                    action={
                        <Dialog.ConfirmTrigger
                            title='Заблокировать сервер'
                            confirm='Заблокировать'
                            pending={updateSuspension.isPending}
                            trigger={({ onClick }) => (
                                <ActionTrigger
                                    reason={
                                        activeTransfer ? 'Сервер переносится и его нельзя заблокировать.' : undefined
                                    }
                                >
                                    <Button
                                        color='orange'
                                        className={actionButtonClass}
                                        disabled={loading || activeTransfer}
                                        onClick={onClick}
                                    >
                                        Заблокировать сервер
                                    </Button>
                                </ActionTrigger>
                            )}
                            onConfirmed={(_event, close) =>
                                updateSuspension.mutate(
                                    updateAdminServerSuspensionInput(attributes.id, true),
                                    mutationOptions(close)
                                )
                            }
                        >
                            Сервер будет заблокирован, все запущенные процессы будут остановлены, а доступ пользователя
                            к файлам и управлению сервером будет отключён.
                        </Dialog.ConfirmTrigger>
                    }
                />
            )}

            <ManageActionCard
                title='Перенос сервера'
                alert={
                    activeTransfer
                        ? undefined
                        : { type: 'warning', title: 'Внимание!', message: 'Эта функция может содержать ошибки.' }
                }
                description={
                    activeTransfer
                        ? 'В настоящее время сервер переносится на другой узел.'
                        : 'Перенести этот сервер на другой узел, подключённый к этой панели.'
                }
                action={
                    <Dialog.Trigger
                        trigger={({ onClick }) => (
                            <ActionTrigger
                                reason={
                                    !activeTransfer && !canTransfer
                                        ? 'Для переноса сервера необходимо настроить более одного узла на этой панели.'
                                        : undefined
                                }
                            >
                                <Button
                                    color='green'
                                    className={actionButtonClass}
                                    disabled={loading || activeTransfer || !canTransfer}
                                    onClick={onClick}
                                >
                                    Перенести сервер
                                </Button>
                            </ActionTrigger>
                        )}
                    >
                        {({ open, onClose }) => <TransferServerModal server={server} open={open} onClose={onClose} />}
                    </Dialog.Trigger>
                }
            />
        </div>
    );
}

export default function ServerManageTab() {
    const { server } = useServerDetail();

    return <ServerManageContent server={server} />;
}
