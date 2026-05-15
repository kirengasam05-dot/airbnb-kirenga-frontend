import { FormEvent, useEffect, useMemo, useState } from "react";
import { FaHeart, FaRegHeart, FaShare, FaStar } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";

import { CheckoutForm } from "../../bookings/components/CheckoutForm";
import { useAuth } from "../../auth/hooks/useAuth";
import { useAiReviewSummary } from "../../ai/useAiReviewSummary";
import { Spinner } from "../../../shared/components/Spinner";
import { useListing } from "../hooks/useListing";
import { api } from "../../../lib/axios";

import "./ListingDetail.css";

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    name?: string;
    username?: string;
    avatar?: string | null;
  };
};

export function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const listingId = id ? Number(id) : undefined;
  const { user, isAuthenticated } = useAuth();

  const [showBooking, setShowBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [saved, setSaved] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const { data: listing, isLoading, isError } = useListing(listingId);
  const { data: aiReviewSummary } = useAiReviewSummary(listingId);

  const defaultCheckIn = useMemo(() => {
    return dayjs().add(1, "day").format("YYYY-MM-DD");
  }, []);

  const defaultCheckOut = useMemo(() => {
    return dayjs().add(3, "day").format("YYYY-MM-DD");
  }, []);

  const [bookingData, setBookingData] = useState({
    checkIn: defaultCheckIn,
    checkOut: defaultCheckOut,
    guests: 1,
  });

  const isGuest = user?.role === "GUEST";
  const isHost = user?.role === "HOST";
  const isAdmin = user?.role === "ADMIN";

  const summaryText =
    aiReviewSummary?.summary ??
    aiReviewSummary?.message ??
    aiReviewSummary?.data?.summary ??
    aiReviewSummary?.data?.message ??
    "";

  const averageRating = useMemo(() => {
    if (!reviews.length) return listing?.rating ?? 4.85;

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Number((total / reviews.length).toFixed(1));
  }, [reviews, listing?.rating]);

  useEffect(() => {
    async function loadReviews() {
      if (!listingId) return;

      try {
        const response = await api.get(`/listings/${listingId}/reviews`);
        setReviews(response.data?.reviews ?? response.data?.data ?? []);
      } catch {
        setReviews([]);
      }
    }

    loadReviews();
  }, [listingId]);

  const handleReserveClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isHost || isAdmin) {
      alert("Only guests can reserve a listing");
      return;
    }

    setShowBooking(true);
  };

  const handleBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!listing) return;

    if (!bookingData.checkIn || !bookingData.checkOut) {
      alert("Please choose check-in and check-out dates");
      return;
    }

    if (dayjs(bookingData.checkOut).isBefore(dayjs(bookingData.checkIn))) {
      alert("Check-out date must be after check-in date");
      return;
    }

    const localBooking = {
      id: Date.now(),
      listingId: listing.id,
      listingTitle: listing.title,
      location: listing.location,
      image: listing.image || listing.img,
      price: listing.price,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: Number(bookingData.guests),
      status: "PENDING",
      paymentStatus: "UNPAID",
      userEmail: user?.email,
      createdAt: new Date().toISOString(),
    };

    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    localStorage.setItem(
      "bookings",
      JSON.stringify([localBooking, ...savedBookings]),
    );

    setShowBooking(false);
    setShowPayment(true);
  };

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!listingId) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!isGuest) {
      alert("Only guests can leave reviews");
      return;
    }

    if (!reviewComment.trim()) {
      alert("Please write your review comment");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await api.post(`/listings/${listingId}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
      });

      const createdReview =
        response.data?.review ?? response.data?.data ?? response.data;

      if (createdReview?.id) {
        setReviews((current) => [createdReview, ...current]);
      }

      setReviewComment("");
      setReviewRating(5);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to create review");
    } finally {
      setReviewLoading(false);
    }
  };

  if (isLoading) return <Spinner />;

  if (isError || !listing) {
    return (
      <main className="detail-container">
        <button className="detail-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="detail-empty">
          <h2>Listing not found</h2>
          <p>Please go back and choose another listing.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="detail-container">
      <div className="detail-top">
        <div>
          <button className="detail-back" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <h1>{listing.title}</h1>

          <p className="detail-meta">
            <FaStar /> {averageRating} · {listing.location} ·{" "}
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>

        <div className="detail-actions">
          <button type="button" className="detail-action">
            <FaShare /> Share
          </button>

          <button
            type="button"
            className="detail-action"
            onClick={() => setSaved((current) => !current)}
          >
            {saved ? <FaHeart /> : <FaRegHeart />} Save
          </button>
        </div>
      </div>

      <section className="gallery">
        <img className="gallery-main" src={listing.img} alt={listing.title} />

        <div className="gallery-grid">
          <img src={listing.img} alt={listing.title} />
          <img src={listing.img} alt={listing.title} />
          <img src={listing.img} alt={listing.title} />
          <img src={listing.img} alt={listing.title} />
        </div>
      </section>

      <section className="detail-layout">
        <div className="detail-left">
          <div className="property-heading">
            <h2>Entire rental unit in {listing.location}</h2>
            <p>{listing.guests || 2} guests · 1 bedroom · 1 bed · 1 bath</p>
          </div>

          <div className="guest-favorite">
            <strong>Guest favorite</strong>
            <span>One of the most loved homes according to guests</span>
            <strong>{averageRating}</strong>
            <span>{reviews.length} reviews</span>
          </div>

          <div className="host-box">
            <div className="host-avatar">
              {listing.host?.name?.charAt(0).toUpperCase() || "K"}
            </div>

            <div>
              <strong>Hosted by {listing.host?.name || "Kirenga"}</strong>
              <p>
                {listing.superhost
                  ? "Superhost · 2 years hosting"
                  : "Experienced host"}
              </p>
            </div>
          </div>

          <div className="features-list">
            <div>
              <strong>Self check-in</strong>
              <p>Check yourself in with the lockbox.</p>
            </div>

            <div>
              <strong>Park for free</strong>
              <p>This is one of the few places in the area with free parking.</p>
            </div>

            <div>
              <strong>
                {listing.superhost ? "Superhost stay" : "Featured stay"}
              </strong>
              <p>
                Highly rated stay with comfort, clean rooms, and a great
                location.
              </p>
            </div>
          </div>
        </div>

        <aside className="reserve-card">
          <p className="price-line">
            <span>${listing.price}</span> / night
          </p>

          <div className="reserve-fields">
            <div>
              <small>CHECK-IN</small>
              <strong>{dayjs(bookingData.checkIn).format("M/D/YYYY")}</strong>
            </div>

            <div>
              <small>CHECKOUT</small>
              <strong>{dayjs(bookingData.checkOut).format("M/D/YYYY")}</strong>
            </div>

            <div className="guests-field">
              <small>GUESTS</small>
              <strong>{bookingData.guests} guest</strong>
            </div>
          </div>

          {!isAuthenticated && (
            <button className="reserve-btn" onClick={handleReserveClick}>
              Login to Reserve
            </button>
          )}

          {isGuest && (
            <button className="reserve-btn" onClick={handleReserveClick}>
              Reserve
            </button>
          )}

          {(isHost || isAdmin) && (
            <button className="reserve-btn" disabled type="button">
              Only guests can reserve
            </button>
          )}

          <p className="charge-text">
            {isGuest || !isAuthenticated
              ? "You won't be charged yet"
              : "Hosts and admins manage bookings from dashboard"}
          </p>
        </aside>
      </section>

      <section className="reviews-section">
        <div className="reviews-header">
          <div>
            <h2>
              <FaStar /> {averageRating} · {reviews.length} review
              {reviews.length === 1 ? "" : "s"}
            </h2>
            <p>Read what guests say about this stay.</p>
          </div>
        </div>

        <div className="ai-summary-card">
          <strong>AI review summary</strong>
          <p>
            {summaryText ||
              "No AI review summary is available yet for this listing."}
          </p>
        </div>

        {isGuest && (
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <h3>Leave a review</h3>

            <label>
              Rating
              <select
                value={reviewRating}
                onChange={(event) => setReviewRating(Number(event.target.value))}
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </label>

            <label>
              Comment
              <textarea
                value={reviewComment}
                onChange={(event) => setReviewComment(event.target.value)}
                placeholder="Share your experience..."
                rows={4}
              />
            </label>

            <button type="submit" disabled={reviewLoading}>
              {reviewLoading ? "Posting..." : "Post Review"}
            </button>
          </form>
        )}

        <div className="reviews-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-user">
                <div className="review-avatar">
                  {(review.user?.name || review.user?.username || "G")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {review.user?.name || review.user?.username || "Guest"}
                  </strong>
                  <span>{dayjs(review.createdAt).format("MMM D, YYYY")}</span>
                </div>
              </div>

              <p className="review-rating">
                <FaStar /> {review.rating}
              </p>

              <p>{review.comment}</p>
            </article>
          ))}

          {reviews.length === 0 && (
            <div className="detail-empty">
              <h3>No reviews yet</h3>
              <p>Be the first guest to review this listing.</p>
            </div>
          )}
        </div>
      </section>

      {showBooking && isGuest && (
        <section className="booking-modal">
          <form className="booking-modal-card" onSubmit={handleBookingSubmit}>
            <h3>Confirm your reservation</h3>

            <label>
              Check-in
              <input
                type="date"
                value={bookingData.checkIn}
                onChange={(event) =>
                  setBookingData({
                    ...bookingData,
                    checkIn: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Check-out
              <input
                type="date"
                value={bookingData.checkOut}
                onChange={(event) =>
                  setBookingData({
                    ...bookingData,
                    checkOut: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Guests
              <input
                type="number"
                min="1"
                max={listing.guests || 10}
                value={bookingData.guests}
                onChange={(event) =>
                  setBookingData({
                    ...bookingData,
                    guests: Number(event.target.value),
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="back-btn"
                onClick={() => setShowBooking(false)}
              >
                Cancel
              </button>

              <button type="submit" className="confirm-btn">
                Continue to Payment
              </button>
            </div>
          </form>
        </section>
      )}

      {showPayment && isGuest && (
        <section className="booking-modal">
          <div className="booking-modal-card">
            <h3>Complete your payment</h3>

            <CheckoutForm
              bookingId={listing.id}
              amount={listing.price}
              onSuccess={() => {
                const bookings = JSON.parse(
                  localStorage.getItem("bookings") || "[]",
                );

                const updatedBookings = bookings.map(
                  (booking: any, index: number) =>
                    index === 0
                      ? {
                          ...booking,
                          paymentStatus: "PAID",
                          status: "CONFIRMED",
                        }
                      : booking,
                );

                localStorage.setItem(
                  "bookings",
                  JSON.stringify(updatedBookings),
                );

                setShowPayment(false);
                navigate("/dashboard");
              }}
            />

            <button
              type="button"
              className="back-btn"
              onClick={() => {
                setShowPayment(false);
                navigate("/dashboard");
              }}
            >
              Pay later
            </button>
          </div>
        </section>
      )}
    </main>
  );
}