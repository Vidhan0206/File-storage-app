# 📁 File Storage App

A modern, responsive file storage application built with Next.js 14, featuring calendar-based organization and cloud storage with Vercel Blob.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vercel Blob](https://img.shields.io/badge/Vercel_Blob-Cloud_Storage-000000?style=for-the-badge&logo=vercel)

## ✨ Features

- 🚀 **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- 📅 **Calendar View** - Organize files by date with interactive calendar
- 📋 **List View** - Browse all files with search and sorting
- 📁 **Drag & Drop Upload** - Intuitive file upload interface
- ☁️ **Cloud Storage** - Secure file storage with Vercel Blob
- 🔍 **Smart Search** - Find files quickly with search functionality
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🎯 **File Type Support** - HTML, PDF, Python, JavaScript, TypeScript, CSS, JSON, and more
- 📊 **File Management** - Download, delete, and organize files easily

## 🖼️ Screenshots

### Calendar View
![Calendar View](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Calendar+View)

### File Upload
![File Upload](https://via.placeholder.com/800x400/10B981/FFFFFF?text=File+Upload+Interface)

### List View
![List View](https://via.placeholder.com/800x400/F59E0B/FFFFFF?text=File+List+View)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vidhan0206/file-storage-app.git
   cd file-storage-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your Vercel Blob token:
   ```env
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Storage:** [Vercel Blob](https://vercel.com/storage/blob)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Handling:** [date-fns](https://date-fns.org/)
- **File Upload:** [React Dropzone](https://react-dropzone.js.org/)

## 📁 Project Structure

```
file-storage-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── files/
│   │   │   └── upload/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       ├── FileUpload.tsx
│       ├── CalendarView.tsx
│       └── FileList.tsx
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy!

3. **Set up Vercel Blob**
   - In Vercel dashboard → Storage
   - Create Blob database
   - Copy the token to environment variables

## 📖 Usage

### Uploading Files
1. Select a date for your files (defaults to today)
2. Drag and drop files or click to select
3. Supported formats: HTML, PDF, Python, JS, TS, CSS, JSON, and more

### Calendar Organization
- Navigate through months using arrow buttons
- Click any date to view files uploaded on that day
- Files are automatically organized by upload date

### File Management
- Search files by name
- Sort by name, date, or size
- Download or delete files directly
- Switch between calendar and list views

## 🔧 API Endpoints

- `GET /api/files` - Retrieve all files
- `POST /api/upload` - Upload new file
- `DELETE /api/files/[id]` - Delete file by ID

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Vercel](https://vercel.com/) for hosting and blob storage
- [Tailwind CSS](https://tailwindcss.com/) for beautiful styling
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the documentation
- Contact the maintainer

---

⭐ **Star this repository if you found it helpful!**