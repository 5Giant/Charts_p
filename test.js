function a(T) {
  return Math.sqrt(k * R * T);
}

function e_bound(j) {
  return p_bound[j] / (k - 1) / den_bound[j] + v_bound[j] ** 2 / 2; //14
}

let cp = 1005.55,
  cv = 718.25,
  R = 287.3,
  k = 1.4,
  L = 1,
  m = 90,
  Co = 0.3,
  T0 = 300,
  F = Math.PI * 0.03 ** 2,
  dx = L / m,
  dt = (Co * dx) / a(T0),
  time = 10000;

let p = [],
  T = [],
  v = [],
  den = [],
  p_bound = [],
  v_bound = [],
  den_bound = [],
  data_p = [],
  mass,
  kin,
  en,
  datag = [];
for (let i = 0; i < m; i++) {
  T[i] = T0;
  v[i] = 0;
  if (i < m / 2) {
    p[i] = 100000;
  } else {
    p[i] = 140000;
  }
  den[i] = p[i] / R / T[i];
}

// границы
for (let i = 0; i < time; i++) {
  if (i == 0) {
    datag = [...p];
  }
  data_p.push([...p]);
  // Левая граница
  v_bound[0] = 0;
  p_bound[0] = p[0] - v[0] * a(T[0]) * den[0]; //15
  den_bound[0] = den[0] * (1 + (p_bound[0] / p[0] - 1) / k);
  //Правая граница
  v_bound[m] = 0;
  p_bound[m] = p[m - 1] + a(T[m - 1]) * den[m - 1] * v[m - 1]; //18
  den_bound[m] = den[m - 1] * (1 + (p_bound[m] / p[m - 1] - 1) / k); //19
  // Остальные границы
  for (let j = 1; j < m; j++) {
    let aden = (a(T[j - 1]) * den[j - 1] + a(T[j]) * den[j]) / 2; //9
    p_bound[j] = (p[j - 1] + p[j] + aden * (v[j - 1] - v[j])) / 2; //10
    v_bound[j] = (v[j - 1] + v[j] + (p[j - 1] - p[j]) / aden) / 2; //11
    if (v_bound[j] >= 0) {
      den_bound[j] = den[j - 1] * (1 + (p_bound[j] / p[j - 1] - 1) / k); //12
    } else {
      den_bound[j] = den[j] * (1 + (p_bound[j] / p[j] - 1) / k); //13
    }
  }

  for (let j1 = 0; j1 < m; j1++) {
    mass = den[j1] * F * dx; //28
    kin = mass * v[j1]; //29
    en = mass * (p[j1] / (k - 1) / den[j1] + v[j1] ** 2 / 2); //30

    mass +=
      dt *
      F *
      (den_bound[j1] * v_bound[j1] - den_bound[j1 + 1] * v_bound[j1 + 1]); //20
    kin +=
      dt *
      F *
      (den_bound[j1] * v_bound[j1] ** 2 +
        p_bound[j1] -
        den_bound[j1 + 1] * v_bound[j1 + 1] ** 2 -
        p_bound[j1 + 1]); //21

    en +=
      dt *
      F *
      (den_bound[j1] * v_bound[j1] * e_bound(j1) +
        p_bound[j1] * v_bound[j1] -
        den_bound[j1 + 1] * v_bound[j1 + 1] * e_bound(j1 + 1) -
        p_bound[j1 + 1] * v_bound[j1 + 1]);

    den[j1] = mass / F / dx; //23
    v[j1] = kin / mass; //24
    T[j1] = (en / mass - v[j1] ** 2 / 2) / cv; //25
    p[j1] = (k - 1) * den[j1] * (en / mass - v[j1] ** 2 / 2); //27
  }
}

let number = [];
for (let i = 0; i < m; i++) {
  number[i] = i;
}

// new Chart(ctx, {
//   type: "line",
//   data: {
//     labels: number,
//     datasets: [
//       {
//         label: "# of Votes",
//         data: data_p[380],
//         // borderWidth: 10,
//       },
//     ],
//   },
//   options: {
//     scales: {
//       y: {
//         // beginAtZero: true,
//       },
//     },
//   },
// });

// Define data set for all charts
let data_ch = data_p[0];
// let moredata_ch = data_p[100];
var myData = {
  labels: number,
  datasets: [
    {
      label: "Распределение давления",
      fill: true,
      backgroundColor: "rgb(190, 99, 255, 0.25)",
      borderColor: "rgb(190, 99, 255)",
      data: data_ch,
      pointStyle: false,
    },
  ],
};

var chartOptions = {
  scales: {
    y: {
      min: 95000,
      max: 140000,
      stepSize: 5000,
    },

    x: {
      min: 0,
      max: m,
      // stepSize: 2,
    },
  },
};

// Default chart defined with type: 'line'
// Chart.defaults.global.defaultFontFamily = "monospace";
var ctx = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx, {
  type: "line",
  data: myData,
  options: chartOptions,
});

// // Function runs on chart type select update
function updateChartType() {
  // Since you can't update chart type directly in Charts JS you must destroy original chart and rebuild
  myChart.destroy();
  myChart = new Chart(ctx, {
    type: document.getElementById("chartType").value,
    data: myData,
    options: chartOptions,
  });
}
let step_g = 0;
// Randomize data button function
function randomizeData() {
  step_g += 1;
  // let newdata_ch = data_ch.map((x) => Math.floor(Math.random() * 50));
  // let newMoredata_ch = moredata_ch.map((x) => Math.floor(Math.random() * 40));
  myData.datasets[0].data = data_p[step_g];
  // myData.datasets[1].data = newMoredata_ch;
  myChart.update();
  // console.log(newdata_ch);
}
setInterval(randomizeData, 20);

// console.log(data_p[100]);
