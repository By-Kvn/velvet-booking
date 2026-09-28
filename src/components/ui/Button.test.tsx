import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it("déclenche l'action au clic", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Rechercher</Button>)
    await userEvent.click(screen.getByRole('button', { name: 'Rechercher' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('bloque les clics pendant le chargement sans perdre le focus', async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Payer
      </Button>,
    )
    const button = screen.getByRole('button', { name: /payer/i })
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).not.toBeDisabled()
    expect(button).toHaveFocus()
  })
})
