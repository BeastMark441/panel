<?php

declare(strict_types=1);

namespace Pterodactyl\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Pterodactyl\Services\Helpers\SoftwareVersionService;

#[Description('Отображает настройки приложения, базы данных и электронной почты, а также версию панели.')]
#[Signature('p:info')]
class InfoCommand extends Command
{
    public function __construct(private readonly SoftwareVersionService $versionService)
    {
        parent::__construct();
    }

    /**
     * Выполняет команду.
     */
    public function handle(): void
    {
        $this->output->title('Информация о версии');
        $this->table([], [
            ['Версия панели', config('app.version')],
            ['Последняя версия', $this->versionService->getPanel()],
            ['Версия актуальна', $this->versionService->isLatestPanel() ? 'Да' : $this->formatText('Нет', 'bg=red')],
            ['Уникальный идентификатор', config('pterodactyl.service.author')],
        ], 'compact');

        $this->output->title('Настройки приложения');
        $this->table([], [
            ['Окружение', $this->formatText(config()->string('app.env'), config('app.env') === 'production' ? '' : 'bg=red')],
            ['Режим отладки', $this->formatText(config('app.debug') ? 'Да' : 'Нет', config('app.debug') ? 'bg=red' : '')],
            ['URL панели', config('app.url')],
            ['Каталог установки', base_path()],
            ['Часовой пояс', config('app.timezone')],
            ['Драйвер кеша', config('cache.default')],
            ['Драйвер очереди', config('queue.default')],
            ['Драйвер сессий', config('session.driver')],
            ['Драйвер файловой системы', config('filesystems.default')],
            ['Тема по умолчанию', config('themes.active')],
            ['Прокси-серверы', config('trustedproxies.proxies')],
        ], 'compact');

        $this->output->title('Настройки базы данных');
        $driver = config()->string('database.default');
        $this->table([], [
            ['Драйвер', $driver],
            ['Хост', config("database.connections.$driver.host")],
            ['Порт', config("database.connections.$driver.port")],
            ['База данных', config("database.connections.$driver.database")],
            ['Имя пользователя', config("database.connections.$driver.username")],
        ], 'compact');

        // TODO: Добавить поддержку других драйверов электронной почты.
        $this->output->title('Настройки электронной почты');
        $this->table([], [
            ['Драйвер', config('mail.default')],
            ['Хост', config('mail.mailers.smtp.host')],
            ['Порт', config('mail.mailers.smtp.port')],
            ['Имя пользователя', config('mail.mailers.smtp.username')],
            ['Адрес отправителя', config('mail.from.address')],
            ['Имя отправителя', config('mail.from.name')],
            ['Шифрование', config('mail.mailers.smtp.encryption')],
        ], 'compact');
        $this->newLine();
        $this->output->title('О модификации панели');
        $this->line('Используется русскоязычная модификация Pterodactyl Panel.');
        $this->line('Из-за изменений в коде оригинальные разработчики могут не иметь возможности помочь с возникшими проблемами.');
        $this->line('По вопросам перевода и работы модифицированной панели обращайтесь в репозиторий проекта:');
        $this->line('https://github.com/BeastMark441/panel');
        $this->line('This panel has been modified.', 'bg=red');
    }

    /**
     * Форматирует текст с заданными параметрами оформления.
     */
    private function formatText(string $value, string $opts = ''): string
    {
        if ($opts === '') {
            return $value;
        }

        return sprintf('<%s>%s</>', $opts, $value);
    }
}
