import type { AdminUser, UserValues } from '@/api/admin/users/queries';
import { requiredWithMaxLength } from '@/components/form/validators';
import { initialExtensionValues } from '@/extensions/forms';

export const userFormValues = (user: AdminUser): UserValues => ({
    email: user.attributes.email,
    username: user.attributes.username,
    nameFirst: user.attributes.first_name ?? '',
    nameLast: user.attributes.last_name ?? '',
    password: '',
    rootAdmin: user.attributes.root_admin,
    language: user.attributes.language,
    extensions: initialExtensionValues(),
});

export const validateUserPassword = ({ value }: { value: string }): string | undefined => {
    if (value.length === 0) {
        return undefined;
    }

    if (value.length < 8) {
        return 'Пароль должен содержать не менее 8 символов.';
    }

    if (value.length > 191) {
        return 'Пароль не должен превышать 191 символа.';
    }

    return undefined;
};

export const validateUserEmail = ({ value }: { value: string }): string | undefined => {
    if (value.length < 1) {
        return 'Укажите адрес электронной почты.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Укажите корректный адрес электронной почты.';
    }

    return undefined;
};

export const validateUsername = requiredWithMaxLength(
    191,
    'Укажите имя пользователя.',
    'Имя пользователя не должно превышать 191 символа.'
);

export const validateFirstName = requiredWithMaxLength(191, 'Укажите имя.', 'Имя не должно превышать 191 символа.');

export const validateLastName = requiredWithMaxLength(
    191,
    'Укажите фамилию.',
    'Фамилия не должна превышать 191 символа.'
);
