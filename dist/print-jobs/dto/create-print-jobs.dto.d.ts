export declare class CreatePrintJobDto {
    customerEmail: string;
    width: number;
    height: number;
    material: string;
}
export declare class CartItemDto {
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
export declare class CreatePrintJobDto2 {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: CartItemDto[];
}
