const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const Crop = require("./models/Crop");
const Disease = require("./models/Disease");

// ─── Dummy Users ───────────────────────────────────────────────────
const users = [
    {
        username: "testing_user",
        email: "testing@agroai.com",
        password: "testing123",
        role: "farmer",
        phone: "+92-300-1234567",
        location: { city: "Lahore", country: "Pakistan" },
    },
];

// ─── Sample Crops ──────────────────────────────────────────────────
const crops = [
    {
        name: "Tomato",
        scientificName: "Solanum lycopersicum",
        season: "Kharif",
        category: "Vegetable",
        description: "A widely cultivated edible berry of the plant Solanum lycopersicum.",
        optimalConditions: {
            temperature: "20-30°C",
            humidity: "65-85%",
            soil: "Well-drained loamy soil",
            water: "Regular watering",
            ph: "6.0-6.8",
        },
    },
    {
        name: "Potato",
        scientificName: "Solanum tuberosum",
        season: "Rabi",
        category: "Vegetable",
        description: "A starchy tuberous crop from the perennial nightshade Solanum tuberosum.",
        optimalConditions: {
            temperature: "15-20°C",
            humidity: "80-90%",
            soil: "Sandy loam soil",
            water: "Moderate",
            ph: "5.0-6.5",
        },
    },
    {
        name: "Wheat",
        scientificName: "Triticum aestivum",
        season: "Rabi",
        category: "Grain",
        description: "A cereal grain which is a worldwide staple food.",
        optimalConditions: {
            temperature: "10-25°C",
            humidity: "50-60%",
            soil: "Clay loam",
            water: "Moderate",
            ph: "6.0-7.0",
        },
    },
    {
        name: "Rice",
        scientificName: "Oryza sativa",
        season: "Kharif",
        category: "Grain",
        description: "A cereal grain and staple food for a large part of the world's population.",
        optimalConditions: {
            temperature: "20-35°C",
            humidity: "80-90%",
            soil: "Clayey and loamy soil",
            water: "Plenty / Standing water",
            ph: "5.5-6.5",
        },
    },
    {
        name: "Cotton",
        scientificName: "Gossypium",
        season: "Kharif",
        category: "Cash Crop",
        description: "A soft, fluffy staple fiber that grows in a boll around the seeds of cotton plants.",
        optimalConditions: {
            temperature: "21-30°C",
            humidity: "50-60%",
            soil: "Black cotton soil",
            water: "Moderate",
            ph: "5.5-8.0",
        },
    },
];

// ─── Sample Diseases ───────────────────────────────────────────────
const diseases = [
    {
        name: "Tomato Late Blight",
        cropName: "Tomato",
        symptoms: [
            "Irregular greenish-black water-soaked patches on leaves",
            "White mold growth on undersides of leaves",
            "Brown spots on stems and fruit",
        ],
        causes: ["Phytophthora infestans fungus", "Cool wet weather"],
        prevention: [
            "Use disease-resistant varieties",
            "Avoid overhead watering",
            "Ensure good air circulation",
        ],
        treatment: {
            chemical: ["Mancozeb spray", "Chlorothalonil"],
            organic: ["Copper-based fungicide", "Neem oil spray"],
        },
        severity: "High",
        modelLabel: "Tomato___Late_blight",
    },
    {
        name: "Tomato Early Blight",
        cropName: "Tomato",
        symptoms: [
            "Dark concentric rings on lower leaves",
            "Yellowing around spots",
            "Premature leaf drop",
        ],
        causes: ["Alternaria solani fungus"],
        prevention: ["Crop rotation", "Remove infected debris", "Mulching"],
        treatment: {
            chemical: ["Mancozeb", "Azoxystrobin"],
            organic: ["Baking soda spray", "Compost tea"],
        },
        severity: "Medium",
        modelLabel: "Tomato___Early_blight",
    },
    {
        name: "Potato Late Blight",
        cropName: "Potato",
        symptoms: [
            "Water-soaked lesions on leaves",
            "White fungal growth on leaf underside",
            "Tubers develop brown rot",
        ],
        causes: ["Phytophthora infestans"],
        prevention: [
            "Use certified disease-free seed potatoes",
            "Avoid planting in poorly drained soil",
        ],
        treatment: {
            chemical: ["Metalaxyl", "Dimethomorph"],
            organic: ["Copper hydroxide"],
        },
        severity: "Critical",
        modelLabel: "Potato___Late_blight",
    },
    {
        name: "Wheat Leaf Rust",
        cropName: "Wheat",
        symptoms: [
            "Small orange-brown pustules on leaf surface",
            "Reduced grain filling",
        ],
        causes: ["Puccinia triticina fungus"],
        prevention: ["Grow resistant varieties", "Timely sowing"],
        treatment: {
            chemical: ["Propiconazole", "Tebuconazole"],
            organic: ["Neem-based bio-fungicide"],
        },
        severity: "Medium",
        modelLabel: "Wheat___Leaf_rust",
    },
    {
        name: "Rice Blast",
        cropName: "Rice",
        symptoms: [
            "Diamond-shaped lesions on leaves",
            "Grayish-green spots that become white with brown borders",
        ],
        causes: ["Magnaporthe oryzae fungus"],
        prevention: [
            "Use blast-resistant varieties",
            "Balanced nitrogen fertilization",
        ],
        treatment: {
            chemical: ["Tricyclazole", "Isoprothiolane"],
            organic: ["Silicon-based supplements"],
        },
        severity: "High",
        modelLabel: "Rice___Blast",
    },
];

// ─── Seed Function ─────────────────────────────────────────────────
const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        // Clear existing data
        await User.deleteMany({});
        await Crop.deleteMany({});
        await Disease.deleteMany({});
        console.log("🗑️  Cleared existing data");

        // Insert users (password is auto-hashed by the pre-save hook)
        for (const userData of users) {
            await User.create(userData);
        }
        console.log(`👤 Inserted ${users.length} dummy users`);

        // Insert crops
        const insertedCrops = await Crop.insertMany(crops);
        console.log(`🌿 Inserted ${insertedCrops.length} crops`);

        // Map crop names to their IDs
        const cropMap = {};
        insertedCrops.forEach((crop) => {
            cropMap[crop.name] = crop._id;
        });

        // Attach cropId to diseases and insert
        const diseasesWithCropId = diseases.map((d) => ({
            ...d,
            cropId: cropMap[d.cropName],
            cropName: undefined, // remove helper field
        }));

        const insertedDiseases = await Disease.insertMany(diseasesWithCropId);
        console.log(`🦠 Inserted ${insertedDiseases.length} diseases`);

        // Update crops with their commonDiseases references
        for (const disease of insertedDiseases) {
            await Crop.findByIdAndUpdate(disease.cropId, {
                $push: { commonDiseases: disease._id },
            });
        }
        console.log("🔗 Linked diseases to crops");

        console.log("\n✅ Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding error:", error.message);
        process.exit(1);
    }
};

seedDB();
