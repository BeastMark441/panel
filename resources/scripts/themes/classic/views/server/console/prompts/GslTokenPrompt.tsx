import { Dialog, Form, SpinnerOverlay, useAppForm } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';

export default function GslTokenPrompt({ model }: ViewProps<'server.feature.gslToken'>) {
    const form = useAppForm({
        defaultValues: { gslToken: '' },
        onSubmit: async ({ value }) => {
            // The failure has already been reported.
            await model.submit(value.gslToken).catch(() => {});
        },
    });

    return (
        <Dialog
            open={model.open}
            title='Недействительный GSL-токен'
            onClose={model.close}
            preventExternalClose={model.pending}
            hideCloseIcon={model.pending}
        >
            <SpinnerOverlay visible={model.pending} />
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
                                description='Перейдите на  https://steamcommunity.com/dev/managegameservers , чтобы сгенерировать токен.'
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
}
