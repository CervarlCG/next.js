/* eslint-env jest */

import { findPort, killApp, launchApp, renderViaHTTP } from 'next-test-utils'
import { join } from 'path'
import waitPort from 'wait-port'

const appDir = join(__dirname, '../')

let appPort
let app

describe('Handles a broken webpack plugin (precompile)', () => {
  let stderr = ''
  beforeAll(async () => {
    appPort = await findPort()
    app = await launchApp(appDir, appPort, {
      stderr: true,
      nextStart: true,
      onStderr(text) {
        stderr += text
      },
    })
    await waitPort({
      host: '127.0.0.1',
      port: appPort,
    })
  })
  afterAll(() => killApp(app))

  beforeEach(() => {
    stderr = ''
  })

  it('should render error correctly', async () => {
    const text = await renderViaHTTP(appPort, '/')
    expect(text).toContain('Internal Server Error')

    expect(stderr).toMatch('Error: oops')
  })
})
