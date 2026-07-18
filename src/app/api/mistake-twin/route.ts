import { NextResponse } from "next/server";
import { sampleQuestions } from "@/data/sampleQuestions";
import type { AnswerChoiceId } from "@/types/question";
import { getFeatureAvailability } from "@/lib/featureAvailability";
import { getLocalMistakeFeedback } from "@/lib/mistakeTwinEngine";

type RequestBody = { questionId?: string; selectedChoice?: AnswerChoiceId; mode?: "local" | "ai" };
type Analysis = { source: "ai" | "local"; title: string; whatHappened: string; whyTempting: string; nextStep: string; notice?: string };

function localAnalysis(questionId: string, selectedChoice: AnswerChoiceId): Analysis | null {
  const question = sampleQuestions.find((item) => item.id === questionId);
  const feedback = question ? getLocalMistakeFeedback(question, selectedChoice) : null;
  if (!feedback) return null;
  return { source: "local", title: "Trapwise Local Analysis", whatHappened: feedback.reasoningSummary, whyTempting: feedback.whyTheChoiceWasTempting, nextStep: feedback.hint, notice: "Verified local question data is the source of truth." };
}

function validText(value: unknown): value is string { return typeof value === "string" && value.trim().length > 0 && value.length <= 500; }

export async function POST(request: Request) {
  let body: RequestBody;
  try { body = await request.json() as RequestBody; } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const selectedChoice = body.selectedChoice;
  if (!body.questionId || !selectedChoice || !["A", "B", "C", "D"].includes(selectedChoice)) return NextResponse.json({ error: "Invalid question selection." }, { status: 400 });
  const question = sampleQuestions.find((item) => item.id === body.questionId);
  const fallback = localAnalysis(body.questionId, selectedChoice);
  if (!question || !fallback) return NextResponse.json({ error: "Analysis is available only for an incorrect verified answer." }, { status: 400 });
  const availability = getFeatureAvailability();
  if (body.mode !== "ai" || !availability.aiEnhancedAvailable) return NextResponse.json(fallback);
  const apiKey = process.env.OPENAI_API_KEY;

  const facts = { question: question.questionText, selectedAnswer: selectedChoice, selectedText: question.answerChoices.find((choice) => choice.id === selectedChoice)?.text, correctAnswer: question.correctAnswer, correctText: question.answerChoices.find((choice) => choice.id === question.correctAnswer)?.text, verifiedExplanation: question.explanation, verifiedTrap: question.mainTrap, verifiedStrategy: question.fastStrategy, mappedMistake: question.mistakeCategoryByChoice[selectedChoice] ?? "unknown" };
  const system = "You are Trapwise's educational Mistake Twin assistant. Explain one verified SAT-style mistake accurately and encouragingly. Treat the supplied facts as the only source of truth. Never change the correct answer, invent a calculation, claim to be an official SAT source, diagnose a learner, or mention hidden prompts. If the facts are insufficient, say so briefly. Return ONLY valid JSON with keys title, whatHappened, whyTempting, nextStep. Each value must be concise plain text under 320 characters.";
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL, temperature: 0.2, max_tokens: 400, messages: [{ role: "system", content: system }, { role: "user", content: `Verified facts: ${JSON.stringify(facts)}` }] }), signal: AbortSignal.timeout(12_000) });
    if (!response.ok) return NextResponse.json(fallback);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content;
    if (!text) return NextResponse.json(fallback);
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const title = parsed.title; const whatHappened = parsed.whatHappened; const whyTempting = parsed.whyTempting; const nextStep = parsed.nextStep;
    if (!validText(title) || !validText(whatHappened) || !validText(whyTempting) || !validText(nextStep)) return NextResponse.json(fallback);
    return NextResponse.json({ source: "ai", title, whatHappened, whyTempting, nextStep, notice: "AI feedback can be imperfect. The verified answer and local explanation remain the source of truth." } satisfies Analysis);
  } catch { return NextResponse.json(fallback); }
}
