import type { Query, QueryClient, QueryFilters } from '@tanstack/react-query';
import { hasGeneratedOperationId } from '@/api/queryKeyGuards';

export type ResourceMutationAction = 'create' | 'update' | 'delete';

const resourceNouns = {
    'application API key': { noun: 'API-ключ приложения', gender: 'm' },
    database: { noun: 'база данных', gender: 'f' },
    'database host': { noun: 'хост баз данных', gender: 'm' },
    egg: { noun: 'шаблон Egg', gender: 'm' },
    location: { noun: 'локация', gender: 'f' },
    mount: { noun: 'точка монтирования', gender: 'f' },
    node: { noun: 'нода', gender: 'f' },
    server: { noun: 'сервер', gender: 'm' },
    tag: { noun: 'тег', gender: 'm' },
    user: { noun: 'пользователь', gender: 'm' },
    variable: { noun: 'переменная', gender: 'f' },
} satisfies Record<string, { noun: string; gender: 'm' | 'f' }>;

const resourceMutationCopy = {
    create: { verb: 'создать', past: { m: 'создан', f: 'создана' } },
    update: { verb: 'обновить', past: { m: 'обновлён', f: 'обновлена' } },
    delete: { verb: 'удалить', past: { m: 'удалён', f: 'удалена' } },
} satisfies Record<ResourceMutationAction, { verb: string; past: { m: string; f: string } }>;

const sentenceCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const invalidateGeneratedOperations = (
    queryClient: QueryClient,
    operationIds: readonly string[]
): Promise<void> => {
    if (operationIds.length === 0) {
        return Promise.resolve();
    }

    return queryClient.invalidateQueries({
        predicate: ({ queryKey }) => operationIds.some((operationId) => hasGeneratedOperationId(queryKey, operationId)),
    });
};

export const removeQueriesWhenUnobserved = (queryClient: QueryClient, filters: QueryFilters): void => {
    const cache = queryClient.getQueryCache();
    const observed = new Set<Query>();

    for (const query of cache.findAll(filters)) {
        if (query.getObserversCount() === 0) {
            cache.remove(query);
        } else {
            observed.add(query);
        }
    }

    if (observed.size === 0) {
        return;
    }

    const unsubscribe = cache.subscribe((event) => {
        if (!observed.has(event.query)) {
            return;
        }

        if (event.type === 'observerRemoved' && event.query.getObserversCount() === 0) {
            cache.remove(event.query);
        } else if (event.type === 'removed') {
            observed.delete(event.query);
            if (observed.size === 0) {
                unsubscribe();
            }
        }
    });
};

export const resourceMutationMessages = (resource: string, action: ResourceMutationAction, name?: string) => {
    const copy = resourceMutationCopy[action];
    const { noun, gender } = resourceNouns[resource as keyof typeof resourceNouns] ?? {
        noun: resource,
        gender: 'm' as const,
    };
    const past = copy.past[gender];
    const title = `${sentenceCase(noun)} ${past}`;

    return {
        errorTitle: `Не удалось ${copy.verb} ${noun}`,
        success: {
            title,
            description: name ? `«${name}» ${past}.` : `${title}.`,
        },
    };
};
