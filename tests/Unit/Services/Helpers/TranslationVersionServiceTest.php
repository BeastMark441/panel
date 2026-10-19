<?php

declare(strict_types=1);

namespace Pterodactyl\Tests\Pest\Unit\Services\Helpers\TranslationVersionServiceTest;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Psr7\Response;
use Illuminate\Cache\ArrayStore;
use Illuminate\Cache\Repository;
use Pterodactyl\Services\Helpers\TranslationVersionService;
use Pterodactyl\Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    config()->set('app.version', '2.0.0-beta.2');
    config()->set('app.translation_version', '2.0.0-beta.2.ru.1');
});

test('recognizes the installed translation release as current', function () {
    $service = service([
        release('v2.0.0-beta.2.ru.1', '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'current' => '2.0.0-beta.2.ru.1',
            'latest' => '2.0.0-beta.2.ru.1',
            'status' => 'current',
            'release_url' => 'https://github.com/BeastMark441/panel/releases/tag/v2.0.0-beta.2.ru.1',
        ]);
});

test('reads the translation version independently of the upstream version', function () {
    config()->set('app.version', 'canary');

    $service = service([
        release('v2.0.0-beta.2.ru.1', '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'current' => '2.0.0-beta.2.ru.1',
            'status' => 'current',
        ]);
});

test('includes published prereleases and selects the highest version regardless of publication date', function () {
    $service = service([
        release('v2.0.0-beta.2.ru.9', '2026-10-22T00:00:00Z'),
        release('v2.0.0-beta.3.ru.1', '2026-10-20T00:00:00Z'),
        release('v2.0.0-beta.2.ru.1', '2026-10-19T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'latest' => '2.0.0-beta.3.ru.1',
            'status' => 'update_available',
            'release_url' => 'https://github.com/BeastMark441/panel/releases/tag/v2.0.0-beta.3.ru.1',
        ]);
});

test('ignores drafts and tags outside the supported translation version format', function () {
    $service = service([
        release('v2.0.0-beta.4.ru.1', '2026-10-22T00:00:00Z', true),
        release('latest', '2026-10-21T00:00:00Z'),
        release('v2.0.0-beta.3', '2026-10-21T00:00:00Z'),
        release('v2.0.0-beta.3.ru', '2026-10-21T00:00:00Z'),
        release('v2.0.0-beta.3.ru.0', '2026-10-21T00:00:00Z'),
        release('v2.0.0-beta.3.ru.01', '2026-10-21T00:00:00Z'),
        release('v2.0.0-beta.3.ru.1.extra', '2026-10-21T00:00:00Z'),
        release('v2.0.0-beta.2.ru.1', '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'latest' => '2.0.0-beta.2.ru.1',
            'status' => 'current',
        ]);
});

test('reports an empty release list separately from a request failure', function () {
    expect(service([])->getVersionInformation())
        ->toMatchArray([
            'latest' => null,
            'status' => 'no_releases',
        ]);
});

test('reports no translation releases when only upstream tags exist', function () {
    $service = service([
        release('v2.0.0-beta.1', '2026-10-19T00:00:00Z'),
        release('v2.0.0-beta.2', '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'latest' => null,
            'status' => 'no_releases',
        ]);
});

test('reports a GitHub request failure as unavailable', function () {
    expect(service([], 403)->getVersionInformation())
        ->toMatchArray([
            'latest' => null,
            'status' => 'unavailable',
        ]);
});

test('reports an invalid GitHub payload as unavailable', function () {
    expect(service(['message' => 'Unexpected response'])->getVersionInformation())
        ->toMatchArray([
            'latest' => null,
            'status' => 'unavailable',
        ]);
});

test('does not claim a canary translation installation is a current release', function () {
    config()->set('app.translation_version', 'canary');

    $service = service([
        release('v2.0.0-beta.2.ru.1', '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'current' => 'canary',
            'latest' => '2.0.0-beta.2.ru.1',
            'status' => 'development',
        ]);
});

test('reports an unsupported installed translation version as unavailable', function () {
    config()->set('app.translation_version', '2.0.0-beta.2');

    $service = service([
        release('v2.0.0-beta.2.ru.1', '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'current' => '2.0.0-beta.2',
            'latest' => '2.0.0-beta.2.ru.1',
            'status' => 'unavailable',
        ]);
});

test('offers a newer translation release', function (string $installed, string $available) {
    config()->set('app.translation_version', $installed);

    $service = service([
        release('v'.$available, '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'current' => $installed,
            'latest' => $available,
            'status' => 'update_available',
        ]);
})->with([
    'next beta translation revision' => [
        '2.0.0-beta.2.ru.1',
        '2.0.0-beta.2.ru.2',
    ],
    'numeric translation revision ordering' => [
        '2.0.0-beta.2.ru.2',
        '2.0.0-beta.2.ru.10',
    ],
    'next upstream beta resets translation revision' => [
        '2.0.0-beta.2.ru.10',
        '2.0.0-beta.3.ru.1',
    ],
    'alpha to beta' => [
        '2.0.0-alpha.1.ru.10',
        '2.0.0-beta.1.ru.1',
    ],
    'beta to release candidate' => [
        '2.0.0-beta.3.ru.10',
        '2.0.0-rc.1.ru.1',
    ],
    'beta to stable' => [
        '2.0.0-beta.2.ru.10',
        '2.0.0.ru.1',
    ],
    'release candidate to stable' => [
        '2.0.0-rc.1.ru.10',
        '2.0.0.ru.1',
    ],
    'stable translation revision' => [
        '2.0.0.ru.1',
        '2.0.0.ru.2',
    ],
    'numeric stable translation revision ordering' => [
        '2.0.0.ru.2',
        '2.0.0.ru.10',
    ],
    'next stable upstream version' => [
        '2.0.0.ru.99',
        '2.1.0.ru.1',
    ],
]);

test('does not offer an older release as an update', function (string $installed, string $available) {
    config()->set('app.translation_version', $installed);

    $service = service([
        release('v'.$available, '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'current' => $installed,
            'latest' => $available,
            'status' => 'current',
        ]);
})->with([
    'older translation revision' => [
        '2.0.0-beta.2.ru.2',
        '2.0.0-beta.2.ru.1',
    ],
    'beta after stable installation' => [
        '2.0.0.ru.1',
        '2.0.0-beta.2.ru.99',
    ],
    'older stable upstream version' => [
        '2.1.0.ru.1',
        '2.0.0.ru.99',
    ],
]);

test('selects the highest numeric revision within the same upstream version', function () {
    config()->set('app.translation_version', '2.0.0.ru.1');

    $service = service([
        release('v2.0.0.ru.2', '2026-10-22T00:00:00Z'),
        release('v2.0.0.ru.10', '2026-10-20T00:00:00Z'),
        release('v2.0.0.ru.1', '2026-10-19T00:00:00Z'),
    ]);

    expect($service->getVersionInformation())
        ->toMatchArray([
            'latest' => '2.0.0.ru.10',
            'status' => 'update_available',
        ]);
});

test('recognizes an installed version with a leading v', function () {
    config()->set('app.translation_version', 'v2.0.0.ru.1');

    $service = service([
        release('v2.0.0.ru.1', '2026-10-20T00:00:00Z'),
    ]);

    expect($service->getVersionInformation()['status'])->toBe('current');
});

test('reuses the cached response without a second HTTP request', function () {
    $service = service([
        release('v2.0.0-beta.2.ru.1', '2026-10-20T00:00:00Z'),
    ]);

    $first = $service->getVersionInformation();
    $second = $service->getVersionInformation();

    expect($first['status'])->toBe('current');
    expect($second)->toBe($first);
});

/**
 * @return array{
 *     tag_name: string,
 *     published_at: string,
 *     draft: bool,
 *     prerelease: bool
 * }
 */
function release(string $tag, string $publishedAt, bool $draft = false): array
{
    return [
        'tag_name' => $tag,
        'published_at' => $publishedAt,
        'draft' => $draft,
        'prerelease' => preg_match('/-(?:alpha|beta|rc)\.\d+/', $tag) === 1,
    ];
}

/** @param array<array-key, mixed> $payload */
function service(array $payload, int $status = 200): TranslationVersionService
{
    $cache = new Repository(new ArrayStore);
    $client = new Client([
        'handler' => HandlerStack::create(new MockHandler([
            new Response($status, body: json_encode($payload, JSON_THROW_ON_ERROR)),
        ])),
    ]);

    return new TranslationVersionService($cache, $client);
}
