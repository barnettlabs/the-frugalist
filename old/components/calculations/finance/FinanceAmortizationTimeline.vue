<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler,
} from 'chart.js'

const props = defineProps({
	sheet: Object,
})

const data = computed(() => {
	const style = getComputedStyle(document.body)
	const principalColor = style.getPropertyValue('--color-primary')
	const extraPaymentColor = style.getPropertyValue('--color-success')
	const interestColor = style.getPropertyValue('--color-danger')

	return props.sheet?.reducedAmortization
		.reduce(
			(acc: any, cur: any) => {
				const xLabel = `${cur.month.slice(0, 3)} '${cur.year
					.toString()
					.slice(2)}`

				acc[0].data.push({
					x: xLabel,
					y: parseFloat(cur.monthlyPrincipalAmount),
				})
				acc[1].data.push({
					x: xLabel,
					y: parseFloat(cur.monthlyInterestAmount),
				})
				acc[2].data.push({
					x: xLabel,
					y: parseFloat(cur.extraPaymentAmount),
				})

				return acc
			},
			[
				{
					label: 'Principal',
					data: [],
					color: principalColor,
				},
				{
					label: 'Interest',
					data: [],
					color: interestColor,
				},
				{
					label: 'Extra',
					data: [],
					color: extraPaymentColor,
				},
			]
		)
		.map((series: any) => ({
			...series,

			data: (() => {
				const chunkGroups = chunkArray(series.data, 6)

				const reduced = chunkGroups.map((chunkValues, index) => {
					const reducedChunk = chunkValues.reduce(
						(acc: { y: number }, cur: { y: number }) => {
							acc.y += cur.y

							return acc
						},
						{ x: '', y: 0 }
					)

					const firstDate = chunkValues[0].x
					const lastDate = chunkValues[chunkValues.length - 1].x

					reducedChunk.x = `${firstDate} - ${lastDate}`
					reducedChunk.y /= chunkValues.length

					return reducedChunk
				})

				return reduced
			})(),
		}))
})

const chartData = computed(() => {
	const labels = data.value?.[0].data.map((d: any) => d.x)
	const datasets = data.value.map((series: any) => ({
		label: series.label,
		data: series.data,
		backgroundColor: series.color + '30',
		pointBackgroundColor: series.color,
		borderColor: series.color,
		fill: true,
	}))

	return {
		// labels,
		datasets,
	}
})

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
	Filler
)
</script>

<template>
	<Line
		:data="chartData"
		class="h-96"
		:options="{
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				y: {
					ticks: {
						callback: (value) => `$${value}`,
					},
				},
			},
			plugins: {
				tooltip: {
					callbacks: {
						label: (context) => {
							const label = context.dataset.label || ''
							if (label) {
								return `${label}: ${context.parsed.y.toLocaleString('en', {
									style: 'currency',
									currency: 'USD',
								})}`
							}
							return ''
						},
					},
				},
				datalabels: {
					display: false,
				},
				legend: {
					position: 'bottom',
					labels: {
						usePointStyle: true,
						pointStyle: 'rectRounded',
						padding: 25,
					},
				},
			},
		}"
	/>
</template>
