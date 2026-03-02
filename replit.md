# ZDSPGC Announcement App

A school announcement mobile application built with Expo + React Native.

## Overview

A role-based school announcement system for **ZDSPGC**. Two roles: Admin and Student, with full CRUD on announcements.

## Tech Stack

- **Frontend**: Expo (SDK 54), React Native, Expo Router (file-based routing)
- **Backend**: Express.js (minimal, for landing page)
- **Storage**: AsyncStorage (local data persistence)
- **Fonts**: Poppins via @expo-google-fonts/poppins
- **State**: React Context (AuthContext + AnnouncementContext)
- **Theme**: Beige & red school theme (#F7EDD8 cream, #C0392B red)

## Architecture

### Authentication
- Role-based: `admin` | `student`
- Default admin: `admin@zdspgc.edu` / `admin123`
- Students can self-register
- Sessions persisted in AsyncStorage

### Announcement Context
- Seeded with 4 sample announcements
- Categories: Academic, Events, Emergency, General
- Full CRUD operations persisted to AsyncStorage

## File Structure

```
app/
  _layout.tsx          # Root layout with providers (Auth + Announcements + Fonts)
  index.tsx            # Auth redirect (login/student/admin based on role)
  login.tsx            # Login screen
  register.tsx         # Student registration
  student/
    _layout.tsx        # Student stack
    index.tsx          # Student dashboard (feed + search + filter)
    announcement/
      [id].tsx         # Announcement detail view
  admin/
    _layout.tsx        # Admin stack
    index.tsx          # Admin dashboard (stats + quick actions)
    add.tsx            # Add announcement form
    manage.tsx         # Manage (list with edit/delete)
    edit/
      [id].tsx         # Edit announcement form

context/
  AuthContext.tsx      # Auth state, login, register, logout
  AnnouncementContext.tsx # Announcements CRUD with AsyncStorage

components/
  AnnouncementCard.tsx # Shared card component (student view + admin manage)
```

## Features

- Login / Register with validation
- Role-based routing (admin → admin dashboard, student → student dashboard)
- Student: announcement feed, search, category filters, pull-to-refresh
- Admin: stats dashboard, add/edit/delete announcements, image upload
- Announcement detail with full content, category badge, metadata
- 4 announcement categories with distinct colors
- Image upload via expo-image-picker (optional per announcement)
- Haptic feedback on key interactions
- Web-compatible with proper inset handling
