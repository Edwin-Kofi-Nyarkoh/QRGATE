// Common API types
export interface ApiResponse<T> {
  data: T;
  orders?: T[];
  tickets?: T[];
  events?: T[];
  users?: T[];
  securityOfficers?: T[];
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  events: T[];
  orders: T[];
  tickets: T[];
  users: T[];
  securityOfficers: T[];
  totalTickets?: number; // Optional, used in Ticket response
  soldTickets: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  gender: string | null;
  birthday: Date | null;
  role: "USER" | "ADMIN" | "ORGANIZER" | "SECURITY";
  isOrganizer: boolean;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  soldCount: number;
  description?: string;
  eventId: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string;
  startDate: Date;
  eventId: string;
  endDate: Date;
  mainImage: string | null;
  price: number;
  totalTickets: number;
  soldTickets: number;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
  organizer: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  images: EventImage[];
  ticketTypes?: TicketType[];
  _count: {
    tickets: number;
  };
}

export interface EventImage {
  id: string;
  url: string;
  eventId: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  qrCode: string;
  type: string;
  price: number;
  isUsed: boolean;
  usedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  status: string; // "PENDING" | "USED" | "CANCELLED"
  scanned: boolean;
  ticketTypeId?: string;
  ticketType?: TicketType;
  event: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    location: string;
    mainImage: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
  };
  order: {
    id: string;
    total: number;
    status: string;
    createdAt: Date;
  };
}

export interface Order {
  id: string;
  total: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED";
  paymentMethod: string | null;
  paymentId: string | null;
  reference: string | null;
  createdAt: Date;
  updatedAt: Date;
  event: {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    location: string;
    mainImage: string | null;
  };
  tickets: Ticket[];
}

export interface SecurityOfficer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  userId: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  event?: Event;
}

// Request types
export interface CreateEventRequest {
  title: string;
  description?: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  price: number;
  totalTickets: number;
  mainImage?: string;
  organizerId: string;
  images?: string[];
  ticketTypes?: Array<{
    name: string;
    price: number;
    quantity: number;
    description?: string;
  }>;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface CreateOrderRequest {
  eventId: string;
  quantity?: number;
  total?: number;
  ticketTypeId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthday?: string;
  profileImage?: string;
}

export interface EventFilters {
  category?: string;
  status?: string;
  search?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  organizerId?: string; // Added for filtering by organizer
}

export interface CreateSecurityOfficerRequest {
  name: string;
  email: string;
  phone?: string;
  eventId: string;
  userId?: string;
}
