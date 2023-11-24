function a(T) {
  return Math.sqrt(k * R * T);
}

function e_bound(j) {
  return p_bound[j] / (k - 1) / den_bound[j] + v_bound[j] ** 2 / 2; //14
}

function f(x) {
  let f1 = v[0] - (p[0] - x) / a(T[0]) / den[0];
  g1 = Math.sqrt(
    Math.abs((2 * k * R * Ta * (1 - (x / pa) ** ((k - 1) / k))) / (k - 1))
  );
  return f1 - g1;
}

function root() {
  let diff = 0.0001,
    c = 0,
    fc = 0,
    a0 = 0,
    b0 = 140000,
    fa = f(a0);
  for (; b0 - a0 > diff; ) {
    c = (a0 + b0) / 2;
    fc = f(c);
    if (fc * fa <= 0.0) {
      b0 = c;
    } else {
      a0 = c;
      fa = fc;
    }
  }
  return c;
}

let flag = 1,
  cp = 1005.55,
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
  datag = [],
  p0 = 150000,
  pb = 1 * 10 ** 5,
  Tb = 300,
  pa = 1.4 * 10 ** 5,
  Ta = 300;

function calculation() {
  (dx = L / m), (dt = (Co * dx) / a(T0)), (data_p = []);

  if (flag == 1) {
    L = 1;
    m = 100;
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
  } else {
    L = 1.7;
    m = 100;
    for (let i = 0; i < m; i++) {
      T[i] = T0;
      v[i] = 0;
      p[i] = p0;
      den[i] = p[i] / R / T[i];
    }
  }

  // границы
  for (let i = 0; i < time; i++) {
    if (i == 0) {
      datag = [...p];
    }
    data_p.push([...p]);
    if (flag == 1) {
      // Левая граница
      v_bound[0] = 0;
      p_bound[0] = p[0] - v[0] * a(T[0]) * den[0]; //15
      den_bound[0] = den[0] * (1 + (p_bound[0] / p[0] - 1) / k);
      //Правая граница
      v_bound[m] = 0;
      p_bound[m] = p[m - 1] + a(T[m - 1]) * den[m - 1] * v[m - 1]; //18
      den_bound[m] = den[m - 1] * (1 + (p_bound[m] / p[m - 1] - 1) / k); //19
    } else {
      //Левая граница втекание
      p_bound[0] = root();
      v_bound[0] = v[0] - (p[0] - p_bound[0]) / a(T[0]) / den[0];
      den_bound[0] = p_bound[0] / R / (Ta - (v_bound[0] * v_bound[0]) / 2 / cp);
      //console.log(p_bound[0] + "  " + v_bound[0] + "   " + den_bound[0] + " 0");
      //Правая граница истекание в ресивер
      p_bound[m] = pb;
      v_bound[m] = v[m - 1] + (p[m - 1] - pb) / a(T[m - 1]) / den[m - 1]; //40
      den_bound[m] = den[m - 1] * (1 + (pb / p[m - 1] - 1) / k); //41
      // console.log(p_bound[m] + "  " + v_bound[m] + "   " + den_bound[m] + " m");
    }
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
  return data_p;
}

calculation();
function re() {
  document.getElementById("form0").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  let inputElement = document.getElementById("in1");
  Co = Number(inputElement.value);
  console.log(Co);
  calculation();
  reset_ch();
  return data_p;
}

let p_centr = [],
  number1 = [],
  number = [];

for (let i = 0; i < m; i++) {
  number[i] = i;
}

var myData = {
  labels: number,
  datasets: [
    {
      fill: true,
      backgroundColor: "rgb( 43,43,255, 0.25)",
      borderColor: "rgb( 43,43,255)",
      data: data_p[0],
      pointStyle: false,
    },
  ],
};

let step_g = 0;

var chartOptions = {
  animation: {
    duration: 0,
  },
  scales: {
    y: {
      min: 99000,
      max: 141000,
    },

    x: {
      title: {
        font: {
          family: '"Times New Roman", Times, serif',
          size: 20,
        },
        display: true,
        text: "Номер ячейки",
      },
      min: 0,
      max: m + 1,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      font: {
        family: '"Times New Roman", Times, serif',
        size: 20,
      },
      display: true,
      text: "Статическое давление, Па",
    },
  },
};

var ctx = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx, {
  type: "line",
  data: myData,
  options: chartOptions,
});

function draw() {
  myChart.destroy();
  myChart = new Chart(ctx, {
    type: "line",
    data: myData,
    options: chartOptions,
  });
}

function step_n() {
  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  const inputElement = document.getElementById("inp1");
  step_g = Number(inputElement.value);
  document.getElementById("layer2").innerHTML = "Шаг: " + String(step_g);
  myData.datasets[0].data = data_p[step_g];
  myChart.update();
  return step_g;
}
function change() {
  step_g += 1;
  document.getElementById("layer2").innerHTML = "Шаг: " + String(step_g);
  myData.datasets[0].data = data_p[step_g];
  myChart.update();
}
let delay = 40;

function stop_ch() {
  setTimeout(() => {
    clearInterval(timerId);
  }, 0);
}

function start_ch() {
  timerId = setInterval(change, delay);
}

function reset_ch() {
  stop_ch();
  step_g = 0;
  document.getElementById("layer2").innerHTML = "Шаг: " + String(step_g);
  myData.datasets[0].data = data_p[step_g];
  myChart.update();
}

function updateChartType() {
  flag = document.getElementById("chartType").value;
  calculation();
  step_g = 0;
  console.log(data_p[step_g]);
  myData.datasets[0].data = data_p[step_g];
  if (flag == 2) {
    chartOptions.scales.y = {
      min: 90000,
    };
    document.getElementById("text").innerHTML = text2;
  } else {
    chartOptions.scales.y = {
      min: 99000,
      max: 141000,
    };
    document.getElementById("text").innerHTML = text1;
  }
  draw();
  stop_ch();
}

const text1 =
    "Имеется прямая труба диаметром d=30 мм и длинной L=1 метр. На левом и правом  конце трубы установлены заглушки. В начальный момент времени параметры в трубе : р_min=1 Бар, р_max=1.4 Бар,  Т=300 К. Для расчета труба делится на N=100 ячеек.",
  text2 =
    "Имеется прямая труба диаметром d=30 мм и длинной L=1.7 метр. На правом конце трубы расположен первый ресивер, в котором находится воздух с параметрами (р=1 Бар, Т=300 К). Втекание в трубу осуществляется без потерь. На левом конце трубы расположен второй ресивер, в котором находится воздух с параметрами (р=1.4 Бар, Т=300 К). Втекание в трубу осуществляется без потерь. В начальный момент времени параметры в трубе (р=1.5 Бар, Т=300 К). Для расчета труба делится на N=100 ячеек.";
