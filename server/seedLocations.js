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
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./config/database");
const Location_1 = require("./models/Location");
const sampleLocations = [
    // Gyms
    {
        name: "Boulder Rock Club",
        type: "gym",
        address: "2829 Mapleton Ave",
        city: "Boulder",
        state: "Colorado",
        country: "USA",
        coordinates: {
            latitude: 40.0097,
            longitude: -105.2655
        },
        description: "Premier climbing gym in Boulder with excellent bouldering and sport climbing walls",
        website: "https://boulderrockclub.com",
        phone: "(303) 447-2804",
        hours: {
            monday: "6:00 AM - 10:00 PM",
            tuesday: "6:00 AM - 10:00 PM",
            wednesday: "6:00 AM - 10:00 PM",
            thursday: "6:00 AM - 10:00 PM",
            friday: "6:00 AM - 10:00 PM",
            saturday: "8:00 AM - 8:00 PM",
            sunday: "8:00 AM - 8:00 PM"
        },
        amenities: ["parking", "showers", "rentals", "cafe", "shop", "lockers"],
        climbingTypes: ["bouldering", "sport", "top-rope", "lead"],
        difficultyRange: {
            min: "V0",
            max: "V12"
        },
        isActive: true
    },
    {
        name: "Planet Granite San Francisco",
        type: "gym",
        address: "924 Mason St",
        city: "San Francisco",
        state: "California",
        country: "USA",
        coordinates: {
            latitude: 37.7915,
            longitude: -122.4103
        },
        description: "Urban climbing gym in the heart of San Francisco",
        website: "https://planetgranite.com",
        phone: "(415) 692-3434",
        hours: {
            monday: "6:00 AM - 11:00 PM",
            tuesday: "6:00 AM - 11:00 PM",
            wednesday: "6:00 AM - 11:00 PM",
            thursday: "6:00 AM - 11:00 PM",
            friday: "6:00 AM - 10:00 PM",
            saturday: "8:00 AM - 8:00 PM",
            sunday: "8:00 AM - 8:00 PM"
        },
        amenities: ["parking", "showers", "rentals", "cafe", "lockers", "wifi"],
        climbingTypes: ["bouldering", "sport", "top-rope", "lead"],
        difficultyRange: {
            min: "V0",
            max: "V10"
        },
        isActive: true
    },
    {
        name: "Brooklyn Boulders",
        type: "gym",
        address: "575 Degraw St",
        city: "Brooklyn",
        state: "New York",
        country: "USA",
        coordinates: {
            latitude: 40.6782,
            longitude: -73.9943
        },
        description: "Large climbing gym and community space in Brooklyn",
        website: "https://brooklynboulders.com",
        phone: "(718) 243-0746",
        amenities: ["parking", "showers", "rentals", "cafe", "shop", "lockers", "wifi", "training_area"],
        climbingTypes: ["bouldering", "sport", "top-rope"],
        difficultyRange: {
            min: "V0",
            max: "V8"
        },
        isActive: true
    },
    // Outdoor locations
    {
        name: "Joshua Tree National Park",
        type: "outdoor",
        address: "74485 National Park Dr",
        city: "Twentynine Palms",
        state: "California",
        country: "USA",
        coordinates: {
            latitude: 33.8734,
            longitude: -115.9010
        },
        description: "World-famous desert climbing destination with incredible granite formations",
        website: "https://www.nps.gov/jotr/",
        amenities: ["parking"],
        climbingTypes: ["bouldering", "trad", "sport"],
        difficultyRange: {
            min: "V0",
            max: "V16"
        },
        isActive: true
    },
    {
        name: "Red Rocks",
        type: "crag",
        address: "Red Rock Canyon National Conservation Area",
        city: "Las Vegas",
        state: "Nevada",
        country: "USA",
        coordinates: {
            latitude: 36.1354,
            longitude: -115.4274
        },
        description: "Stunning red sandstone climbing in the Nevada desert",
        website: "https://www.redrockcanyonlv.org/",
        amenities: ["parking"],
        climbingTypes: ["sport", "trad"],
        difficultyRange: {
            min: "5.5",
            max: "5.14"
        },
        isActive: true
    },
    {
        name: "Flatirons",
        type: "crag",
        address: "Chautauqua Park",
        city: "Boulder",
        state: "Colorado",
        country: "USA",
        coordinates: {
            latitude: 39.9991,
            longitude: -105.2830
        },
        description: "Iconic sandstone formations visible from Boulder",
        amenities: ["parking"],
        climbingTypes: ["trad", "sport"],
        difficultyRange: {
            min: "5.4",
            max: "5.12"
        },
        isActive: true
    },
    {
        name: "Bishop Bouldering",
        type: "boulder_field",
        address: "Buttermilk Country",
        city: "Bishop",
        state: "California",
        country: "USA",
        coordinates: {
            latitude: 37.3861,
            longitude: -118.3667
        },
        description: "World-class bouldering in the Eastern Sierra",
        amenities: ["parking"],
        climbingTypes: ["bouldering"],
        difficultyRange: {
            min: "V0",
            max: "V15"
        },
        isActive: true
    },
    {
        name: "Smith Rock State Park",
        type: "crag",
        address: "9241 NE Crooked River Dr",
        city: "Terrebonne",
        state: "Oregon",
        country: "USA",
        coordinates: {
            latitude: 44.3668,
            longitude: -121.1403
        },
        description: "High desert sport climbing mecca",
        website: "https://stateparks.oregon.gov/index.cfm?do=park.profile&parkId=36",
        amenities: ["parking"],
        climbingTypes: ["sport", "trad"],
        difficultyRange: {
            min: "5.6",
            max: "5.14"
        },
        isActive: true
    }
];
function seedLocations() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, database_1.connectDB)();
            console.log('Connected to database');
            // Clear existing locations
            yield Location_1.Location.deleteMany({});
            console.log('Cleared existing locations');
            // Insert sample locations
            const locations = yield Location_1.Location.insertMany(sampleLocations);
            console.log(`✅ Inserted ${locations.length} sample locations`);
            // Print inserted locations
            locations.forEach(location => {
                console.log(`- ${location.name} (${location.type}) in ${location.city}, ${location.state}`);
            });
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error seeding locations:', error);
            process.exit(1);
        }
    });
}
seedLocations();
