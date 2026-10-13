import { deleteServerScheduleInput, useDeleteServerSchedule } from '@/api/server/schedules/queries';
import Button from '@/components/elements/Button';
import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { useCurrentServerUuid } from '@/api/server/queries';

interface Props {
    scheduleId: number;
    onDeleted: () => void;
}

const DeleteScheduleButton = ({ scheduleId, onDeleted }: Props) => {
    const uuid = useCurrentServerUuid()!;
    const deleteSchedule = useDeleteServerSchedule();

    const onDelete = async (close: () => void) => {
        try {
            await deleteSchedule.mutateAsync(deleteServerScheduleInput(uuid, scheduleId));
            close();
            onDeleted();
        } catch {
            // Error toast is handled by the mutation.
            close();
        }
    };

    return (
        <Dialog.ConfirmTrigger
            title='Удаление расписания'
            confirm='Удалить'
            onConfirmed={(_event, close) => onDelete(close)}
            trigger={({ onClick }) => (
                <Button.Danger isSecondary className='flex-1 sm:flex-none mr-4 border-transparent' onClick={onClick}>
                    Удалить
                </Button.Danger>
            )}
        >
            <SpinnerOverlay visible={deleteSchedule.isPending} />
            Все задачи будут удалены, а запускающиеся процессы будут остановлены.
        </Dialog.ConfirmTrigger>
    );
};

export default DeleteScheduleButton;
