const wrapperHadist = document.querySelector(".wrapper-hadist");
const pilihPerawi = document.querySelector(".pilih-perawi");
const jumlahHadist = document.querySelector(".jumlah-hadist");
const loading = document.querySelector(".loading");

const url = new URL(window.location.href);
const newurl = new URL(window.location.href);
const pathname = url.search.slice(2);
let part = pathname.split(":");

let harian = pathname.split("/")[0];

let perawis;
let jumlah;

if (harian === "hadist") {
  perawis = pathname.split("/")[1];
  jumlah = parseInt(part[1]);
  document.querySelectorAll(".btn-area").forEach((btn) => {
    btn.style.display = "none";
  });
} else {
  perawis = pathname.split("/")[0];
  jumlah = parseInt(part[1]);
  document.querySelectorAll(".btn-area").forEach((btn) => {
    btn.style.display = "flex";
  });
}

addLS(jumlah);
perawiLS(perawis);

if (perawis === null || perawis === undefined || isNaN(parseInt(perawis))) {
  perawis = "bukhari";
}

if (jumlah === null || jumlah === undefined || isNaN(jumlah)) {
  jumlah = 100;
}

if (window.location.href === "https://anwarhakimz.github.io/Muslim-App") {
  let getLSperawi = JSON.parse(localStorage.getItem("perawi"));
  window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/${getLSperawi.value}/jumlah:${jumlah}`;
} else if (
  window.location.href ===
  `https://anwarhakimz.github.io/Muslim-App/Hadist.html?//jumlah:${jumlah}`
) {
  window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/bukhari/jumlah:${jumlah}`;
}

const nextbtn = document.querySelector(".next-btn");
const prevbtn = document.querySelector(".prev-btn");

document.addEventListener("DOMContentLoaded", async function () {
  let getLSperawi = JSON.parse(localStorage.getItem("perawi"));

  if (getLSperawi) {
    if (pilihPerawi.value !== getLSperawi.value) {
      pilihPerawi.value = getLSperawi.value;
    }
  }
  if (harian === "hadist") {
    const searchinputs = document.getElementById("search-input");
    searchinputs.value = `${perawis} ${jumlah}`;
  }

  await getDataHadist();
});

pilihPerawi.addEventListener("change", async function () {
  // Setelah nilai pilihPerawi berubah, simpan nilainya ke localStorage
  perawiLS(pilihPerawi.value);

  let getLSperawi = JSON.parse(localStorage.getItem("perawi"));

  window.location.reload();
  window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/${getLSperawi.value}/jumlah:100`;
});

async function getDataHadist() {
  const indexLS = getLS();
  let index = indexLS.ind;

  let perawi = pilihPerawi.value;
  perawiLS(perawi);

  if (index === null || index === undefined) {
    index = 100;
  }
  const total = await fetchPerawi();
  const progress = document.querySelector(".progress");
  try {
    let list = "";
    let array = [];

    jumlahHadist.textContent = total;

    disabledBTN(total, jumlah);

    let i;

    if (harian !== "hadist") {
      i = jumlah - 100 + 1;

      if (jumlah === total) {
        i = nearestHundred(jumlah);
        i = nearestHundred(i) + 1;
      }

      if (jumlah < 100) {
        i = 1;
      }
    } else {
      i = jumlah;
    }

    // Reset loader

    progress.textContent = "0%";

    for (i; i <= jumlah; i++) {
      if (i > total) {
        break;
      }

      const width =
        Math.floor(((i - (jumlah - 100 + 1)) / 100) * 100) + 1 + "%";
      progress.textContent = width;

      const res = await fetch(
        `https://api.myquran.com/v2/hadits/${perawi}/${i}`
      );
      const data = await res.json();
      array.push(data.data);
    }

    let limit;

    if (harian !== "hadist") {
      limit = 100;

      if (jumlah === total) {
        limit = total - nearestHundred(total);
      }

      if (jumlah < 100) {
        limit = jumlah;
      }
    } else {
      limit = 1;
    }

    array.forEach((data, i) => {
      list += templateHadist(index - limit + i + 1, data.arab, data.id);
    });
    searchinput(array);
    wrapperHadist.innerHTML = list;

    conditionURL(total, index);

    loading.style.display = "none";
  } catch (error) {}
}

function conditionURL(total, index) {
  let getLSperawi = JSON.parse(localStorage.getItem("perawi"));
  if (index > total) {
    index = total;

    window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/${getLSperawi.value}/jumlah:${total}`;
  }

  if (index < 1) {
    index = 100;

    window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/${getLSperawi.value}/jumlah:${jumlah}`;
  }
}

document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("next-btn")) {
    const indexLS = getLS();
    let index = indexLS.ind;

    console.log;

    if (index === null || index === undefined) {
      index = 100;
    }

    index += 100;

    const total = await fetchPerawi();

    if (jumlah == nearestHundred(total)) {
      index += total - nearestHundred(total);
    }
    let getLSperawi = JSON.parse(localStorage.getItem("perawi"));

    window.location.reload();
    window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/${getLSperawi.value}/jumlah:${index}`;
  }
});

document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("prev-btn")) {
    const indexLS = getLS();
    let index = indexLS.ind;

    index -= 100;

    const total = await fetchPerawi();

    if (jumlah == total) {
      index = nearestHundred(total);
    }

    let getLSperawi = JSON.parse(localStorage.getItem("perawi"));
    window.location.reload();
    window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/${getLSperawi.value}/jumlah:${index}`;
  }
});

function nearestHundred(num) {
  return Math.round(num / 100) * 100;
}

async function fetchPerawi() {
  try {
    const res1 = await fetch("https://api.myquran.com/v2/hadits/perawi/");

    if (res1.ok) {
      const data1 = await res1.json();

      const dataPerawi = data1.data.filter((perawi) => {
        return perawi.slug == pilihPerawi.value;
      });

      const [{ total }] = dataPerawi;

      return total;
    }
  } catch (error) {
    wrapperHadist.innerHTML = `<h2 class="fs-secondary-heading text-center p-top-100">Hasil Pencarian Tidak Ditemukan...</h2>`;
    document.querySelectorAll(".btn-area").forEach((btn) => {
      btn.style.display = "none";
    });

    loading.style.display = "none";
  }
}

function disabledBTN(total, jumlah) {
  if (total == jumlah) {
    nextbtn.classList.add("disable");
  } else {
    nextbtn.classList.remove("disable");
  }

  if (jumlah <= 100) {
    prevbtn.classList.add("disable");
  } else {
    prevbtn.classList.remove("disable");
  }
}

const searchiput = document.getElementById("search-input");

function searchinput(array) {
  searchiput.addEventListener("input", function () {
    const indexLS = getLS();
    let index = indexLS.ind;
    let keyword = searchiput.value.trim().toLowerCase().split(" ");

    if (harian == "hadist") {
      if (searchiput.value.length < 1 || searchiput.value === null) {
        if (jumlah <= 100) {
          jumlah = 1;
        } else {
          jumlah = nearestHundred(jumlah);
        }
      }
    }

    wrapperHadist.innerHTML = "";

    const total = jumlahHadist.textContent;
    let list = "";

    let limit = 100;

    if (jumlah === total) {
      limit = total - nearestHundred(total);
    }

    if (jumlah < 100) {
      limit = jumlah;
    }

    array.forEach((data, i) => {
      let arti = data.id.toLowerCase().split(" ");
      let number = data.number;

      const match = keyword.every((keyword) => {
        let indo = arti.includes(keyword);
        let no = number.toString().startsWith(keyword);

        return indo || no;
      });

      if (match) {
        let mark = data.id;

        keyword.forEach((word) => {
          mark = mark
            .split(word)
            .join(
              `<span style="background:var(--clr-primary-100)">${word}</span>`
            );

          return mark;
        });

        list += templateHadist(index - limit + i + 1, data.arab, mark);
      }

      wrapperHadist.innerHTML = list;
      loading.style.display = "none";
    });
    if (wrapperHadist.innerHTML == "") {
      wrapperHadist.innerHTML = `<h2 class="fs-secondary-heading text-center p-top-100">Hasil Pencarian Tidak Ditemukan...</h2>`;
      document.querySelectorAll(".btn-area").forEach((btn) => {
        btn.style.display = "none";
      });
    } else {
      document.querySelectorAll(".btn-area").forEach((btn) => {
        btn.style.display = "flex";
      });
    }
  });
}

searchiput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const value = e.target.value.trim().toLowerCase();
    const valuearray = value.split(" ");

    let number = [];
    let letter = [];

    valuearray.forEach((val) => {
      if (!isNaN(parseFloat(val))) {
        number.push(val);
      } else {
        letter.push(val);
      }
    });

    let nomor = number[number.length - 1];
    let huruf = letter.join(" ");

    switch (huruf) {
      case "tarmidzi":
      case "imam tirmidzi":
      case "imam tarmidzi":
      case "tarmizi":
        huruf = "tirmidzi";
        break;
      case "imam bukhari":
        huruf = "bukhari";
        break;
      case "ibnu majah":
        huruf = "ibnu-majah";
        break;
      case "imam ahmad":
        huruf = "ahmad";
        break;
      case "imam muslim":
        huruf = "muslim";
        break;
      case "abu daud":
      case "abu dawud":
        huruf = "abu-dawud";
        break;
      default:
    }

    console.log(huruf);

    if (nomor === undefined) {
      window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/${huruf}/nomor:100`;
    } else {
      window.location.href = `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/hadist/${huruf}/nomor:${nomor}`;
    }

    console.log(huruf, nomor);
  }
});

const sort = document.querySelector(".sort");
const iconsort = document.querySelector(".icon-sort");

sort.addEventListener("click", function () {
  if (iconsort.classList.contains("ph-arrow-up")) {
    iconsort.classList.remove("ph-arrow-up");
    iconsort.classList.add("ph-arrow-down");
    const list = wrapperHadist.children;

    const allist = [...list].sort((a, b) => {
      return b.getAttribute("data-index") - a.getAttribute("data-index");
    });

    allist.forEach((list) => {
      wrapperHadist.appendChild(list);
    });
  } else {
    iconsort.classList.add("ph-arrow-up");
    iconsort.classList.remove("ph-arrow-down");
    const list = wrapperHadist.children;

    const allist = [...list].sort((a, b) => {
      return a.getAttribute("data-index") - b.getAttribute("data-index");
    });

    allist.forEach((list) => {
      wrapperHadist.appendChild(list);
    });
  }
});

const notif = document.querySelector(".notification");
let delay;

window.addEventListener("click", (e) => {
  if (e.target.classList.contains("copy")) {
    const parent = e.target.parentElement.parentElement;

    const arab = parent.querySelector(".text-arab").textContent;
    const indo = parent.querySelector(".text-arti").textContent;

    let text = `${arab}
    ${indo}`;

    navigator.clipboard.writeText(text);

    clearTimeout(delay);

    delay = setTimeout(() => {
      notif.classList.remove("show");
    }, 1500);

    notif.classList.add("show");
  }
});

const toTop = document.querySelector(".toTop");

document.addEventListener("scroll", function () {
  const scrollposition = window.scrollY;

  if (scrollposition >= window.innerHeight * 0.01) {
    toTop.classList.add("active");
  } else {
    toTop.classList.remove("active");
  }
});

toTop.addEventListener("click", () => {
  window.scrollTo(0, 0);
});

function templateHadist(no, arab, indo) {
  return ` <li class="list" data-index="${no}">
              <div class="list-navigation">
                <p class="No fw-semi-bold ff-primary">${no}</p>
                <span class="material-symbols-outlined copy">
                  content_copy
                </span>
              </div>
              <div class="list-content">
                <h3 class="text-arab p-block-100">${arab}</h3>
                <p class="text-arti fs-medium p-bot-100">${indo}</p>
              </div>
            </li>`;
}

function perawiLS(value) {
  localStorage.setItem("perawi", JSON.stringify({ value }));
}

function addLS(ind) {
  let obj = { ind };

  localStorage.setItem("page", JSON.stringify(obj));
}

function getLS() {
  return localStorage.getItem("page")
    ? JSON.parse(localStorage.getItem("page"))
    : [];
}
