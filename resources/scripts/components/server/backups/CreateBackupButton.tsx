import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { NewButton } from '@/components/elements/NewButton';
import type { WithClassname } from '@/components/types';
import Can from '@/components/elements/Can';
import { useCurrentServerUuid } from '@/api/server/queries';
import { createServerBackupInput, useCreateServerBackup } from '@/api/server/backups/queries';

const CreateBackupDialogContent = ({ onClose }: { onClose: () => void }) => {
    const uuid = useCurrentServerUuid()!;
    const createBackup = useCreateServerBackup();

    const form = useAppForm({
        defaultValues: { name: '', ignored: '', isLocked: false },
        onSubmit: async ({ value }) => {
            try {
                await createBackup.mutateAsync(createServerBackupInput(uuid, value));
                onClose();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

    return (
        <Dialog
            open
            title='Создать резервную копию сервера'
            onClose={onClose}
            preventExternalClose={isSubmitting}
            hideCloseIcon={isSubmitting}
        >
            <SpinnerOverlay visible={isSubmitting} />
            <Form form={form}>
                <form.AppField
                    name='name'
                    validators={{
                        onChange: ({ value }) =>
                            value.length <= 191 ? undefined : 'Имя резервной копии не должно превышать 191 символа.',
                    }}
                >
                    {(field) => (
                        <field.TextField
                            label='Имя копии'
                            description='Если указано, то имя, которое следует использовать для ссылки на эту резервную копию.'
                        />
                    )}
                </form.AppField>
                <div className='mt-6'>
                    <form.AppField name='ignored'>
                        {(field) => (
                            <field.TextAreaField
                                label='Игнорируемые файлы и каталоги'
                                rows={6}
                                description={`
                                            Введите файлы или папки, которые нужно игнорировать при создании резервной копии.  Оставьте поле пустым, чтобы использовать
                                            содержимое файла .pteroignore в корневом каталоге сервера, если он существует.
                                            Поддерживается сопоставление файлов и папок с помощью подстановочных знаков, а также отрицание правила путем добавления восклицательного знака в начало пути.
                                        `}
                            />
                        )}
                    </form.AppField>
                </div>
                <Can action='backup.delete'>
                    <div className='mt-6 bg-card border border-border shadow-inner p-4 rounded-sm'>
                        <form.AppField name='isLocked'>
                            {(field) => (
                                <field.SwitchField
                                    label='Закрыта'
                                    description='Предотвращает удаление этой резервной копии до тех пор, пока она не будет разблокирована.'
                                />
                            )}
                        </form.AppField>
                    </div>
                </Can>
                <div className='flex justify-end mt-6'>
                    <form.AppForm>
                        <form.SubmitButton>Начать копирование</form.SubmitButton>
                    </form.AppForm>
                </div>
            </Form>
        </Dialog>
    );
};

const CreateBackupButton = ({ className }: WithClassname) => (
    <Dialog.Trigger
        trigger={({ onClick }) => (
            <NewButton className={className} onClick={onClick}>
                Новая копия
            </NewButton>
        )}
    >
        {({ open, onClose }) => open && <CreateBackupDialogContent onClose={onClose} />}
    </Dialog.Trigger>
);

export default CreateBackupButton;
