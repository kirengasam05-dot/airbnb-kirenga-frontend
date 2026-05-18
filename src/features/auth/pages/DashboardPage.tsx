import { FormEvent, useMemo, useState } from "react";
import { useFavorites } from "../../listings/hooks/useFavorites";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarCheck,
  FaChartLine,
  FaCog,
  FaEnvelope,
  FaHeart,
  FaHome,
  FaMagic,
  FaMoneyBillWave,
  FaPlus,
  FaSignOutAlt,
  FaStar,
  FaSuitcase,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAuth } from "../hooks/useAuth";
import { aiChatRequest } from "../api/aiApi";
import { useListings } from "../../listings/hooks/useListings";
import { useCreateListing } from "../../listings/hooks/useCreateListing";
import { useDeleteListing } from "../../listings/hooks/useDeleteListing";
import { useMessages } from "../../messages/hooks/useMessages";
import "./DashboardPage.css";

type Role = "ADMIN" | "HOST" | "GUEST";

type Section =
  | "overview"
  | "users"
  | "listings"
  | "createListing"
  | "bookings"
  | "earnings"
  | "trips"
  | "saved"
  | "messages"
  | "settings";

type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

type Booking = {
  id: number;
  guest: string;
  listing: string;
  dates: string;
  guests: number;
  payment: string;
  status: BookingStatus;
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
};

const bookingsData: Booking[] = [
  {
    id: 1,
    guest: "Alice Martin",
    listing: "Luxury Beach Villa",
    dates: "May 10 - May 14",
    guests: 2,
    payment: "$480",
    status: "Pending",
  },
  {
    id: 2,
    guest: "James Smith",
    listing: "Modern Apartment Kigali",
    dates: "May 22 - May 26",
    guests: 1,
    payment: "$650",
    status: "Confirmed",
  },
  {
    id: 3,
    guest: "Diane Uwase",
    listing: "City View House",
    dates: "June 01 - June 05",
    guests: 3,
    payment: "$720",
    status: "Cancelled",
  },
];

const usersData: AdminUser[] = [
  {
    id: 1,
    name: "System Admin",
    email: "admin@gmail.com",
    password: "admin123",
    role: "ADMIN",
  },
  {
    id: 2,
    name: "Sam Host",
    email: "samhost@gmail.com",
    password: "host123",
    role: "HOST",
  },
  {
    id: 3,
    name: "Guest User",
    email: "guest@gmail.com",
    password: "guest123",
    role: "GUEST",
  },
];
const analyticsData = [
  { month: "Jan", bookings: 4, earnings: 420, users: 8 },
  { month: "Feb", bookings: 7, earnings: 690, users: 12 },
  { month: "Mar", bookings: 5, earnings: 540, users: 16 },
  { month: "Apr", bookings: 10, earnings: 920, users: 23 },
  { month: "May", bookings: 13, earnings: 1240, users: 31 },
];

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: listings = [] } = useListings();
  const { messages, sendMessage } = useMessages();

  const [newMessage, setNewMessage] = useState("");

  const createListingMutation = useCreateListing();
  const deleteListingMutation = useDeleteListing();

  const role = user?.role as Role | undefined;
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(usersData);
  const [bookings, setBookings] = useState<Booking[]>(bookingsData);
  const [deletedListingIds, setDeletedListingIds] = useState<number[]>([]);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "GUEST" as Role,
  });

  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    location: "",
    pricePerNight: "",
    guests: "",
    type: "APARTMENT",
    amenities: "",
    image: "",
  });

  const isAdmin = role === "ADMIN";
  const isHost = role === "HOST";
  const isGuest = role === "GUEST";

  const localGuestBookings = useMemo(() => {
    if (!isGuest) return [];

    const raw = localStorage.getItem("bookings");
    const savedBookings = raw ? JSON.parse(raw) : [];

    return savedBookings
      .filter((item: any) => !item.userEmail || item.userEmail === user?.email)
      .map((item: any) => ({
        id: item.id,
        guest: displayName,
        listing: item.listingTitle || "Selected stay",
        dates: `${item.checkIn} - ${item.checkOut}`,
        guests: item.guests || 1,
        payment:
          item.paymentStatus === "PAID" ? `$${item.price || 0}` : "Unpaid",
        status:
          item.status === "CONFIRMED"
            ? "Confirmed"
            : item.status === "CANCELLED"
              ? "Cancelled"
              : "Pending",
      })) as Booking[];
  }, [displayName, isGuest, user?.email]);

  const visibleListings = useMemo(() => {
    return listings.filter((listing: any) => {
      return !deletedListingIds.includes(Number(listing.id));
    });
  }, [listings, deletedListingIds]);

  const dashboardBookings = isGuest ? localGuestBookings : bookings;
  const { saved } = useFavorites();
  const totalIncome = dashboardBookings
    .filter((booking) => booking.status === "Confirmed")
    .reduce((sum, booking) => {
      const amount = Number(String(booking.payment).replace("$", ""));
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);

  const filteredListings = useMemo(() => {
    const search = query.toLowerCase().trim();

    return visibleListings.filter((listing: any) => {
      if (!search) return true;

      return (
        listing.title?.toLowerCase().includes(search) ||
        listing.location?.toLowerCase().includes(search)
      );
    });
  }, [visibleListings, query]);

  const filteredBookings = dashboardBookings.filter((booking) => {
    const search = query.toLowerCase().trim();
    if (!search) return true;

    return (
      booking.guest.toLowerCase().includes(search) ||
      booking.listing.toLowerCase().includes(search) ||
      booking.status.toLowerCase().includes(search)
    );
  });

  const filteredUsers = adminUsers.filter((item) => {
    const search = query.toLowerCase().trim();
    if (!search) return true;

    return (
      item.name.toLowerCase().includes(search) ||
      item.email.toLowerCase().includes(search) ||
      item.role.toLowerCase().includes(search)
    );
  });

  const generateDescription = async () => {
    if (!newListing.title || !newListing.location) {
      alert("Please enter title and location first");
      return;
    }

    try {
      setGeneratingDescription(true);

      const prompt = `
Create a professional Airbnb listing description.

Title: ${newListing.title}
Location: ${newListing.location}
Type: ${newListing.type}
Guests: ${newListing.guests || "Not specified"}
Amenities: ${newListing.amenities || "Not specified"}

Make it short, attractive, modern, and professional.
`;

      const response = await aiChatRequest(prompt);

      const generatedText =
        response?.reply ??
        response?.message ??
        response?.data?.reply ??
        response?.data?.message ??
        "";

      if (!generatedText) {
        alert("AI did not return a description");
        return;
      }

      setNewListing((current) => ({
        ...current,
        description: generatedText,
      }));
    } catch {
      alert("Failed to generate description");
    } finally {
      setGeneratingDescription(false);
    }
  };

  const createUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill all fields");
      return;
    }

    setAdminUsers((current) => [
      ...current,
      {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      },
    ]);

    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "GUEST",
    });
  };

  const createListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !newListing.title ||
      !newListing.description ||
      !newListing.location ||
      !newListing.pricePerNight ||
      !newListing.guests ||
      !newListing.image
    ) {
      alert("Please fill all listing fields");
      return;
    }

    const listing = {
      title: newListing.title,
      description: newListing.description,
      location: newListing.location,
      pricePerNight: Number(newListing.pricePerNight),
      guests: Number(newListing.guests),
      type: newListing.type as "APARTMENT" | "HOUSE" | "VILLA" | "CABIN",
      amenities: newListing.amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      image: newListing.image,
    };

    try {
      await createListingMutation.mutateAsync(listing);
      alert("Listing created successfully");

      setNewListing({
        title: "",
        description: "",
        location: "",
        pricePerNight: "",
        guests: "",
        type: "APARTMENT",
        amenities: "",
        image: "",
      });

      setActiveSection("listings");
    } catch (error) {
      console.error("CREATE LISTING ERROR:", error);
      alert("Failed to create listing");
    }
  };

  const deleteUser = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?",
    );
    if (!confirmed) return;

    setAdminUsers((current) => current.filter((item) => item.id !== id));
  };

  const confirmBooking = (id: number) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "Confirmed" } : booking,
      ),
    );
  };

  const cancelBooking = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?",
    );

    if (!confirmed) return;

    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "Cancelled" } : booking,
      ),
    );
  };

  const deleteListing = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?",
    );

    if (!confirmed) return;

    try {
      await deleteListingMutation.mutateAsync(id);
      setDeletedListingIds((current) => [...current, id]);
      alert("Listing deleted successfully");
    } catch (error) {
      console.error("DELETE LISTING ERROR:", error);
      alert("Failed to delete listing");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <main className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div>
          <Link to="/" className="sidebar-logo">
            <div className="logo-icon">
              <FaHome />
            </div>
            <h2>Stays</h2>
          </Link>

          <p className="sidebar-title">
            {isAdmin ? "Admin Panel" : isHost ? "Host Panel" : "Guest Panel"}
          </p>

          <nav className="sidebar-nav">
            <button
              className={activeSection === "overview" ? "active" : ""}
              onClick={() => setActiveSection("overview")}
            >
              <FaChartLine /> Overview
            </button>

            {isAdmin && (
              <>
                <button
                  className={activeSection === "users" ? "active" : ""}
                  onClick={() => setActiveSection("users")}
                >
                  <FaUsers /> Users
                </button>

                <button
                  className={activeSection === "listings" ? "active" : ""}
                  onClick={() => setActiveSection("listings")}
                >
                  <FaBuilding /> Listings
                </button>

                <button
                  className={activeSection === "bookings" ? "active" : ""}
                  onClick={() => setActiveSection("bookings")}
                >
                  <FaCalendarCheck /> Bookings
                </button>
              </>
            )}

            {isHost && (
              <>
                <button
                  className={activeSection === "listings" ? "active" : ""}
                  onClick={() => setActiveSection("listings")}
                >
                  <FaBuilding /> My Listings
                </button>

                <button
                  className={activeSection === "bookings" ? "active" : ""}
                  onClick={() => setActiveSection("bookings")}
                >
                  <FaCalendarCheck /> Reservations
                </button>

                <button
                  className={activeSection === "earnings" ? "active" : ""}
                  onClick={() => setActiveSection("earnings")}
                >
                  <FaMoneyBillWave /> Earnings
                </button>
              </>
            )}

            {isGuest && (
              <>
                <button
                  className={activeSection === "trips" ? "active" : ""}
                  onClick={() => setActiveSection("trips")}
                >
                  <FaSuitcase /> My Trips
                </button>

                <button
                  className={activeSection === "saved" ? "active" : ""}
                  onClick={() => setActiveSection("saved")}
                >
                  <FaHeart /> Saved Homes
                </button>
              </>
            )}

            <button
              className={activeSection === "messages" ? "active" : ""}
              onClick={() => setActiveSection("messages")}
            >
              <FaEnvelope /> Messages
            </button>

            <button
              className={activeSection === "settings" ? "active" : ""}
              onClick={() => setActiveSection("settings")}
            >
              <FaCog /> Settings
            </button>
          </nav>
        </div>

        <button className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <div className="dashboard-topbar">
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dashboard..."
            />
          </form>
        </div>

        {activeSection === "overview" && (
          <section className="dashboard-card-hero">
            <div className="dashboard-welcome-card">
              <span>{role} Dashboard</span>
              <h1>Welcome back, {displayName}</h1>
              <p>
                {isAdmin &&
                  "Manage users, listings, bookings, and platform activity from one clean dashboard."}
                {isHost &&
                  "Track your listings, reservations, and earnings from one professional workspace."}
                {isGuest &&
                  "View your trips, saved homes, payments, and account activity from one simple dashboard."}
              </p>
            </div>

            <div className="dashboard-action-grid">
              {isAdmin && (
                <>
                  <button onClick={() => setActiveSection("users")}>
                    <FaUsers />
                    <strong>{adminUsers.length}</strong>
                    <span>Total Users</span>
                  </button>

                  <button onClick={() => setActiveSection("listings")}>
                    <FaBuilding />
                    <strong>{visibleListings.length}</strong>
                    <span>Total Listings</span>
                  </button>

                  <button onClick={() => setActiveSection("bookings")}>
                    <FaCalendarCheck />
                    <strong>{dashboardBookings.length}</strong>
                    <span>Total Bookings</span>
                  </button>

                  <button onClick={() => setActiveSection("users")}>
                    <FaUserPlus />
                    <strong>Add</strong>
                    <span>Create User</span>
                  </button>

                  <button onClick={() => setActiveSection("createListing")}>
                    <FaPlus />
                    <strong>Add</strong>
                    <span>Create Listing</span>
                  </button>
                </>
              )}

              {isHost && (
                <>
                  <button onClick={() => setActiveSection("listings")}>
                    <FaBuilding />
                    <strong>{visibleListings.length}</strong>
                    <span>Listings Created</span>
                  </button>

                  <button onClick={() => setActiveSection("bookings")}>
                    <FaCalendarCheck />
                    <strong>{dashboardBookings.length}</strong>
                    <span>Reservations</span>
                  </button>

                  <button onClick={() => setActiveSection("earnings")}>
                    <FaMoneyBillWave />
                    <strong>${totalIncome}</strong>
                    <span>Total Earnings</span>
                  </button>

                  <button onClick={() => setActiveSection("createListing")}>
                    <FaPlus />
                    <strong>Add</strong>
                    <span>Create Listing</span>
                  </button>
                </>
              )}

              {isGuest && (
                <>
                  <button onClick={() => setActiveSection("trips")}>
                    <FaSuitcase />
                    <strong>{dashboardBookings.length}</strong>
                    <span>My Bookings</span>
                  </button>

                  <button onClick={() => setActiveSection("saved")}>
                    <FaHeart />
                    <strong>{saved.length}</strong>
                    <span>Saved Homes</span>
                  </button>

                  <button onClick={() => navigate("/")}>
                    <FaHome />
                    <strong>Explore</strong>
                    <span>Find Listings</span>
                  </button>

                  <button onClick={() => setActiveSection("settings")}>
                    <FaStar />
                    <strong>4.8</strong>
                    <span>Guest Rating</span>
                  </button>
                </>
              )}
            </div>

            {isAdmin && (
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>
                    {isGuest
                      ? "Trip Activity"
                      : isHost
                        ? "Reservations Growth"
                        : "Platform Bookings"}
                  </h3>

                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="bookings" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="analytics-card">
                  <h3>
                    {isGuest
                      ? "Spending Trend"
                      : isHost
                        ? "Earnings Trend"
                        : "User Growth"}
                  </h3>

                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey={isAdmin ? "users" : "earnings"}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>
        )}

        {activeSection === "createListing" && (isAdmin || isHost) && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>Create New Listing</h3>
            </div>

            <form className="create-listing-form" onSubmit={createListing}>
              <label>
                Title
                <input
                  value={newListing.title}
                  onChange={(e) =>
                    setNewListing({ ...newListing, title: e.target.value })
                  }
                  placeholder="Forest Retreat Cabin"
                />
              </label>

              <label>
                Description
                <button
                  type="button"
                  className="generate-ai-btn"
                  onClick={generateDescription}
                  disabled={generatingDescription}
                >
                  <FaMagic />{" "}
                  {generatingDescription ? "Generating..." : "Generate with AI"}
                </button>
                <textarea
                  value={newListing.description}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      description: e.target.value,
                    })
                  }
                  placeholder="Quiet nature cabin surrounded by forest..."
                />
              </label>

              <label>
                Location
                <input
                  value={newListing.location}
                  onChange={(e) =>
                    setNewListing({ ...newListing, location: e.target.value })
                  }
                  placeholder="Nyungwe"
                />
              </label>

              <label>
                Price Per Night
                <input
                  type="number"
                  value={newListing.pricePerNight}
                  onChange={(e) =>
                    setNewListing({
                      ...newListing,
                      pricePerNight: e.target.value,
                    })
                  }
                  placeholder="140"
                />
              </label>

              <label>
                Guests
                <input
                  type="number"
                  value={newListing.guests}
                  onChange={(e) =>
                    setNewListing({ ...newListing, guests: e.target.value })
                  }
                  placeholder="4"
                />
              </label>

              <label>
                Type
                <select
                  value={newListing.type}
                  onChange={(e) =>
                    setNewListing({ ...newListing, type: e.target.value })
                  }
                >
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CABIN">Cabin</option>
                </select>
              </label>

              <label>
                Amenities
                <input
                  value={newListing.amenities}
                  onChange={(e) =>
                    setNewListing({ ...newListing, amenities: e.target.value })
                  }
                  placeholder="wifi, fireplace, forest view, parking"
                />
              </label>

              <label>
                Image URL
                <input
                  value={newListing.image}
                  onChange={(e) =>
                    setNewListing({ ...newListing, image: e.target.value })
                  }
                  placeholder="https://images.unsplash.com/..."
                />
              </label>

              {newListing.image && (
                <img
                  className="listing-preview"
                  src={newListing.image}
                  alt="Listing preview"
                />
              )}

              <button type="submit" disabled={createListingMutation.isPending}>
                {createListingMutation.isPending ? "Saving..." : "Save Listing"}
              </button>
            </form>
          </section>
        )}

        {activeSection === "users" && isAdmin && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>Users & Roles</h3>
            </div>

            <form className="admin-create-user-form" onSubmit={createUser}>
              <input
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="Full name"
              />

              <input
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="Email"
                type="email"
              />

              <input
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                placeholder="Password"
                type="text"
              />

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value as Role })
                }
              >
                <option value="GUEST">Guest</option>
                <option value="HOST">Host</option>
                <option value="ADMIN">Admin</option>
              </select>

              <button type="submit">Add User</button>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.email}</td>
                    <td>{item.password}</td>
                    <td>
                      <span className={`status ${item.role.toLowerCase()}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action danger"
                        disabled={item.role === "ADMIN"}
                        onClick={() => deleteUser(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeSection === "listings" && (isAdmin || isHost) && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>{isAdmin ? "All Listings" : "My Listings"}</h3>

              <button
                type="button"
                onClick={() => setActiveSection("createListing")}
              >
                Create Listing
              </button>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredListings.map((listing: any) => (
                  <tr key={listing.id}>
                    <td>
                      <img
                        className="listing-thumb"
                        src={listing.image || listing.img}
                        alt={listing.title}
                      />
                    </td>
                    <td>{listing.title}</td>
                    <td>{listing.location}</td>
                    <td>${listing.pricePerNight || listing.price}</td>
                    <td>
                      <span className="status active">Active</span>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                      >
                        View
                      </button>

                      <button
                        className="table-action danger"
                        disabled={deleteListingMutation.isPending}
                        onClick={() => deleteListing(Number(listing.id))}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredListings.length === 0 && (
                  <tr>
                    <td colSpan={6}>No listings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {activeSection === "bookings" && (isAdmin || isHost) && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>{isAdmin ? "All Bookings" : "Guest Reservations"}</h3>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Listing</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.guest}</td>
                    <td>{booking.listing}</td>
                    <td>{booking.dates}</td>
                    <td>{booking.guests}</td>
                    <td>{booking.payment}</td>
                    <td>
                      <span
                        className={`status ${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        onClick={() => confirmBooking(booking.id)}
                        disabled={
                          booking.status === "Confirmed" ||
                          booking.status === "Cancelled"
                        }
                      >
                        Confirm
                      </button>

                      <button
                        className="table-action danger"
                        onClick={() => cancelBooking(booking.id)}
                        disabled={booking.status === "Cancelled"}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={7}>No bookings yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {activeSection === "earnings" && isHost && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>Earnings Overview</h3>
            </div>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon green">
                  <FaMoneyBillWave />
                </div>
                <h2>${totalIncome}</h2>
                <p>Total confirmed earnings</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <FaCalendarCheck />
                </div>
                <h2>
                  {
                    dashboardBookings.filter(
                      (booking) => booking.status === "Confirmed",
                    ).length
                  }
                </h2>
                <p>Confirmed reservations</p>
              </div>

              <div className="stat-card">
                <div className="stat-icon yellow">
                  <FaStar />
                </div>
                <h2>4.9</h2>
                <p>Host rating</p>
              </div>
            </section>
          </section>
        )}

        {activeSection === "trips" && isGuest && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>My Trips</h3>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Dates</th>
                  <th>Guests</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.listing}</td>
                    <td>{booking.dates}</td>
                    <td>{booking.guests}</td>
                    <td>{booking.payment}</td>
                    <td>
                      <span
                        className={`status ${booking.status.toLowerCase()}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={5}>No bookings yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {activeSection === "saved" && (isGuest || isHost) && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>Saved Homes</h3>
            </div>

            {saved.length === 0 ? (
              <div className="dashboard-empty">
                <FaHeart />
                <h3>No saved homes yet</h3>
                <p>
                  Browse listings and save homes you like for your next trip.
                </p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {saved.map((item) => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>
                        <button
                          className="table-action"
                          onClick={() => navigate(`/listings/${item.id}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {activeSection === "messages" && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>Messages</h3>
            </div>

            <div className="messages-box">
              {messages.length === 0 ? (
                <div className="dashboard-empty">
                  <FaEnvelope />
                  <h3>No messages yet</h3>
                </div>
              ) : (
                messages
                  .filter((msg) => {
                    if (isAdmin) return true;

                    if (isGuest) {
                      return (
                        msg.sender === user?.name ||
                        msg.sender === user?.email ||
                        msg.receiver === user?.name ||
                        msg.receiver === user?.email ||
                        msg.receiver === "Guest"
                      );
                    }

                    if (isHost) {
                      return (
                        msg.receiver === "Host" ||
                        msg.sender === "Host" ||
                        msg.sender === user?.name ||
                        msg.sender === user?.email ||
                        msg.receiver === user?.name ||
                        msg.receiver === user?.email
                      );
                    }

                    return false;
                  })
                  .map((msg) => (
                    <div key={msg.id} className="message-card">
                      <strong>{msg.sender}</strong>

                      <p>{msg.text}</p>

                      <small>{new Date(msg.createdAt).toLocaleString()}</small>
                    </div>
                  ))
              )}

              {!isAdmin && (
                <div className="message-compose">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write message..."
                  />

                  <button
                    onClick={() => {
                      if (!newMessage) return;

                      sendMessage(
                        user?.name || user?.email || "",
                        isGuest ? "Host" : "Guest",
                        newMessage,
                        isGuest ? "GUEST" : "HOST",
                      );

                      setNewMessage("");
                    }}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === "settings" && (
          <section className="reservation-table">
            <div className="table-header">
              <h3>Account Settings</h3>
            </div>

            <div className="settings-grid">
              <label>
                Name
                <input value={displayName} readOnly />
              </label>

              <label>
                Email
                <input value={user?.email || ""} readOnly />
              </label>

              <label>
                Role
                <input value={role || ""} readOnly />
              </label>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
