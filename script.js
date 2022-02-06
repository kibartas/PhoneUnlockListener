// Global vars
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const todayDate = new Date(new Date().toLocaleString("lt-LT", { timeZone: 'Europe/Vilnius' }))
const historyArray = fetch('https://howmanytimeshaveiunlockedmyphonetoday.rasimas.lt/history.txt')
		.then(response => response.text())
		.then(resp => {
			let hArray = resp.split('\n');
			hArray.pop();
			return hArray;
		});

let searchedMonth = todayDate.getMonth();
let searchedYear = todayDate.getFullYear();
let historyChart = null;



const refresh = (cnt) => {
	const chart = historyChart;
	fetch('https://howmanytimeshaveiunlockedmyphonetoday.rasimas.lt/api') 
		.then(response => response.json())
		.then(txt => {
			cnt.innerText = txt;
			if (searchedMonth === todayDate.getMonth()) {
				const chartData = chart.data.datasets[0].data;
				const curVal = chartData[chartData.length - 1];
				if (txt !== curVal) {
					chart.data.datasets[0].data[chartData.length - 1] = txt.toString();
					chart.update();
				}
			}
		})
		.catch(() => {});
		setTimeout(() => refresh(cnt), 50);
}

const getMonthIndices = (yearAndMonth, historyArray) => 
	[historyArray.findIndex(line => line.startsWith(yearAndMonth)),
	historyArray.length - 1 - historyArray.slice().reverse().findIndex(line => line.startsWith(yearAndMonth))]
	

const goBack = () => {
	if (searchedMonth >= 1) {
		searchedMonth -= 1;	
	} else if (searchedMonth === 0) {
		searchedMonth = 11;
		searchedYear -= 1;
	}
	historyChart.destroy();
	draw();
}

const goForward = () => {
	if (searchedMonth < 11) {
		searchedMonth += 1;	
	} else if (searchedMonth === 11) {
		searchedMonth = 0;
		searchedYear += 1;
	}
	historyChart.destroy();
	draw();
}

document.addEventListener("DOMContentLoaded", () => {
	draw().then(() => refresh(document.getElementById("counter"), historyChart));
});

const draw = () => {
	return historyArray.then(farr => {
			let today = `${searchedYear}-${(searchedMonth + 1).toString().padStart(2, '0')}`
			farr = farr.slice();
			if (searchedMonth === todayDate.getMonth() && searchedYear === todayDate.getFullYear()) {
				today += `-${todayDate.getDate().toString().padStart(2, '0')}`;
				farr.push(`${today}: 1`);
			}
			const searchedMonthHistoryIndices = getMonthIndices(`${searchedYear}-${(searchedMonth + 1).toString().padStart(2, '0')}`, farr);
			if (searchedMonthHistoryIndices[0] === 0) {
				document.getElementById('arrowLeft').style.visibility = "hidden";
			} else {
				document.getElementById('arrowLeft').style.visibility = "visible";
			}
			if (searchedMonthHistoryIndices[1] === farr.length - 1) {
				document.getElementById('arrowRight').style.visibility = "hidden";
			} else {
				document.getElementById('arrowRight').style.visibility = "visible";
			}
			farr = farr.slice(searchedMonthHistoryIndices[0], searchedMonthHistoryIndices[1] + 1)
			let title = '';
			let obj = farr.reduce((acc, el) => {
				let labelAndData = el.split(': ');
				if (!acc['labels']) {
					acc['labels'] = [];
				}
				if (!acc['data']) {
					acc['data'] = [];
				}
				labelAndData[0] = labelAndData[0].split('-');
				if (title === '') title = `${months[(searchedMonth).toString()]}, ${searchedYear}`;
				labelAndData[0].shift();
				labelAndData[0].shift();
				acc['labels'].push(labelAndData[0]);
				acc['data'].push(labelAndData[1]);
				return acc;
			}, {});
			Chart.defaults.font.family = 'Montserrat';
			Chart.defaults.color = "white";
			Chart.defaults.borderColor = "white";
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
							ticks: {
								padding: 10
							}
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
					afterDatasetsDraw: (chart) => {
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
					},
				}]
			});

	});
}
