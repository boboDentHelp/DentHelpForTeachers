#!/bin/bash

# Generate self-signed SSL certificate for localhost development
# This creates a certificate valid for 365 days

echo "🔐 Generating self-signed SSL certificate for localhost..."
echo ""

# Create localhost certificate with openssl
# MSYS_NO_PATHCONV=1 prevents Git Bash on Windows from converting the subject path
MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:2048 \
  -keyout localhost-key.pem \
  -out localhost.pem \
  -days 365 \
  -nodes \
  -subj "/C=RO/ST=Romania/L=Bucharest/O=DentalHelp Dev/CN=localhost"

echo ""
echo "✅ SSL certificate generated successfully!"
echo ""
echo "Files created:"
echo "  - localhost.pem (certificate)"
echo "  - localhost-key.pem (private key)"
echo ""
echo "⚠️  Note: This is a self-signed certificate."
echo "Your browser will show a security warning - this is normal for development."
echo "Click 'Advanced' and 'Proceed to localhost' to continue."
echo ""
