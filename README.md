# t2t
#TODO:

## A. Passenger Split

### Purpose

Splits one or more passengers from an existing PNR into a new PNR.

**Use cases**

* Passengers on the same booking require different changes
* Separate payments or ticketing
* Individual itinerary modifications

### Functional Flow

1. Select passenger(s) from the original PNR
2. Create a new PNR
3. Copy to the new PNR:

   * Selected passengers
   * Applicable itinerary segments
   * SSRs (configurable / optional)
4. Update:

   * Passenger-to-PNR mapping
   * Fare recalculation (if applicable)
5. Original PNR retains remaining passengers

### Business Rules

* At least **one passenger must remain** in the original PNR
* Ticketed and ticketless passengers are handled independently
* An audit trail is mandatory (reference to parent PNR)

---

## B. Origin–Destination (OD) Split

### Purpose

Splits itinerary segments (ODs) from an existing PNR into a new PNR.

**Use cases**

* Partial journey changes
* Segment cancellations
* Rebooking part of an itinerary

### Functional Flow

1. Select OD(s) or individual segment(s)
2. Create a new PNR
3. Move selected segments to the new PNR
4. Re-price both PNRs independently
5. Maintain itinerary and fare-rule continuity

### Business Rules

* Flown segments **cannot** be split
* Segment order must remain logically valid
* Taxes, fees, and surcharges must be recalculated

---

## C. Clone PNR

### Purpose

Creates a full or partial copy of an existing PNR.

**Use cases**

* Rebooking scenarios
* What-if pricing analysis
* Group or corporate booking workflows

### Functional Flow

1. Copy from original PNR:

   * Passengers
   * Itinerary
   * SSRs
   * Contact information
2. Generate a new PNR locator
3. Reset:

   * Ticket numbers
   * Payment information
   * Booking status
4. Maintain reference to the source PNR

### Business Rules

* Cloned PNR is always **ticketless**
* No financial data is copied
* Default status is `HOLD` or `NEW`

---

## D. Ticket Issuance (Ticketless → Ticketed)

### Purpose

Converts a ticketless PNR into a ticketed booking.

### Functional Flow

1. Validate:

   * Passenger details
   * Fare rules
   * Payment authorization
2. Generate ticket number(s)
3. Associate ticket numbers with:

   * Passenger(s)
   * Itinerary segment(s)
4. Update PNR status to `TICKETED`
5. Trigger downstream systems:

   * Accounting
   * Departure Control System (DCS)
   * Notifications

### Business Rules

* One ticket per passenger per journey (excluding EMDs)
* Operation must be **atomic** (full rollback on failure)
* Idempotency is required to prevent duplicate ticketing

---

If you want, I can also:

* Add **sequence diagrams**
* Convert this into **API-level documentation**
* Align it with **IATA / NDC terminology**
* Provide **example JSON payloads** for each flow
