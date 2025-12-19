import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Card, CardContent } from '@/components/ui/card';

export default function AMLPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">
            Anti-Money Laundering (AML) Policy
          </h1>

          <Card>
            <CardContent className=" space-y-6 prose prose-invert">
              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  1. Policy Statement
                </h2>
                <p className="text-foreground/90 leading-relaxed">
                  TradeX Pro is committed to preventing money laundering and
                  terrorist financing. We have implemented robust AML procedures
                  in compliance with international standards and the regulations
                  of our licensing jurisdiction. This policy applies to all
                  clients, employees, and business relationships.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  2. Know Your Customer (KYC)
                </h2>
                <p className="text-foreground/90 leading-relaxed mb-4">
                  All clients must complete our KYC verification process before
                  trading. We collect and verify:
                </p>

                <h3 className="text-xl font-semibold mb-2">
                  Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4 mb-4">
                  <li>Full legal name as appears on government-issued ID</li>
                  <li>Date of birth and nationality</li>
                  <li>Current residential address</li>
                  <li>Contact information (email, phone number)</li>
                  <li>Occupation and source of income</li>
                </ul>

                <h3 className="text-xl font-semibold mb-2">
                  Required Documentation
                </h3>
                <ul className="list-disc list-inside space-y-2 text-foreground/90 ml-4">
                  <li>
                    <strong>Proof of Identity:</strong> Passport, national ID
                    card, or driver's license
                  </li>
                  <li>
                    <strong>Proof of Address:</strong> Utility bill, bank
                    statement, or government document (dated within last 3
                    months)
                  </li>
                  <li>
                    <strong>Source of Funds:</strong> For large deposits, we may
                    request documentation proving the origin of funds
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  3. Customer Due Diligence (CDD)
                </h2>
                <p className="text-muted-foreground mb-4">
                  We conduct risk-based due diligence on all clients:
                </p>

                <h3 className="text-xl font-semibold mb-2">
                  Standard Due Diligence
                </h3>
                <p className="text-muted-foreground mb-4">
                  Applied to all retail clients, involving identity verification
                  and basic background checks.
                </p>

                <h3 className="text-xl font-semibold mb-2">
                  Enhanced Due Diligence (EDD)
                </h3>
                <p className="text-muted-foreground mb-4">
                  Applied to higher-risk clients, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Politically Exposed Persons (PEPs) and their family
                    members/close associates
                  </li>
                  <li>Clients from high-risk jurisdictions</li>
                  <li>Clients with complex ownership structures</li>
                  <li>Clients making unusually large transactions</li>
                  <li>Clients whose source of wealth is unclear</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  4. Politically Exposed Persons (PEPs)
                </h2>
                <p className="text-muted-foreground mb-4">
                  We screen all clients against PEP databases. If you are
                  identified as a PEP, we will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Require senior management approval to establish the
                    relationship
                  </li>
                  <li>Conduct enhanced due diligence</li>
                  <li>Determine the source of wealth and funds</li>
                  <li>
                    Conduct ongoing enhanced monitoring of the relationship
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  5. Sanctions Screening
                </h2>
                <p className="text-muted-foreground">
                  We screen all clients, transactions, and countries against
                  international sanctions lists, including UN, OFAC, EU, and
                  other relevant sanctions programs. We do not accept clients
                  from sanctioned countries or individuals on sanctions lists.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  6. Transaction Monitoring
                </h2>
                <p className="text-muted-foreground mb-4">
                  We continuously monitor client transactions for suspicious
                  activity, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Unusually large or frequent transactions inconsistent with
                    normal trading patterns
                  </li>
                  <li>Transactions with no apparent economic purpose</li>
                  <li>Rapid movement of funds in and out of accounts</li>
                  <li>Transactions involving high-risk jurisdictions</li>
                  <li>Use of third-party payments</li>
                  <li>
                    Attempts to structure transactions to avoid reporting
                    thresholds
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  7. Suspicious Activity Reporting
                </h2>
                <p className="text-muted-foreground mb-4">
                  If we identify suspicious activity, we are legally obligated
                  to file a Suspicious Activity Report (SAR) with the relevant
                  Financial Intelligence Unit (FIU). We will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Document all suspicious transactions and investigations
                  </li>
                  <li>Report to authorities within required timeframes</li>
                  <li>
                    Not notify clients that a SAR has been filed ("tipping off"
                    is prohibited by law)
                  </li>
                  <li>Cooperate fully with law enforcement investigations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  8. Record Keeping
                </h2>
                <p className="text-muted-foreground">
                  We maintain comprehensive records for at least 7 years,
                  including KYC documentation, transaction records,
                  correspondence, and internal analysis. These records are
                  available to regulators and law enforcement upon request.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  9. Third-Party Payments
                </h2>
                <p className="text-muted-foreground mb-4">
                  To prevent money laundering, we enforce strict policies on
                  payments:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Deposits must originate from an account in the client's own
                    name
                  </li>
                  <li>
                    Withdrawals are processed only to the original funding
                    source
                  </li>
                  <li>Third-party payments are generally not accepted</li>
                  <li>
                    Exceptions require enhanced due diligence and senior
                    management approval
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  10. Employee Training
                </h2>
                <p className="text-muted-foreground">
                  All employees receive regular AML training covering red flag
                  identification, reporting procedures, regulatory requirements,
                  and case studies. Compliance with AML policies is mandatory
                  for all staff members.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  11. Compliance Officer
                </h2>
                <p className="text-muted-foreground">
                  We have appointed a dedicated Money Laundering Reporting
                  Officer (MLRO) responsible for overseeing AML compliance,
                  investigating suspicious activities, and liaising with
                  regulatory authorities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  12. Right to Refuse Service
                </h2>
                <p className="text-muted-foreground">
                  We reserve the right to refuse service, close accounts, or
                  freeze funds if we cannot satisfactorily verify your identity,
                  if you provide false information, or if we suspect money
                  laundering or terrorist financing activities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  13. Client Obligations
                </h2>
                <p className="text-muted-foreground mb-4">
                  As our client, you agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Provide accurate and complete information during
                    registration
                  </li>
                  <li>
                    Update your personal information promptly if it changes
                  </li>
                  <li>
                    Submit requested documentation within specified timeframes
                  </li>
                  <li>Cooperate with additional verification requests</li>
                  <li>
                    Acknowledge that failure to comply may result in account
                    restrictions or closure
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  14. Policy Updates
                </h2>
                <p className="text-muted-foreground">
                  This AML Policy is reviewed and updated regularly to reflect
                  changes in regulations, best practices, and emerging risks.
                  Material changes will be communicated to clients through our
                  website or email notifications.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">
                  15. Contact Information
                </h2>
                <p className="text-muted-foreground">
                  For AML-related inquiries, please contact our Compliance
                  Department:
                </p>
                <div className="mt-4 text-muted-foreground">
                  <p>Email: compliance@tradexpro.com</p>
                  <p>Address: 123 Finance Street, Trading District, TD 12345</p>
                </div>
              </section>

              <div className="pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Last Updated:</strong> January 2025
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
