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
exports.Location = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const LocationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    type: {
        type: String,
        enum: ['gym', 'outdoor', 'crag', 'boulder_field'],
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    country: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
        default: 'USA'
    },
    coordinates: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    website: {
        type: String,
        trim: true,
        maxlength: 200
    },
    phone: {
        type: String,
        trim: true,
        maxlength: 20
    },
    hours: {
        monday: { type: String, trim: true },
        tuesday: { type: String, trim: true },
        wednesday: { type: String, trim: true },
        thursday: { type: String, trim: true },
        friday: { type: String, trim: true },
        saturday: { type: String, trim: true },
        sunday: { type: String, trim: true }
    },
    amenities: [{
            type: String,
            enum: ['parking', 'showers', 'rentals', 'cafe', 'shop', 'lockers', 'wifi', 'training_area']
        }],
    climbingTypes: [{
            type: String,
            enum: ['bouldering', 'sport', 'trad', 'top-rope', 'lead'],
            required: true
        }],
    difficultyRange: {
        min: {
            type: String,
            trim: true
        },
        max: {
            type: String,
            trim: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});
// Create indexes for better query performance
LocationSchema.index({ coordinates: '2dsphere' }); // For geospatial queries
LocationSchema.index({ city: 1, state: 1 });
LocationSchema.index({ type: 1 });
LocationSchema.index({ climbingTypes: 1 });
LocationSchema.index({ isActive: 1 });
exports.Location = mongoose_1.default.model('Location', LocationSchema);
