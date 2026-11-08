import { describe, expect, it } from "vitest";
import {
  combineServices,
  comboProblem,
  depositCentsFor,
  getService,
  priceWithLateFee,
  remainderLabelFor,
  type Service,
} from "../lib/services";

/**
 * Plusieurs prestations dans un même rendez-vous + supplément de créneau
 * tardif (demande de Gradi du 08/11/2026).
 */

const s = (id: string): Service => {
  const service = getService(id);
  if (!service) throw new Error(`Prestation inconnue : ${id}`);
  return service;
};

describe("combineServices", () => {
  it("additionne les durées et les tarifs", () => {
    const combo = combineServices([s("depose-cils"), s("volume-russe")]);
    expect(combo.name).toBe("Dépose + Volume russe");
    expect(combo.durationMin).toBe(30 + 150);
    expect(combo.price).toBe("80 €");
    expect(combo.brand).toBe("naftali");
  });

  it("garde « À partir de » quand une prestation n'a pas de prix fixe", () => {
    const combo = combineServices([s("depose-cils"), s("remplissage-cils")]);
    expect(combo.price).toBe("À partir de 50 €");
  });

  it("additionne les fourchettes de prix", () => {
    const combo = combineServices([s("shooting"), s("manucure-semi")]);
    expect(combo.price).toBe("95 – 105 €");
  });

  it("renvoie la prestation telle quelle quand il n'y en a qu'une", () => {
    expect(combineServices([s("cil-a-cil")])).toBe(s("cil-a-cil"));
  });
});

describe("un seul acompte, quel que soit le nombre de prestations", () => {
  it("20 € pour deux poses", () => {
    expect(depositCentsFor(combineServices([s("cil-a-cil"), s("pose-mixte")]))).toBe(2000);
  });

  it("20 € pour trois prestations ongles + maquillage", () => {
    const combo = combineServices([
      s("manucure-semi"),
      s("pedicure-basic"),
      s("naturel-basic"),
    ]);
    expect(depositCentsFor(combo)).toBe(2000);
  });

  it("20 € pour dépose + pose (la dépose seule reste sans acompte)", () => {
    expect(depositCentsFor(combineServices([s("depose-cils"), s("cil-a-cil")]))).toBe(2000);
    expect(depositCentsFor(s("depose-cils"))).toBe(0);
  });

  it("le reste sur place tient compte de toutes les prestations", () => {
    const combo = combineServices([s("depose-cils"), s("volume-russe")]);
    expect(remainderLabelFor(combo.price, depositCentsFor(combo))).toBe("60 €");
  });
});

describe("comboProblem", () => {
  it("refuse de mélanger les deux pôles", () => {
    expect(comboProblem([s("cil-a-cil"), s("manucure-semi")])).not.toBeNull();
  });

  it("refuse les prestations sur devis dans un enchaînement", () => {
    expect(comboProblem([s("mariee-essai"), s("naturel-basic")])).not.toBeNull();
  });

  it("refuse plus de 3 prestations", () => {
    expect(
      comboProblem([
        s("manucure-semi"),
        s("pedicure-basic"),
        s("naturel-basic"),
        s("remplissage"),
      ]),
    ).not.toBeNull();
  });

  it("accepte ongles + maquillage (même pôle Kandylove)", () => {
    expect(comboProblem([s("manucure-semi"), s("naturel-basic")])).toBeNull();
  });
});

describe("getService — identifiant « id1+id2 » envoyé par le site", () => {
  it("reconstruit l'enchaînement", () => {
    const combo = getService("depose-cils+cil-a-cil");
    expect(combo?.name).toBe("Dépose + Pose cil à cil");
    expect(combo?.durationMin).toBe(150);
  });

  it("refuse un enchaînement invalide", () => {
    expect(getService("cil-a-cil+manucure-semi")).toBeUndefined();
    expect(getService("cil-a-cil+inconnue")).toBeUndefined();
    expect(getService("cil-a-cil+cil-a-cil")).toBeUndefined();
  });
});

describe("priceWithLateFee", () => {
  it("ne change rien en journée", () => {
    expect(priceWithLateFee("65 €", false)).toBe("65 €");
  });

  it("ajoute 10 € en créneau tardif", () => {
    expect(priceWithLateFee("65 €", true)).toBe("75 € (dont 10 € créneau tardif)");
    expect(priceWithLateFee("À partir de 35 €", true)).toBe(
      "À partir de 45 € (dont 10 € créneau tardif)",
    );
  });

  it("le reste sur place inclut le supplément, l'acompte ne bouge pas", () => {
    expect(remainderLabelFor(priceWithLateFee("65 €", true), 2000)).toBe("55 €");
  });
});
