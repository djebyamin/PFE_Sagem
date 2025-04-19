// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { getProducts } from '@/app/odoo';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur Odoo' }, { status: 500 });
  }
}
