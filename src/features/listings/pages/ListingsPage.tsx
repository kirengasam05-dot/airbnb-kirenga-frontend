import { useCallback, useEffect, useMemo, useState } from "react";

import { ListingCard } from "../components/ListingCard";
import { SavedBadge } from "../components/SavedBadge";
import { useFavorites } from "../hooks/useFavorites";
import { useListings } from "../hooks/useListings";
import { mapApiListing } from "../hooks/mapListing";

import { Spinner } from "../../../shared/components/Spinner";
import { useStore } from "../../../store/StoreContext";

export function ListingsPage() {
  const { data = [], isLoading, isError, refetch } = useListings();

  const { dispatch } = useStore();
  const { count, isSaved, toggle } = useFavorites();

  const [navbarSearch, setNavbarSearch] = useState(
    localStorage.getItem("listingSearch") || "",
  );

  const [aiResults, setAiResults] = useState<any[]>(() => {
    const raw = localStorage.getItem("aiSearchResults");
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    dispatch({
      type: "SET_LISTINGS",
      payload: data,
    });
  }, [data, dispatch]);

  useEffect(() => {
    const updateSearch = () => {
      setNavbarSearch(localStorage.getItem("listingSearch") || "");

      const raw = localStorage.getItem("aiSearchResults");
      setAiResults(raw ? JSON.parse(raw) : []);
    };

    updateSearch();

    window.addEventListener("listing-search-updated", updateSearch);

    return () => {
      window.removeEventListener("listing-search-updated", updateSearch);
    };
  }, []);

  const normalizedAiResults = useMemo(() => {
    if (!Array.isArray(aiResults) || aiResults.length === 0) {
      return [];
    }

    return aiResults.map((item) => {
      if (item.price || item.pricePerNight || item.img || item.image) {
        return item;
      }

      return mapApiListing(item);
    });
  }, [aiResults]);

  const filtered = useMemo(() => {
    const search = navbarSearch.toLowerCase().trim();

    if (normalizedAiResults.length > 0) {
  return normalizedAiResults.filter((listing) => {
    return (
      listing &&
      typeof listing.id !== 'undefined' &&
      listing.title &&
      (listing.image || listing.img) &&
      (listing.price || listing.pricePerNight)
    )
  })
}

    if (!search) return data;

    return data.filter((listing) => {
      const searchable = `${listing.title} ${listing.location}`.toLowerCase();

      return searchable.includes(search);
    });
  }, [data, navbarSearch, normalizedAiResults]);

  const onToggle = useCallback(
    (id: number, title: string) => {
      toggle(id, title);
    },
    [toggle],
  );

  const clearSearch = () => {
    localStorage.removeItem("listingSearch");
    localStorage.removeItem("aiSearchResults");
    setNavbarSearch("");
    setAiResults([]);
  };

  if (isLoading) return <Spinner />;

  if (isError) {
    return (
      <main className="container">
        <h2>Could not load listings.</h2>

        <button onClick={() => refetch()}>Try again</button>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="toolbar">
        <div>
          <p className="results-text">
            {filtered.length} result(s)
            {navbarSearch && ` for "${navbarSearch}"`}
            {normalizedAiResults.length > 0 && " using AI search"}
          </p>

          {navbarSearch && (
            <button className="clear-btn" onClick={clearSearch}>
              Clear search
            </button>
          )}
        </div>

        <SavedBadge count={count} />
      </div>

      <div className="content-layout">
        <div className="listings-grid">
          {filtered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              saved={isSaved(listing.id)}
              onToggleSave={() => onToggle(listing.id, listing.title)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
