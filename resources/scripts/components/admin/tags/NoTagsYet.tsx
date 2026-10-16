import { Link } from '@tanstack/react-router';
import { Tags } from 'lucide-react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

export default function NoTagsYet() {
    return (
        <Empty size='compact'>
            <EmptyHeader>
                <EmptyMedia variant='icon'>
                    <Tags />
                </EmptyMedia>
                <EmptyTitle>Тегов пока нет</EmptyTitle>
                <EmptyDescription>
                    Введите название ниже, чтобы создать тег, или управляйте тегами на{' '}
                    <Link to='/panel/tags'>странице тегов</Link>.
                </EmptyDescription>
            </EmptyHeader>
        </Empty>
    );
}
