#!/usr/bin/env bash
#
# Archive the iOS app and upload it to App Store Connect / TestFlight.
# Uses an App Store Connect API key for auth + automatic signing, so it needs no
# Apple ID password and no Xcode GUI. Re-run it for every beta build (the build
# number auto-increments from the timestamp).
#
# Required environment variables (none are stored in this repo):
#   TEAM_ID        Apple Developer Team ID (10 chars, e.g. A1B2C3D4E5)
#   ASC_KEY_ID     App Store Connect API Key ID
#   ASC_ISSUER_ID  App Store Connect API Issuer ID (a UUID)
#   ASC_KEY_PATH   absolute path to the downloaded AuthKey_XXXXXX.p8
# Optional:
#   BUILD_NUMBER   CFBundleVersion to stamp (default: current timestamp)
#
# Example:
#   TEAM_ID=A1B2C3D4E5 ASC_KEY_ID=ABC123 ASC_ISSUER_ID=...uuid... \
#   ASC_KEY_PATH=~/asc/AuthKey_ABC123.p8 ./native/ios-testflight.sh
set -euo pipefail

cd "$(dirname "$0")/.."

: "${TEAM_ID:?set TEAM_ID (Apple Developer Team ID)}"
: "${ASC_KEY_ID:?set ASC_KEY_ID (App Store Connect API Key ID)}"
: "${ASC_ISSUER_ID:?set ASC_ISSUER_ID (App Store Connect API Issuer ID)}"
: "${ASC_KEY_PATH:?set ASC_KEY_PATH (path to AuthKey_*.p8)}"
BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}"

export LANG=en_US.UTF-8
ARCHIVE="build/Astrada.xcarchive"
EXPORT_DIR="build/export"
PLIST="build/ExportOptions.plist"
mkdir -p build

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>${TEAM_ID}</string>
  <key>signingStyle</key><string>automatic</string>
  <key>uploadSymbols</key><true/>
</dict>
</plist>
EOF

echo "→ Archiving Astrada (build ${BUILD_NUMBER})…"
xcodebuild \
  -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -archivePath "$ARCHIVE" \
  DEVELOPMENT_TEAM="$TEAM_ID" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$ASC_KEY_PATH" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyIssuerID "$ASC_ISSUER_ID" \
  clean archive

echo "→ Exporting + uploading to App Store Connect…"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$PLIST" \
  -allowProvisioningUpdates \
  -authenticationKeyPath "$ASC_KEY_PATH" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyIssuerID "$ASC_ISSUER_ID"

echo "✅ Uploaded. It'll appear in App Store Connect → TestFlight in a few minutes (after processing)."
