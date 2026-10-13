import { useMemo, useState } from 'react';
import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { KeyRound } from 'lucide-react';
import { httpErrorToHuman } from '@/api/http';
import ContentBox from '@/components/elements/ContentBox';
import CreateApiKeyForm from '@/components/dashboard/forms/CreateApiKeyForm';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Spinner from '@/components/elements/Spinner';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { emptyCompactClass } from '@/components/ui/styles';
import PageContentBlock from '@/components/elements/PageContentBlock';
import { Dialog } from '@/components/elements/dialog';
import Code from '@/components/elements/Code';
import { useAccountApiKeys, useDeleteAccountApiKey } from '@/api/account/api-keys/queries';
import { ServerError } from '@/components/elements/ScreenBlock';
import DataTable from '@/components/elements/table/DataTable';
import { accountApiColumns } from '@/components/dashboard/AccountApiTable';

export default function AccountApiContainer() {
    const [deleteIdentifier, setDeleteIdentifier] = useState('');

    const { data: keys, error, refetch } = useAccountApiKeys();
    const { mutate: deleteKey, isPending: isDeleting } = useDeleteAccountApiKey();
    const columns = useMemo(() => accountApiColumns(setDeleteIdentifier), []);
    const data = useMemo(() => keys?.data ?? [], [keys?.data]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: (key) => key.attributes.identifier,
    });

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => refetch()} />;
    }

    return (
        <PageContentBlock title='API учётной записи'>
            <div className='md:flex flex-nowrap my-10'>
                <ContentBox title='Создание API-ключа' className='flex-none w-full md:w-1/2'>
                    <CreateApiKeyForm />
                </ContentBox>
                <ContentBox title='API-ключи' className='flex-1 overflow-hidden mt-8 md:mt-0 md:ml-8'>
                    <SpinnerOverlay visible={isDeleting} />
                    <Dialog.Confirm
                        title='Удаление API-ключа'
                        confirm='Удалить ключ'
                        open={!!deleteIdentifier}
                        pending={isDeleting}
                        onClose={() => setDeleteIdentifier('')}
                        onConfirmed={() => {
                            deleteKey(
                                { path: { identifier: deleteIdentifier } },
                                { onSettled: () => setDeleteIdentifier('') }
                            );
                        }}
                    >
                        Все запросы, использующие ключ <Code>{deleteIdentifier}</Code>, перестанут действовать.
                    </Dialog.Confirm>
                    {keys ? (
                        <DataTable
                            table={table}
                            emptyState={
                                <Empty className={emptyCompactClass}>
                                    <EmptyHeader>
                                        <EmptyMedia variant='icon'>
                                            <KeyRound />
                                        </EmptyMedia>
                                        <EmptyTitle>Нет API-ключей</EmptyTitle>
                                        <EmptyDescription>
                                            Создайте ключ, чтобы использовать Client API из собственных скриптов и
                                            инструментов.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            }
                        />
                    ) : (
                        <Spinner size='large' centered />
                    )}
                </ContentBox>
            </div>
        </PageContentBlock>
    );
}
