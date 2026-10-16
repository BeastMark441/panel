import { ScreenBlock, screenImages } from '@/sdk';
import type { ServerConflict as Conflict, ViewProps } from '@/sdk/theme';

const notices = {
    installing: {
        title: 'Идёт установка',
        image: screenImages.installing,
        message: 'Ваш сервер скоро будет готов. Попробуйте снова через несколько минут.',
    },
    suspended: {
        title: 'Сервер приостановлен',
        image: screenImages.error,
        message: 'Этот сервер приостановлен и недоступен.',
    },
    maintenance: {
        title: 'Узел на технических работах',
        image: screenImages.error,
        message: 'Узел этого сервера находится на технических работах.',
    },
    transferring: {
        title: 'Перенос',
        image: screenImages.restoring,
        message: 'Ваш сервер переносится на новый узел. Загляните позже.',
    },
    'restoring-backup': {
        title: 'Восстановление из резервной копии',
        image: screenImages.restoring,
        message: 'Ваш сервер восстанавливается из резервной копии. Загляните через несколько минут.',
    },
} satisfies Record<Conflict, { title: string; image: string; message: string }>;

export default function ServerConflict({ model, className }: ViewProps<'server.conflict'>) {
    if (!model.kind) {
        return null;
    }

    const { title, image, message } = notices[model.kind];

    return <ScreenBlock title={title} image={image} message={message} className={className} />;
}
