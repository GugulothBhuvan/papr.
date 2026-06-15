#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Download and install Tectonic for Linux (Render)
echo "Downloading Tectonic for Linux..."
curl --proto '=https' --tlsv1.2 -fsSL https://drop-sh.fullyjustified.net | sh
mkdir -p bin
mv tectonic bin/tectonic
chmod +x bin/tectonic
echo "Tectonic installed successfully."
