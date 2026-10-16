import type { UserValues } from '@/api/admin/users/queries';
import type { AppForm } from '@/components/form';
import type { SelectOption } from '@/components/ui/Select';
import TitledGreyBox from '@/components/elements/TitledGreyBox';
import {
    validateFirstName,
    validateLastName,
    validateUserEmail,
    validateUsername,
    validateUserPassword,
} from '@/components/admin/users/userForm';

interface Props {
    form: AppForm<UserValues>;
    languageOptions: SelectOption[];
    languagesLoading: boolean;
}

const AccountFields = ({ form }: Pick<Props, 'form'>) => (
    <div className='space-y-6'>
        <form.AppField name='email' validators={{ onChange: validateUserEmail }}>
            {(field) => (
                <field.TextField
                    type='email'
                    id='email'
                    label='Адрес электронной почты'
                    description='Адрес, по которому пользователь входит в панель и получает уведомления.'
                />
            )}
        </form.AppField>
        <form.AppField name='username' validators={{ onChange: validateUsername }}>
            {(field) => (
                <field.TextField
                    type='text'
                    id='username'
                    label='Имя пользователя'
                    description='Уникальное имя, по которому определяется эта учётная запись.'
                />
            )}
        </form.AppField>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
            <form.AppField name='nameFirst' validators={{ onChange: validateFirstName }}>
                {(field) => <field.TextField type='text' id='name_first' label='Имя' />}
            </form.AppField>
            <form.AppField name='nameLast' validators={{ onChange: validateLastName }}>
                {(field) => <field.TextField type='text' id='name_last' label='Фамилия' />}
            </form.AppField>
        </div>
    </div>
);

const AuthenticationFields = ({ form, languageOptions, languagesLoading }: Props) => (
    <div className='space-y-6'>
        <form.AppField name='password' validators={{ onChange: validateUserPassword }}>
            {(field) => (
                <field.TextField
                    type='password'
                    id='password'
                    label='Пароль'
                    description='Оставьте пустым, чтобы отправить пользователю ссылку для установки пароля.'
                    autoComplete='new-password'
                />
            )}
        </form.AppField>
        <form.AppField
            name='language'
            validators={{
                onChange: ({ value }) => (value.length >= 1 ? undefined : 'Выберите язык.'),
            }}
        >
            {(field) => (
                <field.SelectField
                    id='language'
                    label='Язык'
                    options={languageOptions}
                    disabled={languagesLoading}
                    placeholder='Выберите язык'
                    description='Язык по умолчанию для этой учётной записи.'
                />
            )}
        </form.AppField>
    </div>
);

const AccessFields = ({ form }: Pick<Props, 'form'>) => (
    <form.AppField name='rootAdmin'>
        {(field) => (
            <field.SwitchField
                label='Администратор'
                description='Предоставить этой учётной записи полные административные права в панели.'
            />
        )}
    </form.AppField>
);

export default function UserFormFields({ form, languageOptions, languagesLoading }: Props) {
    return (
        <div className='space-y-6'>
            <TitledGreyBox title='Данные учётной записи'>
                <AccountFields form={form} />
            </TitledGreyBox>
            <TitledGreyBox title='Аутентификация'>
                <AuthenticationFields
                    form={form}
                    languageOptions={languageOptions}
                    languagesLoading={languagesLoading}
                />
            </TitledGreyBox>
            <TitledGreyBox title='Права доступа'>
                <AccessFields form={form} />
            </TitledGreyBox>
        </div>
    );
}
