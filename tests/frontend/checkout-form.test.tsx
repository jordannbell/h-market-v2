// Import des helpers Testing Library pour rendre le composant, interagir et attendre des effets async
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// Import du composant Stripe à tester
import CheckoutForm from '@/components/CheckoutForm'

// Mock que l’on va associer à stripe.confirmCardPayment
const confirmCardPaymentMock = jest.fn()

// Simulation du SDK Stripe afin de contrôler ses retours dans les tests
jest.mock('@stripe/react-stripe-js', () => ({
  // useStripe renvoie un objet mocké dont confirmCardPayment sera observé
  useStripe: jest.fn(() => ({
    confirmCardPayment: confirmCardPaymentMock,
  })),
  // useElements renvoie un objet mocké dont getElement retourne un pseudo CardElement
  useElements: jest.fn(() => ({
    getElement: jest.fn(() => ({})),
  })),
  // Composant CardElement mocké pour éviter le rendu réel Stripe
  CardElement: jest.fn(() => <div data-testid="card-element" />),
}))

// Mock du hook d’authentification pour fournir un utilisateur déterministe au composant
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      _id: 'user-id',
      name: { first: 'Test', last: 'User' },
      email: 'test@example.com',
    },
  }),
}))

// Mock de react-hot-toast pour intercepter les notifications
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

// Suite de tests dédiée au composant CheckoutForm
describe('CheckoutForm', () => {
  // Avant chaque test, on réinitialise les mocks et on remplace fetch par une version contrôlée
  beforeEach(() => {
    confirmCardPaymentMock.mockReset()
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ clientSecret: 'cs_test_secret' }), // Réponse attendue de l’API
    } as Response)
  })

  // Après chaque test, on restaure les fonctions originales (fetch, etc.)
  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Vérifie que le montant transmis au composant est bien affiché et formaté
  it('affiche le montant formaté en euros', () => {
    render(<CheckoutForm amount={123.45} orderId='order-1' onSuccess={jest.fn()} />)

    const [displayedAmount] = screen.getAllByText((content) =>
      content.replace(/\s/g, '').includes('123,45€')
    )

    expect(displayedAmount).toBeInTheDocument()
    expect(screen.getByTestId('card-element')).toBeInTheDocument()
  })

  // Vérifie que le formulaire exécute bien le flux de confirmation Stripe et appelle onSuccess
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

