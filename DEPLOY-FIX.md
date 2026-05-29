# Fixing the Amplify "required-server-files.json" error

Your BUILD succeeds and produces a STATIC site (route table shows only `/`
and `/_not-found`). The error happens AFTER the build, because Amplify is
still configured as a Next.js **SSR** app and looks for a file that a static
export never creates. This is a console/platform setting, not a code problem.

Pick ONE of the two fixes below.

## Fix A — Make Amplify treat the app as static (Git auto-build keeps working)

1. Amplify console → your app → **Hosting → Build settings → Edit**.
2. Confirm the YAML there matches this repo's `amplify.yml`, especially:
       artifacts:
         baseDirectory: out      <-- MUST be `out`, not `.next`
3. Save.
4. App settings → **General settings** → if there is a **Platform** field set
   to "Web Compute" or "Next.js - SSR", change it to **"Web"** (static). Save.
5. Click **Redeploy this version**.

If it STILL errors on required-server-files.json, the app has cached the SSR
platform. Use Fix B.

## Fix B — Manual static deploy (bypasses Amplify's framework detection)

This always works because you hand Amplify finished static files.

1. Locally:
       npm install
       npm run build        # creates the `out/` folder
2. Zip the **contents** of `out/` (not the folder itself):
       cd out && zip -r ../niyamfin-static.zip . && cd ..
3. Amplify console → **New app → Deploy without Git provider** (or, on the
   existing app, the manual "Drag and drop" deploy option).
4. Drag in `niyamfin-static.zip` (or the `out` folder).
5. Done — it serves the static files directly, no SSR detection involved.

## Even simpler alternative: Netlify or Vercel
Either hosts this static export with zero config:
- Vercel: `npx vercel --prod` from the repo root.
- Netlify: drag the `out/` folder onto https://app.netlify.com/drop
