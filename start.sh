#!/bin/bash
echo "🌴 Tropical Oman — Starting local server..."
echo "Opening http://localhost:3000"
open http://localhost:3000
python3 -m http.server 3000 -d "$(dirname "$0")"
