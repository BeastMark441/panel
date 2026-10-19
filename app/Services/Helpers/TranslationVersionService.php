<?php

declare(strict_types=1);

namespace Pterodactyl\Services\Helpers;

use Exception;
use GuzzleHttp\Client;
use Illuminate\Contracts\Cache\Repository as CacheRepository;
use UnexpectedValueException;

class TranslationVersionService
{
    private const string RELEASES_URL = 'https://api.github.com/repos/BeastMark441/panel/releases';

    private const string RELEASES_PAGE = 'https://github.com/BeastMark441/panel/releases';

    private const string CACHE_KEY = 'pterodactyl:translation_releases:v2';

    private const string VERSION_PATTERN = '/^v?(\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)\.\d+)?)\.ru\.([1-9]\d*)$/D';

    public function __construct(
        protected CacheRepository $cache,
        protected Client $client,
    ) {}

    /**
     * @return array{
     *     current: string,
     *     latest: string|null,
     *     status: string,
     *     release_url: string
     * }
     */
    public function getVersionInformation(): array
    {
        $current = config()->string('app.translation_version');
        $release = $this->getLatestRelease();

        $result = [
            'current' => $current,
            'latest' => $release['version'] ?? null,
            'status' => 'unavailable',
            'release_url' => $release['url'] ?? self::RELEASES_PAGE,
        ];

        if ($release['state'] === 'error') {
            return $result;
        }

        if ($release['state'] === 'empty') {
            $result['status'] = 'no_releases';

            return $result;
        }

        if ($current === 'canary') {
            $result['status'] = 'development';

            return $result;
        }

        $comparison = $this->compareReleaseVersions($current, $release['version']);

        if ($comparison === null) {
            return $result;
        }

        $result['status'] = $comparison >= 0 ? 'current' : 'update_available';

        return $result;
    }

    /**
     * Compare the upstream version first, then the translation revision.
     */
    private function compareReleaseVersions(string $left, string $right): ?int
    {
        if (
            preg_match(self::VERSION_PATTERN, $left, $leftParts) !== 1
            || preg_match(self::VERSION_PATTERN, $right, $rightParts) !== 1
        ) {
            return null;
        }

        $upstreamComparison = version_compare($leftParts[1], $rightParts[1]);

        if ($upstreamComparison !== 0) {
            return $upstreamComparison;
        }

        $lengthComparison = mb_strlen($leftParts[2]) <=> mb_strlen($rightParts[2]);

        return $lengthComparison !== 0
            ? $lengthComparison
            : strcmp($leftParts[2], $rightParts[2]);
    }

    /**
     * @return array{state: 'ok', version: string, url: string}|array{state: 'empty'|'error'}
     */
    private function getLatestRelease(): array
    {
        return $this->cache->remember(
            self::CACHE_KEY,
            now()->addMinutes(60),
            function (): array {
                try {
                    $releases = [];
                    $page = 1;

                    do {
                        $response = $this->client->request('GET', self::RELEASES_URL, [
                            'headers' => [
                                'Accept' => 'application/vnd.github+json',
                                'User-Agent' => 'Pterodactyl-Translation-Version-Check',
                            ],
                            'query' => [
                                'per_page' => 100,
                                'page' => $page,
                            ],
                            'timeout' => 5,
                            'connect_timeout' => 2,
                        ]);

                        $items = json_decode(
                            (string) $response->getBody(),
                            true,
                            flags: JSON_THROW_ON_ERROR
                        );

                        throw_if(! is_array($items) || ! array_is_list($items), UnexpectedValueException::class, 'Invalid GitHub releases response.');

                        foreach ($items as $item) {
                            if (! is_array($item) || ($item['draft'] ?? true) !== false) {
                                continue;
                            }

                            $tag = $item['tag_name'] ?? null;
                            $publishedAt = $item['published_at'] ?? null;

                            if (! is_string($tag) || ! is_string($publishedAt)) {
                                continue;
                            }

                            if (! preg_match(
                                self::VERSION_PATTERN,
                                $tag,
                                $matches
                            )) {
                                continue;
                            }

                            $releases[] = [
                                'version' => $matches[1].'.ru.'.$matches[2],
                                'published_at' => $publishedAt,
                                'url' => self::RELEASES_PAGE.'/tag/'.rawurlencode($tag),
                            ];
                        }

                        $page++;
                    } while (count($items) === 100 && $page <= 10);

                    throw_if(count($items) === 100 && $page > 10, UnexpectedValueException::class, 'GitHub releases pagination limit reached.');

                    if ($releases === []) {
                        return ['state' => 'empty'];
                    }

                    usort(
                        $releases,
                        fn (array $left, array $right): int => $this->compareReleaseVersions(
                            $right['version'],
                            $left['version']
                        ) ?? 0
                    );

                    return [
                        'state' => 'ok',
                        'version' => $releases[0]['version'],
                        'url' => $releases[0]['url'],
                    ];
                } catch (Exception) {
                    return ['state' => 'error'];
                }
            }
        );
    }
}
