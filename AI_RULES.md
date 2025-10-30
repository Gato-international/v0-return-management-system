# AI Rules for Return Management System

This document outlines the core technologies and best practices for developing and maintaining the Return Management System.

## Tech Stack Overview

*   **Next.js:** The foundational React framework for building the web application, providing server-side rendering, routing, and API routes.
*   **React:** The primary JavaScript library for constructing interactive user interfaces.
*   **TypeScript:** Employed across the codebase to ensure type safety and improve code quality.
*   **Tailwind CSS:** A utility-first CSS framework used for all styling, enabling rapid and consistent UI development.
*   **shadcn/ui:** A collection of accessible and customizable UI components built on Radix UI and styled with Tailwind CSS.
*   **Radix UI:** Provides unstyled, accessible UI primitives that `shadcn/ui` components are built upon.
*   **Supabase:** Our Backend-as-a-Service solution, handling database (PostgreSQL), authentication, and file storage.
*   **Vercel Blob:** Used specifically for efficient and scalable image storage.
*   **Zod & React Hook Form:** Utilized together for robust form validation and management.
*   **Lucide React:** A library providing a consistent set of SVG icons for the application.
*   **date-fns:** A lightweight and comprehensive library for date manipulation and formatting.
*   **bcryptjs & jose:** Essential for secure authentication, handling password hashing and JSON Web Token (JWT) management respectively.

## Library Usage Guidelines

To maintain consistency, performance, and readability, please adhere to the following rules when developing:

*   **UI Components:**
    *   **Always** prioritize using components from `shadcn/ui` for all UI elements.
    *   If a required component is not available in `shadcn/ui` or needs significant customization, create a **new, dedicated component file** in `src/components/` and style it using Tailwind CSS.
    *   **Never** directly modify the source files of `shadcn/ui` components.
*   **Styling:**
    *   **Exclusively** use Tailwind CSS utility classes for all styling. Avoid custom CSS files, inline styles, or other CSS-in-JS solutions unless absolutely necessary and explicitly approved.
*   **Icons:**
    *   **Always** use icons from the `lucide-react` library.
*   **Forms & Validation:**
    *   **Always** use `react-hook-form` for managing form state and submissions.
    *   **Always** use `zod` for defining form schemas and performing validation.
*   **Date Handling:**
    *   **Always** use `date-fns` for any date parsing, formatting, or manipulation tasks.
*   **Backend & Database Interactions:**
    *   **Supabase** is the designated backend service. All database queries, authentication flows, and storage operations should be performed using the Supabase client.
    *   Utilize Next.js Server Actions for server-side logic that interacts with Supabase.
*   **Image Uploads:**
    *   **Always** use `@vercel/blob` for handling image uploads to ensure consistency and leverage the existing integration.
*   **Authentication:**
    *   `bcryptjs` is used for hashing user passwords.
    *   `jose` is used for creating and verifying JSON Web Tokens (JWTs) for session management.
*   **State Management:**
    *   For local component state, use React's `useState` and `useReducer` hooks.
    *   For global state, consider passing props or using React Context for simpler scenarios. Avoid complex global state management libraries unless a clear need arises.