import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CheckoutForm from '@/components/CheckoutForm'

const confirmCardPaymentMock = jest.fn()

jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: jest.fn(() => ({
    confirmCardPayment: confirmCardPaymentMock,
  })),
  useElements: jest.fn(() => ({
    getElement: jest.fn(() => ({})),
  })),
  CardElement: jest.fn(() => <div data-testid="card-element" />),
}))

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      _id: 'user-id',
      name: { first: 'Test', last: 'User' },
      email: 'test@example.com',
    },
  }),
}))

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

describe('CheckoutForm', () => {
  beforeEach(() => {
    confirmCardPaymentMock.mockReset()
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: 'cs_test_secret' }),
    } as Response)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('affiche le montant formaté en euros', () => {
    render(<CheckoutForm amount={123.45} orderId='order-1' onSuccess={jest.fn()} />)

    const [displayedAmount] = screen.getAllByText((content) =>
      content.replace(/\s/g, '').includes('123,45€')
    )

    expect(displayedAmount).toBeInTheDocument()
    expect(screen.getByTestId('card-element')).toBeInTheDocument()
  })

  it('soumet le formulaire et appelle Stripe', async () => {
    confirmCardPaymentMock.mockResolvedValue({
      error: null,
      paymentIntent: { status: 'succeeded' },
    })

    const onSuccess = jest.fn()

    render(<CheckoutForm amount={50} orderId='order-2' onSuccess={onSuccess} />)

    const submitButton = screen.getByRole('button', { name: /payer/i })

    fireEvent.submit(submitButton.closest('form')!)

    await waitFor(() => {
      expect(confirmCardPaymentMock).toHaveBeenCalledWith('cs_test_secret', expect.any(Object))
    })

    expect(onSuccess).toHaveBeenCalled()
  })
})

