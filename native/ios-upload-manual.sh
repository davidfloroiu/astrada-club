#!/usr/bin/env bash
#
# Archive + upload the iOS app to TestFlight using MANUAL signing.
#
# Unlike ios-testflight.sh (automatic/cloud signing), this uses the existing
# "Apple Distribution" identity in the login keychain + the installed
# "Astrada App Store" provisioning profile. The App target's Release config is
# already set to manual signing in project.pbxproj. The App Store Connect API
# key is used only to authenticate the upload (no Apple ID password needed).
#
# Required env: ASC_KEY_PATH, ASC_KEY_ID, ASC_ISSUER_ID
# Optional env: TEAM_ID (default B99JSUD4HU), BUILD_NUMBER (default: timestamp)
set -euo pipefail
cd "$(dirname "$0")/.."

: "${ASC_KEY_PATH:?set ASC_KEY_PATH}"
: "${ASC_KEY_ID:?set ASC_KEY_ID}"
: "${ASC_ISSUER_ID:?set ASC_ISSUER_ID}"
TEAM_ID="${TEAM_ID:-B99JSUD4HU}"
BUILD_NUMBER="${BUILD_NUMBER:-$(date +%Y%m%d%H%M)}"

export LANG=en_US.UTF-8
ARCHIVE="build/Astrada.xcarchive"
EXPORT_DIR="build/export"
PLIST="build/ExportOptions.manual.plist"
mkdir -p build

# Dedicated signing keychain (created with a known password we control, so
# codesign runs non-interactively — no GUI keychain-password prompts). We add
# it to the search list + unlock it rather than passing --keychain, because the
# repo path contains a space which breaks the flag inside CocoaPods' embed
# script. codesign resolves the unique "Apple Distribution" identity from the
# unlocked keychain in the search list on its own.
KC="$PWD/build/sign.keychain-db"
if [ -f build/.signpass ] && [ -f "$KC" ]; then
  security list-keychains -d user -s "$KC" "$HOME/Library/Keychains/login.keychain-db" "/Library/Keychains/System.keychain" >/dev/null 2>&1 || true
  security unlock-keychain -p "$(cat build/.signpass)" "$KC" 2>/dev/null || true
  security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$(cat build/.signpass)" "$KC" >/dev/null 2>&1 || true
fi

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>${TEAM_ID}</string>
  <key>signingStyle</key><string>manual</string>
  <key>provisioningProfiles</key>
  <dict><key>com.astradaclub.app</key><string>Astrada App Store</string></dict>
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
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  ${XCODE_BUILD_ACTION:-clean archive}

echo "→ Exporting + uploading to App Store Connect…"
xcodebuild -exportArchive \
  -archivePath "$ARCHIVE" \
  -exportPath "$EXPORT_DIR" \
  -exportOptionsPlist "$PLIST" \
  -authenticationKeyPath "$ASC_KEY_PATH" \
  -authenticationKeyID "$ASC_KEY_ID" \
  -authenticationKeyIssuerID "$ASC_ISSUER_ID"

echo "✅ Uploaded build ${BUILD_NUMBER}. It'll appear in TestFlight after processing (~5-15 min)."
