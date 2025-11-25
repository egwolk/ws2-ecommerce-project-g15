const User = require('../models/users.model');
const { v4: uuidv4 } = require('uuid');

class UserService {
    constructor(client, dbName) {
        this.client = client;
        this.dbName = dbName;
    }

    async getUserByEmail(email) {
        const db = this.client.db(this.dbName);
        const doc = await db.collection('users').findOne({ email });
        return User.fromDocument(doc);
    }

    async getUserByUserId(userId) {
        const db = this.client.db(this.dbName);
        const doc = await db.collection('users').findOne({ userId });
        return User.fromDocument(doc);
    }

    async getUserByToken(token) {
        const db = this.client.db(this.dbName);
        const doc = await db.collection('users').findOne({ verificationToken: token });
        return User.fromDocument(doc);
    }

    async createUser(userData) {
        const db = this.client.db(this.dbName);
        const passwordHash = await User.hashPassword(userData.password);
        const token = User.generateVerificationToken();
        
        const newUser = new User({
            firstName: userData.firstName,
            lastName: userData.lastName,
            contactNo: userData.contactNo || '',
            email: userData.email,
            passwordHash: passwordHash,
            verificationToken: token,
            tokenExpiry: new Date(Date.now() + 3600000) // 1 hour expiry
        });
        
        const validation = newUser.validate();
        if (!validation.isValid) {
            throw new Error('Invalid user data: ' + JSON.stringify(validation.errors));
        }
        
        await db.collection('users').insertOne(newUser.toDocument());
        return { user: newUser, token };
    }

    async verifyEmail(token) {
        const db = this.client.db(this.dbName);
        
        await db.collection('users').updateOne(
            { verificationToken: token },
            { 
                $set: { 
                    isEmailVerified: true,
                    updatedAt: new Date() 
                }, 
                $unset: { 
                    verificationToken: "", 
                    tokenExpiry: "" 
                } 
            }
        );
    }

    async validatePassword(user, password) {
        return User.comparePassword(password, user.passwordHash);
    }

    async getAllUsers() {
        const db = this.client.db(this.dbName);
        const docs = await db.collection('users').find().toArray();
        return docs.map(doc => User.fromDocument(doc));
    }

    async deleteUser(userId) {
        const db = this.client.db(this.dbName);
        const usersCollection = db.collection('users');
        
        return await usersCollection.deleteOne({ _id: userId });
    }

    async getUserById(userId) {
        const db = this.client.db(this.dbName);
        const doc = await db.collection('users').findOne({ _id: userId });
        return User.fromDocument(doc);
    }
    async updateUser(userId, updateData) {
        const db = this.client.db(this.dbName);
        // Hash password if provided
        if (updateData.password) {
            updateData.passwordHash = await User.hashPassword(updateData.password);
            delete updateData.password; // Remove plain text password
            delete updateData.confirmPassword; // Remove confirm password
        }
        
        // Ensure contactNo is preserved/normalized if provided
        if (typeof updateData.contactNo === 'undefined') {
            // do nothing - leave as-is in DB
        } else {
            updateData.contactNo = updateData.contactNo || '';
        }

        updateData.updatedAt = new Date();
        
        await db.collection('users').updateOne(
            { _id: userId },
            { $set: updateData }
        );
    }

    async createUserByAdmin(userData) {
        const db = this.client.db(this.dbName);
        
        // Check if user already exists
        const existingUser = await this.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('User already exists with this email.');
        }
        
        const passwordHash = await User.hashPassword(userData.password);
        
        const newUser = new User({
            firstName: userData.firstName,
            lastName: userData.lastName,
            contactNo: userData.contactNo || '',
            email: userData.email,
            passwordHash: passwordHash,
            role: userData.role || 'customer',
            accountStatus: userData.accountStatus || 'active',
            isEmailVerified: userData.isEmailVerified === 'true' || userData.isEmailVerified === true,
            // No verification token needed for admin creation
        });
        
        const validation = newUser.validate();
        if (!validation.isValid) {
            throw new Error('Invalid user data: ' + JSON.stringify(validation.errors));
        }
        
        await db.collection('users').insertOne(newUser.toDocument());
        return newUser;
    }

    // Password reset methods
    async generateResetToken(email) {
        const token = uuidv4();
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        const db = this.client.db(this.dbName);
        await db.collection('users').updateOne(
            { email },
            { $set: { resetToken: token, resetExpiry: expiry } }
        );

        return { token, expiry };
    }

    async findUserByResetToken(token) {
        const db = this.client.db(this.dbName);
        const doc = await db.collection('users').findOne({
            resetToken: token,
            resetExpiry: { $gt: new Date() }
        });
        return User.fromDocument(doc);
    }

    async resetUserPassword(email, newPassword) {
        const hashedPassword = await User.hashPassword(newPassword);
        
        const db = this.client.db(this.dbName);
        await db.collection('users').updateOne(
            { email },
            {
                $set: { passwordHash: hashedPassword, updatedAt: new Date() },
                $unset: { resetToken: "", resetExpiry: "" }
            }
        );
    }
}

module.exports = UserService;