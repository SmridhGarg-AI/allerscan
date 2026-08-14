import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiResponse } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    const body = await req.json();
    const { message, conversationId } = body;

    if (!message) {
      return apiResponse.error("Message is required", 400);
    }

    let userAllergiesStr = "None specified";
    let userConditionsStr = "None specified";

    if (currentUser) {
      const userFull = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { allergies: true, medicalConditions: true },
      });
      if (userFull) {
        userAllergiesStr = userFull.allergies.map((a) => a.allergenName).join(", ") || "None specified";
        userConditionsStr = userFull.medicalConditions.map((c) => c.conditionName).join(", ") || "None specified";
      }
    }

    // Generate intelligent assistant response
    const msgLower = message.toLowerCase();
    let replyText = "";

    if (msgLower.includes("safe") || msgLower.includes("eat")) {
      replyText = `Based on your profile (Allergies: ${userAllergiesStr}), AllerScan evaluates products by checking both direct allergens and hidden protein derivatives (like casein or whey for milk allergies). Always check the safety badge on barcode or OCR scans!`;
    } else if (msgLower.includes("lactose") || msgLower.includes("milk")) {
      replyText = `Lactose intolerance relates to sugar digestion, whereas a Milk Allergy involves an immune response to milk proteins (casein/whey). For milk allergies, avoid all dairy derivatives. Recommended substitutes include Almond milk, Oat milk, and Soy milk.`;
    } else if (msgLower.includes("peanuts") || msgLower.includes("nut")) {
      replyText = `Peanut allergies require strict avoidance of groundnuts, arachis oil, and items labeled 'processed on equipment that processes peanuts'. Carry your EpiPen at all times and check AllerScan's ICE Emergency tab in case of accidental exposure.`;
    } else {
      replyText = `Hello! I am your AllerScan AI Health Assistant. I analyze ingredients against your active allergy profile (${userAllergiesStr}) and medical conditions (${userConditionsStr}). How can I help you find safe food options today?`;
    }

    let convId = conversationId;
    if (currentUser) {
      if (!convId) {
        const conv = await prisma.conversation.create({
          data: {
            userId: currentUser.id,
            title: message.substring(0, 30) + "...",
          },
        });
        convId = conv.id;
      }

      await prisma.conversationMessage.createMany({
        data: [
          { conversationId: convId, sender: "USER", text: message },
          { conversationId: convId, sender: "ASSISTANT", text: replyText },
        ],
      });
    }

    return apiResponse.success({
      conversationId: convId,
      reply: replyText,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return apiResponse.error("Failed to generate chat response", 500);
  }
}
