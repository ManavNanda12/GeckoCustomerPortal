export interface CategoryResponse{
    categoryId: number;
    categoryName: string;
    imageUrl: string | null;
    parentCategoryID: number | null;
}

export interface ProductResponse{
    productID: number;
    productName: string;
    productDescription: string;
    price: number;
    productImage: string | null;
    categoryID: number;
    categoryName: string;
    totalRecords: number;
    sku:string;
}

export const gymImages: string[] = [
    "https://picsum.photos/600/400?random=1",
    "https://picsum.photos/600/400?random=2",
    "https://picsum.photos/600/400?random=3",
    "https://picsum.photos/600/400?random=4",
    "https://picsum.photos/600/400?random=5",
    "https://picsum.photos/600/400?random=6",
    "https://picsum.photos/600/400?random=7",
    "https://picsum.photos/600/400?random=8",
    "https://picsum.photos/600/400?random=9",
    "https://picsum.photos/600/400?random=10"
];