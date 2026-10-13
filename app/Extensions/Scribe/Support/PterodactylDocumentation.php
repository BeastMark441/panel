<?php

declare(strict_types=1);

namespace Pterodactyl\Extensions\Scribe\Support;

use Pterodactyl\Support\JsonEmptyObject;
use ReflectionMethod;

class PterodactylDocumentation
{
    public const array VALIDATION_ERROR = [
        'errors' => [
            [
                'code' => 'ValidationException',
                'status' => '422',
                'detail' => 'Переданные данные некорректны.',
                'source' => ['field' => 'field'],
            ],
        ],
    ];

    public const array AUTHENTICATION_ERROR = [
        'errors' => [
            [
                'code' => 'Unauthenticated',
                'status' => '401',
                'detail' => 'Данные для аутентификации отсутствуют или некорректны.',
            ],
        ],
    ];

    public const array FORBIDDEN_ERROR = [
        'errors' => [
            [
                'code' => 'Forbidden',
                'status' => '403',
                'detail' => 'У API-ключа нет прав на выполнение этого действия.',
            ],
        ],
    ];

    public const array NOT_FOUND_ERROR = [
        'errors' => [
            [
                'code' => 'NotFoundHttpException',
                'status' => '404',
                'detail' => 'Запрошенный ресурс не найден.',
            ],
        ],
    ];

    public const string DEPLOY_TAGS = 'Теги развёртывания (ID или символьные идентификаторы), указанные при развёртывании. Теги egg на узле сопоставляются с тегами egg по условию «ИЛИ»: узел без таких тегов принимает любой egg, иначе требуется хотя бы один общий тег. Теги развёртывания узла должны точно совпадать с указанными здесь: узел, зарезервированный для отсутствующего здесь тега, пропускается, а каждый указанный тег должен быть зарезервирован на узле.';

    private const array URL_PARAMETERS = [
        'allocation' => ['integer', 'ID выделения.', 1],
        'backup' => ['string', 'UUID резервной копии.', 'b6b9acf9-19b1-4bb1-8c75-4abac802c6cf'],
        'backup_uuid' => ['string', 'UUID резервной копии.', 'b6b9acf9-19b1-4bb1-8c75-4abac802c6cf'],
        'database' => ['string', 'ID базы данных.', 'Lk3jx4pQ'],
        'database_id' => ['string', 'ID базы данных.', 'Lk3jx4pQ'],
        'database_host' => ['integer', 'ID хоста баз данных.', 1],
        'databaseHost' => ['integer', 'ID хоста баз данных.', 1],
        'egg' => ['integer', 'ID egg.', 1],
        'egg_id' => ['integer', 'ID egg.', 1],
        'external_id' => ['string', 'Внешний идентификатор.', 'external-identifier'],
        'extension' => ['string', 'Идентификатор расширения.', 'probe'],
        'file' => ['string', 'Путь к файлу.', '/server.properties'],
        'force' => ['string', 'Выполнять ли принудительное удаление.', 'force'],
        'id' => ['integer', 'ID ресурса.', 1],
        'identifier' => ['string', 'UUID или сокращённый UUID сервера.', 'd3aac109'],
        'input' => ['string', 'Имя поля настройки расширения.', 'logo'],
        'job' => ['string', 'UUID задания, ход выполнения которого отслеживается.', '11111111-1111-4111-8111-111111111111'],
        'key' => ['string', 'Идентификатор API-ключа.', 'ci0abc123def'],
        'location' => ['integer', 'ID локации.', 1],
        'location_id' => ['integer', 'ID локации.', 1],
        'mount' => ['integer', 'ID точки монтирования.', 1],
        'mount_id' => ['integer', 'ID точки монтирования.', 1],
        'node' => ['integer', 'ID узла.', 1],
        'node_id' => ['integer', 'ID узла.', 1],
        'schedule' => ['integer', 'ID расписания.', 1],
        'schedule_id' => ['integer', 'ID расписания.', 1],
        'server' => ['string', 'UUID сервера.', 'd3aac109-e5a0-4331-b03e-3454f7e02bbe'],
        'server_id' => ['integer', 'ID сервера.', 1],
        'server_uuid' => ['string', 'UUID сервера.', 'd3aac109-e5a0-4331-b03e-3454f7e02bbe'],
        'server_admin_identifier' => ['string', 'ID или UUID сервера.', '1'],
        'subuser' => ['integer', 'ID дополнительного пользователя.', 1],
        'task' => ['integer', 'ID задачи.', 1],
        'task_id' => ['integer', 'ID задачи.', 1],
        'user' => ['integer', 'ID пользователя.', 1],
        'user_id' => ['integer', 'ID пользователя.', 1],
        'variable' => ['integer', 'ID переменной.', 1],
        'variable_id' => ['integer', 'ID переменной.', 1],
    ];

    private const array FIELD_DESCRIPTIONS = [
        'action' => 'Действие, которое необходимо выполнить.',
        'alias' => 'Необязательный псевдоним ресурса.',
        'allocation' => 'ID выделения.',
        'allocation_id' => 'ID выделения.',
        'allocation_limit' => 'Максимальное количество выделений.',
        'allowed_ips' => 'IP-адреса, с которых разрешено использовать этот ключ.',
        'backup_limit' => 'Максимальное количество резервных копий.',
        'behind_proxy' => 'Находится ли узел за прокси.',
        'command' => 'Команда для отправки в консоль.',
        'contents' => 'Содержимое файла.',
        'continue_on_failure' => 'Продолжать ли выполнение расписания при ошибке этой задачи.',
        'copy_script_from' => 'ID другого egg, из которого нужно скопировать скрипт установки.',
        'cpu' => 'Лимит использования CPU в процентах.',
        'current_password' => 'Текущий пароль учётной записи.',
        'database_host_id' => 'ID хоста баз данных.',
        'database_limit' => 'Максимальное количество баз данных.',
        'default_value' => 'Значение по умолчанию.',
        'deploy.tags' => self::DEPLOY_TAGS,
        'directory' => 'Путь к каталогу.',
        'disk' => 'Лимит дискового пространства в мегабайтах.',
        'description' => 'Описание ресурса.',
        'docker_image' => 'Используемый образ Docker.',
        'docker_images' => 'Образы Docker, доступные для этого ресурса.',
        'egg_id' => 'ID egg.',
        'email' => 'Адрес электронной почты пользователя.',
        'env_variable' => 'Имя переменной окружения.',
        'environment' => 'Переменные окружения сервера.',
        'external_id' => 'Внешний идентификатор ресурса.',
        'feature_limits.allocations' => 'Максимальное количество выделений.',
        'feature_limits.backups' => 'Максимальное количество резервных копий.',
        'feature_limits.databases' => 'Максимальное количество баз данных.',
        'features' => 'Флаги функций, включённых для этого ресурса.',
        'file' => 'Путь к файлу.',
        'file_denylist' => 'Шаблоны файлов, доступ к которым запрещён в файловом менеджере.',
        'filename' => 'Имя файла.',
        'files' => 'Пути к файлам, затрагиваемым операцией.',
        'fingerprint' => 'Отпечаток SSH-ключа.',
        'force_outgoing_ip' => 'Должны ли серверы использовать IP-адрес своего выделения для исходящего трафика.',
        'fqdn' => 'Полное доменное имя.',
        'host' => 'Адрес хоста баз данных.',
        'ignore_tags' => 'Размещать ли сервер на узле, у которого нет общих тегов egg с выбранным egg. Теги развёртывания узла здесь никогда не проверяются.',
        'ignored' => 'Следует ли игнорировать этот элемент.',
        'import_file' => 'Файл для импорта.',
        'io' => 'Вес блочного ввода-вывода.',
        'ip' => 'IP-адрес.',
        'is_active' => 'Активен ли ресурс.',
        'is_locked' => 'Заблокирован ли ресурс.',
        'language' => 'Код локали.',
        'location_id' => 'ID локации.',
        'max_connections' => 'Максимальное количество подключений.',
        'memory' => 'Лимит памяти в мегабайтах.',
        'mount_id' => 'ID точки монтирования.',
        'name' => 'Отображаемое название.',
        'node_id' => 'ID узла.',
        'notes' => 'Примечания к ресурсу.',
        'oom_disabled' => 'Отключён ли OOM killer.',
        'options' => 'Дополнительные параметры ресурса.',
        'order' => 'ID ресурсов в желаемом порядке отображения.',
        'owner_id' => 'ID пользователя — владельца ресурса.',
        'password' => 'Пароль.',
        'password_confirmation' => 'Подтверждение пароля.',
        'permissions' => 'Права, предоставленные пользователю.',
        'port' => 'Номер порта.',
        'ports' => 'Порты для выделения.',
        'primary_allocation_id' => 'ID основного выделения.',
        'public_key' => 'Открытый SSH-ключ.',
        'remote' => 'Удалённый адрес базы данных.',
        'root_admin' => 'Есть ли у пользователя права администратора.',
        'rules' => 'Правила валидации Laravel для значений, переданных пользователем.',
        'script_container' => 'Образ контейнера установки.',
        'script_entry' => 'Точка входа контейнера установки.',
        'script_install' => 'Текст скрипта установки.',
        'script_is_privileged' => 'Выполняется ли скрипт установки в привилегированном режиме.',
        'sequence_id' => 'Порядок выполнения задачи.',
        'signal' => 'Сигнал управления питанием.',
        'skip_scripts' => 'Пропускать ли скрипты установки.',
        'source' => 'Исходный путь.',
        'start_on_completion' => 'Запускать ли сервер после завершения операции.',
        'startup' => 'Команда запуска.',
        'swap' => 'Лимит памяти подкачки в мегабайтах.',
        'target' => 'Целевой путь.',
        'threads' => 'Потоки CPU, доступные серверу.',
        'time_offset' => 'Задержка перед выполнением задачи.',
        'url' => 'URL.',
        'user' => 'ID пользователя.',
        'user_mountable' => 'Могут ли пользователи монтировать этот ресурс.',
        'username' => 'Имя пользователя.',
    ];

    private const array FIELD_TYPES = [
        'allocation_additional' => 'integer[]',
        'allocation_id' => 'integer',
        'archived' => 'boolean',
        'environment' => 'object<string,string>',
        'extends' => 'integer',
        'egg_id' => 'integer',
        'features' => 'string[]',
        'file_denylist' => 'string[]',
        'location_id' => 'integer',
        'max_connections' => 'integer',
        'server_id' => 'integer',
        'primary_allocation_id' => 'integer',
        'secondary_allocations_ids' => 'integer[]',
        'successful' => 'boolean',
    ];

    /**
     * @return array{type: string, description: string, example: int|string}|null
     */
    public static function urlParameter(string $name): ?array
    {
        if (! isset(self::URL_PARAMETERS[$name])) {
            return null;
        }

        [$type, $description, $example] = self::URL_PARAMETERS[$name];

        return ['type' => $type, 'description' => $description, 'example' => $example];
    }

    public static function fieldDescription(string $name): string
    {
        return self::FIELD_DESCRIPTIONS[$name]
            ?? 'Поле «'.str_replace(['_', '.'], ' ', $name).'».';
    }

    public static function fieldType(string $name): ?string
    {
        return self::FIELD_TYPES[$name] ?? null;
    }

    public static function fieldExample(string $name, string $type): mixed
    {
        return match (true) {
            str_starts_with($name, 'feature_limits.'), str_starts_with($name, 'limits.') => 1,
            str_starts_with($name, 'deploy.') && str_contains($name, 'locations') => [1],
            str_starts_with($name, 'deploy.') && str_contains($name, 'port_range') => ['25565-25570'],
            str_starts_with($name, 'smtp.') && str_contains($name, 'port') => 587,
            str_starts_with($name, 'smtp.') && str_contains($name, 'host') => 'smtp.example.com',
            $name === 'options' => ['user_viewable', 'user_editable'],
            str_contains($type, '[]') && $name === 'order' => [3, 1, 2],
            str_contains($type, '[]') && str_contains($name, 'location') => [1, 2],
            str_contains($type, '[]') && str_contains($name, 'port') => ['25565-25570'],
            str_contains($type, '[]') && str_contains($name, 'permission') => ['control.console', 'control.start'],
            str_contains($type, '[]') && str_contains($name, 'file') => ['/server.properties'],
            $type === 'object<string,string>' => ['SERVER_JARFILE' => 'server.jar'],
            str_contains($type, '[]') => ['example'],
            str_contains($type, 'boolean') || $type === 'bool' => true,
            str_contains($type, 'integer') || $type === 'int' => 1,
            str_contains($type, 'number') || $type === 'float' => 1.5,
            str_contains($name, 'allocation') => 1,
            str_contains($name, 'cpu') => 100,
            str_contains($name, 'disk') => 10240,
            str_contains($name, 'email') => 'admin@example.com',
            str_contains($name, 'memory') => 1024,
            str_contains($name, 'password') => 'correct horse battery staple',
            str_contains($name, 'port') => 25565,
            str_contains($name, 'uuid') => 'd3aac109-e5a0-4331-b03e-3454f7e02bbe',
            $name === 'command' => 'say Сервер будет перезапущен через 5 минут',
            $name === 'contents' => 'server-port=25565',
            $name === 'default_value' => 'server.jar',
            $name === 'description' => 'Краткое описание.',
            $name === 'directory' => '/config',
            $name === 'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
            $name === 'env_variable' => 'SERVER_JARFILE',
            $name === 'file' => '/server.properties',
            $name === 'filename' => 'server.properties',
            $name === 'fqdn' => 'node.example.com',
            $name === 'host' || $name === 'remote' => '127.0.0.1',
            $name === 'import_file' => 'egg-minecraft.json',
            $name === 'ip' => '192.0.2.10',
            $name === 'name' => 'Пример ресурса',
            $name === 'public_key' => 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKey user@example.com',
            $name === 'rules' => 'required|string|max:64',
            $name === 'signal' => 'start',
            $name === 'source' || $name === 'target' => '/server.properties',
            $name === 'startup' => 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
            $name === 'url' => 'https://example.com/server.jar',
            default => 'example',
        };
    }

    public static function methodSource(ReflectionMethod $method): string
    {
        $file = $method->getFileName();
        if ($file === false) {
            return '';
        }

        $lines = file($file);
        if ($lines === false) {
            return '';
        }

        $start = max(0, $method->getStartLine() - 1);
        $length = $method->getEndLine() - $method->getStartLine() + 1;

        return implode('', array_slice($lines, $start, $length));
    }

    /**
     * @return array<string, mixed> Фрагмент схемы OpenAPI, описывающий значение.
     */
    public static function schemaForValue(mixed $value): array
    {
        if (is_array($value)) {
            if (! array_is_list($value)) {
                $properties = [];
                foreach ($value as $key => $item) {
                    $properties[$key] = self::schemaForValue($item);
                    if ($item === null && is_string($key) && ($type = self::fieldType($key)) !== null) {
                        $properties[$key]['type'] = match ($type) {
                            'integer', 'int' => 'integer',
                            'number', 'float' => 'number',
                            'boolean', 'bool' => 'boolean',
                            default => $type,
                        };
                    }
                }

                return [
                    'type' => 'object',
                    'required' => array_keys($properties),
                    'properties' => $properties,
                ];
            }

            return [
                'type' => 'array',
                'items' => isset($value[0]) ? self::schemaForValue($value[0]) : ['type' => 'string'],
            ];
        }

        if ($value === null) {
            return [
                'type' => 'string',
                'nullable' => true,
            ];
        }

        if ($value instanceof JsonEmptyObject) {
            return [
                'type' => 'object',
                'properties' => new JsonEmptyObject,
            ];
        }

        return match (true) {
            is_bool($value) => ['type' => 'boolean', 'example' => $value],
            is_int($value) => ['type' => 'integer', 'example' => $value],
            is_float($value) => ['type' => 'number', 'example' => $value],
            default => ['type' => 'string', 'example' => $value],
        };
    }
}
