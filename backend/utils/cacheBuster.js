const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cache for file hashes to avoid repeated file system calls
const fileHashes = new Map();

// Clear cache in development to pick up file changes
if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
        fileHashes.clear();
    }, 5000); // Clear cache every 5 seconds in development
}

/**
 * Generate a cache-busting query parameter based on file content hash
 * @param {string} filePath - The path to the file relative to frontend folder
 * @returns {string} - Query parameter like "?v=abc123def"
 */
function getCacheBuster(filePath) {
    // Return cached version if available
    if (fileHashes.has(filePath)) {
        return fileHashes.get(filePath);
    }

    try {
        const fullPath = path.join(__dirname, '../../frontend', filePath);
        const fileContent = fs.readFileSync(fullPath);
        const hash = crypto.createHash('md5').update(fileContent).digest('hex').substring(0, 8);
        const cacheBuster = `?v=${hash}`;
        
        // Cache the result
        fileHashes.set(filePath, cacheBuster);
        return cacheBuster;
    } catch (error) {
        console.warn(`Cache buster warning: Could not get hash for ${filePath}`);
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