import { cn, type ScheduleCron } from '@/sdk';

/** The cron fields in a row, as the schedule list shows them. */
export default function ScheduleCronRow({ cron, className }: { cron: ScheduleCron; className?: string }) {
    return (
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
                <p className='font-medium'>{cron.dayOfMonth}</p>
                <p className='text-xs text-muted-foreground uppercase'>День (месяц)</p>
            </div>
            <div className='w-1/5 sm:w-auto text-center ml-4'>
                <p className='font-medium'>{cron.month}</p>
                <p className='text-xs text-muted-foreground uppercase'>Месяц</p>
            </div>
            <div className='w-1/5 sm:w-auto text-center ml-4'>
                <p className='font-medium'>{cron.dayOfWeek}</p>
                <p className='text-xs text-muted-foreground uppercase'>День (неделя)</p>
            </div>
        </div>
    );
}
