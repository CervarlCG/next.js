import React from 'react'
import type { fetchServerResponse } from '../fetch-server-response'
import type { FlightData } from '../../../../server/app-render/types'
jest.mock('../fetch-server-response', () => {
  const flightData: FlightData = [
    [
      [
        '',
        {
          children: [
            'linking',
            {
              children: ['', {}],
            },
          ],
        },
        null,
        null,
        true,
      ],
      <html>
        <head></head>
        <body>
          <h1>Linking Page!</h1>
        </body>
      </html>,
      <>
        <title>Linking page!</title>
      </>,
    ],
  ]
  return {
    fetchServerResponse: (url: URL): ReturnType<typeof fetchServerResponse> => {
      if (url.pathname === '/linking') {
        return Promise.resolve([flightData, undefined])
      }

      throw new Error('unknown url in mock')
    },
  }
})
import { FlightRouterState } from '../../../../server/app-render/types'
import {
  CacheNode,
  CacheStates,
} from '../../../../shared/lib/app-router-context'
import { createInitialRouterState } from '../create-initial-router-state'
import { RefreshAction, ACTION_REFRESH } from '../router-reducer-types'
import { refreshReducer } from './refresh-reducer'

const getInitialRouterStateTree = (): FlightRouterState => [
  '',
  {
    children: [
      'linking',
      {
        children: ['', {}],
      },
    ],
  },
  undefined,
  undefined,
  true,
]

async function runPromiseThrowChain(fn: any): Promise<any> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof Promise) {
      await err
      return await runPromiseThrowChain(fn)
    }

    throw err
  }
}

describe('refreshReducer', () => {
  it('should apply refresh', async () => {
    const initialTree = getInitialRouterStateTree()
    const initialCanonicalUrl = '/linking'
    const children = (
      <html>
        <head></head>
        <body>Root layout</body>
      </html>
    )
    const initialParallelRoutes: CacheNode['parallelRoutes'] = new Map([
      [
        'children',
        new Map([
          [
            'linking',
            {
              status: CacheStates.READY,
              parallelRoutes: new Map([
                [
                  'children',
                  new Map([
                    [
                      '',
                      {
                        status: CacheStates.READY,
                        data: null,
                        subTreeData: <>Linking page</>,
                        parallelRoutes: new Map(),
                      },
                    ],
                  ]),
                ],
              ]),
              data: null,
              subTreeData: <>Linking layout level</>,
            },
          ],
        ]),
      ],
    ])

    const state = createInitialRouterState({
      initialTree,
      initialHead: null,
      initialCanonicalUrl,
      children,
      initialParallelRoutes,
      isServer: false,
      location: new URL('/linking', 'https://127.0.0.1') as any,
    })
    const action: RefreshAction = {
      type: ACTION_REFRESH,
      cache: {
        status: CacheStates.LAZY_INITIALIZED,
        data: null,
        subTreeData: null,
        parallelRoutes: new Map(),
      },
      mutable: {},
      origin: new URL('/linking', 'https://127.0.0.1').origin,
    }

    const newState = await runPromiseThrowChain(() =>
      refreshReducer(state, action)
    )

    const expectedState: ReturnType<typeof refreshReducer> = {
      prefetchCache: new Map(),
      pushRef: {
        mpaNavigation: false,
        pendingPush: false,
      },
      focusAndScrollRef: {
        apply: false,
        hashFragment: null,
        segmentPaths: [],
      },
      canonicalUrl: '/linking',
      nextUrl: '/linking',
      cache: {
        status: CacheStates.READY,
        data: null,
        subTreeData: (
          <html>
            <head></head>
            <body>
              <h1>Linking Page!</h1>
            </body>
          </html>
        ),
        parallelRoutes: new Map([
          [
            'children',
            new Map([
              [
                'linking',
                {
                  status: CacheStates.LAZY_INITIALIZED,
                  parallelRoutes: new Map([
                    [
                      'children',
                      new Map([
                        [
                          '',
                          {
                            status: CacheStates.LAZY_INITIALIZED,
                            data: null,
                            subTreeData: null,
                            parallelRoutes: new Map(),
                            head: (
                              <>
                                <title>Linking page!</title>
                              </>
                            ),
                          },
                        ],
                      ]),
                    ],
                  ]),
                  data: null,
                  subTreeData: null,
                },
              ],
            ]),
          ],
        ]),
      },
      tree: [
        '',
        {
          children: [
            'linking',
            {
              children: ['', {}],
            },
          ],
        },
        undefined,
        undefined,
        true,
      ],
    }

    expect(newState).toMatchObject(expectedState)
  })

  it('should apply refresh (concurrent)', async () => {
    const initialTree = getInitialRouterStateTree()
    const initialCanonicalUrl = '/linking'
    const children = (
      <html>
        <head></head>
        <body>Root layout</body>
      </html>
    )
    const initialParallelRoutes: CacheNode['parallelRoutes'] = new Map([
      [
        'children',
        new Map([
          [
            'linking',
            {
              status: CacheStates.READY,
              parallelRoutes: new Map([
                [
                  'children',
                  new Map([
                    [
                      '',
                      {
                        status: CacheStates.READY,
                        data: null,
                        subTreeData: <>Linking page</>,
                        parallelRoutes: new Map(),
                      },
                    ],
                  ]),
                ],
              ]),
              data: null,
              subTreeData: <>Linking layout level</>,
            },
          ],
        ]),
      ],
    ])

    const state = createInitialRouterState({
      initialTree,
      initialHead: null,
      initialCanonicalUrl,
      children,
      initialParallelRoutes,
      isServer: false,
      location: new URL('/linking', 'https://127.0.0.1') as any,
    })

    const state2 = createInitialRouterState({
      initialTree,
      initialHead: null,
      initialCanonicalUrl,
      children,
      initialParallelRoutes,
      isServer: false,
      location: new URL('/linking', 'https://127.0.0.1') as any,
    })

    const action: RefreshAction = {
      type: ACTION_REFRESH,
      cache: {
        status: CacheStates.LAZY_INITIALIZED,
        data: null,
        subTreeData: null,
        parallelRoutes: new Map(),
      },
      mutable: {},
      origin: new URL('/linking', 'https://127.0.0.1').origin,
    }

    await runPromiseThrowChain(() => refreshReducer(state, action))

    const newState = await runPromiseThrowChain(() =>
      refreshReducer(state2, action)
    )

    const expectedState: ReturnType<typeof refreshReducer> = {
      prefetchCache: new Map(),
      pushRef: {
        mpaNavigation: false,
        pendingPush: false,
      },
      focusAndScrollRef: {
        apply: false,
        hashFragment: null,
        segmentPaths: [],
      },
      canonicalUrl: '/linking',
      nextUrl: '/linking',
      cache: {
        status: CacheStates.READY,
        data: null,
        subTreeData: (
          <html>
            <head></head>
            <body>
              <h1>Linking Page!</h1>
            </body>
          </html>
        ),
        parallelRoutes: new Map([
          [
            'children',
            new Map([
              [
                'linking',
                {
                  status: CacheStates.LAZY_INITIALIZED,
                  parallelRoutes: new Map([
                    [
                      'children',
                      new Map([
                        [
                          '',
                          {
                            status: CacheStates.LAZY_INITIALIZED,
                            data: null,
                            subTreeData: null,
                            parallelRoutes: new Map(),
                            head: (
                              <>
                                <title>Linking page!</title>
                              </>
                            ),
                          },
                        ],
                      ]),
                    ],
                  ]),
                  data: null,
                  subTreeData: null,
                },
              ],
            ]),
          ],
        ]),
      },
      tree: [
        '',
        {
          children: [
            'linking',
            {
              children: ['', {}],
            },
          ],
        },
        undefined,
        undefined,
        true,
      ],
    }

    expect(newState).toMatchObject(expectedState)
  })

  it('should invalidate all segments (concurrent)', async () => {
    const initialTree = getInitialRouterStateTree()
    const initialCanonicalUrl = '/linking'
    const children = (
      <html>
        <head></head>
        <body>Root layout</body>
      </html>
    )
    const initialParallelRoutes: CacheNode['parallelRoutes'] = new Map([
      [
        'children',
        new Map([
          [
            'linking',
            {
              status: CacheStates.READY,
              parallelRoutes: new Map([
                [
                  'children',
                  new Map([
                    [
                      '',
                      {
                        status: CacheStates.READY,
                        data: null,
                        subTreeData: <>Linking page</>,
                        parallelRoutes: new Map(),
                      },
                    ],
                  ]),
                ],
              ]),
              data: null,
              subTreeData: <>Linking layout level</>,
            },
          ],
          [
            'about',
            {
              status: CacheStates.READY,
              parallelRoutes: new Map([
                [
                  'children',
                  new Map([
                    [
                      '',
                      {
                        status: CacheStates.READY,
                        data: null,
                        subTreeData: <>About page</>,
                        parallelRoutes: new Map(),
                      },
                    ],
                  ]),
                ],
              ]),
              data: null,
              subTreeData: <>About layout level</>,
            },
          ],
        ]),
      ],
    ])

    const state = createInitialRouterState({
      initialTree,
      initialHead: null,
      initialCanonicalUrl,
      children,
      initialParallelRoutes,
      isServer: false,
      location: new URL('/linking', 'https://127.0.0.1') as any,
    })

    const state2 = createInitialRouterState({
      initialTree,
      initialHead: null,
      initialCanonicalUrl,
      children,
      initialParallelRoutes,
      isServer: false,
      location: new URL('/linking', 'https://127.0.0.1') as any,
    })

    const action: RefreshAction = {
      type: ACTION_REFRESH,
      cache: {
        status: CacheStates.LAZY_INITIALIZED,
        data: null,
        subTreeData: null,
        parallelRoutes: new Map(),
      },
      mutable: {},
      origin: new URL('/linking', 'https://127.0.0.1').origin,
    }

    await runPromiseThrowChain(() => refreshReducer(state, action))

    const newState = await runPromiseThrowChain(() =>
      refreshReducer(state2, action)
    )

    const expectedState: ReturnType<typeof refreshReducer> = {
      prefetchCache: new Map(),
      pushRef: {
        mpaNavigation: false,
        pendingPush: false,
      },
      focusAndScrollRef: {
        apply: false,
        hashFragment: null,
        segmentPaths: [],
      },
      canonicalUrl: '/linking',
      nextUrl: '/linking',
      cache: {
        status: CacheStates.READY,
        data: null,
        subTreeData: (
          <html>
            <head></head>
            <body>
              <h1>Linking Page!</h1>
            </body>
          </html>
        ),
        parallelRoutes: new Map([
          [
            'children',
            new Map([
              [
                'linking',
                {
                  status: CacheStates.LAZY_INITIALIZED,
                  parallelRoutes: new Map([
                    [
                      'children',
                      new Map([
                        [
                          '',
                          {
                            status: CacheStates.LAZY_INITIALIZED,
                            data: null,
                            subTreeData: null,
                            parallelRoutes: new Map(),
                            head: (
                              <>
                                <title>Linking page!</title>
                              </>
                            ),
                          },
                        ],
                      ]),
                    ],
                  ]),
                  data: null,
                  subTreeData: null,
                },
              ],
            ]),
          ],
        ]),
      },
      tree: [
        '',
        {
          children: [
            'linking',
            {
              children: ['', {}],
            },
          ],
        },
        undefined,
        undefined,
        true,
      ],
    }

    expect(newState).toMatchObject(expectedState)
  })

  it('should invalidate prefetchCache (concurrent)', async () => {
    const initialTree = getInitialRouterStateTree()
    const initialCanonicalUrl = '/linking'
    const children = (
      <html>
        <head></head>
        <body>Root layout</body>
      </html>
    )
    const initialParallelRoutes: CacheNode['parallelRoutes'] = new Map([
      [
        'children',
        new Map([
          [
            'linking',
            {
              status: CacheStates.READY,
              parallelRoutes: new Map([
                [
                  'children',
                  new Map([
                    [
                      '',
                      {
                        status: CacheStates.READY,
                        data: null,
                        subTreeData: <>Linking page</>,
                        parallelRoutes: new Map(),
                      },
                    ],
                  ]),
                ],
              ]),
              data: null,
              subTreeData: <>Linking layout level</>,
            },
          ],
          [
            'about',
            {
              status: CacheStates.READY,
              parallelRoutes: new Map([
                [
                  'children',
                  new Map([
                    [
                      '',
                      {
                        status: CacheStates.READY,
                        data: null,
                        subTreeData: <>About page</>,
                        parallelRoutes: new Map(),
                      },
                    ],
                  ]),
                ],
              ]),
              data: null,
              subTreeData: <>About layout level</>,
            },
          ],
        ]),
      ],
    ])

    const prefetchItem = {
      canonicalUrlOverride: undefined,
      flightData: [
        [
          '',
          {
            children: [
              'linking',
              {
                children: [
                  'about',
                  {
                    children: ['', {}],
                  },
                ],
              },
            ],
          },
          undefined,
          undefined,
          true,
        ],
        <>About</>,
        <>Head</>,
      ],
      tree: [
        '',
        {
          children: [
            'linking',
            {
              children: [
                'about',
                {
                  children: ['', {}],
                },
              ],
            },
          ],
        },
        undefined,
        undefined,
        true,
      ],
    }

    const state = createInitialRouterState({
      initialTree,
      initialHead: null,
      initialCanonicalUrl,
      children,
      initialParallelRoutes,
      isServer: false,
      location: new URL('/linking', 'https://127.0.0.1') as any,
    })

    state.prefetchCache.set('/linking/about', prefetchItem)

    const state2 = createInitialRouterState({
      initialTree,
      initialHead: null,
      initialCanonicalUrl,
      children,
      initialParallelRoutes,
      isServer: false,
      location: new URL('/linking', 'https://127.0.0.1') as any,
    })
    state2.prefetchCache.set('/linking/about', prefetchItem)

    const action: RefreshAction = {
      type: ACTION_REFRESH,
      cache: {
        status: CacheStates.LAZY_INITIALIZED,
        data: null,
        subTreeData: null,
        parallelRoutes: new Map(),
      },
      mutable: {},
      origin: new URL('/linking', 'https://127.0.0.1').origin,
    }

    await runPromiseThrowChain(() => refreshReducer(state, action))

    const newState = await runPromiseThrowChain(() =>
      refreshReducer(state2, action)
    )

    const expectedState: ReturnType<typeof refreshReducer> = {
      prefetchCache: new Map(),
      pushRef: {
        mpaNavigation: false,
        pendingPush: false,
      },
      focusAndScrollRef: {
        apply: false,
        hashFragment: null,
        segmentPaths: [],
      },
      canonicalUrl: '/linking',
      nextUrl: '/linking',
      cache: {
        status: CacheStates.READY,
        data: null,
        subTreeData: (
          <html>
            <head></head>
            <body>
              <h1>Linking Page!</h1>
            </body>
          </html>
        ),
        parallelRoutes: new Map([
          [
            'children',
            new Map([
              [
                'linking',
                {
                  status: CacheStates.LAZY_INITIALIZED,
                  parallelRoutes: new Map([
                    [
                      'children',
                      new Map([
                        [
                          '',
                          {
                            status: CacheStates.LAZY_INITIALIZED,
                            data: null,
                            subTreeData: null,
                            parallelRoutes: new Map(),
                            head: (
                              <>
                                <title>Linking page!</title>
                              </>
                            ),
                          },
                        ],
                      ]),
                    ],
                  ]),
                  data: null,
                  subTreeData: null,
                },
              ],
            ]),
          ],
        ]),
      },
      tree: [
        '',
        {
          children: [
            'linking',
            {
              children: ['', {}],
            },
          ],
        },
        undefined,
        undefined,
        true,
      ],
    }

    expect(newState).toMatchObject(expectedState)
  })
})
