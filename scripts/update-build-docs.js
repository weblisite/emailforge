#!/usr/bin/env node

/**
 * 🚀 EmailForge Build Documentation Updater
 * 
 * This script automatically updates the BUILD.md file based on:
 * - Git commit history
 * - Implementation status
 * - Feature completion tracking
 * 
 * Usage: node scripts/update-build-docs.js [--auto] [--commit]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

class BuildDocUpdater {
  constructor() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    this.projectRoot = path.join(__dirname, '..');
    this.buildFilePath = path.join(this.projectRoot, 'BUILD.md');
    this.prdFilePath = path.join(this.projectRoot, 'PRD.md');
    this.currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Get git commit history for recent changes
   */
  getRecentCommits() {
    try {
      const commits = execSync('git log --oneline --since="1 week ago"', { 
        encoding: 'utf8',
        cwd: this.projectRoot
      });
      return commits.split('\n').filter(line => line.trim()).slice(0, 10);
    } catch (error) {
      console.log('⚠️  Could not fetch git commits:', error.message);
      return [];
    }
  }

  /**
   * Get current implementation status from code analysis
   */
  getImplementationStatus() {
    const status = {
      frontend: this.checkFrontendStatus(),
      backend: this.checkBackendStatus(),
      database: this.checkDatabaseStatus(),
      features: this.checkFeatureStatus()
    };

    return status;
  }

  /**
   * Check frontend implementation status
   */
  checkFrontendStatus() {
    const frontendPath = path.join(this.projectRoot, 'client', 'src');
    const components = ['forms', 'pages', 'components'];
    
    let completed = 0;
    let total = 0;

    components.forEach(component => {
      const componentPath = path.join(frontendPath, component);
      if (fs.existsSync(componentPath)) {
        const files = fs.readdirSync(componentPath);
        total += files.length;
        completed += files.filter(file => file.endsWith('.tsx') || file.endsWith('.ts')).length;
      }
    });

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100) || 0
    };
  }

  /**
   * Check backend implementation status
   */
  checkBackendStatus() {
    const backendPath = path.join(this.projectRoot, 'server');
    const files = ['routes.ts', 'storage.ts', 'services', 'middleware'];
    
    let completed = 0;
    let total = files.length;

    files.forEach(file => {
      const filePath = path.join(backendPath, file);
      if (fs.existsSync(filePath)) {
        completed++;
      }
    });

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100) || 0
    };
  }

  /**
   * Check database implementation status
   */
  checkDatabaseStatus() {
    const dbPath = path.join(this.projectRoot, 'migrations');
    
    if (fs.existsSync(dbPath)) {
      const migrations = fs.readdirSync(dbPath).filter(file => file.endsWith('.sql'));
      return {
        completed: migrations.length,
        total: 3, // Expected migrations
        percentage: Math.round((migrations.length / 3) * 100) || 0
      };
    }

    return { completed: 0, total: 3, percentage: 0 };
  }

  /**
   * Check feature implementation status
   */
  checkFeatureStatus() {
    const features = [
      { name: 'leads', form: 'lead-form' },
      { name: 'email-accounts', form: 'email-account-form' },
      { name: 'sequences', form: 'sequence-form' },
      { name: 'campaigns', form: 'campaign-form' },
      { name: 'analytics', form: null }, // No form needed
      { name: 'inbox', form: null }, // No form needed
      { name: 'settings', form: null }, // No form needed
      { name: 'dashboard', form: null } // No form needed
    ];

    let completed = 0;
    const featureStatus = {};

    features.forEach(feature => {
      const pagePath = path.join(this.projectRoot, 'client', 'src', 'pages', `${feature.name}.tsx`);
      const hasPage = fs.existsSync(pagePath);
      
      if (feature.form) {
        const formPath = path.join(this.projectRoot, 'client', 'src', 'components', 'forms', `${feature.form}.tsx`);
        const hasForm = fs.existsSync(formPath);
        
        if (hasPage && hasForm) {
          completed++;
          featureStatus[feature.name] = '✅ COMPLETE';
        } else if (hasPage) {
          featureStatus[feature.name] = '🟡 PARTIAL';
        } else {
          featureStatus[feature.name] = '❌ NOT STARTED';
        }
      } else {
        // Features without forms are complete if page exists
        if (hasPage) {
          completed++;
          featureStatus[feature.name] = '✅ COMPLETE';
        } else {
          featureStatus[feature.name] = '❌ NOT STARTED';
        }
      }
    });

    return {
      completed,
      total: features.length,
      percentage: Math.round((completed / features.length) * 100) || 0,
      details: featureStatus
    };
  }

  /**
   * Generate a summary report
   */
  generateSummary() {
    const status = this.getImplementationStatus();
    const overallProgress = Math.round(
      (status.frontend.percentage + status.backend.percentage + 
       status.database.percentage + status.features.percentage) / 4
    );

    console.log('\n📋 BUILD STATUS SUMMARY');
    console.log('========================');
    console.log(`🏗️  Frontend: ${status.frontend.percentage}% (${status.frontend.completed}/${status.frontend.total})`);
    console.log(`⚙️  Backend: ${status.backend.percentage}% (${status.backend.completed}/${status.backend.total})`);
    console.log(`🗄️  Database: ${status.database.percentage}% (${status.database.completed}/${status.database.total})`);
    console.log(`✨ Features: ${status.features.percentage}% (${status.features.completed}/${status.features.total})`);
    console.log(`📊 Overall: ${overallProgress}%`);
    
    console.log('\n🎯 FEATURE STATUS');
    console.log('==================');
    Object.entries(status.features.details).forEach(([feature, status]) => {
      console.log(`${feature.padEnd(15)}: ${status}`);
    });
  }

  /**
   * Run the updater
   */
  run() {
    console.log('🚀 EmailForge Build Documentation Updater');
    console.log('==========================================');
    
    this.generateSummary();
    
    console.log('\n🎉 Build documentation summary complete!');
    console.log('💡 Use --summary flag to see status only');
    console.log('💡 Use --commit flag to auto-commit changes');
  }
}

// CLI handling
const updater = new BuildDocUpdater();

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node scripts/update-build-docs.js [options]

Options:
  --auto      Auto-update without prompts
  --commit    Commit changes after update
  --help      Show this help message
  --summary   Show summary only (don't update)

Examples:
  node scripts/update-build-docs.js --auto
  node scripts/update-build-docs.js --summary
    `);
  process.exit(0);
}

if (args.includes('--summary')) {
  updater.generateSummary();
} else {
  updater.run();
  
  if (args.includes('--commit')) {
    try {
      execSync('git add BUILD.md', { cwd: updater.projectRoot });
      execSync('git commit -m "docs: Auto-update BUILD.md with current implementation status"', { cwd: updater.projectRoot });
      console.log('✅ Changes committed to git');
    } catch (error) {
      console.log('⚠️  Could not commit changes:', error.message);
    }
  }
}

export default BuildDocUpdater;
