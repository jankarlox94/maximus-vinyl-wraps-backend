export class CreatePrintJobDto {
  customerEmail: string;
  width: number;
  height: number;
  material: string;
  // The file is handled separately by the interceptor
}

// create-print-jobs.dto.ts
export class CartItemDto {
  cartItemId: string;
  productId: number;
  productName: string;
  size: string;
  quantity: number;
  material: string;
  notes: string;
  price: number;
  hasFile: boolean;
}

export class CreatePrintJobDto2 {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: CartItemDto[];
}
