import { Dialog, Form, NewButton, SpinnerOverlay, useAppForm, type BackupListModel } from '@/sdk';

const ignoredDescription = [
    'Укажите файлы или папки, которые нужно исключить из этой резервной копии.',
    'Оставьте поле пустым, чтобы использовать файл .pteroignore в корневом каталоге сервера, если он существует.',
    'Поддерживаются шаблоны файлов и папок. Чтобы отменить правило, добавьте в начало пути',
    'восклицательный знак.',
].join(' ');

function CreateBackupDialog({ model, onClose }: { model: BackupListModel; onClose: () => void }) {
    const form = useAppForm({
        defaultValues: { name: '', ignored: '', isLocked: false },
        onSubmit: async ({ value }) => {
            if (await model.actions.create(value)) {
                onClose();
            }
        },
    });

    return (
        <form.Subscribe selector={(state) => state.isSubmitting}>
            {(submitting) => (
                <Dialog
                    open
                    title='Создать резервную копию сервера'
                    onClose={onClose}
                    preventExternalClose={submitting}
                    hideCloseIcon={submitting}
                >
                    <SpinnerOverlay visible={submitting} />
                    <Form form={form}>
                        <form.AppField name='name' validators={{ onChange: ({ value }) => model.validateName(value) }}>
                            {(field) => (
                                <field.TextField
                                    label='Имя копии'
                                    description='Необязательное имя, по которому можно будет найти эту резервную копию.'
                                />
                            )}
                        </form.AppField>
                        <div className='mt-6'>
                            <form.AppField name='ignored'>
                                {(field) => (
                                    <field.TextAreaField
                                        label='Игнорируемые файлы и каталоги'
                                        rows={6}
                                        description={ignoredDescription}
                                    />
                                )}
                            </form.AppField>
                        </div>
                        {model.permissions.delete && (
                            <div className='mt-6 bg-card border border-border shadow-inner p-4 rounded-sm'>
                                <form.AppField name='isLocked'>
                                    {(field) => (
                                        <field.SwitchField
                                            label='Заблокирована'
                                            description='Предотвращает удаление этой резервной копии до её разблокировки.'
                                        />
                                    )}
                                </form.AppField>
                            </div>
                        )}
                        <div className='flex justify-end mt-6'>
                            <form.AppForm>
                                <form.SubmitButton>Начать копирование</form.SubmitButton>
                            </form.AppForm>
                        </div>
                    </Form>
                </Dialog>
            )}
        </form.Subscribe>
    );
}

export default function CreateBackupButton({ model }: { model: BackupListModel }) {
    return (
        <Dialog.Trigger trigger={({ onClick }) => <NewButton onClick={onClick}>Новая копия</NewButton>}>
            {({ open, onClose }) => open && <CreateBackupDialog model={model} onClose={onClose} />}
        </Dialog.Trigger>
    );
}
