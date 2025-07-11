<script setup>
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import ChartDataLabels from 'chartjs-plugin-datalabels'

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels)

const props = defineProps({
	sheet: Object,
})

const chartData = computed(() => {
	const labels = ['Principal', 'Interest', 'Extra']

	const datasets = [
		{
			backgroundColor: [
				'hsl(216, 98%, 52%)',
				'hsl(350, 79%, 51%)',
				'hsl(135, 48%, 51%)',
			],
			borderColor: [
				'hsl(216, 98%, 40%)',
				'hsl(350, 79%, 40%)',
				'hsl(135, 48%, 40%)',
			],
			data: [
				props.sheet?.reducedAmortizationDetails.totalPrincipal,
				props.sheet?.reducedAmortizationDetails.totalInterest,
				props.sheet?.reducedAmortizationDetails.totalExtraPayments,
			],
		},
	]

	return {
		labels,
		datasets,
	}
})
</script>

<template>
	<Doughnut
		class="w-5/6"
		:data="chartData"
		:options="{
			responsive: true,
			maintainAspectRatio: false,
			layout: {
				padding: 4,
			},
			elements: {
				arc: {
					spacing: 4,
					borderRadius: 4,
				},
			},
			plugins: {
				datalabels: {
					color: '#fff',
					font: {
						weight: 'bold',
					},
					formatter: function (value, context) {
						const dataset = context.chart.data.datasets[0].data
						const total = dataset.reduce((a, b) => a + b, 0)

						const percent = (value / total) * 100

						if (percent < 8) {
							return ''
						}

						return value.toLocaleString('en', {
							style: 'currency',
							currency: 'USD',
						})
					},
				},
				tooltip: {
					callbacks: {
						label: (context) => {
							const label = context.label || ''
							const value = context.dataset.data[context.dataIndex]

							if (value) {
								return `${label}: ${value.toLocaleString('en', {
									style: 'currency',
									currency: 'USD',
								})}`
							}
							return ''
						},
					},
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
