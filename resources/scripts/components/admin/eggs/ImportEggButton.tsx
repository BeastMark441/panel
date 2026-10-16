import { useNavigate } from '@tanstack/react-router';
import { Upload } from 'lucide-react';
import { importAdminEggInput, useImportAdminEgg } from '@/api/admin/eggs/queries';
import EggFileDialog from '@/components/admin/eggs/EggFileDialog';
import { Dialog } from '@/components/elements/dialog';
import { NewButton } from '@/components/elements/NewButton';

export default function ImportEggButton() {
    const navigate = useNavigate();
    const importEgg = useImportAdminEgg();

    const submit = async (file: File) => {
        const egg = await importEgg.mutateAsync(importAdminEggInput({ import_file: file }));

        void navigate({ to: '/panel/eggs/$eggId', params: { eggId: egg.attributes.id } });
    };

    return (
        <Dialog.Trigger
            trigger={({ onClick }) => (
                <NewButton isSecondary icon={Upload} onClick={onClick}>
                    Импорт шаблона Egg
                </NewButton>
            )}
        >
            {({ open, onClose }) => (
                <EggFileDialog
                    open={open}
                    onClose={onClose}
                    title='Импорт шаблона Egg'
                    description='Загрузите JSON-файл шаблона Egg, чтобы добавить шаблон сервера.'
                    submitLabel='Импортировать шаблон Egg'
                    submitting={importEgg.isPending}
                    onSubmit={submit}
                />
            )}
        </Dialog.Trigger>
    );
}
