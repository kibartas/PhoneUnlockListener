const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const refresh = (cnt, chart) => {
	let num = 0;
	fetch('https://howmanytimeshaveiunlockedmyphonetoday.rasimas.lt/api') 
		.then(response => response.json())
		.then(txt => {
			cnt.innerText = txt;
			const chartData = chart.data.datasets[0].data;
			const curVal = chartData[chartData.length - 1];
			if (txt !== curVal) {
				chart.data.datasets[0].data[chartData.length - 1] = txt.toString();
				chart.update();
			}
		})
		.catch(() => {});
		setTimeout(() => refresh(cnt, chart), 50);
}
document.addEventListener("DOMContentLoaded", (event) => {

	let counter = document.getElementById("counter")
	let historyChart = null;
	fetch('https://howmanytimeshaveiunlockedmyphonetoday.rasimas.lt/history.txt')
		.then(response => response.text())
		.then(resp => {
			let title = '';
			let farr = resp.split('\n');
			farr.pop();
			let obj = farr.reduce((acc, el) => {
				let labelAndData = el.split(': ');
				if (!acc['labels']) {
					acc['labels'] = [];
				}
				if (!acc['data']) {
					acc['data'] = [];
				}
				labelAndData[0] = labelAndData[0].split('-');
				if (title === '') title = `${months[parseInt(labelAndData[0][1], 10) - 1]}, ${labelAndData[0][0]}`;
				labelAndData[0].shift();
				labelAndData[0].shift();
				acc['labels'].push(labelAndData[0]);
				acc['data'].push(labelAndData[1]);
				return acc;
			}, {});
			Chart.defaults.font.family = 'Montserrat';
			Chart.defaults.color = "white";
			Chart.defaults.borderColor = "white";
			obj['data'].push("1");
			let today = new Date(new Date().toLocaleString("lt-LT", { timeZone: 'Europe/Vilnius' })).getDate().toString().padStart(2, '0')
			obj['labels'].push(today);
			let ctx = document.getElementById('historyChart').getContext('2d');
			historyChart = new Chart(ctx, {
				type: 'line',
				data: {
					labels: obj['labels'],
					datasets: [{
						data: obj['data'],
						borderColor: [
							'rgba(40, 223, 40, 1)',
						],
					}]
				},
				options: {
					maintainAspectRatio: false,
					elements: {
						point: {
							backgroundColor: obj['data'].map((_, i) => i === obj['data'].length - 1 ? '#12131C' : 'rgba(40, 223, 40, 1)'),
							pointRadius: obj['data'].map((_, i) => i === obj['data'].length - 1 ? 7 : 4),
							pointBorderWidth: obj['data'].map((_, i) => i === obj['data'].length - 1 ? 2 : 1),
						},
					},
					responsive: true,
					scales: {
						y: {
							display: true,
							precision: 0,
							title: {
								display: true,
								text: "number of unlocks",
								color: 'rgb(40, 223, 40, 1)',
								font: { weight: 'normal', size: '15px' },
								align: 'end'
							}, 
							grid: {
								color: 'rgba(255, 255, 255, 0.2)',
								drawTicks: false,
							},
							grace: '10%',
						},
						x: {
							title: {
								display: true,
								text: "day of month",
								color: 'rgb(40, 223, 40, 1)',
								align: 'end',
								font: { weight: 'normal', size: '15px' },
							},
							grid: {
								display: false,
							},
							offset: true
						}
					},
					plugins: {
						title: {
							display: true,
							text: title,
							color: 'rgba(40, 223, 40, 1)', 
							font: { weight: 'normal', size: '18px' }
						},
						legend: {
							display: false,
						},
					},
				},
				plugins: [{
					afterDatasetDraw: (chart) => {
						const ctx = chart.ctx;
						const dataset = chart.data.datasets[0];
						const datasetMeta = chart.getDatasetMeta(0);
						datasetMeta.data.forEach((point, i) => {
							const value = dataset.data[i];
							const x = point.getCenterPoint().x;
							const y = point.getCenterPoint().y;
							const radius = point.options.radius;
							const fontSize = 14;
							const fontFamily = "sans-serif";
							const fontColor = '#28DF28';
							const fontStyle = 'normal';
							ctx.save();
							ctx.textBaseline = 'middle';
							ctx.textAlign = 'center';
							ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
							ctx.fillStyle = fontColor;
							ctx.fillText(value, x, y - radius - fontSize);
						});
					}
				}]
			});
			refresh(counter, historyChart)
		});

})
