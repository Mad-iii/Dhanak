import { supabase } from '../lib/supabase';

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  text: string;
  createdAt: string; // ISO timestamp string from Supabase
}

export function subscribeToReviews(
  productId: string,
  callback: (reviews: Review[]) => void
): () => void {
  // Initial fetch
  supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) { console.error('reviewService fetch error:', error); return; }
      callback((data ?? []).map(toReview));
    });

  // Real-time subscription
  const channel = supabase
    .channel(`reviews:${productId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reviews', filter: `product_id=eq.${productId}` },
      () => {
        // Re-fetch on any new insert so ordering is correct
        supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .then(({ data }) => { if (data) callback(data.map(toReview)); });
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function addReview(
  productId: string,
  userName: string,
  rating: number,
  text: string
): Promise<void> {
  const { error } = await supabase.from('reviews').insert({
    product_id: productId,
    user_name: userName,
    rating,
    text,
  });
  if (error) throw new Error(error.message);
}

// Map snake_case Supabase row → camelCase Review
function toReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userName: row.user_name,
    rating: row.rating,
    text: row.text,
    createdAt: row.created_at,
  };
}