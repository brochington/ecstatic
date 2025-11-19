import path from 'path';
import fs from 'fs';

import { expect } from 'chai';
import { describe, it, beforeAll } from 'vitest';

// Test that verifies the built package exports are correct
// This prevents regression of the rspack export naming issue

describe('Package Exports', () => {
  beforeAll(async () => {
    // Ensure dist files exist before running tests
    const distPath = path.join(process.cwd(), 'dist');
    // const esmPath = path.join(distPath, 'ecstatic.esm.js');
    const cjsPath = path.join(distPath, 'ecstatic.cjs.js');
    const umdPath = path.join(distPath, 'ecstatic.umd.js');

    if (!fs.existsSync(cjsPath) || !fs.existsSync(umdPath)) {
      throw new Error(
        'Build files not found. Please run "npm run build" before running these tests.'
      );
    }
  });

  describe('CommonJS Build', () => {
    it('should export World, Entity, and trackComponent from CommonJS build', async () => {
      // Import from the built CJS file
      const cjsPath = path.join(process.cwd(), 'dist', 'ecstatic.cjs.js');
      const cjsUrl = `file://${cjsPath}`;
      const ecstatic = await import(cjsUrl);

      expect(ecstatic).to.have.property('World');
      expect(ecstatic).to.have.property('Entity');
      expect(ecstatic).to.have.property('trackComponent');

      expect(ecstatic.World).to.be.a('function');
      expect(ecstatic.Entity).to.be.a('function');
      expect(ecstatic.trackComponent).to.be.a('function');

      // Test basic functionality
      const world = new ecstatic.World();
      const entity = world.createEntity();

      expect(world).to.be.instanceof(ecstatic.World);
      expect(entity).to.be.instanceof(ecstatic.Entity);
    });
  });

  describe('UMD Build', () => {
    it('should exist and contain expected exports', () => {
      const umdPath = path.join(process.cwd(), 'dist', 'ecstatic.umd.js');
      expect(fs.existsSync(umdPath)).to.be.true;

      const umdContent = fs.readFileSync(umdPath, 'utf-8');
      expect(umdContent).to.include('ecstatic');
      expect(umdContent).to.include('World');
      expect(umdContent).to.include('Entity');
      expect(umdContent).to.include('trackComponent');
    });
  });

  describe('Build Configuration', () => {
    it('should have mangleExports disabled in rspack config to prevent export name mangling', () => {
      const configPath = path.join(process.cwd(), 'rspack.config.mjs');
      const configContent = fs.readFileSync(configPath, 'utf-8');
      expect(configContent).to.include('mangleExports: false');
      expect(configContent).to.include("// Don't mangle export names");
    });
  });
});
