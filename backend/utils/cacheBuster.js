const fs = require('fs');
const path = require('path');

// Cache for file timestamps to avoid repeated file system calls
const fileTimestamps = new Map();

/**
 * Generate a cache-busting query parameter based on file modification time
 * @param {string} filePath - The path to the file relative to frontend folder
 * @returns {string} - Query parameter like "?v=1694956789123"
 */
function getCacheBuster(filePath) {
    // Return cached version if available
    if (fileTimestamps.has(filePath)) {
        return fileTimestamps.get(filePath);
    }

    try {
        const fullPath = path.join(__dirname, '../../frontend', filePath);
        const stats = fs.statSync(fullPath);
        const timestamp = stats.mtime.getTime();
        const cacheBuster = `?v=${timestamp}`;
        
        // Cache the result
        fileTimestamps.set(filePath, cacheBuster);
        return cacheBuster;
    } catch (error) {
        console.warn(`Cache buster warning: Could not get timestamp for ${filePath}`);
        return ''; // Return empty string if file doesn't exist
    }
}

/**
 * Helper function to generate versioned asset URLs
 * @param {string} assetPath - The asset path like "styles/global.css"
 * @returns {string} - Versioned URL like "styles/global.css?v=1694956789123"
 */
function versionedAsset(assetPath) {
    return assetPath + getCacheBuster(assetPath);
}

module.exports = { getCacheBuster, versionedAsset };