import { Button, ContentBox, Form, SpinnerOverlay } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { TextField } from '../shared/fields';

export default function PasswordCard({ model, className }: ViewProps<'account.password'>) {
    const { fields } = model;

    return (
        <ContentBox className={className} title='Смена пароля'>
            <SpinnerOverlay size='large' visible={model.submitting} />
            <Form form={{ handleSubmit: model.submit }} className='m-0'>
                <TextField field={fields.current} id='current_password' label='Текущий пароль' />
                <div className='mt-6'>
                    <TextField
                        field={fields.password}
                        id='new_password'
                        label='Новый пароль'
                        description='Новый пароль должен быть не короче 8 символов и уникальным для этого сайта.'
                    />
                </div>
                <div className='mt-6'>
                    <TextField
                        field={fields.confirmPassword}
                        id='confirm_new_password'
                        label='Подтверждение нового пароля'
                    />
                </div>
                <div className='mt-6'>
                    <Button type='submit' disabled={!model.canSubmit} isLoading={model.submitting}>
                        Сменить пароль
                    </Button>
                </div>
            </Form>
        </ContentBox>
    );
}
