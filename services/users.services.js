const User = require('../models/users.model');

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
}

module.exports = UserService;