import { Link } from 'expo-router';
import React from 'react';

import type { Post } from '@/api';
import { Image, Pressable, Text, View } from '@/components/ui';
import { tw } from '@/components/ui/theme';

type Props = Post;

const images = [
	'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80',
	'https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?auto=format&fit=crop&w=800&q=80',
	'https://images.unsplash.com/photo-1515386474292-47555758ef2e?auto=format&fit=crop&w=800&q=80',
	'https://plus.unsplash.com/premium_photo-1666815503002-5f07a44ac8fb?auto=format&fit=crop&w=800&q=80',
	'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
];

export const Card = ({ title, body, id }: Props) => {
	return (
		<Link href={`/feed/${id}`} asChild>
			<Pressable>
				{/* Glassmorphism card with soft shadow and rounded corners */}
				<View className={`m-2 overflow-hidden ${tw.cardElevated}`}>
					<Image
						className="h-56 w-full overflow-hidden rounded-t-xl"
						contentFit="cover"
						source={{
							uri: images[Math.floor(Math.random() * images.length)],
						}}
					/>

					<View className="p-4">
						<Text className="py-2 text-xl font-semibold text-neutral-900 dark:text-white">{title}</Text>
						<Text numberOfLines={3} className="leading-relaxed text-neutral-600 dark:text-neutral-400">
							{body}
						</Text>
					</View>
				</View>
			</Pressable>
		</Link>
	);
};
