import { memo } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { motion } from "framer-motion";
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from "react-icons/fa";
import { format } from "date-fns";
import numeral from "numeral";

import type { Listing } from "../types";
import styles from "./ListingCard.module.css";

interface Props {
  listing: Listing;
  saved: boolean;
  onToggleSave: () => void;
}

function getSafeDate(date?: string) {
  if (!date) return "Available now";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Available now";
  }

  return format(parsedDate, "MMM d, yyyy");
}

function ListingCardBase({ listing, saved, onToggleSave }: Props) {
  const image = listing.img || listing.image;
  const price = Number(listing.price ?? listing.pricePerNight ?? 0);
  const rating = Number(listing.rating ?? 4.85);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={`/listings/${listing.id}`}
        className={clsx(styles.card, { [styles.super]: listing.superhost })}
      >
        <div className={styles.imageWrap}>
          <img
            className={styles.image}
            src={image}
            alt={listing.title || "Listing"}
          />

          <button
            type="button"
            className={clsx(styles.heart, { [styles.saved]: saved })}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onToggleSave();
            }}
            aria-label="Save listing"
          >
            {saved ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <h3 className={styles.title}>{listing.title || "Beautiful stay"}</h3>

            <span>
              <FaStar /> {numeral(rating).format("0.00")}
            </span>
          </div>

          <p className={styles.muted}>
            <FaMapMarkerAlt /> {listing.location || "Unknown location"}
          </p>

          <div className={styles.row}>
            <strong>{numeral(price).format("$0,0")}/night</strong>

            <span className={listing.available ? styles.available : styles.booked}>
              {listing.available ? "Available" : "Booked"}
            </span>
          </div>

          <p className={styles.muted}>
            From {getSafeDate(listing.availableFrom)}
          </p>

          {listing.superhost && <span className={styles.badge}>Superhost</span>}

          {price > 300 && (
            <span className={clsx(styles.badge, styles.luxury)}>Luxury</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

export const ListingCard = memo(ListingCardBase);