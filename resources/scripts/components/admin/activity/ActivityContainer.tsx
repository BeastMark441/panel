import AdminContentBlock from '@/components/admin/AdminContentBlock';
import { View } from '@/views/View';

export default function ActivityContainer() {
    return (
        <AdminContentBlock
            title='Админ · Активность'
            heading='Активность'
            description='Действия, выполненные через панель администратора (начиная с самых новых). Информация об активности сервера и учетной записи отображается на соответствующих экранах.'
        >
            <View name='activity.log' scope='admin' />
        </AdminContentBlock>
    );
}
