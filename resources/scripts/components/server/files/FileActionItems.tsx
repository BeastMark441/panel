import { PackageOpen, Copy, FileArchive, FileCode, FileDown, CornerLeftUp, Pencil, Trash2 } from 'lucide-react';
import Can from '@/components/elements/Can';
import { DropdownMenuItem } from '@/components/elements/dropdown/DropdownMenu';
import { isFileObjectArchiveType, type FileObject } from '@/api/server/files/queries';

interface Props {
    file: FileObject;
    onRename: () => void;
    onMove: () => void;
    onChmod: () => void;
    onCopy: () => void;
    onUnarchive: () => void;
    onArchive: () => void;
    onDownload: () => void;
    onDelete: () => void;
}

export default function FileActionItems({
    file,
    onRename,
    onMove,
    onChmod,
    onCopy,
    onUnarchive,
    onArchive,
    onDownload,
    onDelete,
}: Props) {
    const { attributes } = file;

    return (
        <>
            <Can action='file.update'>
                <DropdownMenuItem onClick={onRename} icon={Pencil} description='Изменить название'>
                    Переименовать
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMove} icon={CornerLeftUp} description='Переместить в путь'>
                    Переместить
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onChmod} icon={FileCode} description='Изменить права доступа'>
                    Права доступа
                </DropdownMenuItem>
            </Can>
            {attributes.is_file && (
                <Can action='file.create'>
                    <DropdownMenuItem onClick={onCopy} icon={Copy} description='Дублировать на месте'>
                        Копировать
                    </DropdownMenuItem>
                </Can>
            )}
            {isFileObjectArchiveType(file) ? (
                <Can action={['file.create', 'file.update']}>
                    <DropdownMenuItem onClick={onUnarchive} icon={PackageOpen} description='Извлечь содержимое'>
                        Распаковать
                    </DropdownMenuItem>
                </Can>
            ) : (
                <Can action='file.archive'>
                    <DropdownMenuItem onClick={onArchive} icon={FileArchive} description='Сжать в архив'>
                        Архивировать
                    </DropdownMenuItem>
                </Can>
            )}
            {attributes.is_file && (
                <DropdownMenuItem onClick={onDownload} icon={FileDown} description='Сохранить локально'>
                    Скачать
                </DropdownMenuItem>
            )}
            <Can action='file.delete'>
                <DropdownMenuItem
                    onClick={onDelete}
                    icon={Trash2}
                    danger
                    description='Удалить безвозвратно'
                    className='mt-1 border-t border-border/70 pt-3'
                >
                    Удалить
                </DropdownMenuItem>
            </Can>
        </>
    );
}
