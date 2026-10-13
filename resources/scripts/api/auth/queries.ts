import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    authCompleteLoginCheckpointMutation,
    authLoginMutation,
    authLogoutMutation,
    authRequestPasswordResetEmailMutation,
    authResetPasswordMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import { authGetCsrfCookie } from '@/api/generated/sdk.gen';
import { notifyHttpError } from '@/plugins/notifications';

export const useLogin = () =>
    useMutation({
        ...authLoginMutation(),
        onMutate: async () => {
            await authGetCsrfCookie();
        },
        onError: (error) => notifyHttpError(error, 'Не удалось войти'),
    });

export const useLoginCheckpoint = () =>
    useMutation({
        ...authCompleteLoginCheckpointMutation(),
        onError: (error) => notifyHttpError(error, 'Не удалось проверить код двухэтапной проверки'),
    });

export const useRequestPasswordResetEmail = () =>
    useMutation({
        ...authRequestPasswordResetEmailMutation(),
        onSuccess: (response) => toast.success(response.status || 'Письмо для сброса пароля отправлено'),
        onError: (error) => notifyHttpError(error, 'Не удалось запросить сброс пароля'),
    });

export const usePerformPasswordReset = () =>
    useMutation({
        ...authResetPasswordMutation(),
        onError: (error) => notifyHttpError(error, 'Не удалось сбросить пароль'),
    });

export const useLogout = () =>
    useMutation({
        ...authLogoutMutation(),
        onSettled: () => {
            window.location.assign('/');
        },
    });
