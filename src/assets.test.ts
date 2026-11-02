import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { tracks } from "./catalog";
describe("shipped playable catalog", () => {
  it.each(tracks)(
    "$id has a complete non-silent PCM file with matching duration and local cover",
    (t) => {
      const b = readFileSync(`public${t.src}`);
      expect(b.toString("ascii", 0, 4)).toBe("RIFF");
      expect(b.toString("ascii", 8, 12)).toBe("WAVE");
      expect(b.readUInt16LE(20)).toBe(1);
      expect(b.readUInt16LE(34)).toBe(16);
      expect(b.readUInt32LE(40)).toBe(b.length - 44);
      const duration = (b.length - 44) / b.readUInt32LE(28);
      expect(Math.abs(duration - t.duration)).toBeLessThan(0.001);
      let energy = 0;
      for (let i = 44; i < b.length; i += 200)
        energy += Math.abs(b.readInt16LE(i));
      expect(energy).toBeGreaterThan(100000);
      expect(existsSync(`public${t.cover}`)).toBe(true);
    },
  );
});
