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

let cp = 1005.55,
  cv = 718.25,
  R = 287.3,
  k = 1.4,
  L = 1.7,
  m = 100,
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
  mass,
  kin,
  p0 = 150000,
  data_p = [],
  en;

let pb = 0.95 * 10 ** 5,
  Tb = 300,
  pa = 1.55 * 10 ** 5,
  Ta = 300;

function calculation() {
  (dx = L / m), (dt = (Co * dx) / a(T0)), (data_p = []);
  for (let i = 0; i < m; i++) {
    T[i] = T0;
    v[i] = 0;
    p[i] = p0;
    den[i] = p[i] / R / T[i];
  }
  // границы
  for (let i = 0; i < time; i++) {
    data_p.push([...p]);

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
  number = [];
  let inputElement = document.getElementById("in1");
  Co = Number(inputElement.value);
  inputElement = document.getElementById("in2");
  L = Number(inputElement.value);
  inputElement = document.getElementById("in3");
  m = Number(inputElement.value);
  inputElement = document.getElementById("in4");
  p0 = Number(inputElement.value);
  inputElement = document.getElementById("in5");
  pa = Number(inputElement.value);
  inputElement = document.getElementById("in6");
  pb = Number(inputElement.value);
  calculation();
  // console.log(data_p[50]);

  for (let i = 0; i < m; i++) {
    number[i] = i;
  }
  myData.labels = number;
  console.log(number);
  // console.log(myData);
  return data_p, number;
}

let p_centr = [],
  number1 = [],
  number = [];
// for (let i = 0; i < 3500; i++) {
//   p_centr.push(data_p[i][45]);
//   number1[i] = i;
// }

for (let i = 0; i < m; i++) {
  number[i] = i;
}

// let moredata_ch = data_p[100];
var myData = {
  labels: number,
  datasets: [
    {
      fill: true,
      backgroundColor: "rgb( 255,43,43, 0.25)",
      borderColor: "rgb( 255,43,43)",
      data: data_p[0],
      pointStyle: false,
    },
  ],
};

let step_g = 0;

var chartOptions = {
  scales: {
    y: {
      min: 80000,
      // max: 160000,
      // stepSize: 5000,
    },

    x: {
      min: 0,
      max: m + 1,
      // stepSize: 2,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: "Распределение давления, Па",
    },
    // subtitle: {
    //   display: ["step" + true],
    //   text: step_g,
    //   color: "blue",
    //   font: {
    //     // size: 12,
    //     // family: "tahoma",
    //     // weight: "normal",
    //     // style: "italic",
    //   },
    //   padding: {
    //     bottom: 10,
    //   },
    // },
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

function draw() {
  myChart.destroy();
  myChart = new Chart(ctx, {
    // type: document.getElementById("chartType").value,
    type: "line",
    data: myData,
    options: chartOptions,
  });
}

// document.getElementById("step").innerHTML = step_g;
function draw1() {
  // const formElement = document.getElementById("form1"); // извлекаем элемент формы
  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  // // formElement.addEventListener("button", (e) => {
  // // e.preventDefault();
  // alert(step_g);
  // const formData = new FormData(formElement); // создаём объект FormData, передаём в него элемент формы
  // // теперь можно извлечь данные
  // step_g = formData.get("step"); // 'John'
  // console.log(step_g);
  // // });
  const inputElement = document.getElementById("inp1");
  step_g = inputElement.value;
  console.log(step_g);
  myData.datasets[0].data = data_p[step_g];
  draw();
}
function change() {
  step_g += 1;
  if (step_g > time) {
    step_g = 0;
  }
  myData.datasets[0].data = data_p[step_g];
  myChart.update();
}
let delay = 40,
  timerId = setInterval(change, delay);

setTimeout(() => {
  clearInterval(timerId);
}, 0);

function stop_ch() {
  setTimeout(() => {
    clearInterval(timerId);
  }, 0);
  console.log(step_g);
  myChart.destroy();
  draw();
}

function start_ch() {
  timerId = setInterval(change, delay);
}

function reset_ch() {
  step_g = 0;
  myData.datasets[0].data = data_p[step_g];
  myChart.destroy();
  draw();
}
