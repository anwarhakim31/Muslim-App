const hours = document.querySelector(".hours");
const minutes = document.querySelector(".minutes");
const date = document.querySelector(".date");
const loading = document.querySelector(".loading");

document.addEventListener("DOMContentLoaded", function () {
  getlocation();
  setInterval(() => {
    getTime();
  });

  setInterval(() => {}, 10000);
  getHijriyah();
  setInterval(() => {
    getHijriyah();
    getlocation();
  }, 6000);
  callhusna();
  calldoa();
  animateProgress();
});

function getTime() {
  let tanggal = new Date();
  let formatTanggal = new Intl.DateTimeFormat("id", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });

  let jam = tanggal.getHours();
  let menit = tanggal.getMinutes();

  let newTanggal = formatTanggal.format(tanggal);

  date.innerText = newTanggal;
  hours.innerText = nol(jam);
  minutes.innerText = nol(menit);
}

function nol(number) {
  return number < 10 ? "0" + number : number;
}

const kota = document.querySelector(".kota");

async function getlocation() {
  try {
    const response = await fetch(`https://ipinfo.io/?token=6bb67ae5952de4`);
    const data = await response.json();

    const city = data.city;

    jadwalSholat(city);

    kota.innerText = city;
  } catch (error) {
    console.error("Error:", error);
  }
}

const dates = new Date();
const tanggal = dates.toLocaleDateString().split("/");
let tanggalformal = tanggal.join("-");

async function getHijriyah() {
  const hijriyah = document.querySelector(".hijriyah");

  const url = `https://masehi-ke-hijriyah.p.rapidapi.com/?tanggal=${tanggalformal}`;
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": "6f7a871fc3mshd8e84db27d9e7a4p10cfdbjsn702731d58be8",
      "X-RapidAPI-Host": "masehi-ke-hijriyah.p.rapidapi.com",
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    const [{ tanggal_hijriyah, bulan_hijriyah, tahun_hijriyah }] = result;

    const bhijiryah = removeDuplicateChars(bulan_hijriyah);

    hijriyah.innerText = `${tanggal_hijriyah} ${bhijiryah} ${tahun_hijriyah}`;
  } catch (error) {
    console.error(error);
  }
}

async function jadwalSholat(city) {
  // let tanggalformal = tanggalformal.reverse();

  try {
    const res1 = await fetch(
      `https://api.myquran.com/v2/sholat/kota/cari/${city}`
    );

    const data1 = await res1.json();

    const lokasiID = data1.data[0].id;

    const t = tanggal[2];
    const b = tanggal[1];
    const h = tanggal[0];

    const res2 = await fetch(
      `https://api.myquran.com/v2/sholat/jadwal/${lokasiID}/${t}/${b}/${h}`
    );

    if (res1.ok && res2.ok) {
      const data = await res2.json();

      const waktusholat = data.data.jadwal;
      const { subuh, dzuhur, ashar, maghrib, isya } = waktusholat;

      document.getElementById("waktu-shubuh").innerText = subuh;
      document.getElementById("waktu-dzuhur").innerText = dzuhur;
      document.getElementById("waktu-ashar").innerText = ashar;
      document.getElementById("waktu-magrib").innerText = maghrib;
      document.getElementById("waktu-isya").innerText = isya;

      hidePreloader();
    } else {
      console.log(response.status);
    }
  } catch (error) {
    console.log(error);
  }
}

function removeDuplicateChars(kata) {
  let katatanpaperulangan = kata[0];

  for (let i = 1; i < kata.length; i++) {
    if (kata[i] !== kata[i - 1]) {
      katatanpaperulangan += kata[i];
    }
  }

  return katatanpaperulangan;
}

const husnaA1 = document.getElementById("husnaA1");
const husnaL1 = document.getElementById("husnaL1");
const husnaA2 = document.getElementById("husnaA2");
const husnaL2 = document.getElementById("husnaL2");

async function getHusna() {
  try {
    const response = await fetch("https://api.myquran.com/v2/husna/acak");

    const data = await response.json();
    const asma = data.data;

    let { arab, indo, id } = asma;

    return { arab, indo, id };
  } catch (error) {
    console.log(error);
  }
}

async function callhusna() {
  const husna1 = await getHusna();
  const husna2 = await getHusna();

  if (husna1 && husna2) {
    randomHusna(husna1.arab, husna1.indo, husnaA1, husnaL1);
    randomHusna(husna2.arab, husna2.indo, husnaA2, husnaL2);

    const parent1 = husnaA1.parentElement.parentElement.parentElement;
    const parent2 = husnaA2.parentElement.parentElement.parentElement;

    parent1.setAttribute("href", `Asmaul-Husna.html?/${husna1.id}`);
    parent2.setAttribute("href", `Asmaul-Husna.html?/${husna2.id}`);
  }
}

function randomHusna(arab, indo, tag1, tag2) {
  tag1.textContent = `${arab}`;
  tag2.textContent = `${indo}`;
}

async function getDoa() {
  try {
    const response = await fetch("https://api.myquran.com/v2/doa/acak");
    const data = await response.json();

    const doa = data.data;

    const { arab, indo, judul } = doa;

    return { arab, indo, judul };
  } catch (error) {
    console.log(error);
  }
}

const Doaarab = document.querySelectorAll(".DoaArab");
const DoaLatin = document.querySelectorAll(".DoaLatin");

async function calldoa() {
  const promises = Array.from({ length: 2 }, () => getDoa());
  const doas = await Promise.all(promises);

  let paramArti = [];

  doas.forEach((doa) => {
    paramArti.push(doa.judul);
  });

  const newArti = paramArti.map((judul) => {
    return judul.split(" ").join("%20");
  });

  const newDoa = doas.map((doa, i) => {
    return { arab: doa.arab, indo: doa.indo, judul: newArti[i] };
  });

  Doaarab.forEach((arab, index) => {
    arab.textContent = doas[index].arab;
    const parent = arab.parentElement.parentElement.parentElement;

    parent.setAttribute("href", `Doa.html?parameter=${newDoa[index].judul}`);
  });

  DoaLatin.forEach((latin, index) => {
    latin.textContent = doas[index].indo;
  });
}

async function getHadist() {
  try {
    const res = await fetch(`https://api.myquran.com/v2/hadits/perawi/acak`);
    const data = await res.json();

    return data;
  } catch (error) {
    console.log(error);
  }
}

const hadistArab = document.querySelectorAll(".HadistArab");
const hadistLatin = document.querySelectorAll(".HadistLatin");

async function callHadist() {
  try {
    const promises = Array.from({ length: 2 }, () => getHadist());
    const data = await Promise.all(promises);

    hadistArab.forEach((arab, index) => {
      arab.textContent = data[index].data.arab;
      const perawi = data[index].info.perawi.slug;
      const nomor = data[index].data.number;

      const parent = arab.parentElement.parentElement.parentElement;

      parent.setAttribute(
        "href",
        `https://anwarhakimz.github.io/Muslim-App/Hadist.html?/hadist/${perawi}/nomor:${nomor}`
      );
    });

    hadistLatin.forEach((latin, index) => {
      latin.textContent = data[index].data.id;
    });
  } catch (error) {
    console.log(error);
  }
}

function hidePreloader() {
  loading.style.display = "none";
}
function animateProgress() {
  let i = 0;
  const progress = document.querySelector(".progress");

  const interval = setInterval(() => {
    i++;
    progress.textContent = `${i}%`;

    if (i === 100) {
      clearInterval(interval);
      hidePreloader();
    }
  }, 20); // Adjust the interval to control the speed of animation
}

callHadist();
