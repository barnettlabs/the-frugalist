import React from 'react';

import { LearningContent } from '@/components/learning';
import { FINANCE_TERMS, FINANCE_TIPS } from '@/lib/data/learning-content';

export default function FinancingTermsScreen() {
	return (
		<LearningContent
			variant="finance"
			headerTitle="Financing"
			backLabel="Finance"
			title="Understanding Vehicle Financing"
			description="Learn the key terms and concepts that will help you navigate the vehicle financing process with confidence."
			terms={FINANCE_TERMS}
			tips={FINANCE_TIPS}
		/>
	);
}
