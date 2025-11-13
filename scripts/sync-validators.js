import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Sync orderValidation
const orderValidationSrc = path.resolve(__dirname, '../src/lib/trading/orderValidation.ts');
const destDir = path.resolve(__dirname, '../supabase/functions/lib');
const orderValidationDest = path.join(destDir, 'orderValidation.ts');

if (!fs.existsSync(orderValidationSrc)) {
  console.error('Source order validator not found:', orderValidationSrc);
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

let orderValidationContent = fs.readFileSync(orderValidationSrc, 'utf8');
orderValidationContent = orderValidationContent.replace(
  "import { z } from 'zod';",
  "import { z } from \"https://deno.land/x/zod@v3.22.4/mod.ts\";"
);
fs.writeFileSync(orderValidationDest, orderValidationContent, 'utf8');
console.log('Order validators synchronized to', orderValidationDest);

// Sync marginCalculations
const marginCalcSrc = path.resolve(__dirname, '../src/lib/trading/marginCalculations.ts');
const marginCalcDest = path.join(destDir, 'marginCalculations.ts');

if (!fs.existsSync(marginCalcSrc)) {
  console.error('Source margin calculations not found:', marginCalcSrc);
  process.exit(1);
}

let marginCalcContent = fs.readFileSync(marginCalcSrc, 'utf8');
marginCalcContent = marginCalcContent.replace(
  "import { z } from 'zod';",
  "import { z } from \"https://deno.land/x/zod@v3.22.4/mod.ts\";"
);
fs.writeFileSync(marginCalcDest, marginCalcContent, 'utf8');
console.log('Margin calculations synchronized to', marginCalcDest);

// Sync slippageCalculation
const slippageCalcSrc = path.resolve(__dirname, '../src/lib/trading/slippageCalculation.ts');
const slippageCalcDest = path.join(destDir, 'slippageCalculation.ts');

if (!fs.existsSync(slippageCalcSrc)) {
  console.error('Source slippage calculations not found:', slippageCalcSrc);
  process.exit(1);
}

let slippageCalcContent = fs.readFileSync(slippageCalcSrc, 'utf8');
slippageCalcContent = slippageCalcContent.replace(
  "import { z } from 'zod';",
  "import { z } from \"https://deno.land/x/zod@v3.22.4/mod.ts\";"
);
fs.writeFileSync(slippageCalcDest, slippageCalcContent, 'utf8');
console.log('Slippage calculations synchronized to', slippageCalcDest);
