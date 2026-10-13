import React from 'react';
import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useUpdateAccountPassword } from '@/api/account/queries';

function UpdatePasswordForm() {
    const updatePassword = useUpdateAccountPassword();

    const form = useAppForm({
        defaultValues: { current: '', password: '', confirmPassword: '' },
        onSubmit: async ({ value }) => {
            try {
                await updatePassword.mutateAsync({
                    body: {
                        current_password: value.current,
                        password: value.password,
                        password_confirmation: value.confirmPassword,
                    },
                });
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting) || updatePassword.isPending;

    return (
        <>
            <SpinnerOverlay size='large' visible={isSubmitting} />
            <Form form={form} className='m-0'>
                <form.AppField
                    name='current'
                    validators={{
                        onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите текущий пароль.'),
                    }}
                >
                    {(field) => <field.TextField id='current_password' type='password' label='Текущий пароль' />}
                </form.AppField>
                <div className='mt-6'>
                    <form.AppField
                        name='password'
                        validators={{
                            onChange: ({ value }) =>
                                value.length >= 8 ? undefined : 'Новый пароль должен быть не короче 8 символов.',
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                id='new_password'
                                type='password'
                                label='Новый пароль'
                                description='Новый пароль должен быть не короче 8 символов и уникальным для этого сайта.'
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-6'>
                    <form.AppField
                        name='confirmPassword'
                        validators={{
                            onChangeListenTo: ['password'],
                            onChange: ({ value, fieldApi }) =>
                                value === fieldApi.form.getFieldValue('password')
                                    ? undefined
                                    : 'Подтверждение пароля не совпадает с введённым паролем.',
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                id='confirm_new_password'
                                type='password'
                                label='Подтверждение нового пароля'
                            />
                        )}
                    </form.AppField>
                </div>
                <div className='mt-6'>
                    <form.AppForm>
                        <form.SubmitButton disabled={updatePassword.isPending}>Сменить пароль</form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </>
    );
}

export default UpdatePasswordForm;
