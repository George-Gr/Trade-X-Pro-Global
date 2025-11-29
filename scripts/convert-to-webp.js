#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../src/assets');
const QUALITY = 80;

// Images to convert
const images = [
  'hero-trading.jpg',
  'hero-trading-professional.jpg', 
  'security-bg.jpg',
  'global-markets-map.jpg'
];

async function convertToWebP(imageName) {
  const inputPath = path.join(ASSETS_DIR, imageName);
  const outputName = imageName.replace(/\.(jpg|jpeg)$/i, '.webp');
  const outputPath = path.join(ASSETS_DIR, outputName);
  
  try {
    console.log(`Converting ${imageName} to ${outputName}...`);
    
    await sharp(inputPath)
      .webp({ 
        quality: QUALITY,
        lossless: false 
      })
      .toFile(outputPath);
    
    // Get file sizes for comparison
    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`✓ ${outputName} created (${reduction}% smaller)`);
    
  } catch (error) {
    console.error(`✗ Failed to convert ${imageName}:`, error.message);
  }
}

async function main() {
  console.log('🚀 Starting WebP conversion...\n');
  
  for (const image of images) {
    const fullPath = path.join(ASSETS_DIR, image);
    if (fs.existsSync(fullPath)) {
      await convertToWebP(image);
    } else {
      console.warn(`⚠️  Image not found: ${image}`);
    }
  }
  
  console.log('\n✅ WebP conversion complete!');
  console.log('📁 Check src/assets/ for the new .webp files');
}

main().catch(console.error);