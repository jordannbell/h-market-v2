/**
 * Tests d’intégration pour la route POST `/api/orders`.
 * On garde la logique du handler et on remplace les dépendances
 * (MongoDB, notifications SSE) par des mocks pour vérifier l’enchaînement.
 */

import { generateToken } from '@/lib/auth'

jest.mock('@/lib/database', () => ({
  connectDB: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/models/User', () => ({
  __esModule: true,
  default: { findById: jest.fn() },
}))

jest.mock('@/models/Order', () => {
  const OrderMock = jest.fn()
  return { __esModule: true, default: OrderMock }
})

jest.mock('@/lib/notifications', () => ({
  sendNotificationToRole: jest.fn(),
}))

import { connectDB } from '@/lib/database'
import UserModel from '@/models/User'
import OrderModel from '@/models/Order'
import { sendNotificationToRole } from '@/lib/notifications'
import { POST as createOrder } from '@/app/api/orders/route'

const connectDBMock = connectDB as jest.Mock
const userFindByIdMock = UserModel.findById as unknown as jest.Mock
const OrderConstructorMock = OrderModel as unknown as jest.Mock
const sendNotificationMock = sendNotificationToRole as jest.Mock

let lastOrderInstance: { save: jest.Mock; totals: any } | null = null

describe('POST /api/orders (intégration)', () => {
  beforeEach(() => {
    connectDBMock.mockClear()
    sendNotificationMock.mockClear()
    userFindByIdMock.mockReset()
    OrderConstructorMock.mockReset()
    lastOrderInstance = null

    OrderConstructorMock.mockImplementation((data) => {
      lastOrderInstance = {
        ...data,
        _id: 'order-id-mock',
        orderNumber: 'HM-TEST-123',
        totals: data.totals,
        save: jest.fn().mockResolvedValue({
          _id: 'order-id-mock',
          orderNumber: 'HM-TEST-123',
          status: 'pending',
          totals: data.totals,
        }),
      }
      return lastOrderInstance
    })
  })

  it('refuse la création sans token Bearer (401)', async () => {
    const request = {
      headers: new Headers(),
      json: async () => ({}),
    } as unknown as Request

    const response = await createOrder(request)

    expect(connectDBMock).not.toHaveBeenCalled()
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toContain('Token')
  })

  it('crée une commande complète et notifie les livreurs', async () => {
    userFindByIdMock.mockResolvedValue({
      _id: 'user-id-123',
      name: { first: 'Alice', last: 'Dupont' },
      email: 'alice@example.com',
    })

    const token = generateToken({
      userId: 'user-id-123',
      email: 'alice@example.com',
      role: 'client',
    })

    const payload = {
      items: [
        {
          _id: 'product-1',
          title: 'Poivrons rouges',
          slug: 'poivrons-rouges',
          image: '/poivrons.jpg',
          price: 4.5,
          quantity: 2,
        },
      ],
      address: {
        street: '12 rue de Paris',
        city: 'Paris',
        postalCode: '75001',
        country: 'France',
      },
      delivery: {
        mode: 'planned',
        slot: 'morning',
        scheduledAt: new Date().toISOString(),
      },
      paymentMethod: 'stripe',
    }

    const headers = new Headers({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    })
    const request = {
      headers,
      json: async () => payload,
    } as unknown as Request

    const response = await createOrder(request)
    const body = await response.json()

    expect(connectDBMock).toHaveBeenCalledTimes(1)
    expect(userFindByIdMock).toHaveBeenCalledWith('user-id-123')
    expect(OrderConstructorMock).toHaveBeenCalledTimes(1)
    expect(lastOrderInstance?.save).toHaveBeenCalledTimes(1)
    expect(sendNotificationMock).toHaveBeenCalledWith(
      'livreur',
      expect.objectContaining({
        type: 'new_order',
        data: expect.objectContaining({ deliveryMode: 'planned' }),
      })
    )

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.order).toMatchObject({
      status: 'pending',
      total: expect.any(Number),
    })
  })
})

