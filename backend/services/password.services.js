const User = require('../models/users.model');
const { v4: uuidv4 } = require('uuid');

class PasswordService {
    constructor(client, dbName) {
        this.client = client;
        this.dbName = dbName;
    }

    async findUserByEmail(email) {
        const db = this.client.db(this.dbName);
        const doc = await db.collection('users').findOne({ email });
        return User.fromDocument(doc);
    }

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

    async resetPassword(email, newPassword) {
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

module.exports = PasswordService;