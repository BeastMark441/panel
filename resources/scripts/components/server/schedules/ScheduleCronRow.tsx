import { type Schedule } from '@/api/server/schedules/queries';
import { cn } from '@/lib/cn';

interface Props {
    cron: Schedule['attributes']['cron'];
    className?: string;
}

const ScheduleCronRow = ({ cron, className }: Props) => (
    <div className={cn('flex', className)}>
        <div className='w-1/5 sm:w-auto text-center'>
            <p className='font-medium'>{cron.minute}</p>
            <p className='text-xs text-muted-foreground uppercase'>Минута</p>
        </div>
        <div className='w-1/5 sm:w-auto text-center ml-4'>
            <p className='font-medium'>{cron.hour}</p>
            <p className='text-xs text-muted-foreground uppercase'>Час</p>
        </div>
        <div className='w-1/5 sm:w-auto text-center ml-4'>
            <p className='font-medium'>{cron.day_of_month}</p>
            <p className='text-xs text-muted-foreground uppercase'>День (месяц)</p>
        </div>
        <div className='w-1/5 sm:w-auto text-center ml-4'>
            <p className='font-medium'>{cron.month}</p>
            <p className='text-xs text-muted-foreground uppercase'>Месяц</p>
        </div>
        <div className='w-1/5 sm:w-auto text-center ml-4'>
            <p className='font-medium'>{cron.day_of_week}</p>
            <p className='text-xs text-muted-foreground uppercase'>День (неделя)</p>
        </div>
    </div>
);

export default ScheduleCronRow;
