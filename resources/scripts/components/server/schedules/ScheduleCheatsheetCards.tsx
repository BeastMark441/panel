import { CircleHelp } from 'lucide-react';
import Icon from '@/components/elements/Icon';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { cn } from '@/lib/cn';

interface Row {
    token: string;
    meaning: string;
    detail?: string;
}

const examples: Row[] = [
    { token: '*/5 * * * *', meaning: 'каждые 5 минут' },
    { token: '0 */1 * * *', meaning: 'каждый час' },
    { token: '0 8-12 * * *', meaning: 'диапазон часов' },
    { token: '0,30 * * * *', meaning: 'в начале часа и в половине' },
    { token: '0 0 * * *', meaning: 'один раз в день' },
    { token: '0 0 * * MON', meaning: 'каждый понедельник' },
    { token: '0 0 * * MON,FRI', meaning: 'каждый понедельник и пятницу' },
];

const specialCharacters: Row[] = [
    {
        token: '*',
        meaning: 'любое значение',
        detail: 'Совпадает с любым значением этого поля. Час * выполняет задачу каждый час.',
    },
    {
        token: ',',
        meaning: 'разделитель списка значений',
        detail: 'Выбирает несколько точных значений. Минута 0,30 выполняется в начале часа и в половине.',
    },
    {
        token: '-',
        meaning: 'диапазон значений',
        detail: 'Покрывает всё между двумя значениями. Час 8-12 выполняется в 8, 9, 10, 11 и 12.',
    },
    {
        token: '/',
        meaning: 'шаг значений',
        detail: 'Повторяет каждое n-е значение. Минута */15 выполняется четыре раза в час.',
    },
];

const hintClass = [
    'inline-flex cursor-help items-baseline gap-1.5 text-left',
    'underline decoration-dotted decoration-muted-foreground underline-offset-4',
    'hover:text-foreground hover:decoration-foreground',
    'focus-visible:text-foreground focus-visible:decoration-foreground focus-visible:outline-hidden',
].join(' ');

const RowMeaning = ({ meaning, detail }: Row) =>
    detail ? (
        <Tooltip content={detail} interactions={['hover', 'focus', 'click']}>
            <button type='button' className={hintClass}>
                {meaning}
                <Icon icon={CircleHelp} className='shrink-0 self-center text-muted-foreground' />
            </button>
        </Tooltip>
    ) : (
        meaning
    );

const CheatsheetCard = ({ title, rows, tokenClass }: { title: string; rows: Row[]; tokenClass: string }) => (
    <div className='overflow-hidden rounded-sm border border-border bg-background/50'>
        <h3 className='border-b border-border bg-popover px-3 py-2 text-xs font-semibold uppercase text-muted-foreground'>
            {title}
        </h3>
        <dl className='divide-y divide-border text-xs'>
            {rows.map((row) => (
                <div key={row.token} className='flex items-baseline gap-3 px-3 py-2.5'>
                    <dt className={cn('shrink-0 whitespace-nowrap font-mono text-foreground', tokenClass)}>
                        {row.token}
                    </dt>
                    <dd className='min-w-0 text-card-foreground'>
                        <RowMeaning {...row} />
                    </dd>
                </div>
            ))}
        </dl>
    </div>
);

const ScheduleCheatsheetCards = () => (
    <div className='mt-4 grid items-start gap-4 sm:grid-cols-2'>
        <CheatsheetCard title='Примеры' rows={examples} tokenClass='w-32' />
        <CheatsheetCard title='Спецсимволы' rows={specialCharacters} tokenClass='w-6 text-center' />
    </div>
);

export default ScheduleCheatsheetCards;
