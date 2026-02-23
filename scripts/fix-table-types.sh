#!/bin/bash

# Fix all DynamoDB table TypeScript type issues

FILES="events products jobs offers rewards settings users notifications promotions leads"

for file in $FILES; do
  filepath="scripts/dynamodb-tables/${file}.ts"
  echo "Fixing $filepath..."

  # Add type imports if not already present
  if ! grep -q "CreateTableCommandInput" "$filepath"; then
    sed -i '' '1s/^/import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput, ScalarAttributeType, KeyType, ProjectionType } from "@aws-sdk\/client-dynamodb";\n/' "$filepath"
    # Remove duplicate imports
    sed -i '' '/^import { DynamoDBClient } from/d' "$filepath"
    sed -i '' '/^import { CreateTableCommand } from/d' "$filepath"
  fi

  # Add type annotation to params
  sed -i '' 's/const params = {/const params: CreateTableCommandInput = {/' "$filepath"

  # Add type assertions to AttributeType
  sed -i '' 's/AttributeType: '\''S'\''/AttributeType: "S" as ScalarAttributeType/g' "$filepath"
  sed -i '' 's/AttributeType: '\''N'\''/AttributeType: "N" as ScalarAttributeType/g' "$filepath"
  sed -i '' 's/AttributeType: "S" as const/AttributeType: "S" as ScalarAttributeType/g' "$filepath"

  # Add type assertions to KeyType
  sed -i '' 's/KeyType: '\''HASH'\''/KeyType: "HASH" as KeyType/g' "$filepath"
  sed -i '' 's/KeyType: '\''RANGE'\''/KeyType: "RANGE" as KeyType/g' "$filepath"
  sed -i '' 's/KeyType: "HASH" as const/KeyType: "HASH" as KeyType/g' "$filepath"
  sed -i '' 's/KeyType: "RANGE" as const/KeyType: "RANGE" as KeyType/g' "$filepath"

  # Add type assertions to ProjectionType
  sed -i '' 's/ProjectionType: '\''ALL'\''/ProjectionType: "ALL" as ProjectionType/g' "$filepath"
  sed -i '' 's/ProjectionType: "ALL" as const/ProjectionType: "ALL" as ProjectionType/g' "$filepath"
done

echo "✅ All table files fixed!"
