# EyeSense AI 👁️

A responsive, browser-based spectacle prescription reader and eye-care education app built with React + Vite.

## Features
- Upload or capture a photo of an existing spectacle prescription.
- OCR text extraction using Tesseract.js (runs in the browser).
- Manual prescription entry for right and left eyes.
- Plain-language explanation of SPH, CYL, AXIS and ADD.
- General eyewear and lens-care suggestions based on entered values.
- Responsive layout for mobile and desktop.
- No account or backend required.

## Important medical note
EyeSense AI does **not** measure refractive error or diagnose eye conditions. A phone camera cannot reliably determine eye power. OCR may misread numbers, signs, decimal points or columns. Always compare extracted values with the original prescription and confirm them with a qualified optometrist/ophthalmologist before buying or using corrective lenses. Recommendations are general educational information, not medical advice.

## Run locally
1. Install Node.js 18 or newer.
2. Extract this project.
3. Open a terminal in the project folder.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite.

## Build
```bash
npm run build
npm run preview
```

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy.

## Deploy to Netlify
- Build command: `npm run build`
- Publish directory: `dist`

## Privacy
The app does not send prescription data to a custom backend. OCR is performed in the browser using Tesseract.js. The OCR library may download its language data from its configured CDN when first used. Avoid uploading documents containing unrelated personal information.

## OCR tips
- Use a clear, straight, well-lit photo.
- Include the complete prescription table.
- Avoid glare, shadows and blurry text.
- Review every extracted value manually.
