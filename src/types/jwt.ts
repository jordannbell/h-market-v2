import { JwtPayload } from 'jsonwebtoken';

export interface AuthTokenPayload extends JwtPayload {
 userId: string;
 email: string;
 role: string;
}

export interface OrderItem {
 _id?: string;
 productId: string;
 title: string;
 slug: string;
 image: string;
 price: number;
 quantity: number;
 totalPrice: number;
}

export interface DeliveryLocation {
 latitude: number;
 longitude: number;
 timestamp?: Date;
}


