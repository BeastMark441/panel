import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { accountActivityFacetsQueryOptions, accountActivityLogsQueryOptions } from '@/api/account/activity/queries';
import type { ActivityLog, ActivityLogFilters } from '@/api/activity';
import { toActivityFacets, emptyActivityFacets, type ActivityFacets } from '@/api/activityFacets';
import { adminActivityFacetsQueryOptions, adminActivityLogsQueryOptions } from '@/api/admin/activity/queries';
import { httpErrorToHuman } from '@/api/http';
import { relationshipAttributes } from '@/api/relationships';
import { useCurrentServerUuid } from '@/api/server/queries';
import { serverActivityFacetsQueryOptions, serverActivityLogsQueryOptions } from '@/api/server/activity/queries';
import { isString } from '@/lib/objects';
import { useServerRouteId } from '@/router/params';
import { getPageSearch, useActivitySearch, type ActivitySearch } from '@/router/pageSearch';
import type { CorePanelDestination } from '@/sdk/navigation';
import { implementViews } from '../registry';
import type {
    ActivityEntry,
    ActivityEventGroup,
    ActivityFilterOption,
    ActivityLogModel,
    ActivityPageModel,
    ActivityScope,
} from './types';

const ACRONYMS = new Map([
    ['api', 'API'],
    ['sftp', 'SFTP'],
    ['ip', 'IP'],
    ['2fa', '2FA'],
]);

const humanise = (value: string) =>
    value
        .split(/[-_]/)
        .map(
            (word, index) =>
                ACRONYMS.get(word.toLowerCase()) ?? (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
        )
        .join(' ');

const RESOURCE_LABELS = {
    Auth: 'Авторизация',
    User: 'Пользователь',
    Account: 'Аккаунт',
    'Api Key': 'API-ключ',
    'Ssh Key': 'SSH-ключ',
    'Two Factor': '2FA',
    Reinstall: 'Переустановка',
    Console: 'Консоль',
    Power: 'Питание',
    Backup: 'Резервные копии',
    Database: 'Базы данных',
    File: 'Файлы',
    SFTP: 'SFTP',
    Allocation: 'Сетевые адреса',
    'Node Allocation': 'Сетевые адреса',
    Schedule: 'Расписания',
    Task: 'Задачи',
    Settings: 'Настройки',
    Startup: 'Запуск',
    Subuser: 'Субпользователи',
    Egg: 'Egg',
    'Egg Variable': 'Переменные Egg',
    Location: 'Локации',
    Mount: 'Точки монтирования',
    Node: 'Ноды',
    Server: 'Серверы',
    'Server Backup': 'Резервные копии',
    'Server Database': 'Базы данных',
    Tag: 'Теги',
} satisfies Record<string, string>;

const ACTION_LABELS = {
    Fail: 'Сбой',
    Success: 'Успех',
    'Password Reset': 'Сброс пароля',
    'Reset Password': 'Запрос сброса пароля',
    Checkpoint: 'Двухфакторная проверка',
    'Recovery Token': 'Резервный код',
    Token: 'Код подтверждения',
    'IP Blocked': 'Заблокированный IP',
    Create: 'Создать',
    Delete: 'Удалить',
    'Delete One': 'Удаление',
    'Delete Other': 'Удаление',
    'Delete Block': 'Удаление блока адресов',
    Update: 'Обновить',
    'Email Changed': 'Изменение email',
    'Password Changed': 'Смена пароля',
    Command: 'Команда',
    Start: 'Запуск',
    Stop: 'Остановка',
    Restart: 'Перезапуск',
    Kill: 'Принудительная остановка',
    Download: 'Скачивание',
    Restore: 'Восстановление',
    'Restore Complete': 'Восстановление завершено',
    'Restore Failed': 'Сбой восстановления',
    Complete: 'Завершение',
    Lock: 'Блокировка',
    'Toggle Lock': 'Блокировка',
    Unlock: 'Разблокировка',
    'Rotate Password': 'Смена пароля',
    'Compress One': 'Архивация',
    'Compress Other': 'Архивация',
    'Chmod One': 'Смена прав',
    'Chmod Other': 'Смена прав',
    Read: 'Просмотр',
    Copy: 'Копирование',
    'Create Directory': 'Создание каталога',
    'Create Directory One': 'Создание каталога',
    'Create Directory Other': 'Создание каталога',
    Decompress: 'Распаковка',
    Pull: 'Скачивание файла',
    'Rename One': 'Переименование',
    'Rename Other': 'Переименование',
    Rename: 'Переименование',
    Write: 'Запись',
    Upload: 'Загрузка',
    Uploaded: 'Загрузка',
    Denied: 'Отказ в доступе',
    Notes: 'Заметки',
    Primary: 'Основной адрес',
    Execute: 'Запуск вручную',
    Description: 'Описание',
    Edit: 'Изменение',
    Image: 'Образ Docker',
    Import: 'Импорт',
    'Update Import': 'Обновление из импорта',
    Scripts: 'Скрипт установки',
    Tags: 'Теги',
    'Tags One': 'Теги',
    'Tags Other': 'Теги',
    Reorder: 'Изменение порядка',
    'Attach Egg': 'Привязка к Egg',
    'Attach Egg One': 'Привязка к Egg',
    'Attach Egg Other': 'Привязка к Egg',
    'Detach Egg': 'Отвязка от Egg',
    'Attach Node': 'Привязка нод',
    'Attach Node One': 'Привязка нод',
    'Attach Node Other': 'Привязка нод',
    'Detach Node': 'Отвязка нод',
    'Deploy Token': 'Токен развёртывания',
    'Deployment Tags': 'Теги развёртывания',
    'Deployment Tags One': 'Теги развёртывания',
    'Deployment Tags Other': 'Теги развёртывания',
    Alias: 'Псевдоним',
    Details: 'Сведения',
    Build: 'Конфигурация ресурсов',
    Rebuild: 'Пересоздание',
    Suspend: 'Блокировка',
    Unsuspend: 'Разблокировка',
    'Toggle Install': 'Статус установки',
    Transfer: 'Перенос',
    Mount: 'Привязка',
    Unmount: 'Отвязка',
} satisfies Record<string, string>;

const label = (value: string, dictionary: Record<string, string>): string => {
    const human = humanise(value);
    const key = Object.keys(dictionary).find((candidate) => candidate.toLowerCase() === human.toLowerCase());

    return key === undefined ? human : dictionary[key]!;
};

/** Группирует события по ресурсу с переведёнными подписями. */
export function eventGroups(events: readonly string[]): ActivityEventGroup[] {
    const grouped = new Map<string, ActivityFilterOption[]>();

    for (const event of events) {
        const [namespace = '', remainder = ''] = event.split(':');
        const separator = remainder.indexOf('.');
        const resource = separator === -1 ? namespace : remainder.slice(0, separator);
        const action = separator === -1 ? remainder : remainder.slice(separator + 1);
        const options = grouped.get(resource) ?? [];

        options.push({
            value: event,
            label: label(action, ACTION_LABELS),
            textLabel: `${label(resource, RESOURCE_LABELS)} · ${label(action, ACTION_LABELS)}`,
        });
        grouped.set(resource, options);
    }

    return [...grouped.entries()]
        .map(([resource, options]) => ({
            label: label(resource, RESOURCE_LABELS),
            options: options.sort((a, b) => a.label.localeCompare(b.label)),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

const userOptions = ({ users }: ActivityFacets): ActivityFilterOption[] =>
    users.map((option) => ({
        value: String(option.id),
        label: option.email ? `${option.username} (${option.email})` : option.username,
    }));

type ActorAttributes = { username?: string; email?: string };

function toEntry(activity: ActivityLog, filter: (event: string) => CorePanelDestination): ActivityEntry {
    const { attributes } = activity;
    const actor = relationshipAttributes<ActorAttributes>(attributes.relationships?.actor);
    const userAgent = attributes.properties.useragent;

    return {
        id: attributes.id,
        event: attributes.event,
        actor: actor ? { username: actor.username ?? null, email: actor.email ?? null } : null,
        properties: attributes.properties,
        hasMetadata: attributes.has_additional_metadata,
        ip: attributes.ip,
        timestamp: attributes.timestamp,
        api: attributes.is_api,
        sftp: attributes.event.startsWith('server:sftp.'),
        userAgent: isString(userAgent) ? userAgent : null,
        filter: filter(attributes.event),
    };
}

function useActivityQueries(scope: ActivityScope, filters: ActivityLogFilters) {
    const uuid = useCurrentServerUuid() ?? '';
    const options = { refetchOnWindowFocus: false, placeholderData: keepPreviousData };
    // One query per scope, only the log's own enabled, keeps each typed by its endpoint.
    const logs = {
        account: useQuery({ ...accountActivityLogsQueryOptions(filters), ...options, enabled: scope === 'account' }),
        server: useQuery({
            ...serverActivityLogsQueryOptions(uuid, filters),
            ...options,
            enabled: scope === 'server' && !!uuid,
        }),
        admin: useQuery({ ...adminActivityLogsQueryOptions(filters), ...options, enabled: scope === 'admin' }),
    }[scope];
    const facets = {
        account: useQuery({
            ...accountActivityFacetsQueryOptions(),
            select: toActivityFacets,
            enabled: scope === 'account',
        }),
        server: useQuery({
            ...serverActivityFacetsQueryOptions(uuid),
            select: toActivityFacets,
            enabled: scope === 'server' && !!uuid,
        }),
        admin: useQuery({ ...adminActivityFacetsQueryOptions(), select: toActivityFacets, enabled: scope === 'admin' }),
    }[scope];

    return { logs, facets: facets.data ?? emptyActivityFacets };
}

function useActivityNavigation(scope: ActivityScope) {
    const navigate = useNavigate();
    const id = useServerRouteId() ?? '';

    const go = (search: ActivitySearch) => {
        const options = { search, replace: true, viewTransition: false };

        if (scope === 'server') {
            void navigate({ to: '/server/$id/activity', params: { id }, ...options });

            return;
        }

        void navigate({ to: scope === 'admin' ? '/panel/activity' : '/account/activity', ...options });
    };

    const filter = (event: string): CorePanelDestination => {
        if (scope === 'server') {
            return { to: '/server/$id/activity', params: { id }, search: { event } };
        }

        return { to: scope === 'admin' ? '/panel/activity' : '/account/activity', search: { event } };
    };

    return { go, filter };
}

function useActivityLogModel({ scope }: { readonly scope: ActivityScope }): ActivityLogModel {
    const { page, event, user } = useActivitySearch();
    const { logs, facets } = useActivityQueries(scope, {
        page,
        filters: { event, user },
        sorts: { timestamp: -1 },
    });
    const { go, filter } = useActivityNavigation(scope);
    const { data, error, isFetching, refetch } = logs;
    const pagination = data?.meta.pagination;

    // Changing a filter returns to the first page.
    const withFilter = (next: { event?: string; user?: string }) => {
        const search: ActivitySearch = {};

        if (next.user) {
            search.user = next.user;
        }

        if (next.event) {
            search.event = next.event;
        }

        go(search);
    };

    return {
        scope,
        entries: (data?.data ?? []).map((activity: ActivityLog) => toEntry(activity, filter)),
        loading: !data && isFetching,
        error: error && !isFetching ? httpErrorToHuman(error) : null,
        retry: () => void refetch(),
        pagination: pagination
            ? {
                  total: pagination.total,
                  count: pagination.count,
                  perPage: pagination.per_page,
                  currentPage: pagination.current_page,
                  totalPages: pagination.total_pages,
              }
            : null,
        event: event ?? null,
        user: user ?? null,
        events: eventGroups(facets.events),
        users: scope === 'account' ? null : userOptions(facets),
        actions: {
            setEvent: (value) => withFilter({ event: value ?? undefined, user }),
            setUser: (value) => withFilter({ event, user: value ?? undefined }),
            clearFilters: () => go({}),
            setPage: (next) => {
                const search: ActivitySearch = getPageSearch(next);

                if (event) {
                    search.event = event;
                }

                if (user) {
                    search.user = user;
                }

                go(search);
            },
        },
    };
}

const noop = () => {};

function entry(
    id: string,
    event: string,
    properties: ActivityEntry['properties'],
    overrides: Partial<ActivityEntry> = {}
): ActivityEntry {
    return {
        id,
        event,
        actor: { username: 'alex', email: 'alex@example.test' },
        properties,
        hasMetadata: false,
        ip: '203.0.113.10',
        timestamp: '2026-10-12T09:30:00Z',
        api: false,
        sftp: false,
        userAgent: null,
        filter: { to: '/account/activity', search: { event } },
        ...overrides,
    };
}

const entries: readonly ActivityEntry[] = [
    entry(
        '1',
        'user:account.email-changed',
        { old: 'alex@old.test', new: 'alex@example.test' },
        {
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0) Firefox/131.0',
        }
    ),
    entry('2', 'user:api-key.create', { identifier: 'ptlc_7hX2kQ9vLm' }, { api: true, hasMetadata: true }),
    entry('3', 'server:sftp.write', { files: ['server.properties'] }, { sftp: true, ip: null }),
    entry('4', 'auth:success', {}, { actor: null, timestamp: '2026-10-01T07:00:00Z' }),
];

function logFixture(scope: ActivityScope, overrides: Partial<ActivityLogModel> = {}): ActivityLogModel {
    return {
        scope,
        entries,
        loading: false,
        error: null,
        retry: noop,
        pagination: { total: 4, count: 4, perPage: 25, currentPage: 1, totalPages: 1 },
        event: null,
        user: null,
        events: eventGroups(['auth:success', 'server:sftp.write', 'user:account.email-changed', 'user:api-key.create']),
        users:
            scope === 'account'
                ? null
                : [
                      { value: '1', label: 'alex (alex@example.test)' },
                      { value: '2', label: 'sam (sam@example.test)' },
                  ],
        actions: { setEvent: noop, setUser: noop, clearFilters: noop, setPage: noop },
        ...overrides,
    };
}

const pageModel: ActivityPageModel = Object.freeze({});
const page = { use: (): ActivityPageModel => pageModel, fixtures: { default: () => pageModel } };

implementViews({
    'activity.log': {
        use: useActivityLogModel,
        fixtureInput: (model) => ({ scope: model.scope }),
        fixtures: {
            account: () => logFixture('account'),
            server: () => logFixture('server'),
            filtered: () =>
                logFixture('server', {
                    entries: [],
                    pagination: { total: 0, count: 0, perPage: 25, currentPage: 1, totalPages: 1 },
                    event: 'server:power.start',
                    user: '2',
                }),
            empty: () =>
                logFixture('account', {
                    entries: [],
                    pagination: { total: 0, count: 0, perPage: 25, currentPage: 1, totalPages: 1 },
                }),
            paged: () =>
                logFixture('account', {
                    pagination: { total: 120, count: 25, perPage: 25, currentPage: 3, totalPages: 5 },
                }),
            loading: () => logFixture('account', { entries: [], loading: true, pagination: null }),
            error: () =>
                logFixture('account', {
                    entries: [],
                    pagination: null,
                    error: 'Request failed with status code 500.',
                }),
        },
    },
    'page.account.activity': page,
    'page.server.activity': page,
});
