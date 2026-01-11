# RallyHQ - app

RallyHQ app is a modern app to manage the rally

## Colors
http://coolors.co/c9dfec-fffcf9-5171a5-ec325a

## ✨ Features

### 🎨 Modern UI/UX
- **Beautiful Design System**: Built with Tailwind CSS and shadcn/ui
- **Dark Mode**: Seamless dark/light theme support
- **Responsive Design**: Mobile-first approach with responsive components
- **Animations**: Smooth transitions and micro-interactions using Framer Motion
- **Gradient Effects**: Modern gradient designs for visual appeal

### 🛠️ Technical Features
- **TypeScript**: Type-safe code with modern TypeScript features
- **React 18**: Latest React features and concurrent rendering
- **Tailwind CSS**: Utility-first CSS framework for rapid development
- **Vite**: Lightning-fast build tool and development server
- **PWA Support**: Progressive Web App capabilities
- **SEO Optimized**: Built-in SEO components and meta tags

### 🔒 Authentication & Security
- **Authentication**: Ready-to-use auth system
- **Protected Routes**: Secure route handling
- **API Security**: Built-in security best practices
- **Environment Variables**: Secure configuration management

### 📦 State Management & Data
- **State Management**: Efficient state handling
- **API Integration**: Ready for backend integration
- **Data Fetching**: Modern data fetching patterns
- **Form Handling**: Advanced form validation and handling

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Pnpm** (v8 or higher)

### Installation

1. **Clone the repository**:
   ```sh
   git clone git@github.com:bobg-dp/rallyHQ-web.git
   ```

2. **Navigate to project directory**:
   ```sh
   cd rallyHQ-web
   ```

3. **Install dependencies**:
   ```sh
   pnpm install
   ```

4. **Set up environment variables**:
   ```sh
   cp .env.example .env.local
   ```

   Required environment variables for Supabase integration:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
   # Keep service_role keys server-side only; do NOT add them to the client .env
   ```

   Note: after adding the variables, restart the dev server.

Migration notes:
- If you already have users in your current auth system, plan a migration: either invite users to reset password via email or run a careful migration script server-side. Password hashes cannot be exported/imported to Supabase directly.
- Keep your existing backend running in parallel while migrating traffic to Supabase and ensure token verification middleware accepts Supabase JWTs.

5. **Start development server**:
   ```sh
   pnpm dev
   ```

## 🏗️ Project Structure

```
project/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI components
│   │   ├── custom-ui/    # Custom UI components
│   │   └── partials/     # Layout components
│   ├── features/         # Feature-based modules
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── .env.example          # Environment variables example
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## 🎯 Key Features in Detail

### Authentication System
- Email/Password authentication
- Social login integration
- Protected routes
- Session management

### UI Components
- Modern button styles
- Form components
- Modal dialogs
- Toast notifications
- Loading states
- Error boundaries

### Performance
- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Performance monitoring

### Development
- Hot module replacement
- Type checking
- Linting and formatting
- Git hooks
- CI/CD ready

## 📚 Documentation

### Component Documentation
Each component is documented with:
- Props interface
- Usage examples
- Best practices
- Accessibility guidelines

### Style Guide
- Color system
- Typography
- Spacing
- Component patterns
- Animation guidelines

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Vite](https://vitejs.dev/) for the build tool

