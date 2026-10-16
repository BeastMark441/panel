import { History, ListFilter, XCircle } from 'lucide-react';
import {
    Alert,
    ButtonStyle,
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
    NewButton,
    PaginationFooter,
    Select,
    Spinner,
    type ActivityLogModel,
    type ActivityScope,
} from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import ActivityLogEntry from './ActivityLogEntry';

const emptyMessages = {
    account: 'Действия, выполненные в вашей учетной записи, будут отображаться здесь.',
    server: 'Действия, выполненные на этом сервере, будут отображаться здесь.',
    admin: 'Действия, выполненные через панель администратора, будут отображаться здесь.',
} satisfies Record<ActivityScope, string>;

function Results({ model, filtered }: { model: ActivityLogModel; filtered: boolean }) {
    if (model.loading) {
        return <Spinner centered />;
    }

    if (model.entries.length) {
        return (
            <div className='bg-card'>
                {model.entries.map((entry) => (
                    <ActivityLogEntry key={entry.id} entry={entry} />
                ))}
            </div>
        );
    }

    return (
        <Empty className='border bg-card'>
            <EmptyHeader>
                <EmptyMedia variant='icon'>{filtered ? <ListFilter /> : <History />}</EmptyMedia>
                <EmptyTitle>{filtered ? 'Нет подходящих действий' : 'Пока нет активности'}</EmptyTitle>
                <EmptyDescription>
                    {filtered ? 'Нет действий, соответствующих выбранным фильтрам.' : emptyMessages[model.scope]}
                </EmptyDescription>
            </EmptyHeader>
            {filtered && (
                <EmptyContent>
                    <NewButton isSecondary icon={XCircle} onClick={model.actions.clearFilters}>
                        Очистить фильтры
                    </NewButton>
                </EmptyContent>
            )}
        </Empty>
    );
}

function Filters({ model, filtered }: { model: ActivityLogModel; filtered: boolean }) {
    const { actions } = model;

    return (
        <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-stretch'>
            {model.users && (
                <div className='w-full sm:max-w-xs'>
                    <Select
                        options={[{ value: '', label: 'Все пользователи' }, ...model.users]}
                        value={model.user ?? ''}
                        placeholder='Все пользователи'
                        searchPlaceholder='Поиск пользователей…'
                        emptyMessage='Пользователи пока не выполняли здесь никаких действий.'
                        onChange={(value) => actions.setUser(String(value) || null)}
                    />
                </div>
            )}
            <div className='w-full sm:max-w-sm'>
                <Select
                    groups={[
                        { label: '', options: [{ value: '', label: 'Все события' }] },
                        ...model.events.map((group) => ({ label: group.label, options: [...group.options] })),
                    ]}
                    value={model.event ?? ''}
                    placeholder='Все события'
                    searchPlaceholder='Поиск действия…'
                    emptyMessage='Здесь пока ничего не записано.'
                    onChange={(value) => actions.setEvent(String(value) || null)}
                />
            </div>
            {filtered && (
                <ButtonStyle
                    type='button'
                    color='grey'
                    className='inline-flex items-center justify-center w-full sm:w-auto sm:shrink-0 h-auto'
                    onClick={actions.clearFilters}
                >
                    Очистить фильтры <XCircle className='w-4 h-4 ml-2' />
                </ButtonStyle>
            )}
        </div>
    );
}

export default function ActivityLog({ model, className }: ViewProps<'activity.log'>) {
    const filtered = model.event !== null || model.user !== null;

    return (
        <div className={className}>
            {model.error !== null && (
                <div className='mb-4 space-y-3'>
                    <Alert type='danger'>{model.error}</Alert>
                    <ButtonStyle type='button' color='grey' onClick={model.retry}>
                        Повторить
                    </ButtonStyle>
                </div>
            )}
            <Filters model={model} filtered={filtered} />
            <Results model={model} filtered={filtered} />
            {model.pagination && (
                <PaginationFooter pagination={model.pagination} onPageSelect={model.actions.setPage} />
            )}
        </div>
    );
}
