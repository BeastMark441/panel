/** @vitest-environment jsdom */
import { afterAll, afterEach, beforeAll, expect, it, vi } from 'vitest';
import { initializeActivityTranslations } from '@/test-utils/activityI18n';
import { act } from '@testing-library/react';
import http from '@/api/http';
import { renderView, type RenderedView } from '@/sdk/testing';
import { getViewChain, getViewDefinitions, type ViewName } from './registry';

// Root className checks do not need to initialize Canvas or the WASM terminal.
vi.mock('@/components/server/console/useTerminal', async () => {
    const { TerminalScrollStore } = await import('@/components/server/console/TerminalScrollStore');
    const state = {
        ref: vi.fn(),
        retry: vi.fn(),
        scroll: new TerminalScrollStore(),
        terminal: { current: null },
        terminalError: null,
        terminalReady: true,
    };

    return { useTerminal: () => state };
});

const requests: string[] = [];
const adapter = http.defaults.adapter;
let rendered: RenderedView | undefined;

beforeAll(async () => {
    await initializeActivityTranslations();
    http.defaults.adapter = async (config) => {
        requests.push(config.url ?? '');

        throw new Error(`A fixture requested ${config.url}.`);
    };
});

afterEach(async () => {
    await act(async () => {
        rendered?.unmount();
    });
    rendered = undefined;
    requests.length = 0;
});

afterAll(() => {
    http.defaults.adapter = adapter;
});

// Every fixture of every view classic draws.
const cases = getViewDefinitions().flatMap((definition) =>
    getViewChain(definition.name).some((layer) => layer.source === 'classic')
        ? Object.keys(definition.fixtures ?? {}).map((fixture) => [definition.name, fixture] as const)
        : []
);

it.each(cases)('%s (%s) renders without a backend, its className on its outermost element', async (name, fixture) => {
    await act(async () => {
        rendered = renderView(name as ViewName, { fixture, className: 'probe-root' });

        // Let effect-started work settle before checking the rendered view.
        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    if (!rendered) {
        throw new Error('The fixture did not produce a rendered view.');
    }

    const root = rendered.container.firstElementChild;

    // A view may render nothing in the page itself, such as a dialog.
    if (root) {
        expect(root.classList.contains('probe-root'), root.outerHTML.slice(0, 160)).toBe(true);
    }

    expect(requests).toEqual([]);
});
