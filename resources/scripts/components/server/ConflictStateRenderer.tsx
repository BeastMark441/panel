import ScreenBlock from '@/components/elements/ScreenBlock';
import ServerInstallSvg from '@/assets/images/server_installing.svg';
import ServerErrorSvg from '@/assets/images/server_error.svg';
import ServerRestoreSvg from '@/assets/images/server_restore.svg';
import { useCurrentServer } from '@/api/server/queries';
import { isInstallingStatus } from '@/lib/serverStatus';

type ConflictState = {
    title: string;
    image: string;
    message: string;
};

type ConflictStatus = string | null;

function resolveConflictState(
    status: ConflictStatus,
    isTransferring: boolean,
    isNodeUnderMaintenance: boolean
): ConflictState {
    if (isInstallingStatus(status)) {
        return {
            title: 'Идёт установка',
            image: ServerInstallSvg,
            message: 'Ваш сервер скоро будет готов. Попробуйте снова через несколько минут.',
        };
    }

    if (status === 'suspended') {
        return {
            title: 'Сервер приостановлен',
            image: ServerErrorSvg,
            message: 'Этот сервер приостановлен и недоступен.',
        };
    }

    if (isNodeUnderMaintenance) {
        return {
            title: 'Узел на технических работах',
            image: ServerErrorSvg,
            message: 'Узел этого сервера находится на технических работах.',
        };
    }

    if (isTransferring) {
        return {
            title: 'Перенос',
            image: ServerRestoreSvg,
            message: 'Ваш сервер переносится на новый узел. Загляните позже.',
        };
    }

    return {
        title: 'Восстановление из резервной копии',
        image: ServerRestoreSvg,
        message: 'Ваш сервер восстанавливается из резервной копии. Загляните через несколько минут.',
    };
}

export default function ConflictStateRenderer() {
    const server = useCurrentServer();
    const status = server?.attributes.status || null;
    const isTransferring = server?.attributes.is_transferring || false;
    const isNodeUnderMaintenance = server?.attributes.is_node_under_maintenance || false;

    const state = resolveConflictState(status, isTransferring, isNodeUnderMaintenance);

    return <ScreenBlock title={state.title} image={state.image} message={state.message} />;
}
