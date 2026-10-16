import { Button, ContentBox, CopyOnClick, Dialog, Form, SpinnerOverlay } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import { TextAreaField, TextField } from '../shared/fields';

function CreatedKeyDialog({ apiKey, onClose }: { apiKey: string | null; onClose: () => void }) {
    return (
        <Dialog open={apiKey !== null} onClose={onClose} preventExternalClose title='Ваш API-ключ'>
            <p className='text-sm mb-6'>
                Запрошенный вами API-ключ показан ниже. Сохраните его в надёжном месте — он не будет показан повторно.
            </p>
            <pre className='overflow-x-scroll text-sm bg-muted rounded-sm py-2 px-4 font-mono'>
                <CopyOnClick text={apiKey ?? ''}>
                    <code className='font-mono'>{apiKey}</code>
                </CopyOnClick>
            </pre>
            <div className='flex justify-end mt-6'>
                <Button type='button' onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </Dialog>
    );
}

export default function ApiKeyCreate({ model, className }: ViewProps<'account.apiKeys.create'>) {
    return (
        <ContentBox title='Создание API-ключа' className={className}>
            <CreatedKeyDialog apiKey={model.createdKey} onClose={model.dismissCreatedKey} />
            <Form form={{ handleSubmit: model.submit }}>
                <SpinnerOverlay visible={model.submitting} />
                <div className='mb-6'>
                    <TextField
                        field={model.fields.description}
                        label='Описание'
                        description='Описание этого API-ключа.'
                    />
                </div>
                <TextAreaField
                    field={model.fields.allowedIps}
                    label='Разрешённые IP-адреса'
                    rows={6}
                    description='Оставьте поле пустым, чтобы разрешить использование этого API-ключа с любого IP-адреса, либо укажите каждый IP-адрес с новой строки.'
                />
                <div className='flex justify-end mt-6'>
                    <Button type='submit' disabled={!model.canSubmit} isLoading={model.submitting}>
                        Создать
                    </Button>
                </div>
            </Form>
        </ContentBox>
    );
}
