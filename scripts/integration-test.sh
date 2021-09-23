#!/bin/bash

echo "Building test extension..."

npm run package

echo "Testing Firefox"

npm run test:integration:jest -- --test_browser=firefox --load_extension=true --headless_mode=false 2>&1 | tee integration.log

pkill -P $$