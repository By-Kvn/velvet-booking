import '@testing-library/jest-dom/vitest'
import { onlineManager } from '@tanstack/react-query'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from '../mocks/node'
import { setScenario } from '../mocks/scenario'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => {
  server.resetHandlers()
  setScenario('default')
  localStorage.clear()
  onlineManager.setOnline(true)
  cleanup()
})
afterAll(() => server.close())
