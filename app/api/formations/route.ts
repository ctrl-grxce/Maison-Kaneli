import { NextResponse } from "next/server";
import { getFormation } from "@/lib/services";
import { getSupabase } from "@/lib/supabase-server";
import { formationRequestSchema } from "@/lib/validation";
import { sendFormationEmails } from "@/lib/email";

export const dynamic = "force-dynamic";

/** POST /api/formations — demande d'inscription à une formation. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    (payload as Record<string, unknown>).website
  ) {
    return NextResponse.json({ reference: "MK-OK" }, { status: 201 });
  }

  const parsed = formationRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Certains champs sont invalides.",
        issues: parsed.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const formation = getFormation(input.formationId);
  if (!formation) {
    return NextResponse.json(
      { error: "Formation inconnue." },
      { status: 400 },
    );
  }

  const kitOption = formation.kitOptions.find(
    (option) => option.id === input.kitOption,
  );
  const kitLabel = kitOption
    ? `${kitOption.label} — ${kitOption.price}`
    : undefined;

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "L'envoi de demandes est momentanément indisponible." },
      { status: 503 },
    );
  }

  const { data: requestId, error } = await supabase.rpc(
    "create_formation_request",
    {
      p_formation_id: formation.id,
      p_formation_name: formation.name,
      p_kit_option: kitLabel ?? "",
      p_first_name: input.firstName,
      p_last_name: input.lastName,
      p_email: input.email,
      p_phone: input.phone,
      p_message: input.message ?? "",
    },
  );

  if (error) {
    console.error("[formations] RPC create_formation_request:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Merci de réessayer." },
      { status: 500 },
    );
  }

  const reference = `MK-${String(requestId).slice(0, 6).toUpperCase()}`;

  try {
    await sendFormationEmails({
      reference,
      formationName: formation.name,
      kitOption: kitLabel,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      message: input.message,
    });
  } catch (emailError) {
    console.error("[formations] Envoi d'emails échoué:", emailError);
  }

  return NextResponse.json({ reference }, { status: 201 });
}
