import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createSessionValue,
  verifySessionValue,
  verifyCode,
  safeEqual,
  sessionFromRequest,
  GESTION_COOKIE,
} from "../lib/gestion-auth";

/**
 * Accès à l'espace de gestion : le code secret et le cookie signé.
 * Aucune base ni réseau — tout est pur et déterministe.
 */

const CODE = "code-test-1234";

beforeEach(() => {
  process.env.ADMIN_CODE = CODE;
});
afterEach(() => {
  delete process.env.ADMIN_CODE;
});

describe("verifyCode", () => {
  it("accepte le bon code (espaces tolérés)", () => {
    expect(verifyCode(CODE)).toBe(true);
    expect(verifyCode(`  ${CODE}  `)).toBe(true);
  });

  it("refuse un mauvais code, un code vide, un code partiel", () => {
    expect(verifyCode("mauvais")).toBe(false);
    expect(verifyCode("")).toBe(false);
    expect(verifyCode(CODE.slice(0, -1))).toBe(false);
  });

  it("refuse tout si ADMIN_CODE n'est pas configuré", () => {
    delete process.env.ADMIN_CODE;
    expect(verifyCode(CODE)).toBe(false);
  });

  it("tolère un BOM invisible collé dans la variable (piège PowerShell)", () => {
    process.env.ADMIN_CODE = `﻿${CODE}\n`;
    expect(verifyCode(CODE)).toBe(true);
  });
});

describe("cookie de session", () => {
  it("créé puis vérifié : valide", () => {
    const value = createSessionValue();
    expect(value).toBeTruthy();
    expect(verifySessionValue(value!)).toBe(true);
  });

  it("expiré : refusé", () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60_000;
    const value = createSessionValue(eightDaysAgo);
    expect(verifySessionValue(value!)).toBe(false);
  });

  it("signature falsifiée ou format cassé : refusés", () => {
    const value = createSessionValue()!;
    const [expires] = value.split(".");
    expect(verifySessionValue(`${expires}.deadbeef`)).toBe(false);
    expect(verifySessionValue("pasdepoint")).toBe(false);
    expect(verifySessionValue("")).toBe(false);
    expect(verifySessionValue(undefined)).toBe(false);
  });

  it("expiration trafiquée (repoussée) : la signature ne colle plus", () => {
    const value = createSessionValue()!;
    const [expires, signature] = value.split(".");
    const later = String(Number(expires) + 1_000_000);
    expect(verifySessionValue(`${later}.${signature}`)).toBe(false);
  });

  it("un changement de code invalide toutes les sessions", () => {
    const value = createSessionValue()!;
    process.env.ADMIN_CODE = "nouveau-code";
    expect(verifySessionValue(value)).toBe(false);
  });
});

describe("sessionFromRequest", () => {
  it("extrait le cookie de gestion parmi d'autres", () => {
    const value = createSessionValue()!;
    const request = new Request("https://maisonkanali.fr/api/gestion/bookings", {
      headers: { cookie: `autre=1; ${GESTION_COOKIE}=${value}; x=2` },
    });
    expect(sessionFromRequest(request)).toBe(value);
    expect(verifySessionValue(sessionFromRequest(request))).toBe(true);
  });

  it("absent : undefined", () => {
    const request = new Request("https://maisonkanali.fr/api/gestion/bookings");
    expect(sessionFromRequest(request)).toBeUndefined();
  });
});

describe("safeEqual", () => {
  it("égalité stricte, longueurs différentes refusées", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });
});
