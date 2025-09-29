#!/usr/bin/env bash

set -euo pipefail

set -o allexport
source ./.env.local
set +o allexport

echo "Creating table ${VITE_APP_TABLE_NAME}"

sleep 0.5

aws dynamodb create-table \
    --table-name "${VITE_APP_TABLE_NAME}" \
    --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S \
    --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --no-cli-pager \
    --endpoint-url "${VITE_LOCAL_DYNAMODB_ENDPOINT}" \
    --global-secondary-indexes \
      "[
          {
              \"IndexName\": \"GSI_INVERSE\",
              \"KeySchema\": [
                  {\"AttributeName\":\"sk\",\"KeyType\":\"HASH\"},
                  {\"AttributeName\":\"pk\",\"KeyType\":\"RANGE\"}
              ],
              \"Projection\": {
                  \"ProjectionType\":\"ALL\"
              }
          }
      ]"


