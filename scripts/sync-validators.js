import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Sync orderValidation
const orderValidationSrc = path.resolve(
  __dirname,
  "../src/lib/trading/orderValidation.ts",
);
const destDir = path.resolve(__dirname, "../supabase/functions/lib");
const orderValidationDest = path.join(destDir, "orderValidation.ts");

if (!fs.existsSync(orderValidationSrc)) {
  console.error("Source order validator not found:", orderValidationSrc);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let orderValidationContent = fs.readFileSync(orderValidationSrc, "utf8");
orderValidationContent = orderValidationContent.replace(
  "import { z } from 'zod';",
  'import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";',
);
fs.writeFileSync(orderValidationDest, orderValidationContent, "utf8");
console.log("Order validators synchronized to", orderValidationDest);

// Sync marginCalculations
const marginCalcSrc = path.resolve(
  __dirname,
  "../src/lib/trading/marginCalculations.ts",
);
const marginCalcDest = path.join(destDir, "marginCalculations.ts");

if (!fs.existsSync(marginCalcSrc)) {
  console.error("Source margin calculations not found:", marginCalcSrc);
  process.exit(1);
}

let marginCalcContent = fs.readFileSync(marginCalcSrc, "utf8");
marginCalcContent = marginCalcContent.replace(
  "import { z } from 'zod';",
  'import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";',
);
fs.writeFileSync(marginCalcDest, marginCalcContent, "utf8");
console.log("Margin calculations synchronized to", marginCalcDest);

// Sync slippageCalculation
const slippageCalcSrc = path.resolve(
  __dirname,
  "../src/lib/trading/slippageCalculation.ts",
);
const slippageCalcDest = path.join(destDir, "slippageCalculation.ts");

if (!fs.existsSync(slippageCalcSrc)) {
  console.error("Source slippage calculations not found:", slippageCalcSrc);
  process.exit(1);
}

let slippageCalcContent = fs.readFileSync(slippageCalcSrc, "utf8");
slippageCalcContent = slippageCalcContent.replace(
  "import { z } from 'zod';",
  'import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";',
);
fs.writeFileSync(slippageCalcDest, slippageCalcContent, "utf8");
console.log("Slippage calculations synchronized to", slippageCalcDest);

// Sync commissionCalculation
const commissionCalcSrc = path.resolve(
  __dirname,
  "../src/lib/trading/commissionCalculation.ts",
);
const commissionCalcDest = path.join(destDir, "commissionCalculation.ts");

if (!fs.existsSync(commissionCalcSrc)) {
  console.error("Source commission calculations not found:", commissionCalcSrc);
  process.exit(1);
}

let commissionCalcContent = fs.readFileSync(commissionCalcSrc, "utf8");
commissionCalcContent = commissionCalcContent.replace(
  "import { z } from 'zod';",
  'import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";',
);
fs.writeFileSync(commissionCalcDest, commissionCalcContent, "utf8");
console.log("Commission calculations synchronized to", commissionCalcDest);

// Sync pnlCalculation
const pnlCalcSrc = path.resolve(
  __dirname,
  "../src/lib/trading/pnlCalculation.ts",
);
const pnlCalcDest = path.join(destDir, "pnlCalculation.ts");

if (!fs.existsSync(pnlCalcSrc)) {
  console.error("Source P&L calculations not found:", pnlCalcSrc);
  process.exit(1);
}

let pnlCalcContent = fs.readFileSync(pnlCalcSrc, "utf8");
pnlCalcContent = pnlCalcContent.replace(
  "import { z } from 'zod';",
  'import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";',
);
fs.writeFileSync(pnlCalcDest, pnlCalcContent, "utf8");
console.log("P&L calculations synchronized to", pnlCalcDest);

// Sync liquidationEngine
const liqEngineSrc = path.resolve(
  __dirname,
  "../src/lib/trading/liquidationEngine.ts",
);
const liqEngineDest = path.join(destDir, "liquidationEngine.ts");

if (!fs.existsSync(liqEngineSrc)) {
  console.error("Source liquidation engine not found:", liqEngineSrc);
} else {
  let liqEngineContent = fs.readFileSync(liqEngineSrc, "utf8");
  // Replace zod import for Deno runtime if present
  liqEngineContent = liqEngineContent.replace(
    "import { z } from 'zod';",
    'import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";',
  );
  fs.writeFileSync(liqEngineDest, liqEngineContent, "utf8");
  console.log("Liquidation engine synchronized to", liqEngineDest);
}
