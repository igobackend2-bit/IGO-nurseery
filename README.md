<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dmTes9OnGv271NKuRHQcyNeP10f1Z-BP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. To send real order emails, set `VITE_ORDER_EMAIL_API_URL` in `.env.local` using [.env.example](.env.example) as a guide
4. Run the app:
   `npm run dev`
