import { useEffect, useRef, useState } from "react";
import {
  FaAirbnb,
  FaBars,
  FaGlobe,
  FaMinus,
  FaPlus,
  FaSearch,
  FaUserCircle,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

import { aiSearchRequest } from "../../features/auth/api/aiApi";
import { useAuth } from "../../features/auth/hooks/useAuth";

import "./Navbar.css";

type SearchPanel = "where" | "when" | "who" | null;

const currencies = ["USD", "RWF", "EUR", "GBP"];

const destinations = [
  "Kigali",
  "Rubavu",
  "Musanze",
  "Nyungwe",
  "Dubai",
  "Switzerland",
];

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

const may2026 = [
  "", "", "", "", "", "1", "2",
  "3", "4", "5", "6", "7", "8", "9",
  "10", "11", "12", "13", "14", "15", "16",
  "17", "18", "19", "20", "21", "22", "23",
  "24", "25", "26", "27", "28", "29", "30",
  "31",
];

const june2026 = [
  "", "1", "2", "3", "4", "5", "6",
  "7", "8", "9", "10", "11", "12", "13",
  "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27",
  "28", "29", "30",
];

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [activePanel, setActivePanel] = useState<SearchPanel>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const [currency, setCurrency] = useState(
    localStorage.getItem("currency") || "USD",
  );

  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(0);

  useEffect(() => {
    function closeDropdown(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setActivePanel(null);
        setMenuOpen(false);
        setCurrencyOpen(false);
      }
    }

    document.addEventListener("mousedown", closeDropdown);

    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  async function handleSearch() {
    const searchValue = destination.trim();

    localStorage.setItem("listingSearch", searchValue);
    localStorage.setItem("searchGuests", String(guests));
    localStorage.setItem("searchDate", date);

    try {
      setSearching(true);

      if (searchValue) {
        const response = await aiSearchRequest({
          query: searchValue,
          page: 1,
          limit: 20,
        });

        const results =
          response?.data?.listings ??
          response?.listings ??
          response?.results ??
          [];

        localStorage.setItem(
          "aiSearchResults",
          JSON.stringify(Array.isArray(results) ? results : []),
        );
      } else {
        localStorage.removeItem("aiSearchResults");
      }
    } catch {
      localStorage.removeItem("aiSearchResults");
    } finally {
      setSearching(false);
    }

    window.dispatchEvent(new Event("listing-search-updated"));

    setActivePanel(null);
    navigate("/");
  }

  function clearSearch() {
    setDestination("");
    setDate("");
    setGuests(0);

    localStorage.removeItem("listingSearch");
    localStorage.removeItem("aiSearchResults");
    localStorage.removeItem("searchGuests");
    localStorage.removeItem("searchDate");

    window.dispatchEvent(new Event("listing-search-updated"));
    navigate("/");
  }

  return (
    <header className="site-header">
      <nav className="airbnb-navbar" ref={wrapperRef}>
        <NavLink to="/" className="airbnb-logo">
          <FaAirbnb />
          <span>Airbnb Stays</span>
        </NavLink>

        <div className="airbnb-search-wrapper">
          <div className="airbnb-search-pill">
            <button
              type="button"
              className={activePanel === "where" ? "active" : ""}
              onClick={() => setActivePanel("where")}
            >
              <strong>Where</strong>
              <span>{destination || "Search destinations"}</span>
            </button>

            <button
              type="button"
              className={activePanel === "when" ? "active" : ""}
              onClick={() => setActivePanel("when")}
            >
              <strong>When</strong>
              <span>{date || "Add dates"}</span>
            </button>

            <button
              type="button"
              className={activePanel === "who" ? "active" : ""}
              onClick={() => setActivePanel("who")}
            >
              <strong>Who</strong>
              <span>{guests > 0 ? `${guests} guests` : "Add guests"}</span>
            </button>

            <button
              type="button"
              className="search-circle"
              onClick={handleSearch}
              disabled={searching}
              aria-label="Search listings"
            >
              <FaSearch />
            </button>
          </div>

          {activePanel === "where" && (
            <div className="search-panel where-panel">
              <p className="panel-title">Search destination</p>

              <input
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Type Kigali, Rubavu, Musanze..."
                className="where-input"
                autoFocus
              />

              <div className="destination-list">
                {destinations.map((place) => (
                  <button
                    key={place}
                    type="button"
                    onClick={() => {
                      setDestination(place);
                      setActivePanel(null);
                    }}
                  >
                    <span className="destination-icon">⌖</span>

                    <span>
                      <strong>{place}</strong>
                      <small>Search stays in {place}</small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activePanel === "when" && (
            <div className="search-panel date-panel">
              <div className="date-tabs">
                <button type="button" className="active">
                  Dates
                </button>
                <button type="button">Flexible</button>
              </div>

              <div className="calendar-grid">
                <div>
                  <h4>May 2026</h4>

                  <div className="calendar-weekdays">
                    {weekdays.map((day, index) => (
                      <span key={`may-${day}-${index}`}>{day}</span>
                    ))}
                  </div>

                  <div className="calendar-days">
                    {may2026.map((day, index) =>
                      day ? (
                        <button
                          key={index}
                          type="button"
                          className={date === `May ${day}, 2026` ? "selected" : ""}
                          onClick={() => {
                            setDate(`May ${day}, 2026`);
                            setActivePanel(null);
                          }}
                        >
                          {day}
                        </button>
                      ) : (
                        <span key={index}></span>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h4>June 2026</h4>

                  <div className="calendar-weekdays">
                    {weekdays.map((day, index) => (
                      <span key={`june-${day}-${index}`}>{day}</span>
                    ))}
                  </div>

                  <div className="calendar-days">
                    {june2026.map((day, index) =>
                      day ? (
                        <button
                          key={index}
                          type="button"
                          className={date === `June ${day}, 2026` ? "selected" : ""}
                          onClick={() => {
                            setDate(`June ${day}, 2026`);
                            setActivePanel(null);
                          }}
                        >
                          {day}
                        </button>
                      ) : (
                        <span key={index}></span>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="date-options">
                <button type="button">Exact dates</button>
                <button type="button">± 1 day</button>
                <button type="button">± 2 days</button>
                <button type="button">± 3 days</button>
                <button type="button">± 7 days</button>
                <button type="button">± 14 days</button>
              </div>
            </div>
          )}

          {activePanel === "who" && (
            <div className="search-panel guests-panel">
              <div className="guest-row">
                <div>
                  <strong>Guests</strong>
                  <span>Add guests for your stay</span>
                </div>

                <div className="guest-controls">
                  <button
                    type="button"
                    disabled={guests === 0}
                    onClick={() => setGuests((value) => Math.max(0, value - 1))}
                  >
                    <FaMinus />
                  </button>

                  <span>{guests}</span>

                  <button
                    type="button"
                    onClick={() => setGuests((value) => value + 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="airbnb-actions">
          {(destination || date || guests > 0) && (
            <button type="button" className="clear-search-btn" onClick={clearSearch}>
              Clear
            </button>
          )}

          <button
            type="button"
            className="currency-btn"
            onClick={() => {
              setCurrencyOpen((current) => !current);
              setMenuOpen(false);
            }}
          >
            <FaGlobe />
            <span>{currency}</span>
          </button>

          <button
            type="button"
            className="profile-menu-btn"
            onClick={() => {
              setMenuOpen((current) => !current);
              setCurrencyOpen(false);
            }}
          >
            <FaBars />
            <FaUserCircle />
          </button>

          {currencyOpen && (
            <div className="currency-menu">
              <strong>Choose currency</strong>

              {currencies.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={currency === item ? "active" : ""}
                  onClick={() => {
                    setCurrency(item);
                    localStorage.setItem("currency", item);
                    setCurrencyOpen(false);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          )}

          {menuOpen && (
            <div className="profile-dropdown">
              {isAuthenticated && (
                <div className="menu-user-box">
                  <strong>{user?.name || user?.email}</strong>
                  <span>{user?.role}</span>
                </div>
              )}

              <NavLink to="/" onClick={() => setMenuOpen(false)}>
                Home
              </NavLink>

              {!isAuthenticated ? (
                <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                  Log in or sign up
                </NavLink>
              ) : (
                <>
                  <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </NavLink>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </>
              )}

              <hr />

              <button type="button">Help Center</button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}