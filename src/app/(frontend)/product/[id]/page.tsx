import React from "react";
import { getPublicProductById } from "@/actions/product";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

// ISR (rendered on first request, then cached). updateProduct/deleteProduct/
// rateProduct call revalidatePath(`/product/${id}`) for on-demand freshness.
export const revalidate = 3600;

// Pre-render nothing at build time (keeps build CPU flat as the catalog grows);
// pages are generated on first request and then cached.
export async function generateStaticParams() {
  return [];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getPublicProductById(id);
  
  if (!product) {
    notFound();
  }
  
  return <ProductDetailClient product={product} />;
}
