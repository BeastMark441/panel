import { useSocketInstance } from '@/state/server';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { SocketRequest } from '@/components/server/events';
import { useAppForm, Form } from '@/components/form';
import { useCurrentServerUuid } from '@/api/server/queries';
import { useUpdateStartupVariable } from '@/api/server/startup/queries';
import { useConsolePatternTrigger } from '@/components/server/features/useConsolePatternTrigger';

const gslTokenErrors = ['(gsl token expired)', '(account not found)'];

const GSLTokenModalFeature = () => {
    const dialog = useConsolePatternTrigger(gslTokenErrors);

    const uuid = useCurrentServerUuid()!;
    const instance = useSocketInstance();
    const updateVariable = useUpdateStartupVariable(uuid);
    const loading = updateVariable.isPending;

    const form = useAppForm({
        defaultValues: { gslToken: '' },
        onSubmit: async ({ value }) => {
            try {
                await updateVariable.mutateAsync({
                    path: { server_uuid: uuid },
                    body: { key: 'STEAM_ACC', value: value.gslToken },
                });
                if (instance) {
                    instance.send(SocketRequest.SET_STATE, 'restart');
                }

                dialog.hide();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    return (
        <Dialog
            open={dialog.open}
            title='Недействительный GSL-токен'
            onClose={dialog.hide}
            preventExternalClose={loading}
            hideCloseIcon={loading}
        >
            <SpinnerOverlay visible={loading} />
            <Form form={form}>
                <p className='mt-4'>Похоже, ваш токен входа на игровой сервер (GSL-токен) недействителен или истёк.</p>
                <p className='mt-4'>
                    Вы можете сгенерировать новый токен и ввести его ниже либо оставить поле пустым, чтобы полностью его
                    удалить.
                </p>
                <div className='sm:flex items-center mt-4'>
                    <form.AppField name='gslToken'>
                        {(field) => (
                            <field.TextField
                                label='GSL-токен'
                                description='Перейдите на https://steamcommunity.com/dev/managegameservers, чтобы сгенерировать токен.'
                                autoFocus
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-8 sm:flex items-center justify-end'>
                    <div className='mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto'>
                        <form.AppForm>
                            <form.SubmitButton className='w-full sm:w-auto'>Обновить GSL-токен</form.SubmitButton>
                        </form.AppForm>
                    </div>
                </div>
            </Form>
        </Dialog>
    );
};

export default GSLTokenModalFeature;
