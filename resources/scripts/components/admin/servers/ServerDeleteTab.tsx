import { useState, type ReactNode } from 'react';
import { useStore } from '@tanstack/react-form';
import { useNavigate } from '@tanstack/react-router';
import { useAppForm, Form } from '@/components/form';
import {
    type AdminServer,
    deleteAdminServerInput,
    forceDeleteAdminServerInput,
    useDeleteAdminServer,
    useForceDeleteAdminServer,
} from '@/api/admin/servers/queries';
import { useServerDetail } from '@/components/admin/servers/useServerDetail';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Button from '@/components/elements/Button';
import { Alert } from '@/components/elements/alert';

type DeleteMode = 'safe' | 'force';

interface Props {
    server: AdminServer;
}

interface DeleteServerDialogProps extends Props {
    mode: DeleteMode;
    open: boolean;
    onClose: () => void;
}

function DeleteServerDialog({ server, mode, open, onClose }: DeleteServerDialogProps) {
    const { attributes } = server;
    const navigate = useNavigate();
    const deleteServer = useDeleteAdminServer();
    const forceDeleteServer = useForceDeleteAdminServer();

    const form = useAppForm({
        defaultValues: { confirm: '' },
        onSubmit: async () => {
            try {
                if (mode === 'force') {
                    await forceDeleteServer.mutateAsync(forceDeleteAdminServerInput(attributes.id, attributes.name));
                } else {
                    await deleteServer.mutateAsync(deleteAdminServerInput(attributes.id, attributes.name));
                }

                await navigate({ to: '/panel/servers' });
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

    const close = () => {
        form.reset();
        onClose();
    };

    return (
        <Dialog
            open={open}
            title={mode === 'force' ? 'Принудительное удаление сервера' : 'Подтверждение удаления сервера'}
            preventExternalClose={isSubmitting}
            hideCloseIcon={isSubmitting}
            onClose={close}
        >
            <SpinnerOverlay visible={isSubmitting} />
            <p className='text-sm'>
                Удаление сервера является необратимым действием. Сервер <strong>{attributes.name}</strong> будет удалён
                безвозвратно вместе со всеми связанными данными.
                {mode === 'force' && (
                    <span className='block mt-2 text-destructive'>
                        При принудительном удалении на демоне могут остаться файлы, если он сообщит об ошибке.
                    </span>
                )}
            </p>
            <Form form={form} className='m-0 mt-6'>
                <form.AppField
                    name='confirm'
                    validators={{
                        onChange: ({ value }) => (value === attributes.name ? undefined : 'Введите имя сервера.'),
                    }}
                >
                    {(field) => (
                        <field.TextField
                            type='text'
                            id={`confirm_server_name_${mode}`}
                            label='Подтвердите имя сервера'
                            description='Введите имя этого сервера, чтобы подтвердить удаление.'
                        />
                    )}
                </form.AppField>
                <div className='mt-6 text-right'>
                    <Button type='button' isSecondary className='mr-2' disabled={isSubmitting} onClick={close}>
                        Отмена
                    </Button>
                    <form.AppForm>
                        <form.SubmitButton color='red'>
                            {mode === 'force' ? 'Принудительно удалить сервер' : 'Удалить сервер'}
                        </form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </Dialog>
    );
}

const DeleteActionCard = ({
    title,
    warning,
    description,
    action,
}: {
    title: string;
    warning: ReactNode;
    description: ReactNode;
    action: ReactNode;
}) => (
    <TitledGreyBox title={title} className='flex h-full flex-col' contentClassName='flex flex-1 flex-col p-0'>
        <div className='flex flex-1 flex-col gap-3 p-3'>
            <Alert type='danger'>
                <strong className='font-semibold'>Опасно!</strong> {warning}
            </Alert>
            <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
        <div className='flex items-center justify-end border-t border-border p-3'>{action}</div>
    </TitledGreyBox>
);

function ServerDeleteContent({ server }: Props) {
    const [mode, setMode] = useState<DeleteMode | null>(null);
    const close = () => setMode(null);

    return (
        <div>
            <DeleteServerDialog server={server} mode='safe' open={mode === 'safe'} onClose={close} />
            <DeleteServerDialog server={server} mode='force' open={mode === 'force'} onClose={close} />

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                <DeleteActionCard
                    title='Безопасное удаление сервера'
                    warning={
                        <>
                            Удаление сервера — необратимое действие. <strong>Все данные сервера</strong> (включая файлы
                            и пользователей) будут удалены из системы.
                        </>
                    }
                    description='Это действие попытается удалить сервер как с панели, так и с демона. Если один из них сообщит об ошибке, действие будет отменено.'
                    action={
                        <Button color='red' className='whitespace-nowrap' onClick={() => setMode('safe')}>
                            Безопасно удалить этот сервер
                        </Button>
                    }
                />

                <DeleteActionCard
                    title='Принудительное удаление сервера'
                    warning={
                        <>
                            Удаление сервера — необратимое действие. <strong>Все данные сервера</strong> будут удалены.
                            Этот метод может оставить файлы на демоне, если он сообщит об ошибке.
                        </>
                    }
                    description='Это действие попытается удалить сервер как с панели, так и с демона. Если демон не ответит или сообщит об ошибке, удаление будет продолжено.'
                    action={
                        <Button color='red' className='whitespace-nowrap' onClick={() => setMode('force')}>
                            Принудительно удалить этот сервер
                        </Button>
                    }
                />
            </div>
        </div>
    );
}

export default function ServerDeleteTab() {
    const { server } = useServerDetail();

    return <ServerDeleteContent server={server} />;
}
