#!/bin/bash

# ============================================
# AI D Mart - Authentication Test Script
# Tests Cognito-based authentication with curl
# ============================================

BASE_URL="${BASE_URL:-http://localhost:3000}"

echo "============================================"
echo "AI D Mart - Authentication Test Script"
echo "============================================"
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# Test 1: Register a new user
# ============================================
echo -e "${YELLOW}Test 1: Register a new user${NC}"
echo "--------------------------------------------"

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass123",
    "mobile": "9876543210"
  }')

echo "Response: $REGISTER_RESPONSE"
echo ""

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  echo "  Note: Check email for verification code"
else
  echo -e "${RED}✗ Registration failed or user already exists${NC}"
fi
echo ""

# ============================================
# Test 2: Verify email (requires code from email)
# ============================================
echo -e "${YELLOW}Test 2: Verify email (example - replace CODE with actual code)${NC}"
echo "--------------------------------------------"
echo "To verify email, run:"
echo "curl -X POST '$BASE_URL/api/auth/verify' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"testuser@example.com\", \"code\": \"123456\"}'"
echo ""

# ============================================
# Test 3: Admin Login (hardcoded credentials)
# ============================================
echo -e "${YELLOW}Test 3: Admin Login${NC}"
echo "--------------------------------------------"

ADMIN_LOGIN_RESPONSE=$(curl -s -c cookies.txt -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin123@gmail.com",
    "password": "Admin123",
    "role": "ADMIN"
  }')

echo "Response: $ADMIN_LOGIN_RESPONSE"
echo ""

if echo "$ADMIN_LOGIN_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Admin login successful${NC}"
else
  echo -e "${RED}✗ Admin login failed${NC}"
fi
echo ""

# ============================================
# Test 4: Get current user (with cookies)
# ============================================
echo -e "${YELLOW}Test 4: Get current user (requires login cookies)${NC}"
echo "--------------------------------------------"

ME_RESPONSE=$(curl -s -b cookies.txt -X GET "$BASE_URL/api/auth/me")

echo "Response: $ME_RESPONSE"
echo ""

if echo "$ME_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Got user info successfully${NC}"
else
  echo -e "${RED}✗ Failed to get user info${NC}"
fi
echo ""

# ============================================
# Test 5: User Login (after verification)
# ============================================
echo -e "${YELLOW}Test 5: Customer Login (example)${NC}"
echo "--------------------------------------------"
echo "After verifying email, login with:"
echo "curl -c cookies.txt -X POST '$BASE_URL/api/auth/login' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"testuser@example.com\", \"password\": \"TestPass123\", \"role\": \"CUSTOMER\"}'"
echo ""

# ============================================
# Test 6: Forgot Password
# ============================================
echo -e "${YELLOW}Test 6: Forgot Password${NC}"
echo "--------------------------------------------"
echo "To initiate password reset:"
echo "curl -X POST '$BASE_URL/api/auth/forgot-password' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"testuser@example.com\"}'"
echo ""
echo "To reset password with code:"
echo "curl -X POST '$BASE_URL/api/auth/forgot-password' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\": \"testuser@example.com\", \"code\": \"123456\", \"newPassword\": \"NewPass123\"}'"
echo ""

# ============================================
# Test 7: Logout
# ============================================
echo -e "${YELLOW}Test 7: Logout${NC}"
echo "--------------------------------------------"

LOGOUT_RESPONSE=$(curl -s -b cookies.txt -X POST "$BASE_URL/api/auth/logout")

echo "Response: $LOGOUT_RESPONSE"
echo ""

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Logout successful${NC}"
else
  echo -e "${RED}✗ Logout failed${NC}"
fi
echo ""

# Cleanup
rm -f cookies.txt

# ============================================
# Summary
# ============================================
echo "============================================"
echo "Test Summary"
echo "============================================"
echo ""
echo "Admin Credentials:"
echo "  Email: admin123@gmail.com"
echo "  Password: Admin123"
echo ""
echo "User Registration Flow:"
echo "  1. Register -> Email verification code sent"
echo "  2. Verify email with code"
echo "  3. Login"
echo ""
echo "============================================"
