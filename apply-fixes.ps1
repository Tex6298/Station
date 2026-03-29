# Run this from C:\Users\adam_\Desktop\Station
# After downloading station-fixes.zip to your Desktop

# Extract the fixed files over the existing ones
Expand-Archive -Path "$HOME\Desktop\station-fixes.zip" -DestinationPath "." -Force

# Delete the conflicting marketing page
$marketingPage = "apps\web\app\(marketing)\page.tsx"
if (Test-Path $marketingPage) {
    Remove-Item $marketingPage
    Write-Host "Deleted conflicting marketing page"
}

# Also remove the push-fixes.sh that got committed by accident
if (Test-Path "push-fixes.sh") {
    Remove-Item "push-fixes.sh"
    Write-Host "Removed push-fixes.sh"
}

# Commit and push
git add -A
git commit -m "fix: resolve all Vercel build failures - actual code fixes"
git push origin main

Write-Host ""
Write-Host "Done! Check Vercel for the new deployment."
