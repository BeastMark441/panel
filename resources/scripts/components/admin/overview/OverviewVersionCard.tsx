import type { AdminVersion, TranslationVersion } from '@/api/admin/version/queries';
import { Alert } from '@/components/elements/alert';

const TRANSLATION_RELEASES = 'https://github.com/BeastMark441/panel/releases';
const UPSTREAM_RELEASES = 'https://github.com/pterodactyl/panel/releases';

function getTranslationTitle(translation?: TranslationVersion): string {
    switch (translation?.status) {
        case 'update_available':
            return 'Доступно обновление русской версии панели.';
        case 'current':
            return 'Установлена актуальная русская версия панели.';
        case 'development':
        case 'no_releases':
        case 'unavailable':
        case undefined:
            return 'Информация о версиях панели.';
    }
}

function TranslationStatus({ translation }: { translation?: TranslationVersion }) {
    switch (translation?.status) {
        case 'current':
            return <p>Установлена актуальная версия перевода.</p>;
        case 'update_available':
            return (
                <p>
                    Доступна новая версия перевода: <code className='font-mono'>{translation.latest}</code>.
                </p>
            );
        case 'development':
            return (
                <div>
                    <p>Установлена сборка разработки. Сравнение с релизной версией не выполняется.</p>
                    {translation.latest && (
                        <p>
                            Последний опубликованный релиз: <code className='font-mono'>{translation.latest}</code>.
                        </p>
                    )}
                </div>
            );
        case 'no_releases':
            return <p>Релизы перевода ещё не опубликованы.</p>;
        case 'unavailable':
        case undefined:
            return <p>Не удалось проверить обновления перевода.</p>;
    }
}

function isUpstreamKnown(version: AdminVersion): boolean {
    return Boolean(version.latest) && version.latest !== 'error';
}

function UpstreamStatus({ version }: { version: AdminVersion }) {
    if (version.current === 'canary') {
        return <p>Используется сборка разработки; актуальность релизной версии не определяется.</p>;
    }

    if (!isUpstreamKnown(version)) {
        return <p>Не удалось проверить обновления оригинальной панели.</p>;
    }

    if (version.is_latest) {
        return <p>По данным официального источника обновление не требуется.</p>;
    }

    return (
        <p>
            Доступна новая оригинальная версия: <code className='font-mono'>{version.latest}</code>.
        </p>
    );
}

function getUpstreamUrl(version: AdminVersion): string {
    if (version.current === 'canary') {
        return UPSTREAM_RELEASES;
    }

    if (isUpstreamKnown(version)) {
        return `${UPSTREAM_RELEASES}/tag/v${version.latest.replace(/^v/, '')}`;
    }

    return UPSTREAM_RELEASES;
}

function isHealthy(version: AdminVersion): boolean {
    return (
        version.translation?.status === 'current' &&
        version.current !== 'canary' &&
        isUpstreamKnown(version) &&
        version.is_latest
    );
}

export default function OverviewVersionCard({ version }: { version: AdminVersion }) {
    const translation = version.translation;

    return (
        <Alert
            type={isHealthy(version) ? 'success' : 'warning'}
            title={getTranslationTitle(translation)}
            className='mb-6'
        >
            <div className='space-y-4'>
                <div>
                    <p className='font-semibold'>Русская версия</p>

                    <p>
                        Вы используете версию{' '}
                        <code className='font-mono'>{translation?.current ?? version.current}</code>.
                    </p>

                    <TranslationStatus translation={translation} />

                    <a
                        href={translation?.release_url ?? TRANSLATION_RELEASES}
                        target='_blank'
                        rel='noreferrer'
                        className='underline transition-colors hover:text-accent'
                    >
                        Релизы русской версии
                    </a>
                </div>

                <div>
                    <p className='font-semibold'>Оригинальная панель Pterodactyl</p>

                    <p>
                        Версия основы: <code className='font-mono'>{version.current}</code>.
                    </p>

                    <UpstreamStatus version={version} />

                    <a
                        href={getUpstreamUrl(version)}
                        target='_blank'
                        rel='noreferrer'
                        className='underline transition-colors hover:text-accent'
                    >
                        Релизы оригинальной панели
                    </a>
                </div>
            </div>
        </Alert>
    );
}
