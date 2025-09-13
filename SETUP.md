# File Storage App Setup Guide

## Quick Setup for Vercel Blob Storage

### 1. Get Your Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project or create a new one
3. Go to Settings → Environment Variables
4. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your Vercel Blob token (get it from Vercel Blob settings)

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

### 5. Test the Application

1. Open http://localhost:3000
2. Try uploading a file
3. Check if files appear in the list
4. Test deleting files

## Troubleshooting

### Files Not Appearing After Upload

1. **Check Environment Variables**: Make sure `BLOB_READ_WRITE_TOKEN` is set correctly
2. **Check Console Logs**: Look for error messages in the browser console
3. **Check Network Tab**: Verify API calls are successful

### Common Issues

- **"Blob storage not configured"**: Set up your `BLOB_READ_WRITE_TOKEN`
- **SSL Certificate Errors**: This is normal during development, files should still work
- **Files disappear after refresh**: Check if the token has proper permissions

## Features

- ✅ **File Upload**: Drag & drop or click to upload files
- ✅ **File Viewing**: See all uploaded files in list or calendar view
- ✅ **File Download**: Click download button to get files
- ✅ **File Deletion**: Delete files with confirmation
- ✅ **Real-time Updates**: Files appear immediately after upload
- ✅ **Error Handling**: Clear error messages for all operations

## File Types Supported

- HTML files (.html, .htm)
- PDF files (.pdf)
- Python files (.py)
- Text files (.txt)
- JSON files (.json)
- CSS files (.css)
- JavaScript files (.js)
- TypeScript files (.ts)
- React files (.jsx, .tsx)
