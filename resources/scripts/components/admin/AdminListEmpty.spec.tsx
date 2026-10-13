/** @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Server } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminListEmpty from './AdminListEmpty';

afterEach(cleanup);

describe('AdminListEmpty', () => {
    it('предлагает действие «создать», когда еще ничего не создано', () => {
        render(
            <AdminListEmpty
                icon={Server}
                noun='сервера'
                onClearFilter={vi.fn()}
                description='Создайте сервер, чтобы начать.'
                action={<button type='button'>Новый сервер</button>}
            />
        );

        expect(screen.getByText('Список пуст: сервера')).toBeInTheDocument();
        expect(screen.getByText('Создайте сервер, чтобы начать.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Новый сервер' })).toBeInTheDocument();
    });

    it('объясняет отсутствие результатов поиска и очищает поле поиска вместо того, чтобы предложить создание', async () => {
        const onClearFilter = vi.fn();

        render(
            <AdminListEmpty
                icon={Server}
                noun='сервера'
                filter='minecraft'
                onClearFilter={onClearFilter}
                description='Создайте сервер, чтобы начать.'
                action={<button type='button'>Новый сервер</button>}
            />
        );

        expect(screen.getByText('Ничего не найдено: сервера')).toBeInTheDocument();
        expect(screen.getByText('minecraft')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Новый сервер' })).not.toBeInTheDocument();

        await userEvent.setup().click(screen.getByRole('button', { name: 'Очистить поиск' }));

        expect(onClearFilter).toHaveBeenCalledOnce();
    });
});
