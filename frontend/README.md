# RAG LLM Assistant - Frontend

Frontend aplikasi RAG-based LLM Assistant yang dibangun dengan React, TypeScript, dan Tailwind CSS.

## 🚀 Fitur

- **Modern UI/UX**: Interface yang clean dan responsif dengan Tailwind CSS
- **Real-time Chat**: Chat interaktif dengan AI assistant
- **File Upload**: Upload dokumen PDF dengan drag & drop
- **Document Management**: Kelola dokumen yang telah diupload
- **System Monitoring**: Monitor kesehatan dan statistik sistem
- **Responsive Design**: Optimized untuk desktop dan mobile

## 🛠️ Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **React Query** - Data Fetching
- **React Router** - Routing
- **Framer Motion** - Animations
- **React Hook Form** - Form Management
- **Axios** - HTTP Client

## 📦 Instalasi

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`

3. **Build untuk Production**
   ```bash
   npm run build
   ```

## 🏗️ Struktur Project

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   └── Layout.tsx      # Main layout component
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx    # Landing page
│   │   ├── ChatPage.tsx    # Chat interface
│   │   ├── UploadPage.tsx  # File upload
│   │   ├── DocumentsPage.tsx # Document management
│   │   └── StatsPage.tsx   # System statistics
│   ├── services/           # API services
│   │   └── api.ts         # API client and functions
│   ├── utils/             # Utility functions
│   │   └── cn.ts         # Class name utility
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## 🎨 Design System

### Colors
- **Primary**: Blue tones untuk aksi utama
- **Secondary**: Gray tones untuk teks dan background
- **Success**: Green untuk status berhasil
- **Warning**: Yellow untuk peringatan
- **Error**: Red untuk error states

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Line Heights**: 120% untuk heading, 150% untuk body

### Components
- **Cards**: Rounded corners dengan subtle shadows
- **Buttons**: Primary dan secondary variants
- **Forms**: Clean input fields dengan focus states
- **Animations**: Smooth transitions dengan Framer Motion

## 🔧 Konfigurasi

### Environment Variables
Tidak ada environment variables yang diperlukan untuk frontend. Semua konfigurasi API menggunakan proxy Vite.

### Proxy Configuration
Vite dikonfigurasi untuk mem-proxy request `/api` ke backend Python:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    }
  }
}
```

## 📱 Responsive Design

- **Mobile First**: Design dimulai dari mobile kemudian desktop
- **Breakpoints**: 
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px

## 🔄 State Management

- **React Query**: Untuk server state management
- **Local State**: useState untuk component state
- **Form State**: React Hook Form untuk form management

## 🎯 Performance

- **Code Splitting**: Automatic dengan Vite
- **Lazy Loading**: Components dimuat sesuai kebutuhan
- **Optimized Images**: Menggunakan modern image formats
- **Caching**: React Query untuk API response caching

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Build untuk production
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

### Code Style

- **ESLint**: Untuk code linting
- **Prettier**: Untuk code formatting (opsional)
- **TypeScript**: Strict mode enabled

## 🚀 Deployment

### Build Production

```bash
npm run build
```

Output akan tersedia di folder `dist/`.

### Deployment Options

1. **Static Hosting**: Netlify, Vercel, GitHub Pages
2. **CDN**: CloudFlare, AWS CloudFront
3. **Traditional Hosting**: Apache, Nginx

### Environment Setup

Untuk production, pastikan:
- Backend API berjalan dan accessible
- CORS dikonfigurasi dengan benar
- SSL certificate untuk HTTPS

## 🔍 Troubleshooting

### Common Issues

1. **API Connection Error**
   - Pastikan backend berjalan di port 8000
   - Check proxy configuration di vite.config.ts

2. **Build Errors**
   - Clear node_modules dan reinstall
   - Check TypeScript errors

3. **Styling Issues**
   - Pastikan Tailwind CSS terkonfigurasi dengan benar
   - Check PostCSS configuration

### Debug Mode

Untuk debugging, gunakan browser developer tools:
- **Network Tab**: Monitor API requests
- **Console**: Check JavaScript errors
- **React DevTools**: Inspect component state

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Query Docs](https://tanstack.com/query/latest)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - lihat file LICENSE untuk detail lengkap.