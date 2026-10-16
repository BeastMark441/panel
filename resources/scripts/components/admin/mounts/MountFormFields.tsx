import type { AppForm } from '@/components/form';
import type { MountValues } from '@/api/admin/mounts/queries';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import { validateMountName } from '@/components/admin/mounts/mountForm';

interface Props {
    form: AppForm<MountValues>;
}

const DetailsFields = ({ form }: Props) => (
    <div className='space-y-6'>
        <form.AppField
            name='name'
            validators={{
                onChange: ({ value }) => validateMountName(value),
            }}
        >
            {(field) => (
                <field.TextField
                    type='text'
                    id='name'
                    label='Название'
                    description='Уникальное название, по которому будет идентифицироваться это крепление.'
                />
            )}
        </form.AppField>
        <form.AppField
            name='description'
            validators={{
                onChange: ({ value }) => (value.length <= 191 ? undefined : 'Описание не должно превышать 191 символ.'),
            }}
        >
            {(field) => (
                <field.TextField
                    type='text'
                    id='description'
                    label='Описание'
                    description='Более подробное описание этого крепления.'
                />
            )}
        </form.AppField>
    </div>
);

const PathFields = ({ form }: Props) => (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <form.AppField
            name='source'
            validators={{
                onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите исходный путь.'),
            }}
        >
            {(field) => (
                <field.TextField
                    type='text'
                    id='source'
                    label='Источник'
                    description='Путь на хост-машине, который будет смонтирован в контейнер.'
                />
            )}
        </form.AppField>
        <form.AppField
            name='target'
            validators={{
                onChange: ({ value }) => (value.length >= 1 ? undefined : 'Укажите целевой путь.'),
            }}
        >
            {(field) => (
                <field.TextField
                    type='text'
                    id='target'
                    label='Целевой путь'
                    description='Путь внутри контейнера, по которому будет доступен исходный каталог.'
                />
            )}
        </form.AppField>
    </div>
);

const AccessFields = ({ form }: Props) => (
    <div className='space-y-6'>
        <form.AppField name='readOnly'>
            {(field) => (
                <field.SwitchField
                    label='Только чтение'
                    description='Монтировать этот том в контейнер как доступный только для чтения.'
                />
            )}
        </form.AppField>
        <form.AppField name='userMountable'>
            {(field) => (
                <field.SwitchField
                    label='Доступно пользователям'
                    description='Позволять пользователям добавлять это крепление к своим серверам.'
                />
            )}
        </form.AppField>
    </div>
);

export default function MountFormFields({ form }: Props) {
    return (
        <div className='space-y-6'>
            <TitledGreyBox title='Сведения о креплении'>
                <DetailsFields form={form} />
            </TitledGreyBox>
            <TitledGreyBox title='Пути'>
                <PathFields form={form} />
            </TitledGreyBox>
            <TitledGreyBox title='Доступ'>
                <AccessFields form={form} />
            </TitledGreyBox>
        </div>
    );
}
