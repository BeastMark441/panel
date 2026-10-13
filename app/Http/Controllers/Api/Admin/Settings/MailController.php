<?php

declare(strict_types=1);

namespace Pterodactyl\Http\Controllers\Api\Admin\Settings;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Response;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Crypt;
use Knuckles\Scribe\Attributes\Endpoint;
use Knuckles\Scribe\Attributes\Group;
use Knuckles\Scribe\Attributes\Response as ScribeResponse;
use Knuckles\Scribe\Attributes\Subgroup;
use Pterodactyl\Exceptions\DisplayException;
use Pterodactyl\Http\Controllers\Api\Admin\AdminApiController;
use Pterodactyl\Http\Requests\Api\Admin\Settings\UpdateMailSettingsRequest;
use Pterodactyl\Models\Setting;
use Pterodactyl\Providers\SettingsServiceProvider;

#[Group('Админ API', 'Конечные точки для root-администратора, предназначенные для управления конфигурацией панели и ресурсами.')]
#[Subgroup('Настройки', 'Просмотр и обновление глобальных настроек панели.')]
class MailController extends AdminApiController
{
    private const array SMTP_DRIVER_ERROR = [
        'errors' => [
            [
                'code' => 'DisplayException',
                'status' => '400',
                'detail' => 'Эта функция доступна только в том случае, если для панели в качестве драйвера электронной почты выбран SMTP.',
            ],
        ],
    ];

    /**
     * Update mail settings.
     */
    #[Endpoint('Обновить настройки почты', 'Обновляет настройки SMTP-почты и перезапускает воркеров, обрабатывающих очередь, чтобы они перезагрузили конфигурацию.')]
    #[ScribeResponse(status: 204, description: 'Настройки почты обновлены.')]
    #[ScribeResponse(self::SMTP_DRIVER_ERROR, status: 400, description: 'Панель не настроена на использование SMTP-почты.')]
    public function __invoke(UpdateMailSettingsRequest $request, Kernel $kernel): Response
    {
        throw_if(config('mail.default') !== 'smtp', DisplayException::class, 'Эта функция доступна только в том случае, если для панели в качестве драйвера электронной почты выбран SMTP.');

        $values = $request->normalize();
        if (Arr::get($values, 'mail:mailers:smtp:password') === '!e') {
            $values['mail:mailers:smtp:password'] = '';
        }

        foreach ($values as $key => $value) {
            if (in_array($key, SettingsServiceProvider::getEncryptedKeys()) && ! empty($value)) {
                $value = Crypt::encrypt($value);
            }

            Setting::put('settings::'.$key, ($value) === null ? null : (string) $value);
        }

        $kernel->call('queue:restart');

        return $this->returnNoContent();
    }
}
