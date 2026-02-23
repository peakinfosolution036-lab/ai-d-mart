# AI D Mart - Next.js 14 Application

## Overview

This application has been fully converted from Vite + React to **Next.js 14** with the App Router. The application is a Digital India Platform connecting rural India to the future economy with FinTech, E-Commerce, and utility services.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Font**: Plus Jakarta Sans (Google Fonts)

## Project Structure

```
ai-d-mart/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Home page (Landing)
│   │   ├── globals.css         # Global styles
│   │   ├── login/              # Login page route
│   │   ├── register/           # Registration page route
│   │   ├── about/              # About page route
│   │   ├── dashboard/          # Dashboard page route
│   │   └── forgot-password/    # Forgot password route
│   ├── components/             # React components
│   │   ├── AppLayout.tsx       # Main layout with navigation
│   │   ├── LandingPage.tsx     # Landing page sections
│   │   └── ...                 # Other components
│   ├── context/                # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── DataContext.tsx     # Application data state
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts
│   └── constants/              # Application constants
│       └── index.ts
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts

```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- next
- react & react-dom
- typescript
- tailwindcss
- lucide-react

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production

```bash
npm run build
```

### 4. Start Production Server

```bash
npm start
```

## Key Features

### 🎨 Modern UI/UX
- Custom cursor animation (desktop only)
- Scroll-based reveal animations
- Responsive design (mobile-first)
- Glassmorphism effects
- Smooth transitions and micro-animations

### 🔐 Authentication
- Role-based authentication (Customer/Admin)
- Protected routes
- Login/Register flows
- Password recovery

### 📱 Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, services, and footer |
| `/about` | About the platform |
| `/login` | User login (Customer/Admin) |
| `/register` | New user registration |
| `/dashboard` | User dashboard (protected) |
| `/forgot-password` | Password recovery |

### 🎯 Components

- **LandingPage**: Hero section, bento grid, services stack, marquee, footer
- **AppLayout**: Responsive navigation header
- **Login**: Authentication with role selection
- **Registration**: Multi-step registration form
- **Dashboard**: Customer and Admin dashboards

### 🔄 State Management

- **AuthContext**: Manages user authentication state and role
- **DataContext**: Manages application data (events, products, jobs, offers, rewards, users)

## Migration from Vite to Next.js

### Key Changes

1. **Routing**: 
   - ❌ React Router DOM → ✅ Next.js App Router
   - File-based routing in `src/app/`

2. **Navigation**:
   - ❌ `<Link to="">` → ✅ `<Link href="">`
   - ❌ `useNavigate()` → ✅ `useRouter()` from `next/navigation`

3. **Client Components**:
   - Added `'use client'` directive to components using hooks or browser APIs

4. **Image Optimization**:
   - Configured for Unsplash images in `next.config.js`

5. **Fonts**:
   - Using Next.js font optimization with Google Fonts

6. **Styling**:
   - Tailwind CSS configured for Next.js
   - Global styles in `src/app/globals.css`

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=your_api_url
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

Build the production bundle:

```bash
npm run build
```

Then deploy the `.next` folder with a Node.js server.

## Development Notes

- The application uses TypeScript for type safety
- All components are properly typed
- Responsive design breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Custom animations defined in Tailwind config and global CSS

## Remaining Tasks

The following components from the original Vite app need to be migrated to Next.js pages:

- [ ] Create `/src/app/login/page.tsx`
- [ ] Create `/src/app/register/page.tsx`
- [ ] Create `/src/app/about/page.tsx`
- [ ] Create `/src/app/dashboard/page.tsx`
- [ ] Create `/src/app/forgot-password/page.tsx`
- [ ] Move remaining components from `/components` to `/src/components`

## License

Private - Devaramane Events and Industries

## Support

For issues or questions, contact the development team.

---

**Made in Bharat 🇮🇳**
