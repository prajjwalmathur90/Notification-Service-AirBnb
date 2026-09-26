# Airbnb Clone - Project Architecture & Technical Report

## 1. Executive Summary
This project is a scalable, backend-focused clone of Airbnb, implemented using a **Microservices Architecture**. By splitting the application into distinct services, it ensures high availability, separation of concerns, and the ability to scale different parts of the system independently (e.g., scaling up the notification service during high email volume without affecting the core inventory service). 

## 2. Global Tech Stack & Tools
Across all microservices, a unified and modern technical stack has been employed to ensure consistency and maintainability:

*   **Runtime & Language:** Node.js, TypeScript
*   **Web Framework:** Express.js (v5)
*   **Database & ORM:** MariaDB paired with **Prisma ORM** (`@prisma/client`, `@prisma/adapter-mariadb`).
*   **Message Broker & Caching:** Redis, **BullMQ** (for reliable, asynchronous job queues).
*   **Validation:** **Zod** for strict, schema-based payload validation.
*   **Logging:** **Winston** with `winston-daily-rotate-file` for robust, persistent logging.
*   **Tooling:** `tsx` for execution, `nodemon` for local development.

---

## 3. Microservices Breakdown

The architecture is divided into three primary microservices:

### A. Core Inventory Service (`AirBnb`)
This service acts as the main inventory and catalog manager for the platform.
*   **Responsibilities:** Managing Hotels, Rooms, and Room Categories.
*   **Architecture:** Follows a standard Controller -> Service -> Repository pattern.
*   **Key Models:** `Hotel`, `Room`, `RoomCategory`.
*   **Purpose:** Exposes APIs for users to browse available hotels and rooms.

### B. Booking Service (`Booking-Service`)
This is the most critical and complex service in the ecosystem. It handles the transaction of securing a room.
*   **Responsibilities:** Processing bookings, managing concurrency, and emitting events.
*   **Key Components:**
    *   **Distributed Locking:** Uses **Redlock** (Redis-based distributed lock) to prevent race conditions (e.g., two users trying to book the same room at the exact same millisecond).
    *   **Idempotency Handling:** Implements Idempotency Keys (`src/utils/idempotency-key`) to ensure that if a request is retried (due to network failure), the user is not double-charged or double-booked.
    *   **Producers:** Enqueues messages (using BullMQ) to an `email.queue` once a booking is confirmed.

### C. Notification Service (`Notification-Service`)
An asynchronous consumer service dedicated entirely to communications.
*   **Responsibilities:** Listening to queues and dispatching emails to users.
*   **Key Components:**
    *   **BullMQ Workers:** Processes jobs placed by the Booking Service.
    *   **Templating:** Uses **Handlebars** (`.hbs`) to render dynamic, visually appealing emails (e.g., `BOOKING_CONFIRMED.hbs`, `welcome.hbs`).
    *   **Mailer:** Uses **Nodemailer** to send out the final emails via SMTP.

---

## 4. Architecture Flow (Booking Example)
1.  **Request:** A user sends a POST request to book a room.
2.  **Correlation ID:** The API gateway/middleware attaches a unique `x-correlation-id` for distributed tracing.
3.  **Concurrency Check:** The Booking Service acquires a `Redlock` on the specific Room ID to prevent double-booking.
4.  **Idempotency Check:** Verifies if the idempotency key has already been processed.
5.  **Database Commit:** The booking is securely saved in MariaDB via Prisma.
6.  **Event Emission:** An event payload is pushed to the BullMQ Redis queue.
7.  **Asynchronous Processing:** The Notification Service picks up the job from the queue.
8.  **Email Dispatch:** Handlebars compiles the `BOOKING_CONFIRMED` template, and Nodemailer sends the confirmation email to the user.

---

## 5. Impressive Points & Engineering Best Practices

*   **Distributed Locking (Redlock):** A massive standout feature. In high-traffic systems like Airbnb, race conditions are a primary source of data corruption (double-booking). Using Redlock ensures absolute data integrity.
*   **Idempotency Keys:** Crucial for payments and bookings. It handles edge cases where client network timeouts prompt retries, guaranteeing safe, idempotent operations.
*   **Event-Driven Decoupling:** By offloading email processing to a background queue, the Booking Service returns a response to the user incredibly fast, maximizing throughput.
*   **Distributed Tracing Setup:** The presence of `correlation.middleware.ts` implies that requests are tracked across microservices. If an error occurs in the Notification Service, logs can be traced back to the exact API call in the Booking Service using the Correlation ID.
*   **Prisma with MariaDB Adapter:** Using the specific `@prisma/adapter-mariadb` implies optimized driver-level performance for MariaDB, rather than generic SQL drivers.
*   **Production-Ready Logging:** Implementing Winston with Daily Rotate File prevents servers from crashing due to disk-space exhaustion caused by massive monolithic log files.
