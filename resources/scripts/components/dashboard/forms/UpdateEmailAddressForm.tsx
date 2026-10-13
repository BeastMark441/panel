import React from 'react';
import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useCurrentUser, useUpdateAccountEmail } from '@/api/account/queries';

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function UpdateEmailAddressForm() {
    const user = useCurrentUser();
    const updateEmail = useUpdateAccountEmail();

    const form = useAppForm({
        defaultValues: { email: user.email, password: '' },
        onSubmit: async ({ value, formApi }) => {
            try {
                await updateEmail.mutateAsync({ body: value });
                formApi.setFieldValue('password', '');
            } catch {
                // Error toast is handled by the mutation.
            } finally {
                formApi.setFieldMeta('password', (meta) => ({ ...meta, errors: [] }));
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting) || updateEmail.isPending;

    return (
        <>
            <SpinnerOverlay size='large' visible={isSubmitting} />
            <Form form={form} className='m-0'>
                <form.AppField
                    name='email'
                    validators={{
                        onChange: ({ value }) =>
                            isEmail(value) ? undefined : 'Укажите действительный адрес электронной почты.',
                    }}
                >
                    {(field) => <field.TextField id='current_email' type='email' label='Электронная почта' />}
                </form.AppField>
                <div className='mt-6'>
                    <form.AppField
                        name='password'
                        validators={{
                            onChange: ({ value }) =>
                                value.length >= 1 ? undefined : 'Укажите пароль от вашей учётной записи.',
                        }}
                    >
                        {(field) => (
                            <field.TextField id='confirm_password' type='password' label='Подтверждение пароля' />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-6'>
                    <form.AppForm>
                        <form.SubmitButton disabled={updateEmail.isPending}>
                            Сменить электронную почту
                        </form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </>
    );
}

export default UpdateEmailAddressForm;
