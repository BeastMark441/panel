/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { AdminVersion } from '@/api/admin/version/queries';
import OverviewVersionCard from './OverviewVersionCard';

afterEach(cleanup);

const version: AdminVersion = {
    current: 'canary',
    latest: '1.12.0',
    is_latest: true,
    daemon: '1.11.13',
    discord: 'https://discord.gg/pterodactyl',
    donations: 'https://github.com/sponsors/pterodactyl',
};

describe('OverviewVersionCard', () => {
    it('renders the current version as a success alert', () => {
        render(<OverviewVersionCard version={version} />);

        expect(screen.getByRole('alert')).toHaveTextContent('Установлена актуальная версия панели.');
        expect(screen.getByRole('alert')).toHaveTextContent('Вы используете версию canary.');
    });

    it('renders an available update as a warning alert', () => {
        render(<OverviewVersionCard version={{ ...version, is_latest: false }} />);

        expect(screen.getByRole('alert')).toHaveTextContent('Доступно обновление панели.');
        expect(screen.getByRole('link', { name: '1.12.0' })).toHaveAttribute(
            'href',
            'https://github.com/BeastMark441/panel/releases/v1.12.0'
        );
        expect(screen.getByRole('link', { name: 'руководству по обновлению' })).toHaveAttribute(
            'href',
            'https://pterodactyl.io/docs/v2/panel/updating'
        );
    });
});
