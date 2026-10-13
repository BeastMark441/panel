<?php

declare(strict_types=1);

namespace Pterodactyl\Http\Controllers\Api\Admin\Settings;

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Response;
use Knuckles\Scribe\Attributes\Endpoint;
use Knuckles\Scribe\Attributes\Group;
use Knuckles\Scribe\Attributes\Response as ScribeResponse;
use Knuckles\Scribe\Attributes\Subgroup;
use Pterodactyl\Http\Controllers\Api\Admin\AdminApiController;
use Pterodactyl\Http\Requests\Api\Admin\Settings\UpdateGeneralSettingsRequest;
use Pterodactyl\Models\Setting;

#[Group('Админ API', 'Конечные точки для root-администратора, предназначенные для управления конфигурацией панели и ресурсами.')]
#[Subgroup('Настройки', 'Просмотр и обновление глобальных настроек панели.')]
class GeneralController extends AdminApiController
{
    /**
     * Update general settings.
     */
    #[Endpoint('Обновить общие настройки', 'Обновляет брендинг панели, требования к двухфакторной аутентификации и настройки локали по умолчанию.')]
    #[ScribeResponse(status: 204, description: 'Общие настройки обновлены.')]
    public function __invoke(UpdateGeneralSettingsRequest $request, Kernel $kernel): Response
    {
        foreach ($request->normalize() as $key => $value) {
            Setting::put('settings::'.$key, (string) $value);
        }

        $kernel->call('queue:restart');

        return $this->returnNoContent();
    }
}
