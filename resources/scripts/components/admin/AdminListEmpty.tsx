import type * as React from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { NewButton } from '@/components/elements/NewButton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { emptyCompactClass } from '@/components/ui/styles';

interface Props {
    icon: LucideIcon;
    /** Название ресурсов во множественном числе: например, «серверы» или «API-ключи». */
    noun: string;
    filter?: string;
    onClearFilter: () => void;
    description: React.ReactNode;
    action?: React.ReactNode;
}

/** Пустое состояние списка с поиском и возможностью сбросить поисковый запрос. */
export default function AdminListEmpty({
    icon: ResourceIcon,
    noun,
    filter,
    onClearFilter,
    description,
    action,
}: Props) {
    const content = filter ? (
        <NewButton isSecondary icon={X} onClick={onClearFilter}>
            Очистить поиск
        </NewButton>
    ) : (
        action
    );

    return (
        <Empty className={emptyCompactClass}>
            <EmptyHeader>
                <EmptyMedia variant='icon'>
                    <ResourceIcon />
                </EmptyMedia>
                <EmptyTitle>{filter ? `Ничего не найдено: ${noun}` : `Список пуст: ${noun}`}</EmptyTitle>
                <EmptyDescription>
                    {filter ? (
                        <>
                            Нет результатов по запросу «<span className='font-medium text-foreground'>{filter}</span>
                            ».
                        </>
                    ) : (
                        description
                    )}
                </EmptyDescription>
            </EmptyHeader>
            {content && <EmptyContent>{content}</EmptyContent>}
        </Empty>
    );
}
