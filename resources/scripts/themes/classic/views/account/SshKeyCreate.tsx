import { Button, ContentBox, Form, SpinnerOverlay } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { TextAreaField, TextField } from '../shared/fields';

export default function SshKeyCreate({ model, className }: ViewProps<'account.sshKeys.create'>) {
    return (
        <ContentBox title='Добавление SSH-ключа' className={className}>
            <Form form={{ handleSubmit: model.submit }}>
                <SpinnerOverlay visible={model.submitting} />
                <div className='mb-6'>
                    <TextField field={model.fields.name} label='Название SSH-ключа' />
                </div>
                <TextAreaField
                    field={model.fields.publicKey}
                    label='Публичный ключ'
                    rows={6}
                    description='Введите ваш публичный SSH-ключ.'
                />
                <div className='flex justify-end mt-6'>
                    <Button type='submit' disabled={!model.canSubmit} isLoading={model.submitting}>
                        Сохранить
                    </Button>
                </div>
            </Form>
        </ContentBox>
    );
}
