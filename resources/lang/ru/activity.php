<?php

declare(strict_types=1);

/**
 * Строки перевода событий журнала активности.
 *
 * События группируются по части имени перед двоеточием (:).
 * События без двоеточия располагаются на верхнем уровне.
 */
return [
    'auth' => [
        'fail' => 'Неудачная попытка входа',
        'success' => 'Выполнен вход',
        'password-reset' => 'Пароль сброшен',
        'reset-password' => 'Запрошен сброс пароля',
        'checkpoint' => 'Запрошена двухфакторная аутентификация',
        'recovery-token' => 'Использован резервный код двухфакторной аутентификации',
        'token' => 'Пройдена двухфакторная аутентификация',
        'ip-blocked' => 'Заблокирован запрос для :identifier с IP-адреса, отсутствующего в списке разрешённых',
        'sftp' => [
            'fail' => 'Неудачная попытка входа по SFTP',
        ],
    ],

    'user' => [
        'user' => [
            'create' => 'Создан пользователь :email',
        ],
        'account' => [
            'email-changed' => 'Адрес электронной почты изменён с :old на :new',
            'password-changed' => 'Пароль изменён',
        ],
        'api-key' => [
            'create' => 'Создан API-ключ :identifier',
            'delete' => 'Удалён API-ключ :identifier',
        ],
        'ssh-key' => [
            'create' => 'В учётную запись добавлен SSH-ключ :fingerprint',
            'delete' => 'Из учётной записи удалён SSH-ключ :fingerprint',
        ],
        'two-factor' => [
            'create' => 'Двухфакторная аутентификация включена',
            'delete' => 'Двухфакторная аутентификация отключена',
        ],
    ],

    'server' => [
        'reinstall' => 'Сервер переустановлен',
        'console' => [
            'command' => 'На сервере выполнена команда «:command»',
        ],
        'power' => [
            'start' => 'Сервер запущен',
            'stop' => 'Сервер остановлен',
            'restart' => 'Сервер перезапущен',
            'kill' => 'Процесс сервера принудительно завершён',
        ],
        'backup' => [
            'download' => 'Скачана резервная копия «:name»',
            'delete' => 'Удалена резервная копия «:name»',
            'restore' => 'Выполнено восстановление из резервной копии «:name» (удаление файлов: :truncate)',
            'restore-complete' => 'Восстановление из резервной копии «:name» завершено',
            'restore-failed' => 'Не удалось завершить восстановление из резервной копии «:name»',
            'start' => 'Начато создание резервной копии «:name»',
            'complete' => 'Резервная копия «:name» отмечена как успешно созданная',
            'fail' => 'Резервная копия «:name» отмечена как неудачная',
            'lock' => 'Резервная копия «:name» заблокирована',
            'unlock' => 'Резервная копия «:name» разблокирована',
        ],
        'database' => [
            'create' => 'Создана база данных «:name»',
            'rotate-password' => 'Пароль базы данных «:name» изменён',
            'delete' => 'Удалена база данных «:name»',
        ],
        'file' => [
            'compress_one' => 'Заархивирован файл :directory:files.0',
            'compress_other' => 'Заархивированы файлы в :directory — :count шт.',
            'chmod_one' => 'Права доступа к :directory:files.0.file изменены на :files.0.mode',
            'chmod_other' => 'Изменены права доступа к файлам в :directory — :count шт.',
            'read' => 'Просмотрено содержимое файла :file',
            'copy' => 'Создана копия файла :file',
            'create-directory' => 'Создан каталог :directory:name',
            'decompress' => 'Распаковано :files в :directory',
            'delete_one' => 'Удалён файл :directory:files.0',
            'delete_other' => 'Удалены файлы в :directory — :count шт.',
            'download' => 'Скачан файл :file',
            'pull' => 'Скачан удалённый файл с :url в :directory',
            'rename_one' => 'Файл :directory:files.0.from переименован в :directory:files.0.to',
            'rename_other' => 'Переименованы файлы в :directory — :count шт.',
            'write' => 'В файл :file записано новое содержимое',
            'upload' => 'Начата загрузка файла',
            'uploaded' => 'Загружен файл :directory:file',
        ],
        'sftp' => [
            'denied' => 'Доступ по SFTP заблокирован из-за недостаточных прав',
            'create_one' => 'Создан файл :files.0',
            'create_other' => 'Созданы новые файлы — :count шт.',
            'write_one' => 'Изменено содержимое файла :files.0',
            'write_other' => 'Изменено содержимое файлов — :count шт.',
            'delete_one' => 'Удалён файл :files.0',
            'delete_other' => 'Удалены файлы — :count шт.',
            'create-directory_one' => 'Создан каталог :files.0',
            'create-directory_other' => 'Созданы каталоги — :count шт.',
            'rename_one' => 'Файл :files.0.from переименован в :files.0.to',
            'rename_other' => 'Переименованы или перемещены файлы — :count шт.',
        ],
        'allocation' => [
            'create' => 'Серверу добавлен сетевой адрес :allocation',
            'notes' => 'Примечание для :allocation изменено с «:old» на «:new»',
            'primary' => ':allocation назначен основным сетевым адресом сервера',
            'delete' => 'Удалён сетевой адрес :allocation',
        ],
        'schedule' => [
            'create' => 'Создано расписание «:name»',
            'update' => 'Обновлено расписание «:name»',
            'execute' => 'Вручную запущено расписание «:name»',
            'delete' => 'Удалено расписание «:name»',
        ],
        'task' => [
            'create' => 'В расписании «:name» создана задача «:action»',
            'update' => 'В расписании «:name» обновлена задача «:action»',
            'delete' => 'Удалена задача из расписания «:name»',
        ],
        'settings' => [
            'rename' => 'Сервер переименован с «:old» на «:new»',
            'description' => 'Описание сервера изменено с «:old» на «:new»',
        ],
        'startup' => [
            'edit' => 'Значение переменной :variable изменено с «:old» на «:new»',
            'image' => 'Docker-образ сервера изменён с :old на :new',
        ],
        'subuser' => [
            'create' => ':email добавлен как дополнительный пользователь',
            'update' => 'Обновлены права дополнительного пользователя :email',
            'delete' => ':email удалён из дополнительных пользователей',
        ],
    ],

    'admin' => [
        'api-key' => [
            'create' => 'Создан API-ключ приложения :identifier',
            'update' => 'Обновлён API-ключ приложения :identifier',
            'delete' => 'Удалён API-ключ приложения :identifier',
        ],
        'database-host' => [
            'create' => 'Создан хост баз данных «:name»',
            'update' => 'Обновлён хост баз данных «:name»',
            'delete' => 'Удалён хост баз данных «:name»',
        ],
        'egg' => [
            'create' => 'Создан шаблон Egg «:name»',
            'update' => 'Обновлён шаблон Egg «:name»',
            'delete' => 'Удалён шаблон Egg «:name»',
            'import' => 'Импортирован шаблон Egg «:name»',
            'update-import' => 'Шаблон Egg «:name» обновлён из импортированных данных',
            'scripts' => 'Обновлён скрипт установки шаблона Egg «:name»',
            'tags' => 'Обновлены теги шаблона Egg',
            'tags_one' => 'Для шаблона Egg установлен тег :tags.0',
            'tags_other' => 'Для шаблона Egg установлены теги — :count шт.',
        ],
        'egg-variable' => [
            'create' => 'Создана переменная шаблона Egg «:name»',
            'update' => 'Обновлена переменная шаблона Egg «:name»',
            'delete' => 'Удалена переменная шаблона Egg «:name»',
            'reorder' => 'Изменён порядок переменных шаблона Egg',
        ],
        'location' => [
            'create' => 'Создана локация «:short»',
            'update' => 'Обновлена локация «:short»',
            'delete' => 'Удалена локация «:short»',
        ],
        'mount' => [
            'create' => 'Создана точка монтирования «:name»',
            'update' => 'Обновлена точка монтирования «:name»',
            'delete' => 'Удалена точка монтирования «:name»',
            'attach-egg' => 'Точка монтирования привязана к шаблонам Egg: :eggs',
            'attach-egg_one' => 'К точке монтирования привязан шаблон Egg',
            'attach-egg_other' => 'К точке монтирования привязаны шаблоны Egg — :count шт.',
            'detach-egg' => 'Точка монтирования отвязана от шаблона Egg :egg',
            'attach-node' => 'Точка монтирования привязана к нодам: :nodes',
            'attach-node_one' => 'К точке монтирования привязана нода',
            'attach-node_other' => 'К точке монтирования привязаны ноды — :count шт.',
            'detach-node' => 'Точка монтирования отвязана от ноды :node',
        ],
        'node' => [
            'create' => 'Создана нода «:name»',
            'update' => 'Обновлена нода «:name»',
            'delete' => 'Удалена нода «:name»',
            'deploy-token' => 'Создан токен развёртывания для ноды «:name»',
            'tags' => 'Обновлены теги шаблонов Egg для ноды',
            'tags_one' => 'Для ноды установлен тег :tags.0',
            'tags_other' => 'Для ноды установлены теги — :count шт.',
            'deployment-tags' => 'Обновлены теги развёртывания ноды',
            'deployment-tags_one' => 'Для ноды установлен тег развёртывания :tags.0',
            'deployment-tags_other' => 'Для ноды установлены теги развёртывания — :count шт.',
        ],
        'node-allocation' => [
            'create' => 'На ноду добавлены порты (:ports_count) для адресов (:address_count)',
            'alias' => 'Для сетевого адреса установлен псевдоним :alias',
            'delete' => 'Удалён порт :port на адресе :address',
            'delete-block' => 'Удалены неназначенные сетевые адреса на :address',
        ],
        'server' => [
            'create' => 'Создан сервер «:name»',
            'delete' => 'Удалён сервер «:name»',
            'details' => 'Обновлены сведения о сервере «:name»',
            'build' => 'Обновлена конфигурация ресурсов сервера «:name»',
            'startup' => 'Обновлена конфигурация запуска сервера «:name»',
            'reinstall' => 'Сервер «:name» переустановлен',
            'rebuild' => 'Запущено пересоздание сервера «:name»',
            'suspend' => 'Сервер «:name» заблокирован',
            'unsuspend' => 'Сервер «:name» разблокирован',
            'toggle-install' => 'Переключён статус установки сервера «:name»',
            'transfer' => 'Начат перенос сервера «:name» на ноду :node_id',
            'mount' => 'К серверу добавлена точка монтирования «:name»',
            'unmount' => 'С сервера удалена точка монтирования «:name»',
        ],
        'server-backup' => [
            'toggle-lock' => 'Переключена блокировка резервной копии «:name»',
        ],
        'server-database' => [
            'create' => 'Создана база данных «:name»',
            'delete' => 'Удалена база данных «:name»',
            'rotate-password' => 'Пароль базы данных «:name» изменён',
        ],
        'tag' => [
            'create' => 'Создан тег «:slug»',
            'update' => 'Обновлён тег «:slug»',
            'delete' => 'Удалён тег «:slug»',
        ],
        'user' => [
            'create' => 'Создан пользователь :email',
            'update' => 'Обновлён пользователь :email',
            'delete' => 'Удалён пользователь :email',
            'disable-2fa' => 'Для пользователя :email отключена двухфакторная аутентификация',
        ],
    ],
];
