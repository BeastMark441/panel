/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { AdminVersion, TranslationVersion } from '@/api/admin/version/queries';
import OverviewVersionCard from './OverviewVersionCard';

afterEach(cleanup);

const translation: TranslationVersion = {
    current: '2.0.0-beta.2',
    latest: '2.0.0-beta.2',
    status: 'current',
    release_url: 'https://github.com/BeastMark441/panel/releases/tag/v2.0.0-beta.2',
};

const version: AdminVersion = {
    current: '2.0.0-beta.2',
    latest: '2.0.0-beta.2',
    is_latest: true,
    daemon: '1.11.13',
    discord: 'https://discord.gg/pterodactyl',
    donations: 'https://github.com/sponsors/pterodactyl',
    translation,
};

function renderVersion(overrides: Partial<AdminVersion> = {}) {
    return render(<OverviewVersionCard version={{ ...version, ...overrides }} />);
}

describe('OverviewVersionCard', () => {
    it('shows the installed translation and upstream versions separately', () => {
        renderVersion();

        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('Установлена актуальная русская версия панели.');
        expect(alert).toHaveTextContent('Вы используете версию 2.0.0-beta.2.');
        expect(alert).toHaveTextContent('Версия основы: 2.0.0-beta.2.');
        expect(alert).toHaveTextContent('По данным официального источника обновление не требуется.');
    });

    it('links to the translation and original repositories separately', () => {
        renderVersion();

        expect(screen.getByRole('link', { name: 'Релизы русской версии' })).toHaveAttribute(
            'href',
            'https://github.com/BeastMark441/panel/releases/tag/v2.0.0-beta.2'
        );
        expect(screen.getByRole('link', { name: 'Релизы оригинальной панели' })).toHaveAttribute(
            'href',
            'https://github.com/pterodactyl/panel/releases/tag/v2.0.0-beta.2'
        );
    });

    it('shows a translation update independently of the upstream status', () => {
        renderVersion({
            translation: {
                ...translation,
                latest: '2.0.0-beta.3',
                status: 'update_available',
                release_url: 'https://github.com/BeastMark441/panel/releases/tag/v2.0.0-beta.3',
            },
        });

        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('Доступно обновление русской версии панели.');
        expect(alert).toHaveTextContent('Доступна новая версия перевода: 2.0.0-beta.3.');
        expect(alert).toHaveTextContent('По данным официального источника обновление не требуется.');
        expect(screen.getByRole('link', { name: 'Релизы русской версии' })).toHaveAttribute(
            'href',
            'https://github.com/BeastMark441/panel/releases/tag/v2.0.0-beta.3'
        );
    });

    it('shows an upstream update without claiming the translation has an update', () => {
        renderVersion({
            latest: '2.0.0-beta.3',
            is_latest: false,
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Доступна новая оригинальная версия: 2.0.0-beta.3.');
        expect(screen.getByRole('alert')).toHaveTextContent('Установлена актуальная версия перевода.');
        expect(screen.queryByText(/Доступна новая версия перевода:/)).not.toBeInTheDocument();
    });

    it('identifies a development installation without claiming it is current', () => {
        renderVersion({
            current: 'canary',
            translation: {
                ...translation,
                current: 'canary',
                status: 'development',
            },
        });

        const alert = screen.getByRole('alert');

        expect(alert).toHaveTextContent('Вы используете версию canary.');
        expect(alert).toHaveTextContent('Сравнение с релизной версией не выполняется.');
        expect(alert).toHaveTextContent('Последний опубликованный релиз: 2.0.0-beta.2.');
        expect(screen.queryByText('Установлена актуальная версия перевода.')).not.toBeInTheDocument();
        expect(screen.queryByText('По данным официального источника обновление не требуется.')).not.toBeInTheDocument();
    });

    it('handles a development installation without an available release number', () => {
        renderVersion({
            current: 'canary',
            translation: {
                ...translation,
                current: 'canary',
                latest: null,
                status: 'development',
            },
        });

        expect(screen.getByRole('alert')).toHaveTextContent('Установлена сборка разработки.');
        expect(screen.queryByText(/Последний опубликованный релиз:/)).not.toBeInTheDocument();
    });

    it('reports that translation releases have not been published', () => {
        renderVersion({
            translation: {
                ...translation,
                latest: null,
                status: 'no_releases',
                release_url: 'https://github.com/BeastMark441/panel/releases',
            },
        });

        expect(screen.getByText('Релизы перевода ещё не опубликованы.')).toBeVisible();
        expect(screen.queryByText('Установлена актуальная версия перевода.')).not.toBeInTheDocument();
    });

    it('reports a translation check failure without hiding upstream information', () => {
        renderVersion({
            translation: {
                ...translation,
                latest: null,
                status: 'unavailable',
            },
        });

        expect(screen.getByText('Не удалось проверить обновления перевода.')).toBeVisible();
        expect(screen.getByText('По данным официального источника обновление не требуется.')).toBeVisible();
    });

    it('handles responses without translation metadata', () => {
        const { translation: omittedTranslation, ...legacyVersion } = version;

        expect(omittedTranslation).toBeDefined();
        render(<OverviewVersionCard version={legacyVersion} />);

        expect(screen.getByText('Не удалось проверить обновления перевода.')).toBeVisible();
        expect(screen.getByRole('link', { name: 'Релизы русской версии' })).toHaveAttribute(
            'href',
            'https://github.com/BeastMark441/panel/releases'
        );
    });

    it('reports an upstream check failure without hiding translation information', () => {
        renderVersion({
            latest: 'error',
            is_latest: false,
        });

        expect(screen.getByText('Не удалось проверить обновления оригинальной панели.')).toBeVisible();
        expect(screen.getByText('Установлена актуальная версия перевода.')).toBeVisible();
        expect(screen.getByRole('link', { name: 'Релизы оригинальной панели' })).toHaveAttribute(
            'href',
            'https://github.com/pterodactyl/panel/releases'
        );
    });
});
