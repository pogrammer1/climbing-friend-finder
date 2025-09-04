"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./models/User");
dotenv_1.default.config();
const createSampleUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/climbing-friend-finder';
        yield mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        // Check if sample user already exists
        const existingUser = yield User_1.User.findOne({ email: 'alex@example.com' });
        if (existingUser) {
            console.log('⚠️  Sample user already exists');
            process.exit(0);
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash('password123', 12);
        // Create sample user
        const sampleUser = new User_1.User({
            username: 'alexclimber',
            email: 'alex@example.com',
            password: hashedPassword,
            firstName: 'Alex',
            lastName: 'Johnson',
            bio: 'Passionate climber looking for partners to tackle new routes! I love both indoor and outdoor climbing.',
            location: 'Seattle, WA',
            experience: 'intermediate',
            climbingType: ['bouldering', 'sport', 'gym'],
            preferredGyms: ['Seattle Bouldering Project', 'Vertical World'],
            availability: {
                weekdays: true,
                weekends: true,
                evenings: true
            },
            climbingGrade: {
                bouldering: 'V4',
                sport: '5.10c'
            }
        });
        yield sampleUser.save();
        console.log('✅ Sample user created successfully!');
        console.log('📧 Email: alex@example.com');
        console.log('🔑 Password: password123');
        console.log('👤 Username: alexclimber');
    }
    catch (error) {
        console.error('❌ Error creating sample user:', error);
    }
    finally {
        yield mongoose_1.default.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
});
createSampleUser();
