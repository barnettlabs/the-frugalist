<script setup>
import { VEHICLE_TYPES } from '@/enums/db'

defineOptions({
	inheritAttrs: false,
})

const props = defineProps({
	labelClassName: String,

	label: {
		type: String,
		default: 'Vehicle Type',
	},
})

const model = defineModel()

const inputs = [
	{
		name: VEHICLE_TYPES.CAR,
		label: 'Car',
		icon: '/icons/vehicles/car.png',
	},
	{
		name: VEHICLE_TYPES.TRUCK,
		label: 'Truck',
		icon: '/icons/vehicles/truck.png',
	},
	{
		name: VEHICLE_TYPES.SUV,
		label: 'SUV',
		icon: '/icons/vehicles/jeep.png',
	},
]
</script>

<template>
	<div
		class="flex flex-row items-center justify-between sm:justify-start sm:gap-4"
	>
		<label
			v-if="label"
			htmlFor="name"
			class="text-input-label"
			:class="labelClassName"
		>
			{{ label }}
		</label>

		<div class="flex flex-row gap-x-2 mt-1">
			<div v-for="i in inputs">
				<input
					type="radio"
					:name="i.name"
					:value="i.name"
					:id="i.name"
					v-model="model"
				/>
				<label
					:for="i.name"
					class="inline-flex flex-col items-center justify-between bg-red-30 p-2 h-14 w-14 -ml-4 border- rounded-lg cursor-pointer shadow"
					:class="[
						model === i.name
							? 'bg-gray-700 text-white'
							: 'hover:bg-gray-100 text-gray-400',
					]"
				>
					<img
						:src="i.icon"
						:alt="i.label"
						class="w-3/4 inline-block"
						:class="[model === i.name ? 'invert' : 'opacity-50']"
					/>
					<span class="text-xs">{{ i.label }}</span>
				</label>
			</div>
		</div>
	</div>
</template>

<style scoped>
input[type='radio'] {
	-moz-appearance: none;
	-webkit-appearance: none;
	appearance: none;
	opacity: 0;
}
</style>
