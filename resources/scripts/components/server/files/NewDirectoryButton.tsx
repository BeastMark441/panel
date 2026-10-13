import { useStore } from '@tanstack/react-form';
import { useAppForm, Form } from '@/components/form';
import { useCurrentServerUuid } from '@/api/server/queries';
import { useServerDirectory } from '@/state/server';
import { join } from 'pathe';
import { normalizeServerPath } from '@/helpers';
import Button from '@/components/elements/Button';
import { NewButton } from '@/components/elements/NewButton';
import type { WithClassname } from '@/components/types';
import { Dialog } from '@/components/elements/dialog';
import Code from '@/components/elements/Code';
import { createDirectoryInput, useCreateDirectory } from '@/api/server/files/queries';

const NewDirectoryDialogContent = ({ onClose }: { onClose: () => void }) => {
    const uuid = useCurrentServerUuid()!;
    const directory = useServerDirectory();

    const createDirectory = useCreateDirectory();

    const form = useAppForm({
        defaultValues: { directoryName: '' },
        onSubmit: async ({ value }) => {
            try {
                await createDirectory.mutateAsync(createDirectoryInput(uuid, directory, value.directoryName));
                onClose();
            } catch {
                // Error toast is handled by the mutation.
            }
        },
    });

    const directoryName = useStore(form.store, (state) => state.values.directoryName);

    return (
        <>
            <Form form={form} className='m-0'>
                <form.AppField
                    name='directoryName'
                    validators={{
                        onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите корректное название папки.'),
                    }}
                >
                    {(field) => <field.TextField autoFocus id='directoryName' label='Название' />}
                </form.AppField>
                <p className='mt-2 text-sm md:text-base break-all'>
                    <span className='text-foreground'>Папка будет создана как&nbsp;</span>
                    <Code>
                        /home/container/
                        <span className='text-accent'>{normalizeServerPath(join(directory, directoryName))}</span>
                    </Code>
                </p>
            </Form>
            <Dialog.Footer>
                <Button.Text className='w-full sm:w-auto' onClick={onClose}>
                    Отмена
                </Button.Text>
                <Button className='w-full sm:w-auto' onClick={() => form.handleSubmit()}>
                    Создать
                </Button>
            </Dialog.Footer>
        </>
    );
};

export default function NewDirectoryButton({ className }: WithClassname) {
    return (
        <Dialog.Trigger
            trigger={({ onClick }) => (
                <NewButton onClick={onClick} className={className}>
                    Новая папка
                </NewButton>
            )}
        >
            {({ open, onClose }) => (
                <Dialog open={open} onClose={onClose} title='Создание папки'>
                    <NewDirectoryDialogContent onClose={onClose} />
                </Dialog>
            )}
        </Dialog.Trigger>
    );
}
