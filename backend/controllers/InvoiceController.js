const Invoice = require("../models/Invoice");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const multer = require("multer");
const { createWorker } = require("tesseract.js");
const PDFParser = require("pdf-parse");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/invoices");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "invoice-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept PDF and images only
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and image files are allowed"), false);
    }
  },
});

// Extract text from PDF file
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  try {
    const data = await PDFParser(dataBuffer);
    return data.text;
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(
      `Failed to extract text from PDF: ${
        error.message ||
        "The PDF may be damaged, encrypted, or contain only images without text."
      }`
    );
  }
}

// Extract text from image using OCR
async function extractTextFromImage(filePath) {
  const worker = await createWorker();
  try {
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(filePath);
    await worker.terminate();
    return data.text;
  } catch (error) {
    console.error("Error performing OCR:", error);
    throw new Error(
      `OCR processing failed: ${
        error.message ||
        "The image may be low quality or blurry. Try uploading a clearer image or a PDF instead."
      }`
    );
  }
}

// Extract invoice metadata using OpenAI API
async function extractInvoiceMetadata(invoiceText) {
  try {
    // Using GPT-4o for more accurate extraction of invoice metadata
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant specialized in extracting metadata from utility invoices. Your task is to identify invoice details and utility types with high precision. Return ONLY a valid JSON object with the requested fields.",
          },
          {
            role: "user",
            content: `Extract the following information from this utility invoice:

INVOICE TEXT:
${invoiceText}

Return a JSON object with EXACTLY these fields:
{
  "invoiceDate": "YYYY-MM-DD", // The invoice date in ISO format
  "invoiceNumber": "ABC123", // The invoice number or reference ID
  "provider": "Company Name", // The utility company name
  "identifiedTypes": ["energy", "water", "gas"], // Array of ALL utility types found (only use: energy, water, gas, other)
  "primaryType": "energy" // The main utility type (must be one of: energy, water, gas, other)
}

Guidelines:
1. For invoice date, convert to YYYY-MM-DD format
2. If you detect electricity or power, classify as "energy"
3. Only include utility types that are actually present in the invoice
4. For combined utilities, list all types in identifiedTypes
5. If you can't determine a value, use reasonable defaults or empty strings`,
          },
        ],
        temperature: 0.0,
        response_format: { type: "json_object" },
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiResponse = response.data.choices[0].message.content;
    let metadata;

    try {
      metadata = JSON.parse(aiResponse);
      console.log(
        "Extracted invoice metadata:",
        JSON.stringify(metadata, null, 2)
      );
    } catch (parseError) {
      console.error("Error parsing JSON from API response:", parseError);
      // Fallback to defaults
      metadata = {
        invoiceDate: new Date().toISOString().split("T")[0], // Today's date as default
        invoiceNumber: `AUTO-${Date.now()}`,
        provider: "Unknown Provider",
        primaryType: "other",
        identifiedTypes: ["other"],
      };
    }

    // Validate the invoice type
    if (!["energy", "water", "gas", "other"].includes(metadata.primaryType)) {
      metadata.primaryType = "other";
    }

    // Ensure the identifiedTypes is valid and normalized
    if (
      !Array.isArray(metadata.identifiedTypes) ||
      metadata.identifiedTypes.length === 0
    ) {
      metadata.identifiedTypes = [metadata.primaryType || "other"];
    } else {
      // Normalize type names and filter to only valid types
      metadata.identifiedTypes = metadata.identifiedTypes
        .map((type) => {
          // Normalize common variations
          if (
            type.includes("electric") ||
            type.includes("power") ||
            type === "kwh"
          ) {
            return "energy";
          }
          if (type.includes("h2o")) {
            return "water";
          }
          if (type.includes("natural")) {
            return "gas";
          }
          return type;
        })
        .filter((type) => ["energy", "water", "gas", "other"].includes(type));

      // Remove duplicates
      metadata.identifiedTypes = [...new Set(metadata.identifiedTypes)];

      if (metadata.identifiedTypes.length === 0) {
        metadata.identifiedTypes = [metadata.primaryType || "other"];
      }
    }

    // Ensure date is in proper format, default to today if invalid
    if (
      !metadata.invoiceDate ||
      !/^\d{4}-\d{2}-\d{2}$/.test(metadata.invoiceDate)
    ) {
      metadata.invoiceDate = new Date().toISOString().split("T")[0];
    }

    // Ensure invoiceNumber is present
    if (!metadata.invoiceNumber) {
      metadata.invoiceNumber = `AUTO-${Date.now()}`;
    }

    // Ensure provider is present
    if (!metadata.provider) {
      metadata.provider = "Unknown Provider";
    }

    // Map primaryType to type for backward compatibility
    metadata.type = metadata.primaryType;

    return metadata;
  } catch (error) {
    console.error(
      "Error calling OpenAI API for metadata extraction:",
      error.response?.data || error.message
    );
    // Return default values if extraction fails
    return {
      invoiceDate: new Date().toISOString().split("T")[0],
      invoiceNumber: `AUTO-${Date.now()}`,
      provider: "Unknown Provider",
      type: "other",
      primaryType: "other",
      identifiedTypes: ["other"],
    };
  }
}

// Calculate CO2 emissions using OpenAI API
async function calculateEmissions(invoiceText, invoiceType) {
  try {
    // Add a check for valid API key
    if (
      !process.env.OPENAI_API_KEY ||
      process.env.OPENAI_API_KEY.includes("your_openai_api_key") ||
      !(
        process.env.OPENAI_API_KEY.startsWith("sk-") ||
        process.env.OPENAI_API_KEY.startsWith("sk-proj-")
      )
    ) {
      throw new Error(
        "Invalid or missing OpenAI API key in server configuration"
      );
    }

    console.log("Making OpenAI API call for emissions calculation...");

    // Create a hash of the invoice text to enable caching in the future
    // This ensures that identical documents get processed consistently
    const invoiceHash = require("crypto")
      .createHash("md5")
      .update(invoiceText)
      .digest("hex");

    console.log(`Processing invoice with hash: ${invoiceHash}`);

    // Define standard emission factors that will be used consistently
    const STANDARD_EMISSION_FACTORS = {
      energy: 0.233, // kg CO₂/kWh (standard for electricity)
      gas: 2.0, // kg CO₂/m³ (standard for natural gas)
      water: 0.344, // kg CO₂/m³ (standard for water)
    };

    // First request to extract the exact consumption data
    const extractionResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o", // Use a more capable model for extraction
        messages: [
          {
            role: "system",
            content:
              "You are a specialized utility invoice data extractor. Your only task is to identify utility types (energy/electricity, gas, water) and extract their consumption values from invoices. Return ONLY a valid JSON object with this data.",
          },
          {
            role: "user",
            content: `Extract the consumption data from this utility invoice. Only focus on energy, gas, and water consumption, nothing else.

INVOICE TEXT:
${invoiceText}

Return a JSON object with the following structure:
{
  "detectedTypes": ["energy", "gas", "water"], // Include only types that are present
  "consumptionData": {
    "energy": { "value": 450, "unit": "kWh" }, // Include only if energy usage is found
    "gas": { "value": 120, "unit": "m³" },     // Include only if gas usage is found
    "water": { "value": 15, "unit": "m³" }     // Include only if water usage is found
  },
  "provider": "Company Name",                  // The utility provider name
  "invoiceDate": "YYYY-MM-DD"                  // The date on the invoice
}`,
          },
        ],
        temperature: 0.0, // No randomness for consistent extraction
        response_format: { type: "json_object" },
        max_tokens: 800,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    let consumptionData;
    try {
      consumptionData = JSON.parse(
        extractionResponse.data.choices[0].message.content
      );
      console.log(
        "Extracted consumption data:",
        JSON.stringify(consumptionData, null, 2)
      );
    } catch (parseError) {
      console.error("Error parsing consumption data JSON:", parseError);
      consumptionData = {
        detectedTypes: [invoiceType],
        consumptionData: {},
        provider: "Unknown Provider",
        invoiceDate: new Date().toISOString().split("T")[0],
      };
    }

    // Calculate emissions based on the extracted consumption data and standard factors
    const emissionBreakdown = {};
    const detectedTypes = consumptionData.detectedTypes || [];
    let totalEmissions = 0;

    // Apply the standardized calculation for each detected type
    for (const type of detectedTypes) {
      if (
        consumptionData.consumptionData[type] &&
        consumptionData.consumptionData[type].value
      ) {
        const consumption = parseFloat(
          consumptionData.consumptionData[type].value
        );
        const emissionFactor = STANDARD_EMISSION_FACTORS[type] || 0.5; // Default factor if unknown

        // Calculate emissions with precise mathematical operation
        const typeEmissions = Number((consumption * emissionFactor).toFixed(3));
        emissionBreakdown[type] = typeEmissions;
        totalEmissions += typeEmissions;
      }
    }

    // Format the totalEmissions to 3 decimal places for consistency
    totalEmissions = Number(totalEmissions.toFixed(3));

    // If no emissions were calculated but we have a type, use default values
    if (totalEmissions === 0 && detectedTypes.length > 0) {
      const type = detectedTypes[0];
      emissionBreakdown[type] = STANDARD_EMISSION_FACTORS[type] * 100;
      totalEmissions = emissionBreakdown[type];
    }

    // Now generate a detailed analysis using the calculated values for consistency
    const analysisMessages = [
      {
        role: "system",
        content:
          "You are a CO2 emissions calculator presenting analysis results. You will be given the exact consumption data and emission factors that have been already calculated. Your job is to format this into a clear, readable report.",
      },
      {
        role: "user",
        content: `Generate a formatted CO2 emissions analysis report using these EXACT values:

CONSUMPTION DATA:
${JSON.stringify(consumptionData.consumptionData, null, 2)}

DETECTED TYPES:
${JSON.stringify(detectedTypes, null, 2)}

EMISSION FACTORS:
${JSON.stringify(STANDARD_EMISSION_FACTORS, null, 2)}

CALCULATED EMISSIONS:
${JSON.stringify(emissionBreakdown, null, 2)}

TOTAL EMISSIONS:
${totalEmissions} kg CO₂

Format the report with clearly labeled sections for each utility type, including:
1. Consumption
2. Emission Factor
3. Calculation
4. Total Emissions

Make sure the calculations shown exactly match the data provided.`,
      },
    ];

    const analysisResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: analysisMessages,
        temperature: 0.0,
        max_tokens: 1000,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiAnalysis = analysisResponse.data.choices[0].message.content;
    console.log("Generated analysis report for invoice");

    // Get primary consumption and unit for backward compatibility
    let consumption = "";
    let consumptionUnit = "";
    let emissionFactor = "";

    if (detectedTypes.length > 0) {
      const primaryType = detectedTypes[0];
      if (consumptionData.consumptionData[primaryType]) {
        consumption = String(
          consumptionData.consumptionData[primaryType].value
        );
        consumptionUnit = consumptionData.consumptionData[primaryType].unit;
        emissionFactor = `${STANDARD_EMISSION_FACTORS[primaryType]} kg CO₂/${consumptionUnit}`;
      }
    }

    console.log(
      `Final calculation - Total: ${totalEmissions} kg CO₂, Types: ${JSON.stringify(
        emissionBreakdown
      )}`
    );

    return {
      emissions: totalEmissions,
      analysis: aiAnalysis,
      consumption,
      consumptionUnit,
      emissionFactor,
      emissionTypes: detectedTypes,
      emissionBreakdown,
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);

    // Provide more specific error messages based on error type
    if (error.response) {
      // The request was made and the server responded with a status code outside the 2xx range
      const statusCode = error.response.status;
      const responseData = error.response.data || {};

      if (statusCode === 401) {
        throw new Error("OpenAI API authentication failed: Invalid API key");
      } else if (statusCode === 429) {
        throw new Error("OpenAI API rate limit exceeded: Too many requests");
      } else if (statusCode === 400) {
        throw new Error(
          `OpenAI API error: ${responseData.error?.message || "Bad request"}`
        );
      } else {
        throw new Error(
          `OpenAI API error (${statusCode}): ${
            responseData.error?.message || "Unknown error"
          }`
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error(
        "Network error: No response from OpenAI API. Check your internet connection."
      );
    } else if (error.message?.includes("Invalid or missing OpenAI API key")) {
      throw new Error(error.message);
    } else {
      // Something happened in setting up the request
      throw new Error(`Failed to calculate emissions: ${error.message}`);
    }
  }
}

// Generate mock emissions data for testing or fallback
function generateMockEmissionsData(invoiceType) {
  // This version of the function always returns the same values for each type
  // This ensures consistency when falling back to mock data

  let consumption, consumptionUnit, emissionFactor, emissions;
  let emissionTypes = [];
  let emissionBreakdown = {};

  // Fixed values for each type
  switch (invoiceType) {
    case "energy":
      consumption = "450";
      consumptionUnit = "kWh";
      emissionFactor = "0.233 kg CO₂/kWh";
      emissions = 104.85; // 450 * 0.233
      emissionTypes.push("energy");
      emissionBreakdown["energy"] = 104.85;
      break;
    case "water":
      consumption = "15";
      consumptionUnit = "m³";
      emissionFactor = "0.344 kg CO₂/m³";
      emissions = 5.16; // 15 * 0.344
      emissionTypes.push("water");
      emissionBreakdown["water"] = 5.16;
      break;
    case "gas":
      consumption = "120";
      consumptionUnit = "m³";
      emissionFactor = "2.0 kg CO₂/m³";
      emissions = 240; // 120 * 2.0
      emissionTypes.push("gas");
      emissionBreakdown["gas"] = 240;
      break;
    default: // other
      consumption = "100";
      consumptionUnit = "units";
      emissionFactor = "0.5 kg CO₂/unit";
      emissions = 50; // 100 * 0.5
      emissionTypes.push("other");
      emissionBreakdown["other"] = 50;
  }

  // For combined utilities (if the type contains multiple types)
  if (invoiceType.includes("energy") && invoiceType.includes("gas")) {
    // Combined energy and gas
    emissionTypes = ["energy", "gas"];
    emissionBreakdown = {
      energy: 104.85,
      gas: 240,
    };
    emissions = 344.85; // Total of both

    const mockAnalysis = `
## CO2 Emissions Analysis (MOCK DATA)

### Energy Consumption
450 kWh

### Energy Emission Factor
0.233 kg CO₂/kWh

### Energy Calculation
450 kWh × 0.233 kg CO₂/kWh = 104.85 kg CO₂

### Gas Consumption
120 m³

### Gas Emission Factor
2.0 kg CO₂/m³

### Gas Calculation
120 m³ × 2.0 kg CO₂/m³ = 240 kg CO₂

### Total Emissions
344.85 kg CO₂

*Note: This is simulated data generated because the AI analysis service is currently unavailable.*
`;

    return {
      emissions,
      analysis: mockAnalysis,
      consumption,
      consumptionUnit,
      emissionFactor,
      emissionTypes,
      emissionBreakdown,
    };
  }

  // For combined utilities (if the type contains multiple types)
  if (invoiceType.includes("energy") && invoiceType.includes("water")) {
    // Combined energy and water
    emissionTypes = ["energy", "water"];
    emissionBreakdown = {
      energy: 104.85,
      water: 5.16,
    };
    emissions = 110.01; // Total of both

    const mockAnalysis = `
## CO2 Emissions Analysis (MOCK DATA)

### Energy Consumption
450 kWh

### Energy Emission Factor
0.233 kg CO₂/kWh

### Energy Calculation
450 kWh × 0.233 kg CO₂/kWh = 104.85 kg CO₂

### Water Consumption
15 m³

### Water Emission Factor
0.344 kg CO₂/m³

### Water Calculation
15 m³ × 0.344 kg CO₂/m³ = 5.16 kg CO₂

### Total Emissions
110.01 kg CO₂

*Note: This is simulated data generated because the AI analysis service is currently unavailable.*
`;

    return {
      emissions,
      analysis: mockAnalysis,
      consumption,
      consumptionUnit,
      emissionFactor,
      emissionTypes,
      emissionBreakdown,
    };
  }

  const mockAnalysis = `
## CO2 Emissions Analysis (MOCK DATA)

### ${invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1)} Consumption
${consumption} ${consumptionUnit}

### ${
    invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1)
  } Emission Factor
${emissionFactor}

### ${invoiceType.charAt(0).toUpperCase() + invoiceType.slice(1)} Calculation
${consumption} ${consumptionUnit} × ${
    emissionFactor.split(" ")[0]
  } kg CO₂/${consumptionUnit} = ${emissions} kg CO₂

### Total Emissions
${emissions} kg CO₂

*Note: This is simulated data generated because the AI analysis service is currently unavailable.*
`;

  return {
    emissions,
    analysis: mockAnalysis,
    consumption,
    consumptionUnit,
    emissionFactor,
    emissionTypes,
    emissionBreakdown,
  };
}

// Upload and process invoice
exports.uploadInvoice = async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    // Handle file upload
    upload.single("file")(req, res, async function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      try {
        // Extract text from the uploaded file based on file type
        let extractedText = "";
        try {
          if (req.file.mimetype === "application/pdf") {
            extractedText = await extractTextFromPDF(req.file.path);
          } else if (req.file.mimetype.startsWith("image/")) {
            extractedText = await extractTextFromImage(req.file.path);
          }
        } catch (extractionError) {
          console.error("Text extraction error:", extractionError);
          return res.status(422).json({
            success: false,
            message:
              extractionError.message || "Failed to extract text from the file",
          });
        }

        // Extract metadata from the invoice text
        let metadata;
        try {
          metadata = await extractInvoiceMetadata(extractedText);
          console.log("Extracted metadata:", metadata);
        } catch (metadataError) {
          console.error("Metadata extraction error:", metadataError);
          // Use fallback metadata if extraction fails
          metadata = {
            invoiceDate: new Date().toISOString().split("T")[0],
            invoiceNumber: `AUTO-${Date.now()}`,
            provider: "Unknown Provider",
            type: "other",
          };
        }

        // Use metadata or fallback to manual inputs from request body if provided
        const invoiceDate = req.body.invoiceDate || metadata.invoiceDate;
        // Always ensure invoiceNumber is set with a fallback
        const invoiceNumber =
          req.body.invoiceNumber ||
          metadata.invoiceNumber ||
          `AUTO-${Date.now()}`;
        const provider = req.body.provider || metadata.provider;

        // Create a consistent normalized type from the identified types
        const identifiedTypes = metadata.identifiedTypes || ["other"];
        let normalizedType;
        if (
          identifiedTypes.includes("energy") &&
          identifiedTypes.includes("gas")
        ) {
          normalizedType = "energygas"; // Combined type for energy and gas
        } else if (
          identifiedTypes.includes("energy") &&
          identifiedTypes.includes("water")
        ) {
          normalizedType = "energywater"; // Combined type for energy and water
        } else if (identifiedTypes.length > 0) {
          normalizedType = identifiedTypes[0]; // Use the first identified type
        } else {
          normalizedType = "other"; // Default to other if nothing is identified
        }

        // Store the normalized type and all identified types
        const type = normalizedType;

        // Calculate CO2 emissions
        let emissionsData;
        try {
          // Pass consistent type information to the emissions calculator
          emissionsData = await calculateEmissions(extractedText, type);
        } catch (emissionsError) {
          console.error("Emissions calculation error:", emissionsError);

          // Instead of failing, use mock data
          console.log("Using mock emissions data due to API error");
          emissionsData = generateMockEmissionsData(type);

          // Add warning message to the analysis
          emissionsData.analysis =
            `WARNING: OpenAI API error (${emissionsError.message})\n\n` +
            emissionsData.analysis;
        }

        // Log to ensure we have a valid user ID
        console.log("Creating invoice for user ID:", req.user._id);

        // Convert Map to Object for storage
        const emissionBreakdownObj = {};
        if (emissionsData.emissionBreakdown) {
          if (emissionsData.emissionBreakdown instanceof Map) {
            for (const [
              key,
              value,
            ] of emissionsData.emissionBreakdown.entries()) {
              emissionBreakdownObj[key] = value;
            }
          } else {
            // It's already an object
            Object.assign(
              emissionBreakdownObj,
              emissionsData.emissionBreakdown
            );
          }
        }

        // Create invoice record in database
        const invoice = new Invoice({
          fileName: req.file.filename,
          originalName: req.file.originalname,
          filePath: req.file.path,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          invoiceDate,
          invoiceNumber,
          provider,
          type, // Keep the primary type
          emissionTypes: emissionsData.emissionTypes ||
            identifiedTypes || [type], // Use all detected types
          emissionBreakdown: emissionBreakdownObj,
          co2Emissions: emissionsData.emissions,
          aiAnalysis: emissionsData.analysis,
          rawText: extractedText,
          userId: req.user._id, // Using the authenticated user's ID
          consumption: emissionsData.consumption,
          consumptionUnit: emissionsData.consumptionUnit,
          emissionFactor: emissionsData.emissionFactor,
        });

        await invoice.save();

        res.status(201).json({
          success: true,
          message: "Invoice uploaded and processed successfully",
          invoice: {
            id: invoice._id,
            fileName: invoice.fileName,
            originalName: invoice.originalName,
            invoiceDate: invoice.invoiceDate,
            invoiceNumber: invoice.invoiceNumber,
            provider: invoice.provider,
            type: invoice.type,
            emissionTypes: invoice.emissionTypes,
            co2Emissions: invoice.co2Emissions,
            emissionBreakdown: emissionBreakdownObj,
            emissionsUnit: invoice.emissionsUnit,
            consumption: invoice.consumption,
            consumptionUnit: invoice.consumptionUnit,
            emissionFactor: invoice.emissionFactor,
            createdAt: invoice.createdAt,
          },
          analysis: emissionsData.analysis,
        });
      } catch (error) {
        console.error("Processing error:", error);
        // Remove the uploaded file if processing fails
        if (fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (unlinkError) {
            console.error("Error removing file:", unlinkError);
          }
        }
        res.status(500).json({
          success: false,
          message: error.message || "Failed to process invoice",
        });
      }
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all invoices for a user
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices.map((invoice) => ({
        id: invoice._id,
        fileName: invoice.fileName,
        originalName: invoice.originalName,
        invoiceDate: invoice.invoiceDate,
        invoiceNumber: invoice.invoiceNumber,
        provider: invoice.provider,
        type: invoice.type,
        emissionTypes: invoice.emissionTypes || [invoice.type],
        emissionBreakdown: invoice.emissionBreakdown || {},
        co2Emissions: invoice.co2Emissions,
        emissionsUnit: invoice.emissionsUnit,
        consumption: invoice.consumption,
        consumptionUnit: invoice.consumptionUnit,
        emissionFactor: invoice.emissionFactor,
        uploadDate: invoice.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
    });
  }
};

// Get a single invoice by ID
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: invoice._id,
        fileName: invoice.fileName,
        originalName: invoice.originalName,
        invoiceDate: invoice.invoiceDate,
        invoiceNumber: invoice.invoiceNumber,
        provider: invoice.provider,
        type: invoice.type,
        emissionTypes: invoice.emissionTypes || [invoice.type],
        emissionBreakdown: invoice.emissionBreakdown || {},
        co2Emissions: invoice.co2Emissions,
        emissionsUnit: invoice.emissionsUnit,
        aiAnalysis: invoice.aiAnalysis,
        consumption: invoice.consumption,
        consumptionUnit: invoice.consumptionUnit,
        emissionFactor: invoice.emissionFactor,
        uploadDate: invoice.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoice",
    });
  }
};

// Download an invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (!fs.existsSync(invoice.filePath)) {
      return res.status(404).json({
        success: false,
        message: "Invoice file not found",
      });
    }

    res.download(invoice.filePath, invoice.originalName);
  } catch (error) {
    console.error("Error downloading invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download invoice",
    });
  }
};

// Delete an invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Remove file from storage
    if (fs.existsSync(invoice.filePath)) {
      fs.unlinkSync(invoice.filePath);
    }

    // Remove from database
    await Invoice.findByIdAndDelete(invoice._id);

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
    });
  }
};
