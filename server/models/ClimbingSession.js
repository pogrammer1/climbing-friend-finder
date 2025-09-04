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
exports.ClimbingSession = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ClimbingSessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    climbingType: {
        type: String,
        enum: ['bouldering', 'sport', 'trad', 'gym', 'outdoor'],
        required: true
    },
    routes: [{
            name: {
                type: String,
                trim: true,
                maxlength: 100
            },
            grade: {
                type: String,
                required: true,
                trim: true
            },
            type: {
                type: String,
                enum: ['bouldering', 'sport', 'trad'],
                required: true
            },
            status: {
                type: String,
                enum: ['sent', 'project', 'attempted', 'onsight', 'flash'],
                required: true
            },
            attempts: {
                type: Number,
                min: 1,
                default: 1
            },
            notes: {
                type: String,
                trim: true,
                maxlength: 500
            }
        }],
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 1440 // 24 hours in minutes
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    partners: [{
            type: String,
            trim: true,
            maxlength: 100
        }],
    weather: {
        type: String,
        trim: true,
        maxlength: 100
    },
    conditions: {
        type: String,
        trim: true,
        maxlength: 200
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
ClimbingSessionSchema.index({ userId: 1, date: -1 });
ClimbingSessionSchema.index({ userId: 1, climbingType: 1 });
ClimbingSessionSchema.index({ userId: 1, location: 1 });
exports.ClimbingSession = mongoose_1.default.model('ClimbingSession', ClimbingSessionSchema);
