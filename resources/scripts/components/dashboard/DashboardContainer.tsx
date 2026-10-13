import { ComponentReplacementSession } from '@/extensions/componentSession';
import { useEffect } from 'react';
import { httpErrorToHuman } from '@/api/http';
import { Server } from 'lucide-react';
import ServerRow from '@/components/dashboard/ServerRow';
import { NewLinkButton } from '@/components/elements/NewButton';
import Spinner from '@/components/elements/Spinner';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Switch from '@/components/ui/Switch';
import Pagination from '@/components/elements/Pagination';
import { useNavigate } from '@tanstack/react-router';
import { useAccountServers } from '@/api/account/servers/queries';
import { ServerError } from '@/components/elements/ScreenBlock';
import { useCurrentUser } from '@/api/account/queries';
import { getPageSearch, useDashboardSearch } from '@/router/search';
import Slot from '@/extensions/Slot';
import PageHeading from '@/components/elements/PageHeading';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

function DashboardContainerContent() {
    const navigate = useNavigate();
    const { page, type } = useDashboardSearch();

    const { rootAdmin } = useCurrentUser();
    const serverType = rootAdmin ? type : undefined;
    const showOnlyAdmin = serverType === 'admin';

    const navigateToPage = (page: number) => {
        void navigate({
            to: '/',
            search: serverType ? { ...getPageSearch(page), type: serverType } : getPageSearch(page),
            replace: true,
            viewTransition: false,
        });
    };

    const { data: servers, error, refetch } = useAccountServers({ page, type: serverType });

    const toggleShowOnlyAdmin = () => {
        void navigate({
            to: '/',
            search: showOnlyAdmin ? {} : { type: 'admin' },
            replace: true,
            viewTransition: false,
        });
    };

    useEffect(() => {
        if (!servers) {
            return;
        }

        if (servers.meta.pagination.current_page > 1 && !servers.data.length) {
            void navigate({
                to: '/',
                search: serverType ? { type: serverType } : {},
                replace: true,
                viewTransition: false,
            });
        }
    }, [navigate, serverType, servers]);

    if (error) {
        return <ServerError message={httpErrorToHuman(error)} onRetry={() => refetch()} />;
    }

    return (
        <PageContentBlock title='Дашборд'>
            <PageHeading
                title='Серверы'
                className='mb-4'
                actions={
                    rootAdmin && (
                        <Switch
                            checked={showOnlyAdmin}
                            onChange={toggleShowOnlyAdmin}
                            label={showOnlyAdmin ? 'Показаны серверы других пользователей' : 'Показаны ваши серверы'}
                            controlPosition='end'
                            className='gap-2'
                        />
                    )
                }
            />
            <Slot name='dashboard.before' />
            {servers ? (
                <Pagination data={servers} onPageSelect={navigateToPage}>
                    {({ items }) =>
                        items.length > 0 ? (
                            items.map((server, index) => (
                                <ServerRow
                                    key={server.attributes.uuid}
                                    server={server}
                                    className={index > 0 ? 'mt-2' : undefined}
                                />
                            ))
                        ) : (
                            <Empty className='border bg-card'>
                                <EmptyHeader>
                                    <EmptyMedia variant='icon'>
                                        <Server />
                                    </EmptyMedia>
                                    <EmptyTitle>
                                        {showOnlyAdmin ? 'Нет серверов других пользователей' : 'Пока нет серверов'}
                                    </EmptyTitle>
                                    <EmptyDescription>
                                        {showOnlyAdmin
                                            ? 'Серверы, принадлежащие другим пользователям, будут отображаться здесь.'
                                            : 'Здесь появятся серверы, которыми вы владеете или к которым вас пригласили.'}
                                    </EmptyDescription>
                                </EmptyHeader>
                                {rootAdmin && (
                                    <EmptyContent>
                                        <NewLinkButton to='/panel/servers/new'>Новый сервер</NewLinkButton>
                                    </EmptyContent>
                                )}
                            </Empty>
                        )
                    }
                </Pagination>
            ) : (
                <Spinner centered size='large' />
            )}
            <Slot name='dashboard.after' />
        </PageContentBlock>
    );
}

export default function DashboardContainer() {
    return (
        <ComponentReplacementSession>
            <DashboardContainerContent />
        </ComponentReplacementSession>
    );
}
