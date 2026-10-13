import { keepPreviousData } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useAdminActivityFacets, useAdminActivityLogs } from '@/api/admin/activity/queries';
import AdminContentBlock from '@/components/admin/AdminContentBlock';
import ActivityLogView, { type ActivityLogSearch } from '@/components/elements/activity/ActivityLogView';
import { useActivitySearch } from '@/router/search';

export default function ActivityContainer() {
    const navigate = useNavigate();
    const { page, event, user } = useActivitySearch();
    const facets = useAdminActivityFacets();
    const { data, error, isFetching, refetch } = useAdminActivityLogs(
        { page, filters: { event, user }, sorts: { timestamp: -1 } },
        { refetchOnWindowFocus: false, placeholderData: keepPreviousData }
    );

    return (
        <AdminContentBlock
            title='Админ · Активность'
            heading='Активность'
            description='Действия, выполненные через панель администратора (начиная с самых новых). Информация об активности сервера и учетной записи отображается на соответствующих экранах.'
        >
            <ActivityLogView
                data={data}
                error={error}
                isFetching={isFetching}
                refetch={refetch}
                event={event}
                user={user}
                facets={facets}
                emptyMessage='Действия, выполненные через панель администратора, будут отображаться здесь.'
                onNavigate={(search: ActivityLogSearch) =>
                    navigate({ to: '/panel/activity', search, replace: true, viewTransition: false })
                }
            />
        </AdminContentBlock>
    );
}
