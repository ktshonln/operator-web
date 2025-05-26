# Shapes for different routes
These are examples of what is expected as the request and what should be returned as the response. Left out details assume what is specified in "Internship Report - Week 2"

## Authentication service
This is the authentication service including user registration, login, and agent invitation
### POST/users/auth/register
request shape, the backend fills the branch to 'main' for admin user and role as 'admin'
```typescript
interface RegistrationDetails { // A general Admin, on branch main
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: string; // operator | passenger
  companyName: string;
  companyRegNo: string;
  companyAddress: string;
  companyContact: string;
}
```
User shape
```typescript
interface User { 
  id?: string;
  firstName: string;
  lastName: string;
  userType: string;
  companyId: string;
  role: Role;
  branch:string;
}
```

Response JWT(same as on login) or User shape
```typescript
interface LoggedInUser { // The JWT data
  id?: string;
  firstName: string;
  lastName: string;
  userType: string;
  companyId: string;
  role: Role;
  branch:string; // An agent needs one but for an admin it is not necessary this could default to 'main'
  exp?:number
}
```
! By registering an admin, a company is also created.

### POST/companies/{companyId}/agents
### PUT/companies/{companyId}/agents/{agentId}
request shape
```typescript
interface AgentDetails {
    inviteUserId: string; 
    companyId: string;
    branch: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: Role;
}

type Role = 'admin'| 'agent'| "agentManager"
```
Full agent shape with fields 'filled from the backend' and the query shape
```typescript
interface AgentQuery {
  searchText: string;
}
interface Agent {
    userId:string;
    inviteUserId: string;
    companyId: string;
    branch: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: Role;
    status: string;
    joinedDate: string
}
```
### Bus
Bus details when on POST
```typescript
 interface BusDetails {
    plateNumber: string;
    brand: string;
    model: string;
    seatingCapacity: number;
    assignedDriverId: string;
}
```
Full Bus shape
```typescript
interface Bus {
  busId: string;
  plateNumber: string;
  brand: string;
  model: string;
  year: string;
  vin: string; // Vehicle id
  seatingCapacity: number;
  status: string;
  assignedDriverId: string;
  scheduleId: string; // schedules of the bus
}
```
### Driver
POST details
```typescript
interface DriverDetails {
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  assignedBusId: string;
}
```
Full Driver shape
```typescript
interface Driver {
  driverId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  assignedBusId: string;
  status: string;
}
```
### Routes {/companies/:companyId/routes | /companies/:companyId/routes/{routeId} } 
POST details for a route 
```typescript
interface IntermediateStopDetails {
  name: string;
  price: number;
}

interface RouteDetails {
  route: { start: string; end: string }; // origin stop id and destination id included
  price: number;
  intermediateStops?: IntermediateStopDetails[];
}
```
Full Route shape and query
```typescript
interface RouteQuery {
  searchText: string;
  branch?: string;
}

interface IntermediateStop {
  stopId: string;
  name: string;
  price: number;
}

interface Route { // On GET an array of these is returned
  routeId: string;
  route: { startId: string; start: string; endId: string; end: string }; // origin stop id and destination id included
  price: number;
  intermediateStops: IntermediateStop[];
}
```
### Trips
POST trip shape
```typescript
 interface TripDetails {
    route: { start: string, end: string};
    busId: string;
    express?: boolean;
    departureDateAndTime: string;
    autoScheduling?: boolean
    departureTime?: string;
    scheduleBlock?: ScheduleBlock; // 'day'| 'week' | 'month'
    dayRange?:{from:string, to:string}
    minuteInterval?:number; 
    timeRange?:{from:string, to:string}
}
```
Full Trip Shape and query, on GET an array of Trips is returned
```typescript
export interface TripQuery {
  departureTime: string;
  // The start time and the end time will be sent, if the departure time is within the range or equal in case they are both the same, it will be returned.
  startTime: string;
  endTime: string;
  searchText: string;
  branch?: string;
  status: string;
  busId?: string;
  scheduleId: string; // A schedule id is created when autoScheduled trips have the same scheduleId, this  query param should help get those trips but exclude the parent scheduling trip
  driverId?: string;
}

interface Trip {
  tripId: string;
  scheduleId: string;
  route: { startId: string, start: string, endId: string, end:string}; // origin stop id and destination id included
  departureDateAndTime: string;
  arrivalTime: string;
  price: number;
  busId: string;
  seats: string[];
  status: string;
  express: boolean;
  intermediateStops: string[]; // Fed in the backend after route determination
  departureTime?: string;
  autoScheduling?: boolean
  scheduleBlock?: ScheduleBlock;
  dayRange?:{from:string, to:string}
  minuteInterval?:number; 
  timeRange?:{from:string, to:string}
}

interface Manifest { // GET /companies/{companyId}/trips/{tripId}/manifest
  tripId: string;
  departureTime: string;
  route: string;
  busPlate: string;
  driverName: string;
  manifest: [
    {
      ticketId: string;
      passengerName: string;
      passengerPhone: string;
      seatNumber: string;
      origin: string;
      destination: string;
      timeTaken: string;
      status: string;
    }
  ];
}
```
### Analytics
```typescript
export interface AnalyticsQuery {
  branch?: string ;
  startDate: string;
  endDate: string;
}

interface GeneralAnalytics { // GET /companies/{companyId}/analytics
  companyId: string;
  timeRange: { start: string; end: string };
  totalTripsRun: number;
  totalTicketsSold: number;
  totalRevenue: { amount: number; currency: string };
  averageOccupacy: number;
}

interface PeakTimes { // GET /companies/{companyId}/analytics/peak-times
    peakHours: [
        { hour: number, averageTickets: number },
        { hour: number, averageTickets: number },
      ],
      peakDaysOfWeek: [
        { day: number, dayName: string, averageTickets: number },
        { day: number, dayName: string, averageTickets: number },
      ],
}

interface RevenueAnalytics {// GET /companies/{companyId}/analytics/revenue
  routeId: string;
  routeName: string;
  revenue: string;
}

interface PopularRoute {// GET /companies/{companyId}/analytics/popular-routes An ARRAY of these is returned
  routeId: string;
  routeName: string;
  ticketsSold: number;
  rank: number;
}
```
### Company
Company shape
```typescript
interface Company {
  companyId: string;
  name: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  registrationDate: string;
  branches: string[];
  about: string;
}
```
### Tickets
GET tickets
```typescript
interface TicketQuery {
  branch?: Branch;
  startDate?: string;
  endDate?: string;
  passengerId?: string;
  agentId?: string;
  tripId?: string;
  status?: string;
}


interface TicketResponse { // GET tickets
  query: { tripId: string };
  tickets: Ticket[];
}
export interface Branch {
  name: string;
}

```
Selling a ticket POST ticket
```typescript
export interface TicketSaleDetails {
 passengerName?:string;
 passengerPhone?:string;
 tripId: string;
 originStopId: string;
 destinationStopId: string;
 ticketQuantity: number;
 seatNumber: string | string[];
 userId: string | null; // rename later to agentId or better operatorId
}

 interface TicketSaleResponse {
  ticketId: string;
}

```
Full ticket shape
```typescript
export interface Ticket {
  ticketId: string;
  tripId: string;
  passenger: {
    passengerId: string; // this is possible on the passenger client because they are logged in
    firstName: string;
    lastName: string;
  };
  ticketQuantity:number; // ticket quantity to be added
  seatNumber: number | number[];
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  busId: string; // bus id not plate
  companyId:string; // company id is enough
  pricing: {
    basePrice: number;
    vatIncluded: number;
    serviceFee: number;
    totalCharged: number;
  };
  status: string;
  purchaseTime: string;
  invoice: {
    invoiceNumber: string;
    ebmStatus: string;
    timestamp: string;
  };
  printableTicketUrl: string;
  reminder: string;
  IssuedBy: string;
}
```
