import React from 'react';
import { useStore } from '@tanstack/react-form';
import { SearchX } from 'lucide-react';
import type { DialogProps } from '@/components/elements/dialog';
import { Dialog } from '@/components/elements/dialog';
import { useAppForm, Form } from '@/components/form';
import InputSpinner from '@/components/elements/InputSpinner';
import { ip } from '@/lib/formatters';
import SearchServerResult from '@/components/dashboard/SearchServerResult';
import { useAccountServerSearch } from '@/api/account/servers/queries';
import { Alert } from '@/components/elements/alert';
import { httpErrorToHuman } from '@/api/http';
import { useCurrentUser } from '@/api/account/queries';
import { useDebouncedValue } from '@/plugins/useDebouncedValue';
import { relationshipData } from '@/api/relationships';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { emptyCompactClass } from '@/components/ui/styles';
import { cn } from '@/lib/cn';

type Props = DialogProps;

export default function SearchModal({ ...props }: Props) {
    const isAdmin = useCurrentUser().rootAdmin;

    const form = useAppForm({
        defaultValues: { term: '' },
        // Search runs on the debounced term, not on submit.
        onSubmit: async () => {},
    });

    const term = useStore(form.store, (state) => state.values.term);
    const debouncedTerm = useDebouncedValue(term, 500);
    const query = debouncedTerm.trim();
    const type = isAdmin ? 'admin-all' : undefined;
    const canSearch = query.length >= 3;

    const { data: servers, error, isFetching } = useAccountServerSearch({ query, type }, canSearch);
    const serverList = servers?.data.slice(0, 5) ?? [];

    return (
        <Dialog title='Поиск серверов' {...props}>
            <Form form={form}>
                <InputSpinner visible={isFetching}>
                    <form.AppField
                        name='term'
                        validators={{
                            onChange: ({ value }) =>
                                value.length >= 3 || value.length === 0
                                    ? undefined
                                    : 'Введите минимум три символа, чтобы начать поиск.',
                        }}
                    >
                        {(field) => (
                            <field.TextField
                                label='Поисковый запрос'
                                description='Введите название сервера, UUID или выделение, чтобы начать поиск.'
                                autoFocus
                            />
                        )}
                    </form.AppField>
                </InputSpinner>
            </Form>
            {canSearch && error && !isFetching && (
                <div className='mt-4'>
                    <Alert type='danger'>{httpErrorToHuman(error)}</Alert>
                </div>
            )}
            {canSearch && servers && !isFetching && !error && serverList.length === 0 && (
                <Empty className={cn(emptyCompactClass, 'mt-6')}>
                    <EmptyHeader>
                        <EmptyMedia variant='icon'>
                            <SearchX />
                        </EmptyMedia>
                        <EmptyTitle>Серверы не найдены</EmptyTitle>
                        <EmptyDescription>
                            Ни один сервер не соответствует запросу. Попробуйте другое название или адрес.
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            )}
            {canSearch && serverList.length > 0 && (
                <div className='mt-6'>
                    {serverList.map((server) => {
                        const { attributes } = server;
                        const defaultAllocations = relationshipData(attributes.relationships?.allocations).reduce<
                            React.ReactNode[]
                        >((allocations, allocation) => {
                            const allocationAttributes = allocation.attributes;

                            if (allocationAttributes.is_default) {
                                allocations.push(
                                    <span key={allocationAttributes.ip + allocationAttributes.port.toString()}>
                                        {allocationAttributes.ip_alias || ip(allocationAttributes.ip)}:
                                        {allocationAttributes.port}
                                    </span>
                                );
                            }

                            return allocations;
                        }, []);

                        return (
                            <SearchServerResult
                                key={attributes.uuid}
                                serverId={attributes.identifier}
                                onClick={() => props.onClose()}
                            >
                                <div className='flex-1 mr-4'>
                                    <p className='text-sm'>{attributes.name}</p>
                                    <p className='mt-1 text-xs text-muted-foreground'>{defaultAllocations}</p>
                                </div>
                                <div className='flex-none text-right'>
                                    <span className='text-xs py-1 px-2 bg-accent text-accent-foreground rounded-sm'>
                                        {attributes.node}
                                    </span>
                                </div>
                            </SearchServerResult>
                        );
                    })}
                </div>
            )}
        </Dialog>
    );
}
