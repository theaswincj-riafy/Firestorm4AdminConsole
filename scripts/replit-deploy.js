#!/usr/bin/env node

/**
 * Replit Deployment Script
 * 
 * This script provides programmatic deployment capabilities for Replit.
 * While Replit doesn't have a direct API for deployments, this script
 * can be used to prepare and trigger deployments.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ReplitDeployer {
    constructor(options = {}) {
        this.projectName = options.projectName || 'firestorm-referral-console';
        this.buildDir = options.buildDir || 'dist';
        this.verbose = options.verbose || false;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: '🔵',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }[type] || '🔵';

        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async checkEnvironment() {
        this.log('Checking Replit environment...');
        
        const isReplit = process.env.REPL_ID || process.env.REPLIT_URL;
        if (!isReplit) {
            this.log('Not running in Replit environment', 'warning');
            return false;
        }

        this.log('Replit environment detected', 'success');
        return true;
    }

    async buildProject() {
        this.log('Building project...');
        
        try {
            // Install dependencies
            execSync('npm ci', { stdio: this.verbose ? 'inherit' : 'pipe' });
            
            // Build the project
            execSync('npm run build', { stdio: this.verbose ? 'inherit' : 'pipe' });
            
            // Verify build output
            if (!fs.existsSync(this.buildDir)) {
                throw new Error(`Build directory ${this.buildDir} not found`);
            }
            
            this.log('Project built successfully', 'success');
            return true;
        } catch (error) {
            this.log(`Build failed: ${error.message}`, 'error');
            return false;
        }
    }

    async createReplitConfig() {
        this.log('Creating Replit configuration...');
        
        const replitConfig = {
            language: 'nodejs',
            run: 'npm run dev',
            entrypoint: 'server/index.ts',
            modules: ['nodejs-20'],
            deployment: {
                run: 'npm start',
                deploymentTarget: 'gce',
                environment: 'production'
            }
        };

        try {
            fs.writeFileSync('.replit', Object.entries(replitConfig)
                .map(([key, value]) => {
                    if (typeof value === 'object') {
                        return `[${key}]\n${Object.entries(value)
                            .map(([k, v]) => `${k} = "${v}"`)
                            .join('\n')}`;
                    }
                    return `${key} = "${value}"`;
                })
                .join('\n\n'));
            
            this.log('Replit configuration created', 'success');
            return true;
        } catch (error) {
            this.log(`Failed to create Replit config: ${error.message}`, 'error');
            return false;
        }
    }

    async createDeploymentManifest() {
        this.log('Creating deployment manifest...');
        
        const manifest = {
            name: this.projectName,
            version: process.env.npm_package_version || '1.0.0',
            description: 'Firestorm Referral Console - Admin interface for managing referral configurations',
            main: 'server/index.js',
            scripts: {
                start: 'node server/index.js',
                build: 'npm run build'
            },
            engines: {
                node: '>=18.0.0'
            },
            deployedAt: new Date().toISOString(),
            commit: this.getGitCommit(),
            files: this.getDeploymentFiles()
        };

        try {
            fs.writeFileSync('deployment-manifest.json', JSON.stringify(manifest, null, 2));
            this.log('Deployment manifest created', 'success');
            return true;
        } catch (error) {
            this.log(`Failed to create deployment manifest: ${error.message}`, 'error');
            return false;
        }
    }

    getGitCommit() {
        try {
            return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        } catch {
            return 'unknown';
        }
    }

    getDeploymentFiles() {
        const deploymentFiles = [];
        
        // Server files
        if (fs.existsSync('server')) {
            deploymentFiles.push('server/**/*');
        }
        
        // Client build files
        if (fs.existsSync(this.buildDir)) {
            deploymentFiles.push(`${this.buildDir}/**/*`);
        }
        
        // Shared files
        if (fs.existsSync('shared')) {
            deploymentFiles.push('shared/**/*');
        }
        
        // Configuration files
        ['package.json', 'package-lock.json', '.replit'].forEach(file => {
            if (fs.existsSync(file)) {
                deploymentFiles.push(file);
            }
        });
        
        return deploymentFiles;
    }

    async prepareForDeployment() {
        this.log('Preparing for deployment...');
        
        const steps = [
            () => this.checkEnvironment(),
            () => this.buildProject(),
            () => this.createReplitConfig(),
            () => this.createDeploymentManifest()
        ];

        for (const step of steps) {
            const success = await step();
            if (!success) {
                this.log('Deployment preparation failed', 'error');
                return false;
            }
        }

        this.log('Deployment preparation completed', 'success');
        return true;
    }

    async triggerDeployment() {
        this.log('Triggering deployment...');
        
        // For Replit, deployment is typically done through the UI
        // This script prepares everything needed for deployment
        
        this.log('To complete deployment in Replit:', 'info');
        this.log('1. Go to the "Deployments" tab in your Replit project', 'info');
        this.log('2. Click "Deploy" to create a new deployment', 'info');
        this.log('3. Configure your deployment settings if needed', 'info');
        this.log('4. Wait for the deployment to complete', 'info');
        
        // If running in CI/CD, you might want to use Replit's API when available
        if (process.env.REPLIT_API_KEY) {
            this.log('Replit API key found, attempting programmatic deployment...', 'info');
            // TODO: Implement Replit API deployment when available
        }
        
        return true;
    }

    async deploy() {
        this.log(`Starting deployment for ${this.projectName}...`);
        
        const prepared = await this.prepareForDeployment();
        if (!prepared) {
            process.exit(1);
        }
        
        await this.triggerDeployment();
        
        this.log('Deployment process completed! 🎉', 'success');
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {
        verbose: args.includes('--verbose') || args.includes('-v'),
        projectName: process.env.PROJECT_NAME || 'firestorm-referral-console'
    };
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Replit Deployment Script

Usage: node scripts/replit-deploy.js [options]

Options:
  --help, -h      Show this help message
  --verbose, -v   Enable verbose output

Environment Variables:
  PROJECT_NAME    Name of the project (default: firestorm-referral-console)
  REPLIT_API_KEY  Replit API key for programmatic deployment (when available)
        `);
        process.exit(0);
    }
    
    const deployer = new ReplitDeployer(options);
    deployer.deploy().catch(error => {
        console.error('Deployment failed:', error);
        process.exit(1);
    });
}

module.exports = ReplitDeployer;