import type { AdminDatabaseHost } from '@/api/admin/database-hosts/queries';
import { type NumberInputValue, requiredNumber, submittedNumber } from '@/components/admin/numberInput';
import { requiredWithMaxLength } from '@/components/form/validators';
import { type ExtensionFormValues, initialExtensionValues } from '@/extensions/forms';

export interface DatabaseHostFormValues {
    name: string;
    host: string;
    port: NumberInputValue;
    username: string;
    password: string;
    nodeId: string;
    extensions: ExtensionFormValues;
}

type TextValidator = ({ value }: { value: string }) => string | undefined;

export const newDatabaseHostFormValues = (): DatabaseHostFormValues => ({
    name: '',
    host: '',
    port: 3306,
    username: '',
    password: '',
    nodeId: '',
    extensions: initialExtensionValues(),
});

export const databaseHostFormValues = (host: AdminDatabaseHost): DatabaseHostFormValues => ({
    name: host.attributes.name,
    host: host.attributes.host,
    port: host.attributes.port,
    username: host.attributes.username,
    password: '',
    nodeId: host.attributes.node_id === null ? '' : String(host.attributes.node_id),
    extensions: initialExtensionValues(),
});

const validateName = requiredWithMaxLength(191, 'Укажите название.', 'Название не должно превышать 191 символ.');

const validateHost: TextValidator = ({ value }): string | undefined => {
    if (value.length < 1) {
        return 'Укажите хост.';
    }

    if (!/^[\w\-.]+$/.test(value)) {
        return 'Хост должен быть корректным именем хоста или IP-адресом.';
    }

    return undefined;
};

const validateUsername = requiredWithMaxLength(
    32,
    'Укажите имя пользователя.',
    'Имя пользователя не должно превышать 32 символов.'
);

const validateRequiredPassword: TextValidator = ({ value }) => (value.length >= 1 ? undefined : 'Укажите пароль.');

export const databaseHostValidators = {
    name: { onChange: validateName },
    host: { onChange: validateHost },
    port: {
        onChange: requiredNumber('Укажите порт.', (value) =>
            value >= 1 && value <= 65535 ? undefined : 'Порт должен быть в диапазоне от 1 до 65535.'
        ),
    },
    username: { onChange: validateUsername },
    requiredPassword: { onChange: validateRequiredPassword },
};

export const databaseHostBodyFromFormValues = (values: DatabaseHostFormValues) => ({
    name: values.name,
    host: values.host,
    port: submittedNumber(values.port),
    username: values.username,
    password: values.password || undefined,
    node_id: values.nodeId === '' ? null : Number(values.nodeId),
    extensions: values.extensions,
});
