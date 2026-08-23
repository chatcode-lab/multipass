import { describe, expect, it } from "vitest";
import fallbackSnapshot from "./fallback.json";
import combinationInsights from "./combination-insights.json";
import { PASSPORT_COLORS } from "./passport-colors";
import { COUNTRY_MAPS, REGION_MAPS } from "./world-map";
import { calculateMobilityScore } from "../lib/passport";
import type { CombinationInsights, DataSnapshot } from "../lib/types";

const snapshot = fallbackSnapshot as DataSnapshot;
const insights = combinationInsights as CombinationInsights;

describe("bundled passport snapshot", () => {
  it("contains one complete, internally consistent dataset", () => {
    expect(snapshot.manifest.destinations).toHaveLength(227);
    expect(snapshot.manifest.passports).toHaveLength(199);
    expect(new Set(snapshot.manifest.destinations.map(({ code }) => code)).size).toBe(227);
    expect(new Set(snapshot.manifest.passports.map(({ code }) => code)).size).toBe(199);

    for (const summary of snapshot.manifest.passports) {
      const detail = snapshot.passports[summary.code];
      if (!detail) throw new Error(`Missing fallback passport detail for ${summary.code}`);
      expect(Object.keys(detail.statuses), summary.code).toHaveLength(227);
      expect(calculateMobilityScore(detail.statuses), summary.code).toBe(summary.mobilityScore);
    }
  });

  it("contains a cover color and visible regional marker for every passport", () => {
    expect(Object.keys(PASSPORT_COLORS)).toHaveLength(snapshot.manifest.passports.length);
    expect(Object.keys(COUNTRY_MAPS)).toHaveLength(snapshot.manifest.passports.length);
    expect(Object.keys(REGION_MAPS)).toHaveLength(7);

    for (const passport of snapshot.manifest.passports) {
      expect(PASSPORT_COLORS[passport.code], passport.code).toMatch(/^#[0-9a-f]{6}$/);
      const countryMap = COUNTRY_MAPS[passport.code];
      const regionMap = REGION_MAPS[passport.region];
      expect(countryMap, passport.code).toBeDefined();
      expect(regionMap, passport.region).toBeDefined();
      const [x, y, width, height] = regionMap.viewBox.split(" ").map(Number);
      expect(countryMap.marker[0], `${passport.code} horizontal marker`).toBeGreaterThanOrEqual(x);
      expect(countryMap.marker[0], `${passport.code} horizontal marker`).toBeLessThanOrEqual(x + width);
      expect(countryMap.marker[1], `${passport.code} vertical marker`).toBeGreaterThanOrEqual(y);
      expect(countryMap.marker[1], `${passport.code} vertical marker`).toBeLessThanOrEqual(y + height);
    }

    expect(COUNTRY_MAPS.DE.path.length).toBeGreaterThan(100);
    expect(COUNTRY_MAPS.SG.marker).toEqual([757.1, 242]);
  });

  it("keeps the generated combination research on the bundled snapshot", () => {
    expect(insights.snapshotVersion).toBe(snapshot.manifest.version);
    expect(insights.checkedAt).toBe(snapshot.manifest.checkedAt);
    expect(insights.destinationCount).toBe(snapshot.manifest.destinations.length);
  });

  it("applies verified destination-authority corrections to the bundled snapshot", () => {
    expect(snapshot.passports.IN.statuses.HK).toBe("eta");
    expect(snapshot.passports.MD.statuses.GD).toBe("visa_on_arrival");
    expect(snapshot.passports.UZ.statuses.DJ).toBe("evisa");
    expect(snapshot.passports.PH.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.HK.statuses.AO).toBe("visa_free");
    expect(snapshot.passports.HK.statuses.BO).toBe("visa_on_arrival");
    expect(snapshot.passports.DM.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.HU.statuses.TD).toBe("evisa");
    expect(snapshot.passports.HU.statuses.CI).toBe("visa_on_arrival");
    expect(snapshot.passports.CZ.statuses.DJ).toBe("evisa");
    expect(snapshot.passports.SI.statuses.IR).toBe("evisa");
    expect(snapshot.passports.SI.statuses.SS).toBe("visa_required");
    expect(snapshot.passports.PL.statuses.CI).toBe("visa_on_arrival");
    expect(snapshot.passports.MX.statuses.BD).toBe("visa_required");
  });

  it("applies the final Georgian, Malian, Mauritanian and Maldivian outbound audits", () => {
    expect(snapshot.passports.GE.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.GE.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.GE.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.ML.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.ML.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.MR.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.MR.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.MR.statuses.GM).toBe("visa_free");
    expect(snapshot.passports.MV.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.MV.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.MV.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.MV.statuses.TR).toBe("evisa");
  });

  it("applies the final Salvadoran, Honduran, Indian and Mozambican outbound audits", () => {
    expect(snapshot.passports.SV.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.SV.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.SV.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.HN.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.HN.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.HN.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.IN.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.IN.statuses.JO).toBe("visa_required");
    expect(snapshot.passports.MZ.statuses.AO).toBe("visa_free");
    expect(snapshot.passports.MZ.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.MZ.statuses.PA).toBe("visa_required");
  });

  it("applies the final Nepali, Peruvian, Serbian and Sierra Leonean outbound audits", () => {
    expect(snapshot.passports.NP.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.NP.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.PE.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.PE.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.PE.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.PE.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.RS.statuses.AO).toBe("visa_required");
    expect(snapshot.passports.RS.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.RS.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.RS.statuses.KW).toBe("visa_required");
    expect(snapshot.passports.RS.statuses.MN).toBe("evisa");
    expect(snapshot.passports.RS.statuses.MK).toBe("visa_free");
    expect(snapshot.passports.RS.statuses.SA).toBe("visa_required");
    expect(snapshot.passports.RS.statuses.SL).toBe("visa_required");
    expect(snapshot.passports.RS.statuses.UA).toBe("visa_free");
    expect(snapshot.passports.SL.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.SL.statuses.PA).toBe("visa_required");
  });

  it("applies the final Turkmen, Barbadian, Botswanan and Algerian outbound audits", () => {
    expect(snapshot.passports.TM.statuses.GD).toBe("visa_on_arrival");
    expect(snapshot.passports.TM.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.TM.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.BB.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.BB.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.BB.statuses.LR).toBe("visa_free");
    expect(snapshot.passports.BW.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.BW.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.DZ.statuses.BD).toBe("visa_required");
    expect(snapshot.passports.DZ.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.DZ.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.DZ.statuses.MN).toBe("evisa");
    expect(snapshot.passports.DZ.statuses.PA).toBe("visa_required");
  });

  it("applies the final Ecuadorian, Eswatini, Gabonese and Grenadian outbound audits", () => {
    expect(snapshot.passports.EC.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.EC.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.EC.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.SZ.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.SZ.statuses.JO).toBe("visa_required");
    expect(snapshot.passports.SZ.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.GA.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.GA.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.GD.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.GD.statuses.PA).toBe("visa_free");
  });

  it("applies the final Kiribati, Mongolian, Namibian and Nigerian outbound audits", () => {
    expect(snapshot.passports.KI.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.KI.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.KI.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.KI.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.MN.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.MN.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.NA.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.NA.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.NA.statuses.TR).toBe("evisa");
    expect(snapshot.passports.NG.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.NG.statuses.MN).toBe("evisa");
    expect(snapshot.passports.NG.statuses.PA).toBe("visa_required");
  });

  it("applies the final Saint Kitts and Nevis, DPRK, Saint Lucian and Pakistani outbound audits", () => {
    expect(snapshot.passports.KN.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.KN.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.KN.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.KP.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.KP.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.LC.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.LC.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.LC.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.LC.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.LC.statuses.TR).toBe("evisa");
    expect(snapshot.passports.PK.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.PK.statuses.MN).toBe("evisa");
    expect(snapshot.passports.PK.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.PK.statuses.TR).toBe("visa_required");
  });

  it("applies the final Senegalese, São Toméan, Ugandan and Vincentian outbound audits", () => {
    expect(snapshot.passports.SN.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.SN.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.SN.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.ST.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.ST.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.ST.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.UG.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.UG.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.VC.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.VC.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.VC.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.VC.statuses.PA).toBe("visa_free");
  });

  it("applies the final Tajik, Vanuatu, Samoan and Armenian outbound audits", () => {
    expect(snapshot.passports.TJ.statuses.GD).toBe("visa_on_arrival");
    expect(snapshot.passports.TJ.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.TJ.statuses.MN).toBe("evisa");
    expect(snapshot.passports.TJ.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.VU.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.VU.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.VU.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.VU.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.WS.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.WS.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.WS.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.AM.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.AM.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.AM.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.AM.statuses.TR).toBe("evisa");
  });

  it("applies the final Bolivian, Fijian, Guatemalan and Micronesian outbound audits", () => {
    expect(snapshot.passports.BO.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.BO.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.BO.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.FJ.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.FJ.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.FJ.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.FJ.statuses.TR).toBe("evisa");
    expect(snapshot.passports.GT.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.GT.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.GT.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.FM.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.FM.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.FM.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.FM.statuses.PA).toBe("visa_free");
  });

  it("applies the final Kenyan, Lebanese, Lesotho and Marshallese outbound audits", () => {
    expect(snapshot.passports.KE.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.KE.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.KE.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.LB.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.LB.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.LB.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.LS.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.LS.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.LS.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.MH.statuses.JO).toBe("visa_on_arrival");
  });

  it("applies the final Solomon Islands, Tuvaluan, Ukrainian and Uruguayan outbound audits", () => {
    expect(snapshot.passports.SB.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.SB.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.SB.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.SB.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.TV.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.TV.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.TV.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.TV.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.UA.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.UA.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.UA.statuses.MN).toBe("visa_free");
    expect(snapshot.passports.UA.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.UY.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.UY.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.UY.statuses.PA).toBe("visa_free");
  });

  it("applies the final Papuan, Paraguayan, Tunisian and Vatican outbound audits", () => {
    expect(snapshot.passports.PG.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.PG.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.PY.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.PY.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.PY.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.TN.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.TN.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.TN.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.VA.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.VA.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.VA.statuses.PA).toBe("visa_free");
  });

  it("applies the final Nigerien, Nauruan, Palauan and Bangladeshi outbound audits", () => {
    expect(snapshot.passports.NE.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.NE.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.NR.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.PW.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.PW.statuses.IS).toBe("visa_free");
    expect(snapshot.passports.PW.statuses.PA).toBe("visa_free");
    expect(snapshot.passports.BD.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.BD.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.BD.statuses.TR).toBe("visa_required");
  });

  it("applies the final Cameroonian, Congolese, Dominican and Eritrean outbound audits", () => {
    expect(snapshot.passports.CM.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.CM.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.CD.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.CD.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.DO.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.DO.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.ER.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.ER.statuses.PA).toBe("visa_required");
  });

  it("applies the final Equatorial Guinean, Lao, Malawian and Nicaraguan outbound audits", () => {
    expect(snapshot.passports.GQ.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.GQ.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.GQ.statuses.TR).toBe("visa_required");
    expect(snapshot.passports.LA.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.LA.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.MW.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.MW.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.MW.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.NI.statuses.GD).toBe("visa_free");
    expect(snapshot.passports.NI.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.NI.statuses.PA).toBe("visa_free");
  });

  it("applies the final Antiguan, Jordanian, Myanmar and Timorese outbound audits", () => {
    expect(snapshot.passports.AG.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.JO.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.JO.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.MM.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.MM.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.TL.statuses.TR).toBe("evisa");
  });

  it("applies the final Chadian, Zambian, Zimbabwean and Angolan outbound audits", () => {
    expect(snapshot.passports.TD.statuses.GD).toBe("visa_required");
    expect(snapshot.passports.TD.statuses.PA).toBe("visa_required");
    expect(snapshot.passports.ZW.statuses.JO).toBe("visa_on_arrival");
    expect(snapshot.passports.AO.statuses.PA).toBe("visa_required");
  });
});
