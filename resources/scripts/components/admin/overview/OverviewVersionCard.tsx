import type { AdminVersion } from '@/api/admin/version/queries';
import { Alert } from '@/components/elements/alert';

export default function OverviewVersionCard({ version }: { version: AdminVersion }) {
    return (
        <Alert
            type={version.is_latest ? 'success' : 'warning'}
            title={version.is_latest ? 'Установлена актуальная версия панели.' : 'Доступно обновление панели.'}
            className='mb-6'
        >
            {version.is_latest ? (
                <>
                    Вы используете версию <code className='font-mono'>{version.current}</code>.
                </>
            ) : (
                <>
                    Вы используете версию <code className='font-mono'>{version.current}</code>; последняя доступная{' '}
                    <a
                        href={`https://github.com/BeastMark441/panel/releases/v${version.latest}`}
                        target='_blank'
                        rel='noreferrer'
                        className='font-mono underline transition-colors hover:text-accent'
                    >
                        {version.latest}
                    </a>
                    . Следуйте{' '}
                    <a
                        href='https://pterodactyl.io/docs/v2/panel/updating'
                        target='_blank'
                        rel='noreferrer'
                        className='underline transition-colors hover:text-accent'
                    >
                        руководству по обновлению
                    </a>{' '}
                    для обновления.
                </>
            )}
        </Alert>
    );
}
