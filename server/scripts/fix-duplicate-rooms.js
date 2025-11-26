// Script to fix duplicate chat rooms and apply unique index
// Run this with: node scripts/fix-duplicate-rooms.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maczone';

async function fixDuplicateRooms() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const ChatRoom = mongoose.connection.collection('chatrooms');

        // 1. Find duplicate rooms (same user_id)
        console.log('\n📊 Finding duplicate rooms...');
        const duplicates = await ChatRoom.aggregate([
            {
                $group: {
                    _id: '$user_id',
                    count: { $sum: 1 },
                    rooms: { $push: { id: '$_id', status: '$status', createdAt: '$createdAt' } }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]).toArray();

        console.log(`Found ${duplicates.length} users with duplicate rooms`);

        // 2. For each user with duplicates, keep only the most recent room
        let deletedCount = 0;
        for (const dup of duplicates) {
            console.log(`\n👤 User ${dup._id} has ${dup.count} rooms`);

            // Sort rooms by createdAt, keep the newest
            const sortedRooms = dup.rooms.sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            const keepRoom = sortedRooms[0];
            const deleteRoomIds = sortedRooms.slice(1).map(r => r.id);

            console.log(`  ✅ Keeping room: ${keepRoom.id} (${keepRoom.status})`);
            console.log(`  ❌ Deleting ${deleteRoomIds.length} duplicate room(s)`);

            // Delete duplicate rooms
            const result = await ChatRoom.deleteMany({
                _id: { $in: deleteRoomIds }
            });

            deletedCount += result.deletedCount;
        }

        console.log(`\n✅ Deleted ${deletedCount} duplicate rooms`);

        // 3. Drop existing index on user_id if it exists (but not unique)
        console.log('\n🔧 Managing indexes...');
        const indexes = await ChatRoom.indexes();
        const userIdIndexes = indexes.filter(idx =>
            idx.key && idx.key.user_id === 1 && !idx.unique
        );

        for (const idx of userIdIndexes) {
            console.log(`  Dropping non-unique index: ${idx.name}`);
            await ChatRoom.dropIndex(idx.name);
        }

        // 4. Create unique index
        console.log('\n🔐 Creating unique index on user_id...');
        try {
            await ChatRoom.createIndex({ user_id: 1 }, { unique: true });
            console.log('✅ Unique index created successfully');
        } catch (error) {
            if (error.code === 11000) {
                console.log('⚠️  Unique index already exists');
            } else {
                throw error;
            }
        }

        // 5. Verify
        console.log('\n✅ Verification...');
        const totalRooms = await ChatRoom.countDocuments();
        const uniqueUsers = (await ChatRoom.distinct('user_id')).length;
        console.log(`  Total rooms: ${totalRooms}`);
        console.log(`  Unique users: ${uniqueUsers}`);

        if (totalRooms === uniqueUsers) {
            console.log('  ✅ All good! Each user has exactly 1 room');
        } else {
            console.log('  ⚠️  Warning: Still have some duplicates');
        }

        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixDuplicateRooms();
