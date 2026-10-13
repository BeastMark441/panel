import Button from '@/components/elements/Button';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useCurrentServerUuid } from '@/api/server/queries';
import { useServerDirectory, useServerStore } from '@/state/server';
import RenameFileModal from '@/components/server/files/RenameFileModal';
import Portal from '@/components/elements/Portal';
import Slot from '@/extensions/Slot';
import useFileManagerExtensionData from './useFileManagerExtensionData';
import { Dialog } from '@/components/elements/dialog';
import { compressFilesInput, deleteFilesInput, useCompressFiles, useDeleteFiles } from '@/api/server/files/queries';

/** `selectedFiles` must be entries of the current listing. */
const MassActionsBar = ({ selectedFiles }: { selectedFiles: readonly string[] }) => {
    const uuid = useCurrentServerUuid()!;

    const directory = useServerDirectory();

    const clearSelectedFiles = useServerStore((state) => state.files.clearSelectedFiles);
    const compressFiles = useCompressFiles();
    const deleteFiles = useDeleteFiles();

    const onClickCompress = () => {
        compressFiles
            .mutateAsync(compressFilesInput(uuid, directory, [...selectedFiles]))
            .then(() => clearSelectedFiles())
            .catch(() => {});
    };

    const onClickConfirmDeletion = (close: () => void) => {
        close();

        deleteFiles
            .mutateAsync(deleteFilesInput(uuid, directory, [...selectedFiles]))
            .then(() => {
                clearSelectedFiles();
            })
            .catch(() => {});
    };

    const loading = compressFiles.isPending || deleteFiles.isPending;
    const extensionData = useFileManagerExtensionData();

    return (
        <div className='pointer-events-none fixed bottom-0 z-20 left-0 right-0 flex justify-center'>
            <SpinnerOverlay visible={loading} size='large' fixed />
            <Portal>
                <div className='pointer-events-none fixed bottom-0 mb-6 flex justify-center w-full z-50'>
                    {selectedFiles.length > 0 && (
                        <div className='flex items-center space-x-4 pointer-events-auto rounded-sm p-4 bg-background/50'>
                            {extensionData && <Slot name='server.files.selectionActions' data={extensionData} />}
                            <Dialog.Trigger trigger={({ onClick }) => <Button onClick={onClick}>Переместить</Button>}>
                                {({ open, onClose }) =>
                                    open && (
                                        <RenameFileModal
                                            files={[...selectedFiles]}
                                            open={open}
                                            useMoveTerminology
                                            onClose={onClose}
                                        />
                                    )
                                }
                            </Dialog.Trigger>
                            <Button onClick={onClickCompress}>Архивировать</Button>
                            <Dialog.ConfirmTrigger
                                title='Удаление файлов'
                                confirm='Удалить'
                                trigger={({ onClick }) => (
                                    <Button.Danger isSecondary onClick={onClick}>
                                        Удалить
                                    </Button.Danger>
                                )}
                                onConfirmed={(_event, close) => onClickConfirmDeletion(close)}
                            >
                                <p className='mb-2'>
                                    Вы уверены, что хотите удалить выбранные файлы (всего:&nbsp;
                                    <span className='font-semibold text-foreground'>{selectedFiles.length}</span>)? Это
                                    действие необратимо, восстановить файлы будет невозможно.
                                </p>
                                <ul className='mt-2 mb-0 pl-6 list-disc list-outside'>
                                    {selectedFiles.slice(0, 15).map((file) => (
                                        <li key={file}>{file}</li>
                                    ))}
                                    {selectedFiles.length > 15 && <li>и ещё {selectedFiles.length - 15}</li>}
                                </ul>
                            </Dialog.ConfirmTrigger>
                        </div>
                    )}
                </div>
            </Portal>
        </div>
    );
};

export default MassActionsBar;
