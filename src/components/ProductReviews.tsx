// src/components/ProductReviews.tsx  (Dhanak)
// Drop this into your product detail page.
// Shows: avg rating, star breakdown, first 5 reviews + "show all" toggle, review form.
// Review form only renders if customer is logged in AND has a delivered order of this product.
//
// Usage:
//   <ProductReviews
//     productId={product.id}
//     productName={product.name}
//     storeId={STORE_ID}          // your store's Postgres ID (set in env)
//     currentUser={currentUser}   // { email, name } or null
//   />

import { useState, useEffect } from "react";

const OWNER_PORTAL_URL = import.meta.env.VITE_OWNER_PORTAL_URL ?? "https://owner-portal-ten.vercel.app";

interface Review {
    id: string;
    customerName: string | null;
    customerEmail: string | null;
    rating: number;
    title: string | null;
    body: string;
    verified: boolean;
    source: string;
    createdAt: string;
}

interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    starBreakdown: { star: number; count: number }[];
}

interface Props {
    productId: string;
    productName: string;
    storeId: string;
    currentUser: { email: string; name?: string } | null;
}

function Stars({ rating, size = 18 }: { rating: number; size?: number }) {
    return (
        <span style={{ display: "inline-flex", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width={size} height={size} viewBox="0 0 20 20"
                    fill={s <= rating ? "#f59e0b" : "#e5e7eb"}>
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </span>
    );
}

function ClickableStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    return (
        <span style={{ display: "inline-flex", gap: 4, cursor: "pointer" }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width={28} height={28} viewBox="0 0 20 20"
                    fill={(hover || value) >= s ? "#f59e0b" : "#e5e7eb"}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => onChange(s)}
                    style={{ transition: "fill 0.1s" }}
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </span>
    );
}

export default function ProductReviews({ productId, productName, storeId, currentUser }: Props) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(true);

    // Eligibility
    const [eligible, setEligible] = useState(false);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [alreadyDone, setAlreadyDone] = useState(false);

    // Form state
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState("");

    // Fetch reviews + stats
    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const res = await fetch(
                    `${OWNER_PORTAL_URL}/api/reviews?storeId=${storeId}&productId=${productId}&limit=100`
                );
                const data = await res.json();
                setReviews(data.reviews ?? []);
                setStats({
                    averageRating: data.averageRating,
                    totalReviews: data.totalReviews,
                    starBreakdown: data.starBreakdown,
                });
            } catch {
                // silently fail — reviews non-critical
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [productId, storeId, submitted]);

    // Check eligibility via Dhanak's own server (which calls Owner-portal)
    useEffect(() => {
        if (!currentUser?.email) return;
        async function checkEligibility() {
            try {
                const res = await fetch(
                    `/api/reviews/eligible?storeId=${storeId}&productId=${productId}&customerEmail=${encodeURIComponent(currentUser!.email)}`
                );
                const data = await res.json();
                setEligible(data.eligible);
                setAlreadyDone(data.alreadyReviewed);
                setOrderId(data.orderId ?? null);
            } catch { /* ignore */ }
        }
        checkEligibility();
    }, [currentUser, productId, storeId]);

    // Submit review
    const submitReview = async () => {
        if (rating === 0) { setFormError("Please select a star rating."); return; }
        if (!body.trim()) { setFormError("Please write your review."); return; }
        setFormError("");
        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId,
                    productId,
                    productName,
                    orderId,
                    customerEmail: currentUser?.email,
                    customerName: currentUser?.name,
                    rating,
                    title: title.trim() || undefined,
                    reviewBody: body.trim(),
                }),
            });
            if (res.status === 409) {
                setFormError("You've already reviewed this product.");
                return;
            }
            if (!res.ok) {
                const err = await res.json();
                setFormError(err.error ?? "Failed to submit review.");
                return;
            }
            setSubmitted(true);
            setRating(0); setTitle(""); setBody("");
            setEligible(false); setAlreadyDone(true);
        } catch {
            setFormError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const displayedReviews = showAll ? reviews : reviews.slice(0, 5);

    if (loading) {
        return (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                Loading reviews…
            </div>
        );
    }

    return (
        <section style={{ marginTop: 48, fontFamily: "inherit" }}>
            {/* ── Section header ── */}
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 24 }}>
                Customer Reviews
            </h2>

            {/* ── Stats overview ── */}
            {stats && stats.totalReviews > 0 && (
                <div style={{ display: "flex", gap: 32, alignItems: "flex-start", marginBottom: 36, flexWrap: "wrap" }}>
                    {/* Big rating */}
                    <div style={{ textAlign: "center", minWidth: 100 }}>
                        <p style={{ fontSize: 52, fontWeight: 800, color: "#111827", lineHeight: 1, margin: 0 }}>
                            {stats.averageRating}
                        </p>
                        <Stars rating={Math.round(stats.averageRating)} size={20} />
                        <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                            {stats.totalReviews} review{stats.totalReviews !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Star breakdown bars */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        {stats.starBreakdown.map(({ star, count }) => {
                            const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                            return (
                                <div key={star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: "#6b7280", width: 32, textAlign: "right" }}>{star}★</span>
                                    <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 99 }}>
                                        <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 99, transition: "width 0.4s" }} />
                                    </div>
                                    <span style={{ fontSize: 12, color: "#9ca3af", width: 20 }}>{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Review cards ── */}
            {reviews.length === 0 ? (
                <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 32 }}>
                    No reviews yet — be the first!
                </p>
            ) : (
                <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 16 }}>
                        {displayedReviews.map((r) => (
                            <div key={r.id} style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: "20px 24px",
                                background: "#fff",
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                    <div>
                                        <Stars rating={r.rating} size={16} />
                                        {r.title && (
                                            <p style={{ fontWeight: 600, color: "#111827", margin: "6px 0 0", fontSize: 15 }}>{r.title}</p>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                        {r.verified && (
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 4,
                                                fontSize: 11, color: "#16a34a", fontWeight: 600,
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Verified Purchase
                                            </span>
                                        )}
                                        <span style={{ fontSize: 11, color: "#9ca3af" }}>
                                            {new Date(r.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
                                        </span>
                                    </div>
                                </div>
                                <p style={{ color: "#374151", fontSize: 14, margin: 0, lineHeight: 1.6 }}>{r.body}</p>
                                <p style={{ fontSize: 12, color: "#6b7280", marginTop: 10, marginBottom: 0 }}>
                                    — {r.customerName ?? "Anonymous"}
                                </p>
                            </div>
                        ))}
                    </div>

                    {reviews.length > 5 && (
                        <button
                            onClick={() => setShowAll((v) => !v)}
                            style={{
                                padding: "10px 20px",
                                border: "1px solid #d1d5db",
                                borderRadius: 8,
                                background: "#fff",
                                color: "#374151",
                                fontSize: 14,
                                cursor: "pointer",
                                marginBottom: 36,
                                fontWeight: 500,
                            }}
                        >
                            {showAll ? "Show fewer reviews" : `See all ${reviews.length} reviews`}
                        </button>
                    )}
                </>
            )}

            {/* ── Review form ── */}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
                    Write a Review
                </h3>

                {!currentUser ? (
                    <p style={{ color: "#6b7280", fontSize: 14 }}>
                        Please <a href="/login" style={{ color: "#111827", fontWeight: 600, textDecoration: "underline" }}>log in</a> to leave a review.
                    </p>
                ) : alreadyDone || submitted ? (
                    <div style={{
                        padding: "16px 20px",
                        background: "#f0fdf4",
                        borderRadius: 10,
                        border: "1px solid #bbf7d0",
                        color: "#15803d",
                        fontSize: 14,
                        fontWeight: 500,
                    }}>
                        ✓ {submitted ? "Thank you! Your review has been published." : "You've already reviewed this product."}
                    </div>
                ) : !eligible ? (
                    <div style={{
                        padding: "16px 20px",
                        background: "#f9fafb",
                        borderRadius: 10,
                        border: "1px solid #e5e7eb",
                        color: "#6b7280",
                        fontSize: 14,
                    }}>
                        Only customers who have purchased and received this product can leave a review.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 520 }}>
                        {/* Star picker */}
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                                Your Rating *
                            </label>
                            <ClickableStars value={rating} onChange={setRating} />
                        </div>

                        {/* Title */}
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                Review Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Summarise your experience"
                                maxLength={100}
                                style={{
                                    width: "100%", padding: "10px 12px",
                                    border: "1px solid #d1d5db", borderRadius: 8,
                                    fontSize: 14, color: "#111827", outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                        </div>

                        {/* Body */}
                        <div>
                            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                                Your Review *
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="What did you like or dislike? How was the quality?"
                                rows={4}
                                style={{
                                    width: "100%", padding: "10px 12px",
                                    border: "1px solid #d1d5db", borderRadius: 8,
                                    fontSize: 14, color: "#111827", outline: "none",
                                    resize: "vertical", boxSizing: "border-box",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>

                        {formError && (
                            <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>{formError}</p>
                        )}

                        <button
                            onClick={submitReview}
                            disabled={submitting}
                            style={{
                                padding: "12px 24px",
                                background: submitting ? "#6b7280" : "#111827",
                                color: "#fff",
                                border: "none",
                                borderRadius: 8,
                                fontSize: 14,
                                fontWeight: 600,
                                cursor: submitting ? "not-allowed" : "pointer",
                                alignSelf: "flex-start",
                                transition: "background 0.2s",
                            }}
                        >
                            {submitting ? "Submitting…" : "Submit Review"}
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}