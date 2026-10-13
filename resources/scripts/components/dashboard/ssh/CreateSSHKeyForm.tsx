import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useCreateSSHKey } from '@/api/account/ssh-keys/queries';

export default function CreateSSHKeyForm() {
    const createSshKey = useCreateSSHKey();

    const form = useAppForm({
        defaultValues: { name: '', publicKey: '' },
        onSubmit: async ({ value, formApi }) => {
            try {
                await createSshKey.mutateAsync({
                    body: {
                        name: value.name,
                        public_key: value.publicKey,
                    },
                });
                formApi.reset();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

    return (
        <Form form={form}>
            <SpinnerOverlay visible={isSubmitting} />
            <div className='mb-6'>
                <form.AppField
                    name='name'
                    validators={{
                        onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите название ключа.'),
                    }}
                >
                    {(field) => <field.TextField label='Название SSH-ключа' />}
                </form.AppField>
            </div>
            <form.AppField
                name='publicKey'
                validators={{
                    onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите публичный ключ.'),
                }}
            >
                {(field) => (
                    <field.TextAreaField
                        label='Публичный ключ'
                        rows={6}
                        description='Введите ваш публичный SSH-ключ.'
                    />
                )}
            </form.AppField>
            <div className='flex justify-end mt-6'>
                <form.AppForm>
                    <form.SubmitButton>Сохранить</form.SubmitButton>
                </form.AppForm>
            </div>
        </Form>
    );
}
