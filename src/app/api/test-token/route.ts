import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
 try {
 return NextResponse.json({
 success: true,
 message: 'API fonctionne correctement',
 timestamp: new Date().toISOString()
 })
 } catch {
 return NextResponse.json(
 { error: 'Erreur de test' },
 { status: 500 }
 )
 }
}
