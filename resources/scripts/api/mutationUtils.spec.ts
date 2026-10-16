import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import {
    invalidateGeneratedOperations,
    removeQueriesWhenUnobserved,
    resourceMutationMessages,
} from '@/api/mutationUtils';

describe('mutation utilities', () => {
    it('invalidates all requested generated operations in one cache scan', () => {
        const queryClient = new QueryClient();
        const nodes = [{ _id: 'adminListNodes' }] as const;
        const servers = [{ _id: 'adminListServers' }] as const;
        const users = [{ _id: 'adminListUsers' }] as const;

        queryClient.setQueryData(nodes, 'nodes');
        queryClient.setQueryData(servers, 'servers');
        queryClient.setQueryData(users, 'users');

        void invalidateGeneratedOperations(queryClient, ['adminListNodes', 'adminListServers']);

        expect(queryClient.getQueryState(nodes)?.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(servers)?.isInvalidated).toBe(true);
        expect(queryClient.getQueryState(users)?.isInvalidated).toBe(false);
    });

    it('does not invalidate when no operation IDs are supplied', () => {
        const queryClient = new QueryClient();
        const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

        void invalidateGeneratedOperations(queryClient, []);

        expect(invalidate).not.toHaveBeenCalled();
    });

    it('removes unobserved queries at once and observed queries when their last observer leaves', () => {
        const queryClient = new QueryClient();
        const queryFn = vi.fn(() => 'refetched');
        const observedKey = ['server', 7, 'detail'];
        const idleKey = ['server', 7, 'databases'];
        const otherKey = ['server', 8, 'detail'];

        for (const key of [observedKey, idleKey, otherKey]) {
            queryClient.setQueryData(key, 'cached');
        }

        const observers = [1, 2].map(
            () => new QueryObserver(queryClient, { queryKey: observedKey, queryFn, staleTime: Infinity })
        );
        const unsubscribes = observers.map((observer) => observer.subscribe(() => {}));

        removeQueriesWhenUnobserved(queryClient, { queryKey: ['server', 7] });

        expect(queryClient.getQueryData(idleKey)).toBeUndefined();
        expect(queryClient.getQueryData(observedKey)).toBe('cached');
        unsubscribes[0]!();
        expect(queryClient.getQueryData(observedKey)).toBe('cached');
        unsubscribes[1]!();
        expect(queryClient.getQueryData(observedKey)).toBeUndefined();
        expect(queryClient.getQueryData(otherKey)).toBe('cached');
        expect(queryFn).not.toHaveBeenCalled();
    });

    it('builds consistent resource mutation copy with and without a resource name', () => {
        expect(resourceMutationMessages('database host', 'update', 'primary')).toEqual({
            errorTitle: 'Не удалось обновить хост баз данных',
            success: {
                title: 'Хост баз данных обновлён',
                description: '«primary» обновлён.',
            },
        });
        expect(resourceMutationMessages('egg', 'delete')).toEqual({
            errorTitle: 'Не удалось удалить шаблон Egg',
            success: {
                title: 'Шаблон Egg удалён',
                description: 'Шаблон Egg удалён.',
            },
        });
    });
});
