import { TruthVerification } from '@/components/TruthVerification';

export default function VerifyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Truth Verification System</h1>
        <div className="prose prose-lg mb-8">
          <p>
            ActaMundi's Truth Verification System uses blockchain technology to create a decentralized,
            transparent, and immutable record of verified information. This system allows users to:
          </p>
          <ul>
            <li>Submit claims with sources for verification</li>
            <li>Verify claims based on reputation and expertise</li>
            <li>Dispute claims that may be incorrect</li>
            <li>Track the verification status of claims</li>
          </ul>
          <p>
            The system uses a reputation-based mechanism where verified users can participate in the
            verification process. Claims become verified when they receive sufficient positive
            verifications from reputable users.
          </p>
        </div>
        <TruthVerification />
      </div>
    </div>
  );
} 