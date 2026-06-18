#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Download and install Tectonic for Linux (Render)
echo "Downloading Tectonic for Linux..."
wget https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%400.14.1/tectonic-0.14.1-x86_64-unknown-linux-musl.tar.gz
tar -xzf tectonic-0.14.1-x86_64-unknown-linux-musl.tar.gz
mkdir -p bin
mv tectonic bin/tectonic
chmod +x bin/tectonic
rm tectonic-*.tar.gz
echo "Tectonic installed successfully."
