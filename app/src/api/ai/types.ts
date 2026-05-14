export type DealGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
export type DealRating = 'excellent' | 'good' | 'fair' | 'poor' | 'bad' | 'needs_more_info';

export type DealGradeResponse = {
	grade: DealGrade;
	rating: DealRating;
	confidence: number;
	summary: string;
	red_flags: string[];
	tips: string[];
};

export type GradeDealVariables = {
	agentSlug: string;
	calculatorType: 'finance' | 'lease';
	inputs: Record<string, unknown>;
};

export type GradeDealResult = {
	response: DealGradeResponse;
	cached: boolean;
	agent: { slug: string; version: number };
};
