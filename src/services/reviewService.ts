// Reviews temporarily disabled — migrating from Firebase to Postgres
export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export function subscribeToReviews(
  _productId: string,
  _callback: (reviews: Review[]) => void
): () => void {
  return () => { };
}

export async function addReview(
  _productId: string,
  _userName: string,
  _rating: number,
  _text: string
): Promise<void> { }