import { Dialog } from '@/components/elements/dialog';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { DeleteAction } from '@/components/elements/table/RowActions';
import { useCurrentServer } from '@/api/server/queries';
import { deleteServerSubuserInput, useDeleteSubuser } from '@/api/server/users/queries';
import type { Subuser } from '@/api/server/users/queries';

type Props = {
    subuser: Subuser;
};

const RemoveSubuserButton = ({ subuser }: Props) => {
    const server = useCurrentServer();
    const uuid = server?.attributes.uuid ?? '';
    const deleteSubuser = useDeleteSubuser(subuser);
    const loading = deleteSubuser.isPending;

    const doDeletion = (close: () => void) => {
        void deleteSubuser
            .mutateAsync(deleteServerSubuserInput(uuid, subuser))
            .catch(() => {})
            .then(close);
    };

    return (
        <Dialog.ConfirmTrigger
            title='Удалить этого субпользователя?'
            confirm='Да, удалить субпользователя'
            preventExternalClose={loading}
            pending={loading}
            onConfirmed={(_event, close) => doDeletion(close)}
            trigger={({ onClick }) => (
                <DeleteAction aria-label={`Удалить ${subuser.attributes.email}`} onClick={onClick} />
            )}
        >
            <SpinnerOverlay visible={loading} />
            Вы действительно хотите удалить этого субпользователя? Он немедленно потеряет весь доступ к этому серверу.
        </Dialog.ConfirmTrigger>
    );
};

export default RemoveSubuserButton;
