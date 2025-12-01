import { Redirect } from 'expo-router';
import React from 'react';

// This screen redirects to the proper auth login
export default function Login() {
  return <Redirect href="/(auth)/login" />;
}
