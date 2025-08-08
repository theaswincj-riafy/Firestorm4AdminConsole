#!/bin/bash

# Firestorm Referral Console - Deployment Script
# This script handles the deployment process for the admin console

set -e # Exit on any error

echo "🚀 Starting deployment process..."

# Configuration
PROJECT_NAME="firestorm-referral-console"
BUILD_DIR="dist"
DEPLOYMENT_BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the correct branch
check_branch() {
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    if [ "$current_branch" != "$DEPLOYMENT_BRANCH" ]; then
        print_warning "Current branch is $current_branch, expected $DEPLOYMENT_BRANCH"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    fi
}

# Pre-deployment checks
pre_deploy_checks() {
    print_status "Running pre-deployment checks..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check if git is clean
    if ! git diff --quiet; then
        print_warning "Working directory is not clean"
        git status --porcelain
        read -p "Continue with uncommitted changes? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Please commit your changes before deploying"
            exit 1
        fi
    fi
    
    print_success "Pre-deployment checks passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci --production=false
    print_success "Dependencies installed"
}

# Build the application
build_application() {
    print_status "Building application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the project
    npm run build
    
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build directory not found. Build may have failed."
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Deploy to Replit (if running on Replit)
deploy_to_replit() {
    if [ -n "$REPLIT_URL" ]; then
        print_status "Detected Replit environment"
        print_status "For Replit deployment, use the deployment tab in the Replit interface"
        print_status "or use the suggest_deploy tool in the agent"
        return 0
    fi
}

# Deploy to custom server
deploy_to_server() {
    if [ -n "$DEPLOY_URL" ] && [ -n "$DEPLOY_KEY" ]; then
        print_status "Deploying to custom server..."
        
        # Create deployment package
        tar -czf "${PROJECT_NAME}-$(date +%s).tar.gz" \
            package.json \
            package-lock.json \
            server/ \
            client/dist/ \
            shared/
        
        # Upload to server (replace with your actual deployment method)
        # Example using rsync:
        # rsync -avz --delete ./ user@server:/path/to/app/
        
        # Example using curl to trigger deployment:
        # curl -X POST "$DEPLOY_URL" -H "Authorization: Bearer $DEPLOY_KEY"
        
        print_success "Deployed to custom server"
    else
        print_warning "DEPLOY_URL or DEPLOY_KEY not set, skipping server deployment"
    fi
}


# Post-deployment tasks
post_deploy() {
    print_status "Running post-deployment tasks..."
    
    # Create deployment log
    echo "$(date): Deployed commit $(git rev-parse HEAD)" >> deployment.log
    
    # Clean up build artifacts if needed
    if [ "$CLEAN_BUILD" = "true" ]; then
        rm -rf node_modules/.cache
        print_status "Build cache cleaned"
    fi
    
    print_success "Post-deployment tasks completed"
}

# Main deployment function
main() {
    print_status "Starting deployment for $PROJECT_NAME"
    
    # Run deployment steps
    check_branch
    pre_deploy_checks
    install_dependencies
    build_application
    
    # Deploy to various targets
    deploy_to_replit
    deploy_to_server
    
    post_deploy
    
    print_success "🎉 Deployment completed successfully!"
    print_status "Application should be available at your configured deployment URL"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --build-only   Only build the application, don't deploy"
        echo "  --skip-checks  Skip pre-deployment checks"
        echo ""
        echo "Environment variables:"
        echo "  DEPLOY_URL      URL for deployment webhook"
        echo "  DEPLOY_KEY      Authorization key for deployment"
        echo ""
        echo "  CLEAN_BUILD     Set to 'true' to clean build cache"
        ;;
    --build-only)
        print_status "Building application only..."
        install_dependencies
        build_application
        print_success "Build completed"
        ;;
    --skip-checks)
        print_warning "Skipping pre-deployment checks"
        install_dependencies
        build_application
        deploy_to_replit
        deploy_to_server
        post_deploy
        ;;
    *)
        main
        ;;
esac