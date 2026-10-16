import { Clock, CloudDownload, CloudUpload, Cpu, HardDrive, MemoryStick, Wifi } from 'lucide-react';
import { bytesToString, cn, CopyOnClick, Stat } from '@/sdk';
import type { ServerRunState, ServerStatMetric, UiTone, ViewProps } from '@/sdk/theme';

const tile = 'col-span-3 md:col-span-2 lg:col-span-6';

function uptimeTone(state: ServerRunState | null): UiTone {
    if (state === 'running') {
        return 'neutral';
    }

    return state === 'offline' ? 'danger' : 'warning';
}

/** "1д 2ч 3м", или "2ч 3м 4с", если прошло меньше суток. */
function UptimeDuration({ seconds }: { seconds: number }) {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((Math.floor(seconds) / 60 / 60) % 24);
    const remainder = Math.floor(seconds - hours * 60 * 60);
    const minutes = Math.floor((remainder / 60) % 60);

    if (days > 0) {
        return (
            <>
                {days}д {hours}ч {minutes}м
            </>
        );
    }

    return (
        <>
            {hours}ч {minutes}м {remainder % 60}с
        </>
    );
}

function Uptime({ state, uptime }: { state: ServerRunState | null; uptime: number }) {
    if (state === null) {
        return 'Оффлайн';
    }

    if (uptime > 0) {
        return <UptimeDuration seconds={uptime / 1000} />;
    }

    const labels = {
        offline: 'Оффлайн',
        starting: 'Запуск',
        stopping: 'Остановка',
        running: 'Запущен',
    } satisfies Record<ServerRunState, string>;

    return labels[state];
}

const limitText = (limit: string | null) => <>/ {limit || <>&infin;</>}</>;

const bytesLimit = (limit: number) => (limit ? bytesToString(limit) : null);

const tone = (metric: ServerStatMetric): UiTone => metric.alarm ?? 'neutral';

export default function Stats({ model, className }: ViewProps<'server.stats'>) {
    const offline = model.state === 'offline';
    const address = model.address ?? 'н/д';
    const { cpu, memory, disk } = model;

    return (
        <div className={cn('grid grid-cols-6 gap-2 md:gap-4', className)}>
            <CopyOnClick text={address}>
                <Stat icon={Wifi} label='Адрес' value={address} className={tile} />
            </CopyOnClick>
            <Stat
                icon={Clock}
                label='Аптайм'
                value={<Uptime state={model.state} uptime={model.uptime} />}
                tone={uptimeTone(model.state)}
                className={tile}
            />
            <Stat
                icon={Cpu}
                label='Нагрузка CPU'
                value={offline ? 'Оффлайн' : `${cpu.value.toFixed(2)}%`}
                limit={offline ? undefined : limitText(cpu.limit ? `${cpu.limit}%` : null)}
                tone={tone(cpu)}
                unavailable={offline}
                className={tile}
            />
            <Stat
                icon={MemoryStick}
                label='Память'
                value={offline ? 'Оффлайн' : bytesToString(memory.value)}
                limit={offline ? undefined : limitText(bytesLimit(memory.limit))}
                tone={tone(memory)}
                unavailable={offline}
                className={tile}
            />
            <Stat
                icon={HardDrive}
                label='Диск'
                value={bytesToString(disk.value)}
                limit={limitText(bytesLimit(disk.limit))}
                tone={tone(disk)}
                className={tile}
            />
            <Stat
                icon={CloudDownload}
                label='Сеть (входящая)'
                value={offline ? 'Оффлайн' : bytesToString(model.network.rx)}
                unavailable={offline}
                className={tile}
            />
            <Stat
                icon={CloudUpload}
                label='Сеть (исходящая)'
                value={offline ? 'Оффлайн' : bytesToString(model.network.tx)}
                unavailable={offline}
                className={tile}
            />
        </div>
    );
}
