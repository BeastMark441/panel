import { FolderOpen } from 'lucide-react';
import { cn, Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle, Spinner } from '@/sdk';
import type { FileManagerEntry, ViewProps } from '@/sdk/theme';
import { FileRow, RowActionsProvider } from './FileRows';

const entryKey = ({ kind, name }: FileManagerEntry) => `${kind === 'directory' ? 'dir' : 'file'}_${name}`;

export default function FileManagerList({ model, className }: ViewProps<'server.files.manager.list'>) {
    if (model.loading) {
        return <Spinner size='large' centered />;
    }

    if (!model.entries.length) {
        return (
            <Empty className={cn('border', className)}>
                <EmptyHeader>
                    <EmptyMedia variant='icon'>
                        <FolderOpen />
                    </EmptyMedia>
                    <EmptyTitle>Эта папка пуста</EmptyTitle>
                    <EmptyDescription>
                        {model.permissions.create
                            ? 'Загрузите файлы или создайте новый файл или папку.'
                            : 'В этой папке нет файлов.'}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    const selected = new Set(model.selection);

    return (
        <div className={className}>
            {model.truncated && (
                <div className='rounded-sm bg-warning mb-px p-3'>
                    <p className='text-warning-foreground text-sm text-center'>
                        Этот каталог слишком велик для отображения в браузере. Показаны только первые 250 файлов.
                    </p>
                </div>
            )}
            <RowActionsProvider model={model}>
                {model.entries.map((entry) => (
                    <FileRow key={entryKey(entry)} entry={entry} selected={selected.has(entry.name)} />
                ))}
            </RowActionsProvider>
        </div>
    );
}
