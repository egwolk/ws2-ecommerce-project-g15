const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 12;

class User {
    constructor(data = {}) {
        this._id = data._id;
        this.userId = data.userId || uuidv4();
        this.firstName = data.firstName || '';
        this.lastName = data.lastName || '';
        this.email = data.email || '';
        this.passwordHash = data.passwordHash || '';
        this.role = data.role || 'customer';
        this.accountStatus = data.accountStatus || 'active';
        this.isEmailVerified = data.isEmailVerified || false;
        this.verificationToken = data.verificationToken || null;
        this.tokenExpiry = data.tokenExpiry || null;
        this.resetToken = data.resetToken || null;        
        this.resetExpiry = data.resetExpiry || null; 
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Convert MongoDB document to User instance
    static fromDocument(doc) {
        if (!doc) return null;
        return new User({
            _id: doc._id,
            userId: doc.userId,
            firstName: doc.firstName,
            lastName: doc.lastName,
            email: doc.email,
            passwordHash: doc.passwordHash,
            role: doc.role,
            accountStatus: doc.accountStatus,
            isEmailVerified: doc.isEmailVerified,
            verificationToken: doc.verificationToken,
            tokenExpiry: doc.tokenExpiry,
            resetToken: doc.resetToken,        
            resetExpiry: doc.resetExpiry,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    // Convert User instance to MongoDB document
    toDocument() {
        return {
            userId: this.userId,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            passwordHash: this.passwordHash,
            role: this.role,
            accountStatus: this.accountStatus,
            isEmailVerified: this.isEmailVerified,
            ...(this.verificationToken && { verificationToken: this.verificationToken }),
            ...(this.tokenExpiry && { tokenExpiry: this.tokenExpiry }),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
        
    }

    // Get user's full name
    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim();
    }

    // Get safe user object (without sensitive data)
    getSafeUser() {
        const { passwordHash, verificationToken, tokenExpiry, ...safeUser } = this.toDocument();
        return safeUser;
    }

    // Create session user object
    getSessionUser() {
        return {
            _id: this._id, 
            userId: this.userId,
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email,
            role: this.role,
            isEmailVerified: this.isEmailVerified
        };
    }

    // Static methods for user operations
    static async hashPassword(password) {
        return bcrypt.hash(password, saltRounds);
    }

    static async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    static generateVerificationToken() {
        return uuidv4();
    }

    // Basic validation
    validate() {
        const errors = {};
        
        if (!this.firstName) errors.firstName = 'First name is required';
        if (!this.lastName) errors.lastName = 'Last name is required';
        
        if (!this.email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.email = 'Email is not valid';
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

module.exports = User;