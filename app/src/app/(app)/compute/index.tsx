import { Redirect } from 'expo-router';
import React from 'react';

// Redirect to finance as default compute screen
export default function ComputeScreen() {
	return <Redirect href="/compute/finance" />;
}
