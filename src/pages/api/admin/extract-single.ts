import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import jwt from "jsonwebtoken";
import { extractFromPDF } from "@/lib/import/pdf-processor";
import { removeBackground } from "@/lib/import/background-removal";
import { uploadToCloudinary } from "@/lib/import/job-processor";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.cookies.admin_token;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    jwt.verify(token, process.env.ADMIN_JWT_SECRET as string);
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024,
      keepExtensions: true,
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const fileArray = files.file;
    const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileBuffer = fs.readFileSync(file.filepath);
    
    // We only process the first item found in the PDF
    const extractedData = await extractFromPDF(fileBuffer);
    
    if (extractedData.length === 0) {
      return res.status(400).json({ error: "Could not extract any cycle data from this PDF." });
    }

    const item = extractedData[0];
    let imageUrl = null;
    let publicId = null;

    if (item.imageBuffer) {
      try {
        const bgRemoved = await removeBackground(item.imageBuffer);
        const uploaded = await uploadToCloudinary(bgRemoved.buffer, "udaya-cycles/products");
        if (uploaded) {
          imageUrl = uploaded.secure_url;
          publicId = uploaded.public_id;
        }
      } catch (err) {
        console.error("Failed to process/upload image:", err);
      }
    }

    return res.status(200).json({
      name: item.name || "",
      category: item.category || "",
      brand: item.brand || "",
      image: imageUrl ? { url: imageUrl, publicId } : null
    });

  } catch (error: any) {
    console.error("[POST /api/admin/extract-single]", error);
    return res.status(500).json({ error: error.message || "Failed to extract data" });
  }
}
