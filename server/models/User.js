"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    bio: {
        type: String,
        maxlength: 500
    },
    location: {
        type: String,
        maxlength: 100
    },
    climbingGrade: {
        bouldering: {
            type: String,
            enum: ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10+']
        },
        sport: {
            type: String,
            enum: ['5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12+']
        },
        trad: {
            type: String,
            enum: ['5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12+']
        }
    },
    climbingType: [{
            type: String,
            enum: ['bouldering', 'sport', 'trad', 'gym', 'outdoor'],
            required: true
        }],
    preferredGyms: [{
            type: String,
            trim: true
        }],
    availability: {
        weekdays: {
            type: Boolean,
            default: false
        },
        weekends: {
            type: Boolean,
            default: false
        },
        evenings: {
            type: Boolean,
            default: false
        }
    },
    experience: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true
    },
    goals: [{
            type: String,
            enum: ['training', 'social', 'competition', 'outdoor', 'other'],
            trim: true
        }],
    profilePicture: {
        type: String
    },
    followers: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }],
    following: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
            default: []
        }]
}, {
    timestamps: true
});
// Create indexes for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ location: 1 });
UserSchema.index({ climbingType: 1 });
exports.User = mongoose_1.default.model('User', UserSchema);
