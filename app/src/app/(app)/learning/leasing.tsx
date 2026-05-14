import React from 'react';

import { LearningContent } from '@/components/learning';
import { LEASE_TERMS, LEASE_TIPS } from '@/lib/data/learning-content';

export default function LeasingLearningScreen() {
	return (
		<LearningContent
			variant="lease"
			headerTitle="Leasing"
			backLabel="Home"
			title="Understanding Vehicle Leasing"
			description="Master the terminology and concepts behind vehicle leasing to make informed decisions."
			terms={LEASE_TERMS}
			tips={LEASE_TIPS}
		/>
	);
}
