# Deployment Guide

This repository includes comprehensive CI/CD deployment scripts for the Firestorm Referral Console. Here's how to use them:

## 🚀 Quick Start

### Automated Deployment (Recommended)

1. **GitHub Actions CI/CD** - Automatically triggered on push to main branch
2. **Manual Deployment** - Run deployment scripts manually

## 📋 Available Deployment Methods

### 1. GitHub Actions CI/CD Pipeline

**File:** `.github/workflows/ci-cd.yml`

**Features:**
- ✅ Automatic testing on multiple Node.js versions
- ✅ Type checking and linting
- ✅ Automatic deployment on main branch push
- ✅ Build validation

**Setup:**
1. Push your code to a GitHub repository
2. Set up the following secrets in your GitHub repository:
   - `DEPLOY_KEY` - Your deployment authorization key
   - `DEPLOY_URL` - Your deployment webhook URL
3. The pipeline will automatically run on every push

**Trigger manually:**
```bash
# Push to main branch triggers deployment
git push origin main
```

### 2. Manual Deployment Script

**File:** `scripts/deploy.sh`

**Features:**
- ✅ Pre-deployment checks
- ✅ Dependency installation
- ✅ Application building
- ✅ Multi-platform deployment support
- ✅ Post-deployment cleanup

**Usage:**
```bash
# Full deployment
./scripts/deploy.sh

# Build only (no deployment)
./scripts/deploy.sh --build-only

# Skip pre-deployment checks
./scripts/deploy.sh --skip-checks

# Get help
./scripts/deploy.sh --help
```

**Environment Variables:**
```bash
export DEPLOY_URL="https://your-deployment-webhook.com"
export DEPLOY_KEY="your-secret-key"
export CLEAN_BUILD="true"  # Optional: clean build cache
```

### 3. Replit Deployment Script

**File:** `scripts/replit-deploy.js`

**Features:**
- ✅ Replit environment detection
- ✅ Automatic configuration generation
- ✅ Deployment manifest creation
- ✅ Integration with Replit's deployment system

**Usage:**
```bash
# Deploy on Replit
node scripts/replit-deploy.js

# Verbose output
node scripts/replit-deploy.js --verbose

# Get help
node scripts/replit-deploy.js --help
```

**For Replit Deployment:**
1. Run the script to prepare your project
2. Go to the "Deployments" tab in Replit
3. Click "Deploy" to create a new deployment


## 🔧 Configuration

### Environment Variables

The deployment scripts support the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DEPLOY_URL` | Webhook URL for deployment | Optional |
| `DEPLOY_KEY` | Authorization key for deployment | Optional |
| `PROJECT_NAME` | Name of your project | Optional |
| `NODE_ENV` | Environment (production/development) | Auto-set |
| `CLEAN_BUILD` | Clean build cache after deployment | Optional |

### Customization

You can customize the deployment process by:

1. **Modifying deployment scripts** in the `scripts/` directory
2. **Updating GitHub Actions workflow** in `.github/workflows/ci-cd.yml`

## 🔍 Deployment Targets

### Supported Platforms

- ✅ **Replit Deployments** - Native Replit deployment
- ✅ **Custom Servers** - Via webhook or rsync
- ✅ **Cloud Platforms** - AWS, GCP, Azure, etc.

### Platform-Specific Notes

#### Replit
- Uses the Replit deployment interface
- Automatic environment detection
- Configuration files are auto-generated

#### Custom Servers
- Requires `DEPLOY_URL` and `DEPLOY_KEY`
- Supports rsync and webhook deployments
- Includes deployment verification


## 🚨 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check Node.js version
node --version  # Should be >= 18

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Permission Errors:**
```bash
# Make scripts executable
chmod +x scripts/deploy.sh
chmod +x scripts/replit-deploy.js
```


### Logs and Debugging

- **GitHub Actions**: Check the Actions tab in your repository
- **Local Deployment**: Scripts output detailed logs

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the deployment logs
3. Ensure all required environment variables are set
4. Verify your deployment target is correctly configured

## 🔐 Security Best Practices

- ✅ Never commit secrets to version control
- ✅ Use environment variables for sensitive data
- ✅ Regularly update dependencies
- ✅ Use HTTPS for all external connections
- ✅ Implement proper authentication for deployments

## 📈 Monitoring

After deployment, monitor your application:

- **Health Checks**: `/health` endpoint (if implemented)
- **Application Logs**: Check server logs for errors
- **Performance**: Monitor response times and resource usage
- **Uptime**: Set up monitoring alerts

---

*This deployment system is designed to be flexible and extensible. Modify the scripts according to your specific deployment requirements.*