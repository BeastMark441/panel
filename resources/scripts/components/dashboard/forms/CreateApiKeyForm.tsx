import { useState } from 'react';
import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import ApiKeyModal from '@/components/dashboard/ApiKeyModal';
import { useCreateAccountApiKey } from '@/api/account/api-keys/queries';

function CreateApiKeyForm() {
    const [apiKey, setApiKey] = useState('');
    const createApiKey = useCreateAccountApiKey();

    const form = useAppForm({
        defaultValues: { description: '', allowedIps: '' },
        onSubmit: async ({ value, formApi }) => {
            try {
                const created = await createApiKey.mutateAsync({
                    body: {
                        description: value.description,
                        allowed_ips: value.allowedIps.length > 0 ? value.allowedIps.split('\n') : [],
                    },
                });

                formApi.reset();
                setApiKey(`${created.attributes.identifier}${created.meta?.secret_token ?? ''}`);
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

    return (
        <>
            <ApiKeyModal open={apiKey.length > 0} onClose={() => setApiKey('')} apiKey={apiKey} />
            <Form form={form}>
                <SpinnerOverlay visible={isSubmitting} />
                <div className='mb-6'>
                    <form.AppField
                        name='description'
                        validators={{
                            onChange: ({ value }) =>
                                value.length >= 4 ? undefined : 'Укажите описание длиной не менее 4 символов.',
                        }}
                    >
                        {(field) => <field.TextField label='Описание' description='Описание этого API-ключа.' />}
                    </form.AppField>
                </div>
                <form.AppField name='allowedIps'>
                    {(field) => (
                        <field.TextAreaField
                            label='Разрешённые IP-адреса'
                            rows={6}
                            description='Оставьте поле пустым, чтобы разрешить использование этого API-ключа с любого IP-адреса, либо укажите каждый IP-адрес с новой строки.'
                        />
                    )}
                </form.AppField>
                <div className='flex justify-end mt-6'>
                    <form.AppForm>
                        <form.SubmitButton>Создать</form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </>
    );
}

export default CreateApiKeyForm;
