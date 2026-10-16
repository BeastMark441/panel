import { useAdminNodesGroupedByLocation } from '@/api/admin/nodes/queries';
import Select from '@/components/ui/Select';
import Label from '@/components/elements/Label';

interface Props {
    id: string;
    value: string;
    onChange: (value: string) => void;
}

export default function DatabaseHostNodeSelect({ id, value, onChange }: Props) {
    const { data: locations } = useAdminNodesGroupedByLocation();

    const groups = [
        {
            label: 'Глобальный',
            options: [{ value: '', label: 'Без узла' }],
        },
        ...(locations ?? []).map((group) => ({
            label: `${group.location.attributes.long || group.location.attributes.short} (${group.location.attributes.short})`,
            options: group.nodes.map((node) => ({
                value: String(node.id),
                label: `${node.name} (${node.fqdn})`,
            })),
        })),
    ];

    return (
        <div>
            <Label htmlFor={id}>Связанный узел</Label>
            <Select
                id={id}
                value={value}
                placeholder='Без узла'
                groups={groups}
                disabled={locations === undefined}
                onChange={(value) => onChange(String(value))}
            />
            <p className='input-help'>
                При добавлении баз данных для серверов на выбранном узле использовать этот хост по умолчанию.
            </p>
        </div>
    );
}
