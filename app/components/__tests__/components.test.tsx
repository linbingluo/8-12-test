import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import { createDestination, createTrip, deleteTrip, updateDestination, updateTrip } from "@/app/lib/api";
import { CloseIcon, EditIcon } from "../ActionIcons";
import CreateDestinationModal from "../CreateDestinationModal";
import CreateTripModal from "../CreateTripModel";
import DestinationCard from "../DestinationCard";
import EditDestinationModal from "../EditDestinationModal";
import EditTripModal from "../EditTripModal";
import FavoriteCard from "../FavoriteCard";
import MapView from "../MapView";
import Navbar from "../Navbar";
import Sidebar from "../sidebar";
import StatCard from "../StatCard";
import TripCard from "../TripCard";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  CircleMarker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useMap: () => ({ setView: jest.fn(), fitBounds: jest.fn() }),
}));

jest.mock("leaflet", () => ({
  __esModule: true,
  default: { latLngBounds: jest.fn(() => ({})) },
}));

jest.mock("@/app/lib/api", () => ({
  createDestination: jest.fn(),
  createTrip: jest.fn(),
  updateTrip: jest.fn(),
  deleteTrip: jest.fn(),
  updateDestination: jest.fn(),
}));

describe("frontend components", () => {
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (usePathname as jest.Mock).mockReturnValue("/my-trips");
    Object.defineProperty(window, "confirm", { writable: true, value: jest.fn(() => true) });
    Object.defineProperty(window, "alert", { writable: true, value: jest.fn() });
    Object.defineProperty(window, "fetch", {
      writable: true,
      value: jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ location: { lat: 48.8566, lon: 2.3522 } }),
      }),
    });
    localStorage.clear();
  });

  it("renders action icons", () => {
    const { container } = render(
      <div>
        <EditIcon />
        <CloseIcon />
      </div>
    );
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("renders stat card", () => {
    render(<StatCard label="Trips" value={7} color="blue" />);
    expect(screen.getByText("Trips")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("renders destination card and triggers actions", () => {
    const onEdit = jest.fn();
    const onDeleted = jest.fn();
    const onFavorite = jest.fn();

    render(
      <DestinationCard
        id={1}
        image_url="https://example.com/paris.jpg"
        name="Paris"
        description="City guide"
        rating={4}
        country="France"
        tags="culture, food"
        status="wishlist"
        onEdit={onEdit}
        onDeleted={onDeleted}
        onFavorite={onFavorite}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    fireEvent.click(screen.getByRole("button", { name: "Favorite" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
    expect(onFavorite).toHaveBeenCalledTimes(1);
  });

  it("renders favorite card and triggers actions", () => {
    const onEdit = jest.fn();
    const onDeleted = jest.fn();

    render(
      <FavoriteCard
        id={1}
        name="Kyoto"
        city="Kyoto"
        category="Culture"
        rating={5}
        country="Japan"
        saved_at="2026-08-10"
        image_url="https://example.com/kyoto.jpg"
        onEdit={onEdit}
        onDeleted={onDeleted}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it("handles trip card edit, delete and select", async () => {
    const onEdit = jest.fn();
    const onDeleted = jest.fn();
    const onSelectionChange = jest.fn();
    (deleteTrip as jest.Mock).mockResolvedValue({});

    const { rerender } = render(
      <TripCard
        id={3}
        title="Paris Trip"
        dateRange="2026-06-01 ~ 2026-06-10"
        destinations={4}
        budget={1200}
        rating={5}
        status="ongoing"
        onEdit={onEdit}
        onDeleted={onDeleted}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(deleteTrip).toHaveBeenCalledWith(3));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDeleted).toHaveBeenCalledTimes(1);

    rerender(
      <TripCard
        id={3}
        title="Paris Trip"
        dateRange="2026-06-01 ~ 2026-06-10"
        destinations={4}
        budget={1200}
        rating={5}
        status="ongoing"
        isSelectMode
        isSelected={false}
        onSelectionChange={onSelectionChange}
      />
    );

    fireEvent.click(screen.getByRole("checkbox"));
    expect(onSelectionChange).toHaveBeenCalledWith(true);
  });

  it("submits create destination modal", async () => {
    const onClose = jest.fn();
    const onCreated = jest.fn();
    (createDestination as jest.Mock).mockResolvedValue({});

    render(<CreateDestinationModal isOpen onClose={onClose} onCreated={onCreated} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Paris"), { target: { value: "Paris" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(createDestination).toHaveBeenCalled());
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits edit destination modal", async () => {
    const onClose = jest.fn();
    const onUpdated = jest.fn();
    (updateDestination as jest.Mock).mockResolvedValue({});

    render(
      <EditDestinationModal
        isOpen
        onClose={onClose}
        onUpdated={onUpdated}
        destination={{
          id: 5,
          name: "Rome",
          description: "Old city",
          rating: 4,
          country: "Italy",
          tags: "history",
          status: "planned",
          image_url: "https://example.com/rome.jpg",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    await waitFor(() => expect(updateDestination).toHaveBeenCalledWith(5, expect.any(Object)));
    expect(onUpdated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits create trip modal", async () => {
    const onClose = jest.fn();
    const onTripCreated = jest.fn();
    (createTrip as jest.Mock).mockResolvedValue({});
    localStorage.setItem("user", JSON.stringify({ id: 8, username: "demo", email: "demo@example.com" }));

    render(<CreateTripModal isOpen onClose={onClose} onTripCreated={onTripCreated} />);
    fireEvent.change(screen.getByPlaceholderText("e.g., Paris Trip"), { target: { value: "Trip A" } });
    fireEvent.change(screen.getByPlaceholderText("e.g., 2026-06-01 ~ 2026-06-10"), { target: { value: "2026-01-01~2026-01-03" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => expect(createTrip).toHaveBeenCalled());
    expect(onTripCreated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits edit trip modal", async () => {
    const onClose = jest.fn();
    const onTripUpdated = jest.fn();
    (updateTrip as jest.Mock).mockResolvedValue({});

    render(
      <EditTripModal
        isOpen
        onClose={onClose}
        onTripUpdated={onTripUpdated}
        trip={{
          id: 2,
          title: "Trip B",
          date_range: "2026-02-01~2026-02-05",
          destinations_count: 2,
          budget: 700,
          rating: 4,
          status: "draft",
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(updateTrip).toHaveBeenCalledWith(2, expect.any(Object)));
    expect(onTripUpdated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders navbar with profile and logout", () => {
    localStorage.setItem("user", JSON.stringify({ username: "alice", email: "alice@example.com" }));
    render(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: "👤" }));
    expect(screen.getByText("alice")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "🚪 Logout" }));
    expect(mockReplace).toHaveBeenCalledWith("/");
  });

  it("renders sidebar with menu links", () => {
    render(<Sidebar />);
    expect(screen.getByRole("link", { name: "✈️My Trips" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "🌍Destinations" })).toBeInTheDocument();
  });

  it("renders map view and resolves markers", async () => {
    render(
      <MapView
        destinations={[
          { id: 1, name: "Paris", country: "France" },
          { id: 2, name: "London", country: "UK" },
        ]}
      />
    );

    expect(screen.getByText("Destination Map")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Showing 2 locations")).toBeInTheDocument());
  });
});
