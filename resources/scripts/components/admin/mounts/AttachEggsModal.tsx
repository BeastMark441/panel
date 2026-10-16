import { useState } from 'react';
import { Egg } from 'lucide-react';
import {
    attachAdminMountEggsInput,
    type AdminMountWithRelations,
    useAttachAdminMountEggs,
} from '@/api/admin/mounts/queries';
import { useAdminEggs } from '@/api/admin/eggs/queries';
import { Dialog } from '@/components/elements/dialog';
import Button from '@/components/elements/Button';
import Select from '@/components/ui/Select';
import Label from '@/components/elements/Label';
import Spinner from '@/components/elements/Spinner';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { relationshipData } from '@/api/relationships';
import { cn } from '@/lib/cn';

interface Props {
    mount: AdminMountWithRelations;
    open: boolean;
    onClose: () => void;
    onAttached: () => void;
}

export default function AttachEggsModal({ mount, open, onClose, onAttached }: Props) {
    const [selected, setSelected] = useState<number[]>([]);
    const attachEggs = useAttachAdminMountEggs();
    const submitting = attachEggs.isPending;

    const { data: eggs } = useAdminEggs();

    const attachedIds = new Set(relationshipData(mount.attributes.relationships?.eggs).map((egg) => egg.attributes.id));

    const availableEggs = (eggs?.data ?? []).filter((egg) => !attachedIds.has(egg.attributes.id));

    const submit = () => {
        if (selected.length === 0) {
            return;
        }

        attachEggs
            .mutateAsync(attachAdminMountEggsInput(mount.attributes.id, selected))
            .then(() => {
                setSelected([]);
                onAttached();
            })
            .catch(() => {
                // Error toast is handled by the mutation.
            });
    };

    return (
        <Dialog
            open={open}
            title='Привязать шаблоны Egg'
            preventExternalClose={submitting}
            hideCloseIcon={submitting}
            onClose={onClose}
        >
            <SpinnerOverlay visible={submitting} />
            {eggs === undefined ? (
                <Spinner size='large' centered />
            ) : (
                <>
                    {availableEggs.length === 0 ? (
                        <Empty size='compact'>
                            <EmptyHeader>
                                <EmptyMedia variant='icon'>
                                    <Egg />
                                </EmptyMedia>
                                <EmptyTitle>
                                    {eggs.data.length === 0 ? 'Пока нет шаблонов Egg' : 'Все шаблоны Egg привязаны'}
                                </EmptyTitle>
                                <EmptyDescription>
                                    {eggs.data.length === 0
                                        ? 'Создайте или импортируйте шаблон Egg, прежде чем привязывать его к этому креплению.'
                                        : 'Все шаблоны Egg уже привязаны к этому креплению.'}
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <>
                            <Label>Шаблоны Egg</Label>
                            <Select
                                multiple
                                placeholder='Выберите один или несколько шаблонов Egg…'
                                value={selected}
                                onChange={(value) => setSelected((value as (string | number)[]).map(Number))}
                                options={availableEggs.map((egg) => ({
                                    value: egg.attributes.id,
                                    label: egg.attributes.name,
                                }))}
                            />
                        </>
                    )}
                    <div className='flex flex-wrap justify-end mt-6'>
                        <Button
                            type='button'
                            isSecondary
                            className={cn('w-full sm:w-auto', availableEggs.length > 0 && 'sm:mr-2')}
                            onClick={onClose}
                        >
                            {availableEggs.length > 0 ? 'Отмена' : 'Закрыть'}
                        </Button>
                        {availableEggs.length > 0 && (
                            <Button
                                className='w-full mt-4 sm:w-auto sm:mt-0'
                                type='button'
                                disabled={selected.length === 0}
                                onClick={submit}
                            >
                                Привязать шаблоны Egg
                            </Button>
                        )}
                    </div>
                </>
            )}
        </Dialog>
    );
}
