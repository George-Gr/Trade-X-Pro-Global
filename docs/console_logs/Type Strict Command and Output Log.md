npm run type:strict

> vite_react_shadcn_ts@0.0.0 type:strict
> tsc -p tsconfig.strict.json --noEmit

src/components/trading/OrdersTable.tsx:170:86 - error TS2339: Property 'message' does not exist on type 'nev
er'.                                                                                                        
170             <span className="text-sm text-destructive">Error loading orders: {error?.message || 'Unknown
 error'}</span>                                                                                                                                                                                      ~~~~~~~

src/lib/chartPerformance.ts:442:56 - error TS2345: Argument of type '(...args: T[]) => void' is not assignab
le to parameter of type '(...args: unknown[]) => void'.                                                       Types of parameters 'args' and 'args' are incompatible.
    Type 'unknown' is not assignable to type 'T'.
      'T' could be instantiated with an arbitrary type which could be unrelated to 'unknown'.

442       debouncerRef.current = new DebouncedChartUpdater(callback, mergedConfig.debounceDelay);
                                                           ~~~~~~~~

src/lib/logger.ts:470:101 - error TS2554: Expected 1-2 arguments, but got 3.

470       this.warn(`Slow transaction: ${transaction.name} took ${duration.toFixed(2)}ms`, {} as Error, {
                                                                                                        ~
471         ...fullContext,
    ~~~~~~~~~~~~~~~~~~~~~~~
... 
477         }
    ~~~~~~~~~
478       });
    ~~~~~~~

src/lib/logger.ts:501:7 - error TS2322: Type 'number | boolean | undefined' is not assignable to type 'boole
an'.                                                                                                          Type 'undefined' is not assignable to type 'boolean'.

501       success: !error && status && status < 400,
          ~~~~~~~

  src/lib/logger.ts:89:3
    89   success: boolean;
         ~~~~~~~
    The expected type comes from property 'success' which is declared here on type 'APICallInfo'

src/lib/logger.ts:550:93 - error TS2554: Expected 1-2 arguments, but got 3.

550       this.warn(`Slow API call: ${method} ${url} took ${duration.toFixed(2)}ms`, undefined, {
                                                                                                ~
551         component: 'API',
    ~~~~~~~~~~~~~~~~~~~~~~~~~
... 
559         }
    ~~~~~~~~~
560       });
    ~~~~~~~

src/lib/logger.ts:614:106 - error TS2554: Expected 1-2 arguments, but got 3.

614         this.warn(`Slow Supabase query: ${operation} ${table} took ${duration.toFixed(2)}ms`, undefined,
 {                                                                                                                                                                                                                      
 ~                                                                                                          615           component: 'Supabase',
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
... 
622           }
    ~~~~~~~~~~~
623         });
    ~~~~~~~~~

src/lib/trading/__tests__/commissionCalculation.test.ts:240:42 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass.Stock; side: "buy"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                                        Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass.Stock; side: "buy"; qu
antity: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                
240       const result = calculateCommission({
                                             ~
241         symbol: 'MSFT',
    ~~~~~~~~~~~~~~~~~~~~~~~
... 
245         executionPrice: 300.0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
246       });
    ~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/commissionCalculation.test.ts:397:29 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass; side: "buy"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                                              Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass; side: "buy"; quantity
: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                      
397         calculateCommission({
                                ~
398           symbol: 'AAPL',
    ~~~~~~~~~~~~~~~~~~~~~~~~~
... 
402           executionPrice: 150.0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
403         });
    ~~~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/commissionCalculation.test.ts:409:29 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass.Stock; side: "buy" | "sell"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                               Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass.Stock; side: "buy" | "
sell"; quantity: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.       
409         calculateCommission({
                                ~
410           symbol: 'AAPL',
    ~~~~~~~~~~~~~~~~~~~~~~~~~
... 
414           executionPrice: 150.0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
415         });
    ~~~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/commissionCalculation.test.ts:421:29 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass.Stock; side: "buy"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                                        Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass.Stock; side: "buy"; qu
antity: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                
421         calculateCommission({
                                ~
422           symbol: 'AAPL',
    ~~~~~~~~~~~~~~~~~~~~~~~~~
... 
426           executionPrice: 150.0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
427         });
    ~~~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/commissionCalculation.test.ts:433:29 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass.Stock; side: "buy"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                                        Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass.Stock; side: "buy"; qu
antity: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                
433         calculateCommission({
                                ~
434           symbol: 'AAPL',
    ~~~~~~~~~~~~~~~~~~~~~~~~~
... 
438           executionPrice: 150.0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
439         });
    ~~~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/commissionCalculation.test.ts:445:29 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass.Stock; side: "buy"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                                        Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass.Stock; side: "buy"; qu
antity: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                
445         calculateCommission({
                                ~
446           symbol: 'AAPL',
    ~~~~~~~~~~~~~~~~~~~~~~~~~
... 
450           executionPrice: 0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
451         });
    ~~~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/commissionCalculation.test.ts:457:29 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass.Stock; side: "buy"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                                        Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass.Stock; side: "buy"; qu
antity: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                
457         calculateCommission({
                                ~
458           symbol: 'AAPL',
    ~~~~~~~~~~~~~~~~~~~~~~~~~
... 
462           executionPrice: -150.0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
463         });
    ~~~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/commissionCalculation.test.ts:469:29 - error TS2345: Argument of type '{ symbol: s
tring; assetClass: AssetClass.Stock; side: "buy"; quantity: number; executionPrice: number; }' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                                                        Property 'accountTier' is missing in type '{ symbol: string; assetClass: AssetClass.Stock; side: "buy"; qu
antity: number; executionPrice: number; }' but required in type '{ symbol: string; side: "buy" | "sell"; quantity: number; assetClass: AssetClass; executionPrice: number; accountTier: AccountTier; }'.                
469         calculateCommission({
                                ~
470           symbol: '',
    ~~~~~~~~~~~~~~~~~~~~~
... 
474           executionPrice: 150.0,
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
475         });
    ~~~~~~~~~

  src/lib/trading/commissionCalculation.ts:133:3
    133   accountTier: z.nativeEnum(AccountTier).default(AccountTier.Standard),
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    'accountTier' is declared here.

src/lib/trading/__tests__/slippageCalculation.test.ts:339:27 - error TS2345: Argument of type 'Record<string
, unknown>' is not assignable to parameter of type '{ symbol: string; side: "buy" | "sell"; conditions: { currentVolatility: number; averageVolatility: number; dailyVolume: number; isHighVolatility: boolean; isLowLiquidity: boolean; orderSizePercentage: number; isAfterHours: boolean; }; marketPrice: number; orderQuantity: number; seed?: string | undefined; }'.                                                                        Type 'Record<string, unknown>' is missing the following properties from type '{ symbol: string; side: "buy
" | "sell"; conditions: { currentVolatility: number; averageVolatility: number; dailyVolume: number; isHighVolatility: boolean; isLowLiquidity: boolean; orderSizePercentage: number; isAfterHours: boolean; }; marketPrice: number; orderQuantity: number; seed?: string | undefined; }': symbol, side, conditions, marketPrice, orderQuantity                                                                                                 
339         calculateSlippage({
                              ~
340           symbol: 'EURUSD',
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~
... 
352           },
    ~~~~~~~~~~~~
353         } as Record<string, unknown>)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/lib/tradingview-compatibility.ts:106:28 - error TS7006: Parameter 'target' implicitly has an 'any' type.

106   Object.assign = function(target, ...sources) {
                               ~~~~~~

src/lib/tradingview-compatibility.ts:106:36 - error TS7019: Rest parameter 'sources' implicitly has an 'any[
]' type.                                                                                                    
106   Object.assign = function(target, ...sources) {
                                       ~~~~~~~~~~

src/pages/KYC.tsx:42:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter of t
ype 'SetStateAction<string>'.                                                                                 Type 'null' is not assignable to type 'SetStateAction<string>'.

42       setKycStatus(data.kyc_status || null);
                      ~~~~~~~~~~~~~~~~~~~~~~~

src/pages/KYC.tsx:51:7 - error TS2578: Unused '@ts-expect-error' directive.

51       // @ts-expect-error - Supabase type inference issue with kyc_documents
         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/Portfolio.tsx:236:33 - error TS2322: Type 'number | null' is not assignable to type 'number | unde
fined'.                                                                                                       Type 'null' is not assignable to type 'number | undefined'.

236                                 trailingStopDistance={position.trailing_stop_distance || null}
                                    ~~~~~~~~~~~~~~~~~~~~

  src/components/trading/TrailingStopDialog.tsx:17:3
    17   trailingStopDistance?: number;
         ~~~~~~~~~~~~~~~~~~~~
    The expected type comes from property 'trailingStopDistance' which is declared here on type 'IntrinsicAt
tributes & TrailingStopDialogProps'                                                                         
src/pages/Settings.tsx:29:20 - error TS2345: Argument of type 'string | null' is not assignable to parameter
 of type 'SetStateAction<string>'.                                                                            Type 'null' is not assignable to type 'SetStateAction<string>'.

29       setKycStatus(data.kyc_status || null);
                      ~~~~~~~~~~~~~~~~~~~~~~~

src/pages/Wallet.tsx:46:24 - error TS2345: Argument of type 'string | undefined' is not assignable to parame
ter of type 'string'.                                                                                         Type 'undefined' is not assignable to type 'string'.

46         .eq('user_id', user?.id)
                          ~~~~~~~~

src/pages/Wallet.tsx:274:21 - error TS2322: Type '{ actual_amount_received: number | null; amount: number; c
ompleted_at: string | null; confirmations: number | null; created_at: string; currency: string; id: string; metadata: Json; ... 8 more ...; user_id: string; }[]' is not assignable to type 'Transaction[]'.              Type '{ actual_amount_received: number | null; amount: number; completed_at: string | null; confirmations:
 number | null; created_at: string; currency: string; id: string; metadata: Json; ... 8 more ...; user_id: string; }' is not assignable to type 'Transaction'.                                                              Types of property 'confirmations' are incompatible.
      Type 'number | null' is not assignable to type 'number'.
        Type 'null' is not assignable to type 'number'.

274                     transactions={transactions?.filter(t => t.transaction_type === 'deposit') || []}
                        ~~~~~~~~~~~~

  src/components/wallet/TransactionHistory.tsx:21:3
    21   transactions: Transaction[];
         ~~~~~~~~~~~~
    The expected type comes from property 'transactions' which is declared here on type 'IntrinsicAttributes
 & TransactionHistoryProps'                                                                                 
src/pages/Wallet.tsx:287:21 - error TS2322: Type '{ actual_amount_received: number | null; amount: number; c
ompleted_at: string | null; confirmations: number | null; created_at: string; currency: string; id: string; metadata: Json; ... 8 more ...; user_id: string; }[]' is not assignable to type 'Transaction[]'.              Type '{ actual_amount_received: number | null; amount: number; completed_at: string | null; confirmations:
 number | null; created_at: string; currency: string; id: string; metadata: Json; ... 8 more ...; user_id: string; }' is not assignable to type 'Transaction'.                                                              Types of property 'confirmations' are incompatible.
      Type 'number | null' is not assignable to type 'number'.
        Type 'null' is not assignable to type 'number'.

287                     transactions={transactions || []}
                        ~~~~~~~~~~~~

  src/components/wallet/TransactionHistory.tsx:21:3
    21   transactions: Transaction[];
         ~~~~~~~~~~~~
    The expected type comes from property 'transactions' which is declared here on type 'IntrinsicAttributes
 & TransactionHistoryProps'                                                                                 

Found 24 errors in 10 files.

Errors  Files
     1  src/components/trading/OrdersTable.tsx:170
     1  src/lib/chartPerformance.ts:442
     4  src/lib/logger.ts:470
     8  src/lib/trading/__tests__/commissionCalculation.test.ts:240
     1  src/lib/trading/__tests__/slippageCalculation.test.ts:339
     2  src/lib/tradingview-compatibility.ts:106
     2  src/pages/KYC.tsx:42
     1  src/pages/Portfolio.tsx:236
     1  src/pages/Settings.tsx:29
     3  src/pages/Wallet.tsx:46