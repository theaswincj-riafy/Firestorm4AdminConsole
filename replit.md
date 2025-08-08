# replit.md

## Overview

This is a full-stack web application built as an admin console for managing referral configurations. The application allows administrators to create and manage apps with their associated referral settings through both a visual UI editor and a JSON editor. The system supports CRUD operations on app metadata and dynamic configuration management with features like translation and content regeneration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built using React with TypeScript and follows a component-based architecture:

- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management with local state handled by React hooks
- **UI Components**: Shadcn/UI components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for fast development and optimized builds

The application uses a single-page architecture with modular components organized by feature areas (admin console, UI editors, forms).

### Backend Architecture

The backend follows a minimal Express.js structure:

- **Framework**: Express.js with TypeScript
- **Architecture Pattern**: Simple REST API with route registration pattern
- **Data Layer**: Currently uses in-memory storage with an interface-based design for easy database integration
- **Development**: Vite integration for hot module replacement during development

The storage layer is abstracted through an interface (`IStorage`) allowing for easy migration from memory storage to persistent databases.

### Database Design

Currently implements in-memory storage but designed for PostgreSQL integration:

- **ORM**: Drizzle ORM configured for PostgreSQL dialect
- **Schema**: Shared schema definitions using Zod for validation
- **Migration**: Drizzle Kit for database migrations

The schema defines app metadata, configuration structures, and user management with type-safe validation throughout the stack.

### Component Structure

- **Admin Console**: Main dashboard with sidebar navigation and content editing
- **UI Editor**: Visual form-based editor for JSON configuration with auto-generated fields
- **JSON Editor**: Monaco Editor integration for direct JSON editing
- **Form Components**: Reusable form elements with validation using React Hook Form and Zod

### Editor Architecture

The application features a dual-editor approach:

- **UI Editor**: Automatically generates form fields from JSON structure with support for nested objects, arrays, and template variables
- **JSON Editor**: Monaco-based editor with syntax highlighting and validation
- **State Synchronization**: Both editors work on the same data model with real-time updates

## External Dependencies

### UI Libraries
- **Radix UI**: Comprehensive accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: Code editor for JSON editing

### Development Tools
- **Drizzle ORM**: Type-safe database toolkit for PostgreSQL
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation library

### Database
- **Neon Database**: Serverless PostgreSQL (configured via `@neondatabase/serverless`)
- **Connection Pooling**: PostgreSQL session management via `connect-pg-simple`

### Build & Development
- **Vite**: Build tool and development server
- **TypeScript**: Type checking and development experience
- **ESBuild**: Fast JavaScript bundler for production builds

The application is designed to be deployed as a single full-stack application with the frontend served statically and the backend providing API endpoints.