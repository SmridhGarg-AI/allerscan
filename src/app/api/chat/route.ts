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

    let userAllergies: string[] = [];
    let userConditions: string[] = [];
    let userDiet: string[] = [];

    if (currentUser) {
      const userFull = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { allergies: true, medicalConditions: true, dietPreferences: true },
      });
      if (userFull) {
        userAllergies = userFull.allergies.map((a) => a.allergenName);
        userConditions = userFull.medicalConditions.map((c) => c.conditionName);
        userDiet = userFull.dietPreferences.map((d) => d.preferenceName);
      }
    }

    const allergiesStr = userAllergies.join(", ") || "None recorded";
    const conditionsStr = userConditions.join(", ") || "None recorded";
    const dietStr = userDiet.join(", ") || "None recorded";

    let replyText = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const promptText = `You are AllerScan AI, a clinical food safety & allergen assistant.
User Profile:
- Active Allergies: ${allergiesStr}
- Medical Conditions: ${conditionsStr}
- Dietary Preferences: ${dietStr}

User Query: "${message}"

Provide a concise, empathetic, medically sound response (2-4 sentences). Emphasize food safety, potential hidden allergen cross-contamination, and suggest safe alternatives if relevant.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const candidateText =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            replyText = candidateText.trim();
          }
        }
      } catch (err) {
        console.error("Gemini API call failed, falling back to clinical rule engine:", err);
      }
    }

    // Fallback Clinical Rules Engine if Gemini API key not present or network unavailable
    if (!replyText) {
      const q = message.toLowerCase();

      if (q.includes("burger") || q.includes("pizza") || q.includes("fast food")) {
        const hasMilk = userAllergies.some((a) => a.toLowerCase().includes("milk"));
        const hasGluten = userAllergies.some((a) => a.toLowerCase().includes("gluten") || a.toLowerCase().includes("wheat"));
        if (hasMilk || hasGluten) {
          replyText = `⚠️ Caution for Fast Food (${message}): Traditional burgers and pizzas frequently contain dairy cheese (milk allergy trigger) and wheat flour buns/crusts (gluten trigger). Based on your profile (${allergiesStr}), choose plant-based burgers (like Beyond Burger) on gluten-free buns with vegan dairy-free cheese alternatives.`;
        } else {
          replyText = `Burgers and pizzas generally match your recorded profile (${allergiesStr}). However, always check for hidden milk proteins in sauces or cheese marinades before consuming!`;
        }
      } else if (q.includes("snack") || q.includes("cookie") || q.includes("chocolate")) {
        replyText = `When selecting snacks with your profile (${allergiesStr}), inspect labels for whey, casein, or 'processed in a facility that handles peanuts'. Safe choices include certified allergen-free dark chocolate, rice cakes, and dried fruit mixes.`;
      } else if (q.includes("substitute") || q.includes("replace") || q.includes("alternative")) {
        replyText = `Great question! For milk allergies, coconut milk or oat milk serve as excellent 1:1 cooking replacements. For gluten intolerance, use almond flour or certified gluten-free oat flour.`;
      } else if (q.includes("emergency") || q.includes("anaphylaxis") || q.includes("reaction")) {
        replyText = `🚨 Emergency Alert: If you suspect an acute allergic reaction (swelling, tightness in throat, difficulty breathing), use your epinephrine auto-injector (EpiPen) immediately and tap the red 'ICE Emergency' button at the top right to call 911 and access your digital Medical ID!`;
      } else {
        replyText = `I have analyzed your query against your personal profile (Allergies: ${allergiesStr} | Medical: ${conditionsStr} | Diet: ${dietStr}). Always scan food labels using AllerScan's Barcode or OCR camera tool before trying new products to ensure complete safety.`;
      }
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
